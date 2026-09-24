import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import ButtonLink from '../components/ui/ButtonLink'
import { cancelBooking } from '../lib/api'
import { isUuid } from '@shared/schedule.js'
import { BUSINESS } from '../data/business'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function CancelBooking() {
  useDocumentMeta('Cancel a Booking', 'Cancel an upcoming appointment at The Crown & Razor Co.')
  const [params] = useSearchParams()
  const [reference, setReference] = useState(params.get('ref') ?? '')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ state: 'idle', message: null, errors: {} })
  const lock = useRef(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (lock.current) return
    const errors = {}
    if (!isUuid(reference.trim())) errors.reference = 'Enter the full booking reference shown on your confirmation.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errors.email = 'Enter the email address you booked with.'
    if (Object.keys(errors).length) {
      setStatus({ state: 'idle', message: null, errors })
      document.getElementById(errors.reference ? 'cancel-ref' : 'cancel-email')?.focus()
      return
    }
    lock.current = true
    setStatus({ state: 'submitting', message: null, errors: {} })
    try {
      const result = await cancelBooking({ bookingId: reference.trim(), email: email.trim() })
      setStatus({
        state: 'done',
        message: result.already
          ? 'This appointment was already cancelled.'
          : 'Your appointment has been cancelled and the time has been released.',
        errors: {},
      })
    } catch (error) {
      setStatus({ state: 'error', message: error.message, errors: {} })
    } finally {
      lock.current = false
    }
  }

  return (
    <>
      <PageHero
        compact
        eyebrow="Manage Booking"
        title={
          <>
            Cancel a <em>booking.</em>
          </>
        }
        intro="Plans change. Cancel online up until your appointment starts, and the time is released for another guest."
      />
      <section className="section section--light">
        <div className="container container--narrow">
          {status.state === 'done' ? (
            <div className="cancel-done" role="status">
              <CheckCircle2 aria-hidden="true" />
              <h2 className="h3">{status.message}</h2>
              <p className="muted">Want a different time instead?</p>
              <ButtonLink to="/booking">Book a New Time</ButtonLink>
            </div>
          ) : (
            <form className="cancel-form" onSubmit={onSubmit} noValidate>
              {status.state === 'error' && (
                <div className="notice notice--error" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <p>{status.message}</p>
                </div>
              )}
              <div className={`field ${status.errors.reference ? 'has-error' : ''}`}>
                <label htmlFor="cancel-ref" className="field__label">
                  Booking reference <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cancel-ref"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  aria-invalid={Boolean(status.errors.reference)}
                  aria-describedby={status.errors.reference ? 'cancel-ref-error' : 'cancel-ref-hint'}
                  placeholder="e.g. 3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f"
                />
                {status.errors.reference ? (
                  <p id="cancel-ref-error" className="field__error">
                    <AlertCircle aria-hidden="true" />
                    {status.errors.reference}
                  </p>
                ) : (
                  <p id="cancel-ref-hint" className="field__hint">
                    Shown on your booking confirmation and in your calendar event.
                  </p>
                )}
              </div>
              <div className={`field ${status.errors.email ? 'has-error' : ''}`}>
                <label htmlFor="cancel-email" className="field__label">
                  Email address <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cancel-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(status.errors.email)}
                  aria-describedby={status.errors.email ? 'cancel-email-error' : undefined}
                />
                {status.errors.email && (
                  <p id="cancel-email-error" className="field__error">
                    <AlertCircle aria-hidden="true" />
                    {status.errors.email}
                  </p>
                )}
              </div>
              <button type="submit" className="btn btn--dark" disabled={status.state === 'submitting'}>
                {status.state === 'submitting' && <span className="spinner" aria-hidden="true" />}
                <span>{status.state === 'submitting' ? 'Cancelling…' : 'Cancel Appointment'}</span>
              </button>
              <p className="muted cancel-form__help">
                Lost your reference? Call us on <a href={BUSINESS.phone.href}>{BUSINESS.phone.display}</a>.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
