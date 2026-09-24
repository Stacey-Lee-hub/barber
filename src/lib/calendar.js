import { buildIcs, icsFileName } from '@shared/calendar.js'

// Event generation is shared with the create-booking Edge Function, so the
// confirmation email's calendar details always match these buttons.
export {
  buildIcs,
  escapeIcsText,
  eventDescription,
  eventTitle,
  foldIcsLine,
  googleCalendarUrl,
  icsFileName,
  toCalendarUtc,
} from '@shared/calendar.js'

/** Triggers a download of the .ics file (opens the Add to Calendar sheet on iOS/macOS). */
export function downloadIcs(booking) {
  const blob = new Blob([buildIcs(booking)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = icsFileName(booking)
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
