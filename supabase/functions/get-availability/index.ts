// POST { service_id, barber_id | "any", date: "YYYY-MM-DD" }
// → { date, timezone, reason, slots: [{ time, starts_at, ends_at }] }
// Only start/end times are read from appointments; no customer data leaves the database.
import { createAdminClient, RELEASED_STATUS_FILTER } from '../_shared/admin.ts'
import { errorResponse, json, readJsonRequest, SERVER_ERROR_MESSAGE } from '../_shared/http.js'
import {
  BUSINESS_TIMEZONE,
  buildDaySlots,
  dayBoundsUtc,
  dayOfWeek,
  getBookingWindow,
  isUuid,
  isValidDateString,
} from '../_shared/schedule.js'

Deno.serve(async (req) => {
  const { body, response } = await readJsonRequest(req)
  if (response) return response

  const { service_id, barber_id, date } = body
  if (!isUuid(service_id)) return errorResponse(400, 'invalid_service', 'Please choose a valid service.')
  if (barber_id !== 'any' && !isUuid(barber_id)) {
    return errorResponse(400, 'invalid_barber', 'Please choose a valid barber.')
  }
  if (!isValidDateString(date)) return errorResponse(400, 'invalid_date', 'Please choose a valid date.')

  try {
    const db = createAdminClient()
    const now = new Date()

    const barberQuery = db.from('barbers').select('id').eq('active', true).order('display_order')
    const [serviceRes, barbersRes, hoursRes] = await Promise.all([
      db.from('services').select('id, duration_minutes').eq('id', service_id).eq('active', true).maybeSingle(),
      barber_id === 'any' ? barberQuery : barberQuery.eq('id', barber_id),
      db.from('business_hours').select('opening_time, closing_time, is_closed').eq('day_of_week', dayOfWeek(date)).maybeSingle(),
    ])
    if (serviceRes.error || barbersRes.error || hoursRes.error) {
      throw serviceRes.error ?? barbersRes.error ?? hoursRes.error
    }
    if (!serviceRes.data) {
      return errorResponse(404, 'service_not_found', 'That service is no longer available. Please choose another.')
    }
    const barbers = barbersRes.data ?? []
    if (barbers.length === 0) {
      return errorResponse(404, 'barber_unavailable', 'That barber is not currently taking appointments.')
    }

    const reply = (reason: string | null, slots: unknown[] = []) =>
      json(200, { date, timezone: BUSINESS_TIMEZONE, reason, slots })

    const { firstDate, lastDate } = getBookingWindow(now)
    if (date < firstDate) return reply('past_date')
    if (date > lastDate) return reply('beyond_window')
    const hours = hoursRes.data
    if (!hours || hours.is_closed) return reply('closed')

    const { start, end } = dayBoundsUtc(date)
    const { data: busy, error: busyError } = await db
      .from('appointments')
      .select('barber_id, starts_at, ends_at')
      .in('barber_id', barbers.map((b) => b.id))
      .lt('starts_at', end.toISOString())
      .gt('ends_at', start.toISOString())
      .not('status', 'in', RELEASED_STATUS_FILTER)
    if (busyError) throw busyError

    const byTime = new Map()
    for (const barber of barbers) {
      const slots = buildDaySlots({
        date,
        hours,
        durationMinutes: serviceRes.data.duration_minutes,
        busy: (busy ?? []).filter((a) => a.barber_id === barber.id),
        now,
      })
      for (const slot of slots) if (!byTime.has(slot.time)) byTime.set(slot.time, slot)
    }
    const slots = [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time))

    if (slots.length > 0) return reply(null, slots)
    // Distinguish "today's remaining hours have passed" from a genuinely full day.
    const openSlotsIgnoringBookings = buildDaySlots({ date, hours, durationMinutes: serviceRes.data.duration_minutes, now })
    return reply(date === firstDate && openSlotsIgnoringBookings.length === 0 ? 'day_over' : 'fully_booked')
  } catch (err) {
    console.error('get-availability failed', err)
    return errorResponse(500, 'server_error', SERVER_ERROR_MESSAGE)
  }
})
