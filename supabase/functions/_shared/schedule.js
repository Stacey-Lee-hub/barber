// Scheduling rules shared by the Supabase Edge Functions (Deno) and the React app (Vite).
// Pure JavaScript with no runtime-specific APIs so both environments import the same logic.

export const BUSINESS_TIMEZONE = 'America/Los_Angeles'
export const SLOT_INTERVAL_MINUTES = 15
export const BOOKING_HORIZON_DAYS = 60
// Customers cannot book a chair that starts within this many minutes from now.
export const MIN_LEAD_MINUTES = 30
// The appointment status that frees a barber's time. Matches appointments_status_check and
// the prevent_barber_double_booking exclusion constraint (which ignores cancelled rows).
export const CANCELLED_STATUS = 'cancelled'

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const formatters = new Map()

function partsFormatter(timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    )
  }
  return formatters.get(timeZone)
}

export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value)
}

export function isValidDateString(value) {
  if (typeof value !== 'string') return false
  const match = DATE_RE.exec(value)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const probe = new Date(Date.UTC(y, m - 1, d))
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d
}

export function isValidTimeString(value) {
  return typeof value === 'string' && TIME_RE.test(value)
}

/** Wall-clock components of an instant in the given time zone. */
export function getZonedParts(date, timeZone = BUSINESS_TIMEZONE) {
  const parts = {}
  for (const { type, value } of partsFormatter(timeZone).formatToParts(date)) {
    if (type !== 'literal') parts[type] = Number(value)
  }
  // Some engines report midnight as hour 24.
  if (parts.hour === 24) parts.hour = 0
  return parts
}

/** Minutes the zone is ahead of UTC at the given instant (e.g. -420 for PDT). */
export function getTimeZoneOffsetMinutes(date, timeZone = BUSINESS_TIMEZONE) {
  const p = getZonedParts(date, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  const truncated = Math.floor(date.getTime() / 1000) * 1000
  return Math.round((asUtc - truncated) / 60000)
}

/** Convert a wall-clock date/time in the business zone to a UTC Date, respecting DST. */
export function zonedDateTimeToUtc(dateStr, timeStr, timeZone = BUSINESS_TIMEZONE) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  const wall = Date.UTC(y, m - 1, d, hh, mm)
  const firstOffset = getTimeZoneOffsetMinutes(new Date(wall), timeZone)
  let utc = wall - firstOffset * 60000
  const secondOffset = getTimeZoneOffsetMinutes(new Date(utc), timeZone)
  if (secondOffset !== firstOffset) utc = wall - secondOffset * 60000
  return new Date(utc)
}

const pad = (n) => String(n).padStart(2, '0')

/** Calendar date (YYYY-MM-DD) of an instant in the business zone. */
export function dateInZone(date, timeZone = BUSINESS_TIMEZONE) {
  const p = getZonedParts(date, timeZone)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`
}

/** Wall-clock time (HH:MM) of an instant in the business zone. */
export function timeInZone(date, timeZone = BUSINESS_TIMEZONE) {
  const p = getZonedParts(date, timeZone)
  return `${pad(p.hour)}:${pad(p.minute)}`
}

/** 0 = Sunday … 6 = Saturday, matching business_hours.day_of_week. */
export function dayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + days))
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`
}

/** '08:00:00' or '08:00' → 480 */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(total) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

export function getBookingWindow(now = new Date()) {
  const firstDate = dateInZone(now)
  return { firstDate, lastDate: addDays(firstDate, BOOKING_HORIZON_DAYS) }
}

/** UTC instants bounding a business-zone calendar day. */
export function dayBoundsUtc(dateStr) {
  return {
    start: zonedDateTimeToUtc(dateStr, '00:00'),
    end: zonedDateTimeToUtc(addDays(dateStr, 1), '00:00'),
  }
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

/**
 * Bookable start times for one barber on one date.
 * @param {object} args
 * @param {string} args.date YYYY-MM-DD in the business zone
 * @param {{opening_time:string, closing_time:string, is_closed:boolean}|null} args.hours
 * @param {number} args.durationMinutes
 * @param {Array<{starts_at:string, ends_at:string}>} [args.busy] existing appointments
 * @param {Date} [args.now]
 */
export function buildDaySlots({ date, hours, durationMinutes, busy = [], now = new Date() }) {
  if (!hours || hours.is_closed || !(durationMinutes > 0)) return []
  const open = timeToMinutes(hours.opening_time)
  const close = timeToMinutes(hours.closing_time)
  const earliest = now.getTime() + MIN_LEAD_MINUTES * 60000
  const slots = []
  for (let m = open; m + durationMinutes <= close; m += SLOT_INTERVAL_MINUTES) {
    const time = minutesToTime(m)
    const start = zonedDateTimeToUtc(date, time)
    const end = new Date(start.getTime() + durationMinutes * 60000)
    if (start.getTime() < earliest) continue
    if (busy.some((b) => overlaps(start, end, b.starts_at, b.ends_at))) continue
    slots.push({ time, starts_at: start.toISOString(), ends_at: end.toISOString() })
  }
  return slots
}

/**
 * Validate a requested appointment against opening hours, lead time and the booking window.
 * Returns { ok: true, start, end } or { ok: false, code, message }.
 */
export function validateRequestedSlot({ date, time, hours, durationMinutes, now = new Date() }) {
  const fail = (code, message) => ({ ok: false, code, message })
  if (!isValidDateString(date)) return fail('invalid_date', 'Please choose a valid date.')
  if (!isValidTimeString(time)) return fail('invalid_time', 'Please choose a valid time.')

  const { firstDate, lastDate } = getBookingWindow(now)
  if (date < firstDate) return fail('past_date', 'That date has already passed.')
  if (date > lastDate) {
    return fail('beyond_window', `Appointments can be booked up to ${BOOKING_HORIZON_DAYS} days ahead.`)
  }
  if (!hours || hours.is_closed) return fail('closed', 'The shop is closed on that day.')

  const startMinutes = timeToMinutes(time)
  const open = timeToMinutes(hours.opening_time)
  const close = timeToMinutes(hours.closing_time)
  if ((startMinutes - open) % SLOT_INTERVAL_MINUTES !== 0 || startMinutes < open) {
    return fail('outside_hours', 'That time is outside our opening hours.')
  }
  if (startMinutes + durationMinutes > close) {
    return fail('after_closing', 'That appointment would finish after closing time.')
  }

  const start = zonedDateTimeToUtc(date, time)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  if (start.getTime() < now.getTime() + MIN_LEAD_MINUTES * 60000) {
    return fail('past_time', 'That time has passed or is too soon to book. Please choose a later time.')
  }
  return { ok: true, start, end }
}

export function calculateDiscountCents(priceCents, percentage) {
  if (!(percentage > 0)) return 0
  return Math.round((priceCents * Math.min(percentage, 100)) / 100)
}
