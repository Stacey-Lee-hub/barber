// Display formatting shared by the website and the Edge Functions.
import { BUSINESS_TIMEZONE, timeToMinutes } from './schedule.js'

/** Cents → South African Rand, e.g. 4500 → 'R45', 6375 → 'R63.75'. */
export function formatPrice(cents) {
  const rand = cents / 100
  return `R${Number.isInteger(rand) ? rand : rand.toFixed(2)}`
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

/** Instant → 'Friday, October 2, 2026' in the shop's time zone. */
export function formatZonedDate(iso) {
  return longDate.format(new Date(iso))
}

/** Instant → '3:00 PM' in the shop's time zone. */
export function formatZonedTime(iso) {
  return clock.format(new Date(iso))
}
