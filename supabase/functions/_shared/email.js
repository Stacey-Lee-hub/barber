// Booking confirmation email. Built from the confirmed booking record with the same
// helpers as the calendar event, so the email, the attached .ics and the website's
// Add to Calendar buttons always show identical details.
import { ADDRESS_LINES, BUSINESS, FULL_ADDRESS } from './business.js'
import { eventTitle, eventWhen, googleCalendarUrl } from './calendar.js'
import { formatPrice, formatZonedDate, formatZonedTime } from './format.js'

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const firstName = (name) => name.trim().split(/\s+/)[0]

/** Rows shown in both the HTML and plain-text versions. */
export function confirmationRows(booking) {
  const rows = [
    ['Service', booking.service.name],
    ['Barber', booking.barber.name],
    ['Date', formatZonedDate(booking.starts_at)],
    ['Time', `${formatZonedTime(booking.starts_at)} – ${formatZonedTime(booking.ends_at)} ${BUSINESS.timezoneAbbr}`],
    ['Duration', `${booking.duration_minutes} minutes`],
    ['Location', FULL_ADDRESS],
  ]
  if (booking.discount_cents > 0) {
    rows.push(['Price', formatPrice(booking.original_price_cents)])
    rows.push([`Discount (${booking.promo_code})`, `−${formatPrice(booking.discount_cents)}`])
  }
  rows.push(['Total (pay at the shop)', formatPrice(booking.final_price_cents)])
  return rows
}

/**
 * @param {object} booking confirmed booking as returned by create-booking
 * @param {{ siteUrl?: string }} [options] public site URL for the cancel link, if configured
 */
export function buildConfirmationEmail(booking, { siteUrl } = {}) {
  const rows = confirmationRows(booking)
  const gcal = googleCalendarUrl(booking)
  const cancelUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}/booking/cancel?ref=${booking.id}` : null
  const name = firstName(booking.customer.name)
  const subject = `Booking confirmed: ${booking.service.name}, ${formatZonedDate(booking.starts_at)} at ${formatZonedTime(booking.starts_at)}`

  const text = [
    `Hi ${name},`,
    '',
    `Your appointment at ${BUSINESS.name} is confirmed.`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    `Booking reference: ${booking.id}`,
    '',
    'Add to your calendar:',
    `- Google Calendar: ${gcal}`,
    '- Apple Calendar / Outlook: open the attached .ics file',
    '',
    cancelUrl
      ? `Need to cancel? ${cancelUrl}`
      : 'Need to cancel? Use "Cancel a Booking" on our website with your reference and this email address.',
    '',
    `${BUSINESS.name}`,
    ...ADDRESS_LINES,
    `${BUSINESS.phone.display} · ${BUSINESS.email}`,
  ].join('\n')

  const rowHtml = rows
    .map(([label, value], i) => {
      const isTotal = i === rows.length - 1
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e7dfd2;color:#5d5751;font-size:14px;${isTotal ? 'font-weight:600;color:#171717;border-bottom:0;' : ''}">${escapeHtml(label)}</td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #e7dfd2;color:#171717;font-size:14px;${isTotal ? "font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#8c6b43;border-bottom:0;" : ''}">${escapeHtml(value)}</td>
      </tr>`
    })
    .join('')

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f0e8;font-family:Arial,Helvetica,sans-serif;color:#171717;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;">
        <tr><td style="background:#171717;padding:28px 32px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f4f0e8;letter-spacing:0.5px;">The Crown <span style="color:#b89b65;font-style:italic;">&amp;</span> Razor Co.</div>
          <div style="font-size:10px;letter-spacing:3px;color:#b3aca2;margin-top:6px;">EST. ${BUSINESS.established} · BARBERS</div>
        </td></tr>
        <tr><td style="padding:32px 32px 8px;">
          <div style="font-size:11px;letter-spacing:3px;color:#8c6b43;font-weight:bold;">BOOKING CONFIRMED</div>
          <h1 style="margin:10px 0 12px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:30px;line-height:1.2;color:#171717;">You’re booked, ${escapeHtml(name)}.</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#5d5751;">Your chair is reserved. Here are your appointment details — the same details are in the attached calendar file.</p>
        </td></tr>
        <tr><td style="padding:16px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowHtml}</table>
        </td></tr>
        <tr><td style="padding:20px 32px 0;">
          <div style="border:1px dashed #b89b65;padding:12px 14px;font-size:12px;color:#5d5751;">
            <span style="letter-spacing:2px;font-weight:bold;">BOOKING REFERENCE</span><br>
            <span style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#171717;">${escapeHtml(booking.id)}</span>
          </div>
        </td></tr>
        <tr><td style="padding:24px 32px 0;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;margin-bottom:12px;">Add it to your calendar</div>
          <a href="${escapeHtml(gcal)}" style="display:inline-block;background:#b89b65;color:#171717;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:2px;padding:14px 22px;">ADD TO GOOGLE CALENDAR</a>
          <p style="margin:12px 0 0;font-size:13px;color:#5d5751;">Apple Calendar or Outlook: open the attached <strong>.ics</strong> file.</p>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#5d5751;">Need to cancel? ${
            cancelUrl
              ? `<a href="${escapeHtml(cancelUrl)}" style="color:#8c6b43;">Cancel your booking online</a>`
              : 'Use “Cancel a Booking” on our website'
          } with your booking reference and this email address. Please arrive a few minutes early.</p>
        </td></tr>
        <tr><td style="padding:24px 32px 28px;border-top:1px solid #e7dfd2;font-size:12px;line-height:1.7;color:#5d5751;">
          <strong style="color:#171717;">${escapeHtml(BUSINESS.name)}</strong><br>
          ${ADDRESS_LINES.map(escapeHtml).join('<br>')}<br>
          ${escapeHtml(BUSINESS.phone.display)} · ${escapeHtml(BUSINESS.email)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html, text, title: eventTitle(booking), when: eventWhen(booking) }
}
