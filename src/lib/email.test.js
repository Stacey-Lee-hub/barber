import { describe, expect, it } from 'vitest'
import { buildConfirmationEmail } from '@shared/email.js'
import { buildIcs, googleCalendarUrl } from '@shared/calendar.js'

// Shape returned by the create-booking Edge Function.
const booking = {
  id: '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
  timezone: 'Africa/Johannesburg',
  service: { id: 's1', name: 'The Executive Package' },
  barber: { id: 'b1', name: 'Elena Rostova' },
  starts_at: '2026-10-02T13:00:00+00:00', // 3:00 PM SAST
  ends_at: '2026-10-02T14:15:00+00:00', // 4:15 PM SAST
  duration_minutes: 75,
  original_price_cents: 7500,
  discount_cents: 1125,
  final_price_cents: 6375,
  promo_code: 'CROWN15',
  customer: { name: 'Jordan <b>Ellis</b>', email: 'jordan@example.com' },
}

describe('confirmation email', () => {
  const email = buildConfirmationEmail(booking, { siteUrl: 'https://crown.example/' })

  it('has a clear subject with service, date and time', () => {
    expect(email.subject).toBe('Booking confirmed: The Executive Package, Friday, October 2, 2026 at 3:00 PM')
  })

  it('shows the same appointment details as the calendar event', () => {
    for (const part of [
      'The Executive Package',
      'Elena Rostova',
      'Friday, October 2, 2026',
      '3:00 PM – 4:15 PM SAST',
      '75 minutes',
      '142 Bree Street, Suite 102, Cape Town City Centre, Cape Town, 8001, South Africa',
      'R75',
      '−R11.25',
      'R63.75',
      booking.id,
    ]) {
      expect(email.text).toContain(part)
      expect(email.html).toContain(part.replace(/&/g, '&amp;'))
    }
    expect(email.when).toBe('Friday, October 2, 2026, 3:00 PM – 4:15 PM SAST')
    // Calendar file carries the identical instants
    expect(buildIcs(booking)).toContain('DTSTART:20261002T130000Z')
  })

  it('links to the identical Google Calendar event', () => {
    const href = googleCalendarUrl(booking).replace(/&/g, '&amp;')
    expect(email.html).toContain(`href="${href}"`)
    expect(email.text).toContain(googleCalendarUrl(booking))
  })

  it('escapes customer-provided text in the HTML', () => {
    expect(email.html).toContain('Jordan &lt;b&gt;Ellis&lt;/b&gt;'.split(' ')[0])
    expect(email.html).not.toContain('<b>Ellis</b>')
  })

  it('includes a cancel link only when a site URL is configured', () => {
    expect(email.html).toContain(`https://crown.example/booking/cancel?ref=${booking.id}`)
    const noSite = buildConfirmationEmail(booking)
    expect(noSite.html).not.toContain('/booking/cancel')
    expect(noSite.text).toContain('Cancel a Booking')
  })
})
