import { describe, expect, it } from 'vitest'
import { buildIcs, escapeIcsText, foldIcsLine, googleCalendarUrl, toCalendarUtc } from './calendar'
import { groupBusinessHours } from './hours'

// Shape returned by the create-booking Edge Function.
const booking = {
  id: '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
  timezone: 'Africa/Johannesburg',
  service: { id: 's1', name: 'The Executive Package' },
  barber: { id: 'b1', name: 'Marcus "Blade" Vance' },
  starts_at: '2026-10-02T13:00:00+00:00', // 3:00 PM SAST
  ends_at: '2026-10-02T14:15:00+00:00', // 4:15 PM SAST
  duration_minutes: 75,
  original_price_cents: 7500,
  discount_cents: 1125,
  final_price_cents: 6375,
  promo_code: 'CROWN15',
}

describe('Google Calendar link', () => {
  const url = new URL(googleCalendarUrl(booking))

  it('uses the confirmed start and end instants in UTC', () => {
    expect(url.searchParams.get('dates')).toBe('20261002T130000Z/20261002T141500Z')
  })

  it('includes title, location, shop time zone and booking details', () => {
    expect(url.searchParams.get('text')).toBe('The Crown & Razor Co. — The Executive Package')
    expect(url.searchParams.get('location')).toBe('142 Bree Street, Suite 102, Cape Town City Centre, Cape Town, 8001, South Africa')
    expect(url.searchParams.get('ctz')).toBe('Africa/Johannesburg')
    const details = url.searchParams.get('details')
    expect(details).toContain('Barber: Marcus "Blade" Vance')
    expect(details).toContain('3:00 PM – 4:15 PM SAST')
    expect(details).toContain('(021) 019 2834')
  })
})

describe('ICS file', () => {
  const ics = buildIcs(booking, new Date('2026-09-24T12:00:00Z'))
  const unfolded = ics.replace(/\r\n /g, '')

  it('uses CRLF line endings and wraps a single VEVENT', () => {
    expect(ics.split('\r\n').filter(Boolean).every((l) => !l.includes('\n'))).toBe(true)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
  })

  it('has the confirmed start, end, a stable UID and timestamp', () => {
    expect(unfolded).toContain('DTSTART:20261002T130000Z')
    expect(unfolded).toContain('DTEND:20261002T141500Z')
    expect(unfolded).toContain(`UID:${booking.id}@crownandrazor.com`)
    expect(unfolded).toContain('DTSTAMP:20260924T120000Z')
  })

  it('escapes commas and semicolons in text fields', () => {
    expect(unfolded).toContain(
      'LOCATION:142 Bree Street\\, Suite 102\\, Cape Town City Centre\\, Cape Town\\, 8001\\, South Africa',
    )
    expect(unfolded).toContain('SUMMARY:The Crown & Razor Co. — The Executive Package')
  })

  it('keeps every physical line within 75 octets', () => {
    const encoder = new TextEncoder()
    for (const line of ics.split('\r\n')) expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
  })
})

describe('ICS helpers', () => {
  it('escapes backslashes, semicolons, commas and newlines', () => {
    expect(escapeIcsText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne')
  })

  it('folds long lines without splitting multi-byte characters', () => {
    const folded = foldIcsLine('SUMMARY:' + '—'.repeat(40))
    expect(folded.replace(/\r\n /g, '')).toBe('SUMMARY:' + '—'.repeat(40))
  })

  it('formats UTC timestamps', () => {
    expect(toCalendarUtc('2026-12-04T23:00:00.000Z')).toBe('20261204T230000Z')
  })
})

describe('opening hours display', () => {
  it('groups consecutive days with identical hours', () => {
    const rows = [
      { day_of_week: 0, opening_time: '10:00:00', closing_time: '16:00:00', is_closed: false },
      ...[1, 2, 3, 4, 5].map((d) => ({ day_of_week: d, opening_time: '08:00:00', closing_time: '19:00:00', is_closed: false })),
      { day_of_week: 6, opening_time: '08:00:00', closing_time: '18:00:00', is_closed: false },
    ]
    expect(groupBusinessHours(rows)).toEqual([
      { label: 'Monday – Friday', value: '8:00 AM – 7:00 PM' },
      { label: 'Saturday', value: '8:00 AM – 6:00 PM' },
      { label: 'Sunday', value: '10:00 AM – 4:00 PM' },
    ])
  })
})
