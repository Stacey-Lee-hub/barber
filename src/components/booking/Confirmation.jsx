import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarPlus, Copy, Download } from 'lucide-react'
import { downloadIcs, googleCalendarUrl } from '../../lib/calendar'
import {
  formatDurationLong,
  formatPrice,
  formatZonedDate,
  formatZonedTime,
} from '../../lib/format'
import { BUSINESS, FULL_ADDRESS } from '../../data/business'

const EASE = [0.22, 0.61, 0.36, 1]

function SuccessMark() {
  return (
    <svg className="confirm__mark" viewBox="0 0 64 64" aria-hidden="true">
      <motion.circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <motion.path
        d="M20 33l8 8 16-18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
      />
    </svg>
  )
}

/** Shown only after create-booking returns the persisted appointment. */
export default function Confirmation({ booking, onBookAnother }) {
  const [copied, setCopied] = useState(false)
  const [icsSaved, setIcsSaved] = useState(false)
  const headingRef = useRef(null)

  // Announce the result: bring the confirmation into view and move focus to its heading.
  useEffect(() => {
    const heading = headingRef.current
    heading?.scrollIntoView({ block: 'center' })
    heading?.focus({ preventScroll: true })
  }, [])

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(booking.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const rows = [
    ['Service', booking.service.name],
    ['Barber', booking.barber.name],
    ['Date', formatZonedDate(booking.starts_at)],
    [
      'Time',
      `${formatZonedTime(booking.starts_at)} – ${formatZonedTime(booking.ends_at)} ${BUSINESS.timezoneAbbr}`,
    ],
    ['Duration', formatDurationLong(booking.duration_minutes)],
    ['Location', FULL_ADDRESS],
  ]

  return (
    <motion.div
      className="confirm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="confirm__head" role="status">
        <SuccessMark />
        <p className="eyebrow eyebrow--plain">Booking confirmed</p>
        <h2 className="h2 confirm__title" ref={headingRef} tabIndex={-1}>
          You’re booked, <em>{booking.customer.name.split(' ')[0]}.</em>
        </h2>
        <p className="muted">
          Your appointment has been reserved. Please keep your booking reference — we don’t send confirmation emails.
        </p>
      </div>

      <div className="confirm__ref">
        <span className="small-caps">Booking reference</span>
        <code>{booking.id}</code>
        <button type="button" className="confirm__copy" onClick={copyReference}>
          <Copy aria-hidden="true" />
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <dl className="confirm__list">
        {rows.map(([label, value]) => (
          <div key={label} className="summary__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        {booking.discount_cents > 0 && (
          <>
            <div className="summary__row">
              <dt>Price</dt>
              <dd>{formatPrice(booking.original_price_cents)}</dd>
            </div>
            <div className="summary__row summary__row--discount">
              <dt>Discount ({booking.promo_code})</dt>
              <dd>−{formatPrice(booking.discount_cents)}</dd>
            </div>
          </>
        )}
        <div className="summary__row summary__row--total">
          <dt>Total (pay at the shop)</dt>
          <dd>{formatPrice(booking.final_price_cents)}</dd>
        </div>
      </dl>

      <div className="confirm__calendar">
        <h3 className="confirm__cal-title">Add it to your calendar</h3>
        <div className="btn-row">
          <a
            className="btn btn--gold"
            href={googleCalendarUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalendarPlus aria-hidden="true" />
            <span>Add to Google Calendar</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <button
            type="button"
            className="btn btn--light"
            onClick={() => {
              downloadIcs(booking)
              setIcsSaved(true)
            }}
          >
            <Download aria-hidden="true" />
            <span>Apple / Outlook (.ics)</span>
          </button>
        </div>
        <p className="confirm__cal-note" aria-live="polite">
          {icsSaved
            ? 'Calendar file downloaded — open it to add the appointment to your calendar app.'
            : 'Optional — your booking is already saved with us.'}
        </p>
      </div>

      <div className="confirm__foot">
        <p className="muted">
          Need to cancel?{' '}
          <Link to={`/booking/cancel?ref=${booking.id}`}>Cancel online</Link> with your reference and email.
        </p>
        <button type="button" className="text-link" onClick={onBookAnother}>
          Book another appointment
        </button>
      </div>
    </motion.div>
  )
}
