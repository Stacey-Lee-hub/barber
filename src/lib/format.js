// Price and date/time formatting is shared with the Edge Functions (confirmation email).
export { formatClock, formatPrice, formatZonedDate, formatZonedTime } from '@shared/format.js'

export function formatDuration(minutes) {
  return `${minutes} min`
}

export function formatDurationLong(minutes) {
  return `${minutes} minutes`
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
