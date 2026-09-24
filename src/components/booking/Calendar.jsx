import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, dayOfWeek } from '@shared/schedule.js'
import { formatCalendarDate } from '../../lib/format'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const KEY_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

const monthOf = (dateStr) => dateStr.slice(0, 7)

function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function daysInMonth(month) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/**
 * Month grid in the shop's calendar. Dates are plain 'YYYY-MM-DD' strings, so the
 * customer's own time zone never shifts which day is selected.
 */
export default function Calendar({ value, onChange, firstDate, lastDate, isClosed }) {
  const [viewMonth, setViewMonth] = useState(monthOf(value ?? firstDate))
  const [focusDate, setFocusDate] = useState(null)
  const gridRef = useRef(null)

  const isDisabled = (d) => d < firstDate || d > lastDate || isClosed(d)

  useEffect(() => {
    if (!focusDate) return
    gridRef.current?.querySelector(`[data-date="${focusDate}"]`)?.focus()
  }, [focusDate, viewMonth])

  const total = daysInMonth(viewMonth)
  const leading = dayOfWeek(`${viewMonth}-01`)
  const days = Array.from({ length: total }, (_, i) => `${viewMonth}-${String(i + 1).padStart(2, '0')}`)
  const enabledDays = days.filter((d) => !isDisabled(d))
  const tabStop = value && monthOf(value) === viewMonth && !isDisabled(value) ? value : enabledDays[0]

  const canPrev = viewMonth > monthOf(firstDate)
  const canNext = viewMonth < monthOf(lastDate)

  const onKeyDown = (event, date) => {
    const step = KEY_STEPS[event.key]
    if (!step) return
    event.preventDefault()
    let target = addDays(date, step)
    while (target >= firstDate && target <= lastDate && isDisabled(target)) target = addDays(target, step)
    if (target < firstDate || target > lastDate) return
    if (monthOf(target) !== viewMonth) setViewMonth(monthOf(target))
    setFocusDate(target)
  }

  const [year, month] = viewMonth.split('-').map(Number)
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  )

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button
          type="button"
          className="calendar__nav"
          onClick={() => setViewMonth(shiftMonth(viewMonth, -1))}
          disabled={!canPrev}
          aria-label="Previous month"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h3 className="calendar__month" aria-live="polite">
          {monthLabel}
        </h3>
        <button
          type="button"
          className="calendar__nav"
          onClick={() => setViewMonth(shiftMonth(viewMonth, 1))}
          disabled={!canNext}
          aria-label="Next month"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="calendar__grid" ref={gridRef} role="group" aria-label={`Dates in ${monthLabel}`}>
        {Array.from({ length: leading }, (_, i) => (
          <span key={`pad-${i}`} aria-hidden="true" />
        ))}
        {days.map((date) => {
          const disabled = isDisabled(date)
          const selected = date === value
          const closed = date >= firstDate && date <= lastDate && isClosed(date)
          return (
            <button
              key={date}
              type="button"
              data-date={date}
              className={`calendar__day ${selected ? 'is-selected' : ''} ${date === firstDate ? 'is-today' : ''}`}
              disabled={disabled}
              aria-pressed={selected}
              aria-current={date === firstDate ? 'date' : undefined}
              aria-label={`${formatCalendarDate(date)}${closed ? ', closed' : ''}${date === firstDate ? ', today' : ''}`}
              tabIndex={date === tabStop ? 0 : -1}
              onClick={() => onChange(date)}
              onKeyDown={(e) => onKeyDown(e, date)}
            >
              {Number(date.slice(8))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
