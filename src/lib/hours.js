import { formatClock } from './format'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Monday first

/**
 * Collapse business_hours rows into display groups, e.g.
 * [{ label: 'Monday – Friday', value: '8:00 AM – 7:00 PM' }, …]
 */
export function groupBusinessHours(rows = []) {
  const byDay = new Map(rows.map((r) => [r.day_of_week, r]))
  const groups = []
  for (const day of DISPLAY_ORDER) {
    const row = byDay.get(day)
    if (!row) continue
    const value = row.is_closed ? 'Closed' : `${formatClock(row.opening_time)} – ${formatClock(row.closing_time)}`
    const last = groups.at(-1)
    if (last && last.value === value && last.lastDay === DISPLAY_ORDER[DISPLAY_ORDER.indexOf(day) - 1]) {
      last.lastDay = day
    } else {
      groups.push({ firstDay: day, lastDay: day, value })
    }
  }
  return groups.map((g) => ({
    label: g.firstDay === g.lastDay ? DAY_NAMES[g.firstDay] : `${DAY_NAMES[g.firstDay]} – ${DAY_NAMES[g.lastDay]}`,
    value: g.value,
  }))
}
