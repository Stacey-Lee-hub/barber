import { describe, expect, it } from 'vitest'
import {
  buildDaySlots,
  calculateDiscountCents,
  dateInZone,
  dayBoundsUtc,
  dayOfWeek,
  getBookingWindow,
  validateRequestedSlot,
  zonedDateTimeToUtc,
} from '@shared/schedule.js'
import { validateCustomer } from '@shared/validation.js'

const weekday = { day_of_week: 5, opening_time: '08:00:00', closing_time: '19:00:00', is_closed: false }
const sunday = { day_of_week: 0, opening_time: '10:00:00', closing_time: '16:00:00', is_closed: false }
// A "now" well before the dates under test.
const NOW = new Date('2026-09-24T12:00:00Z')

describe('time zone conversion (America/Los_Angeles)', () => {
  it('converts PDT wall time to UTC (UTC-7)', () => {
    expect(zonedDateTimeToUtc('2026-10-02', '15:00').toISOString()).toBe('2026-10-02T22:00:00.000Z')
  })

  it('converts PST wall time to UTC (UTC-8)', () => {
    expect(zonedDateTimeToUtc('2026-12-04', '15:00').toISOString()).toBe('2026-12-04T23:00:00.000Z')
  })

  it('handles the day after DST ends (Nov 1 2026)', () => {
    expect(zonedDateTimeToUtc('2026-10-31', '08:00').toISOString()).toBe('2026-10-31T15:00:00.000Z')
    expect(zonedDateTimeToUtc('2026-11-02', '08:00').toISOString()).toBe('2026-11-02T16:00:00.000Z')
  })

  it('handles the day DST starts (Mar 8 2026)', () => {
    expect(zonedDateTimeToUtc('2026-03-08', '10:00').toISOString()).toBe('2026-03-08T17:00:00.000Z')
    expect(zonedDateTimeToUtc('2026-03-07', '10:00').toISOString()).toBe('2026-03-07T18:00:00.000Z')
  })

  it('reports the shop calendar date, not the UTC date', () => {
    // 2026-09-25 03:00 UTC is still the evening of the 24th in Los Angeles.
    expect(dateInZone(new Date('2026-09-25T03:00:00Z'))).toBe('2026-09-24')
  })

  it('computes 23- and 25-hour days around DST changes', () => {
    const spring = dayBoundsUtc('2026-03-08')
    const fall = dayBoundsUtc('2026-11-01')
    expect((spring.end - spring.start) / 3600000).toBe(23)
    expect((fall.end - fall.start) / 3600000).toBe(25)
  })

  it('maps dates to business_hours day_of_week (0 = Sunday)', () => {
    expect(dayOfWeek('2026-09-27')).toBe(0)
    expect(dayOfWeek('2026-10-02')).toBe(5)
  })
})

describe('slot generation', () => {
  it('ends a 45-minute appointment at 3:45 PM when it starts at 3:00 PM', () => {
    const slots = buildDaySlots({ date: '2026-10-02', hours: weekday, durationMinutes: 45, now: NOW })
    const three = slots.find((s) => s.time === '15:00')
    expect(three.starts_at).toBe('2026-10-02T22:00:00.000Z')
    expect(three.ends_at).toBe('2026-10-02T22:45:00.000Z')
  })

  it('ends a 75-minute Executive Package at 4:15 PM when it starts at 3:00 PM', () => {
    const slots = buildDaySlots({ date: '2026-10-02', hours: weekday, durationMinutes: 75, now: NOW })
    expect(slots.find((s) => s.time === '15:00').ends_at).toBe('2026-10-02T23:15:00.000Z')
  })

  it('never lets an appointment run past closing', () => {
    const exec = buildDaySlots({ date: '2026-10-02', hours: weekday, durationMinutes: 75, now: NOW })
    expect(exec.at(-1).time).toBe('17:45') // 17:45 + 75 = 19:00
    expect(exec.some((s) => s.time === '18:45')).toBe(false)
    const beard = buildDaySlots({ date: '2026-10-02', hours: weekday, durationMinutes: 30, now: NOW })
    expect(beard.at(-1).time).toBe('18:30')
  })

  it('uses Sunday hours (10:00–16:00)', () => {
    const slots = buildDaySlots({ date: '2026-09-27', hours: sunday, durationMinutes: 45, now: NOW })
    expect(slots[0].time).toBe('10:00')
    expect(slots.at(-1).time).toBe('15:15')
  })

  it('returns no slots on a closed day', () => {
    const closed = { ...weekday, is_closed: true }
    expect(buildDaySlots({ date: '2026-10-02', hours: closed, durationMinutes: 45, now: NOW })).toEqual([])
  })

  it('removes slots that overlap an existing booking but keeps back-to-back ones', () => {
    const busy = [{ starts_at: '2026-10-02T22:00:00Z', ends_at: '2026-10-02T22:45:00Z' }] // 3:00–3:45 PM
    const times = buildDaySlots({ date: '2026-10-02', hours: weekday, durationMinutes: 45, busy, now: NOW }).map((s) => s.time)
    expect(times).not.toContain('14:30') // would end 3:15
    expect(times).not.toContain('15:00')
    expect(times).not.toContain('15:30')
    expect(times).toContain('14:15') // ends exactly 3:00
    expect(times).toContain('15:45') // starts exactly at 3:45
  })

  it('hides times in the past or within the minimum lead time', () => {
    const now = new Date('2026-10-02T21:10:00Z') // 2:10 PM PDT
    const times = buildDaySlots({ date: '2026-10-02', hours: weekday, durationMinutes: 45, now }).map((s) => s.time)
    expect(times[0]).toBe('14:45') // 2:10 PM + 30 min lead → first quarter-hour at/after 2:40 PM
    expect(times).not.toContain('14:30')
  })
})

describe('requested slot validation', () => {
  const base = { hours: weekday, durationMinutes: 45, now: NOW }

  it('accepts a valid future slot', () => {
    const r = validateRequestedSlot({ ...base, date: '2026-10-02', time: '15:00' })
    expect(r.ok).toBe(true)
    expect(r.end.toISOString()).toBe('2026-10-02T22:45:00.000Z')
  })

  it('rejects past dates', () => {
    expect(validateRequestedSlot({ ...base, date: '2026-09-20', time: '15:00' }).code).toBe('past_date')
  })

  it('rejects past times today', () => {
    const now = new Date('2026-10-02T22:30:00Z')
    expect(validateRequestedSlot({ ...base, now, date: '2026-10-02', time: '15:00' }).code).toBe('past_time')
  })

  it('rejects appointments that would end after closing', () => {
    expect(validateRequestedSlot({ ...base, durationMinutes: 75, date: '2026-10-02', time: '18:00' }).code).toBe('after_closing')
  })

  it('rejects times before opening or off the 15-minute grid', () => {
    expect(validateRequestedSlot({ ...base, date: '2026-10-02', time: '07:45' }).code).toBe('outside_hours')
    expect(validateRequestedSlot({ ...base, date: '2026-10-02', time: '09:10' }).code).toBe('outside_hours')
  })

  it('rejects dates beyond the booking window and malformed input', () => {
    const { lastDate } = getBookingWindow(NOW)
    expect(validateRequestedSlot({ ...base, date: '2027-06-01', time: '10:00' }).code).toBe('beyond_window')
    expect(lastDate > '2026-11-01').toBe(true)
    expect(validateRequestedSlot({ ...base, date: '2026-02-30', time: '10:00' }).code).toBe('invalid_date')
    expect(validateRequestedSlot({ ...base, date: '2026-10-02', time: '25:00' }).code).toBe('invalid_time')
  })
})

describe('discounts', () => {
  it('takes 15% off the Signature Cut and Executive Package prices', () => {
    expect(calculateDiscountCents(4500, 15)).toBe(675)
    expect(calculateDiscountCents(7500, 15)).toBe(1125)
  })

  it('returns zero for no promotion', () => {
    expect(calculateDiscountCents(4500, 0)).toBe(0)
  })
})

describe('customer validation', () => {
  const valid = { name: 'Alex Morgan', email: 'alex@example.com', phone: '(555) 123-4567', notes: '' }

  it('accepts valid details', () => {
    expect(validateCustomer(valid)).toEqual({})
  })

  it('flags each invalid field with a message', () => {
    const errors = validateCustomer({ name: 'A', email: 'not-an-email', phone: '12', notes: 'x'.repeat(501) })
    expect(Object.keys(errors).sort()).toEqual(['email', 'name', 'notes', 'phone'])
  })

  it('rejects phone numbers with letters', () => {
    expect(validateCustomer({ ...valid, phone: '555-CALL-NOW' }).phone).toBeTruthy()
  })
})
