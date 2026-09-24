import { BUSINESS_TIMEZONE, timeToMinutes } from '@shared/schedule.js'

export function formatPrice(cents) {
  const dollars = cents / 100
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`
}

export function formatDuration(minutes) {
  return `${minutes} min`
}

export function formatDurationLong(minutes) {
  return `${minutes} minutes`
}

/** '15:00' or '15:00:00' → '3:00 PM' (no time zone conversion; wall-clock value). */
export function formatClock(timeStr) {
  const total = timeToMinutes(timeStr)
  const h = Math.floor(total / 60)
  const m = total % 60
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

const zoned = (options) => new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TIMEZONE, ...options })
const longDate = zoned({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const clock = zoned({ hour: 'numeric', minute: '2-digit' })
const zoneName = zoned({ timeZoneName: 'short' })

/** Instant → 'Friday, October 2, 2026' in the shop's time zone. */
export function formatZonedDate(iso) {
  return longDate.format(new Date(iso))
}

/** Instant → '3:00 PM' in the shop's time zone. */
export function formatZonedTime(iso) {
  return clock.format(new Date(iso))
}

/** Instant → 'PDT' / 'PST'. */
export function formatZoneAbbr(iso) {
  return zoneName.formatToParts(new Date(iso)).find((p) => p.type === 'timeZoneName')?.value ?? 'PT'
}

/** 'YYYY-MM-DD' calendar date → 'Friday, October 2' (no zone shift). */
export function formatCalendarDate(dateStr, options = { weekday: 'long', month: 'long', day: 'numeric' }) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** First name, stripping a quoted nickname: 'Marcus "Blade" Vance' → 'Marcus'. */
export function firstName(fullName) {
  return fullName.replace(/"[^"]*"/g, '').trim().split(/\s+/)[0]
}
