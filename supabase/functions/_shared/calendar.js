// Calendar output shared by the website (Add to Calendar buttons) and the create-booking
// Edge Function (confirmation email + attached .ics), so both always carry identical details.
// Everything is generated from the confirmed booking record: starts_at / ends_at are UTC
// instants, so events land at the shop's local time whatever the customer's device zone.
import { BUSINESS, FULL_ADDRESS } from './business.js'
import { BUSINESS_TIMEZONE, dateInZone } from './schedule.js'
import { formatPrice, formatZonedDate, formatZonedTime } from './format.js'

/** Date → '20261002T130000Z' */
export function toCalendarUtc(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function eventTitle(booking) {
  return `${BUSINESS.name} — ${booking.service.name}`
}

/** 'Friday, October 2, 2026, 3:00 PM – 4:15 PM SAST' */
export function eventWhen(booking) {
  return `${formatZonedDate(booking.starts_at)}, ${formatZonedTime(booking.starts_at)} – ${formatZonedTime(booking.ends_at)} ${BUSINESS.timezoneAbbr}`
}

export function eventDescription(booking) {
  const lines = [
    `Service: ${booking.service.name}`,
    `Barber: ${booking.barber.name}`,
    `When: ${eventWhen(booking)}`,
    `Duration: ${booking.duration_minutes} minutes`,
    `Total: ${formatPrice(booking.final_price_cents)}${booking.discount_cents > 0 ? ` (includes ${booking.promo_code} discount)` : ''}`,
    `Booking reference: ${booking.id}`,
    '',
    `Phone: ${BUSINESS.phone.display}`,
    `Email: ${BUSINESS.email}`,
    'Need to change your appointment? Contact us or cancel online with your booking reference.',
  ]
  return lines.join('\n')
}

export function googleCalendarUrl(booking) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(booking),
    dates: `${toCalendarUtc(booking.starts_at)}/${toCalendarUtc(booking.ends_at)}`,
    details: eventDescription(booking),
    location: FULL_ADDRESS,
    ctz: booking.timezone || BUSINESS_TIMEZONE,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** RFC 5545 TEXT escaping. */
export function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Fold content lines longer than 75 octets (RFC 5545 §3.1), never splitting a UTF-8 character. */
export function foldIcsLine(line) {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const out = []
  let current = ''
  let currentBytes = 0
  let limit = 75
  for (const char of line) {
    const size = encoder.encode(char).length
    if (currentBytes + size > limit) {
      out.push(current)
      current = ''
      currentBytes = 0
      limit = 74 // continuation lines start with a space
    }
    current += char
    currentBytes += size
  }
  out.push(current)
  return out.join('\r\n ')
}

export function buildIcs(booking, now = new Date()) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Crown & Razor Co.//Online Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@${BUSINESS.domain}`,
    `DTSTAMP:${toCalendarUtc(now.toISOString())}`,
    `DTSTART:${toCalendarUtc(booking.starts_at)}`,
    `DTEND:${toCalendarUtc(booking.ends_at)}`,
    `SUMMARY:${escapeIcsText(eventTitle(booking))}`,
    `DESCRIPTION:${escapeIcsText(eventDescription(booking))}`,
    `LOCATION:${escapeIcsText(FULL_ADDRESS)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`Reminder: ${booking.service.name} at ${BUSINESS.name}`)}`,
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldIcsLine).join('\r\n') + '\r\n'
}

export function icsFileName(booking) {
  return `crown-and-razor-appointment-${dateInZone(new Date(booking.starts_at))}.ics`
}
