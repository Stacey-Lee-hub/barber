import { useState } from 'react'
import { CalendarSearch, Check } from 'lucide-react'
import Calendar from './Calendar'
import { ErrorBlock } from '../ui/States'
import useAvailability from '../../hooks/useAvailability'
import { getAvailability } from '../../lib/api'
import { addDays, dayOfWeek, getBookingWindow } from '@shared/schedule.js'
import { formatCalendarDate, formatClock, formatZonedTime } from '../../lib/format'
import { BUSINESS } from '../../data/business'

const PERIODS = [
  { id: 'morning', label: 'Morning', test: (t) => t < '12:00' },
  { id: 'afternoon', label: 'Afternoon', test: (t) => t >= '12:00' && t < '17:00' },
  { id: 'evening', label: 'Evening', test: (t) => t >= '17:00' },
]

const REASON_TEXT = {
  fully_booked: 'Fully booked on this day for the selected barber and service.',
  day_over: 'There are no more bookable times today.',
  closed: 'The shop is closed on this day.',
  past_date: 'That date has passed.',
  beyond_window: 'That date is beyond our booking window.',
}

const SEARCH_LIMIT_DAYS = 21

export default function DateTimeStep({ state, dispatch, service, hours }) {
  const { firstDate, lastDate } = getBookingWindow()
  const hoursByDay = new Map(hours.map((h) => [h.day_of_week, h]))
  const isClosed = (date) => {
    const row = hoursByDay.get(dayOfWeek(date))
    return !row || row.is_closed
  }

  const availability = useAvailability({
    serviceId: state.serviceId,
    barberId: state.barberId,
    date: state.date,
    refreshKey: state.availabilityKey,
  })
  const [search, setSearch] = useState({ status: 'idle', message: null })

  const findNextAvailable = async () => {
    setSearch({ status: 'searching', message: null })
    let date = state.date ?? firstDate
    for (let i = 0; i < SEARCH_LIMIT_DAYS; i++) {
      date = addDays(date, 1)
      if (date > lastDate) break
      if (isClosed(date)) continue
      try {
        const result = await getAvailability({ serviceId: state.serviceId, barberId: state.barberId, date })
        if (result.slots?.length) {
          setSearch({ status: 'idle', message: null })
          dispatch({ type: 'selectDate', date })
          return
        }
      } catch (error) {
        setSearch({ status: 'idle', message: error.message })
        return
      }
    }
    setSearch({
      status: 'idle',
      message: `No openings in the next ${SEARCH_LIMIT_DAYS} days for this selection. Try another barber, or call us on ${BUSINESS.phone.display}.`,
    })
  }

  const slotsByPeriod = PERIODS.map((p) => ({ ...p, slots: availability.slots.filter((s) => p.test(s.time)) })).filter(
    (p) => p.slots.length > 0,
  )

  return (
    <div className="datetime">
      <div className="datetime__calendar">
        <h2 className="step-title">Choose a date</h2>
        <Calendar
          value={state.date}
          onChange={(date) => dispatch({ type: 'selectDate', date })}
          firstDate={firstDate}
          lastDate={lastDate}
          isClosed={isClosed}
        />
        <p className="datetime__tz">Times shown in {BUSINESS.timezoneLabel} (shop local time).</p>
      </div>

      <div className="datetime__slots" aria-live="polite">
        <h2 className="step-title">
          {state.date ? `Available times · ${formatCalendarDate(state.date, { weekday: 'short', month: 'short', day: 'numeric' })}` : 'Choose a time'}
        </h2>

        {!state.date && <p className="muted">Select a date to see open times for the {service.name}.</p>}

        {availability.status === 'loading' && (
          <div className="slot-skeletons" role="status" aria-label="Loading available times">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="skeleton slot-skeleton" />
            ))}
          </div>
        )}

        {availability.status === 'error' && (
          <ErrorBlock
            title="Couldn't load times"
            message={availability.error?.message}
            onRetry={availability.reload}
          />
        )}

        {availability.status === 'ready' && availability.slots.length === 0 && (
          <div className="state-block">
            <p className="state-block__title">
              <CalendarSearch aria-hidden="true" />
              {REASON_TEXT[availability.reason] ?? 'No times available on this day.'}
            </p>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={findNextAvailable}
              disabled={search.status === 'searching'}
            >
              {search.status === 'searching' ? <span className="spinner" aria-hidden="true" /> : null}
              <span>{search.status === 'searching' ? 'Searching…' : 'Find the next available day'}</span>
            </button>
            {search.message && <p className="muted">{search.message}</p>}
          </div>
        )}

        {availability.status === 'ready' && slotsByPeriod.length > 0 && (
          <fieldset className="slot-groups">
            <legend className="visually-hidden">Available start times</legend>
            {slotsByPeriod.map((period) => (
              <div key={period.id} className="slot-group">
                <p className="slot-group__label small-caps">{period.label}</p>
                <div className="slot-grid">
                  {period.slots.map((slot) => {
                    const checked = state.slot?.starts_at === slot.starts_at
                    return (
                      <label key={slot.starts_at} className={`slot ${checked ? 'is-checked' : ''}`}>
                        <input
                          type="radio"
                          name="slot"
                          className="visually-hidden"
                          checked={checked}
                          onChange={() => dispatch({ type: 'selectSlot', slot })}
                          aria-label={`${formatClock(slot.time)} to ${formatZonedTime(slot.ends_at)}`}
                        />
                        {checked && <Check aria-hidden="true" />}
                        {formatClock(slot.time)}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </fieldset>
        )}

        {state.slot && (
          <p className="datetime__selected">
            <strong>{formatClock(state.slot.time)}</strong> – {formatZonedTime(state.slot.ends_at)} ·{' '}
            {service.duration_minutes} minutes
          </p>
        )}
      </div>
    </div>
  )
}
