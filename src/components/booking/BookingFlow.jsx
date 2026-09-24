import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import Stepper from './Stepper'
import { BarberStep, ServiceStep } from './ChoiceSteps'
import DateTimeStep from './DateTimeStep'
import DetailsStep from './DetailsStep'
import ReviewStep from './ReviewStep'
import BookingSummary from './BookingSummary'
import Confirmation from './Confirmation'
import useBooking from '../../hooks/useBooking'
import { canOpenStep, STEPS, stepIndex } from '../../lib/bookingFlow'

const EASE = [0.22, 0.61, 0.36, 1]

export default function BookingFlow({ initial, services, barbers, hours }) {
  const { state, dispatch, verifyPromo, continueFromDetails, submitBooking, promoPending, submitting } =
    useBooking(initial)
  const [focusSignal, setFocusSignal] = useState(0)
  const panelRef = useRef(null)
  const firstRender = useRef(true)

  const service = services.find((s) => s.id === state.serviceId) ?? null
  const barber = barbers.find((b) => b.id === state.barberId) ?? null
  const index = stepIndex(state.step)
  const isLast = index === STEPS.length - 1
  const nextStep = STEPS[index + 1]?.id
  const canContinue = state.step === 'details' || (nextStep ? canOpenStep(state, nextStep) : true)

  // On step change, bring the panel into view and move focus to its heading for screen readers.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const panel = panelRef.current
    if (!panel) return
    panel.scrollIntoView({ block: 'start', behavior: 'smooth' })
    panel.focus({ preventScroll: true })
  }, [state.step])

  const handleContinue = async () => {
    if (state.step === 'details') {
      const errors = await continueFromDetails()
      if (errors) setFocusSignal((n) => n + 1)
      return
    }
    if (state.step === 'review') {
      await submitBooking()
      return
    }
    dispatch({ type: 'next' })
  }

  if (state.step === 'confirmed' && state.booking) {
    return (
      <div className="booking booking--confirmed">
        <Confirmation booking={state.booking} onBookAnother={() => dispatch({ type: 'reset' })} />
      </div>
    )
  }

  const continueLabel = {
    service: 'Choose Barber',
    barber: 'Choose Date & Time',
    datetime: 'Enter Your Details',
    details: 'Review Booking',
    review: submitting ? 'Confirming…' : 'Confirm Booking',
  }[state.step]

  return (
    <div className="booking">
      <Stepper state={state} onGoTo={(step) => dispatch({ type: 'goTo', step })} />

      <div className="booking__layout">
        <div className="booking__panel" ref={panelRef} tabIndex={-1} aria-label={`Step ${index + 1} of ${STEPS.length}`}>
          {state.notice && (
            <div className={`notice notice--${state.notice.tone}`} role="alert">
              <AlertCircle aria-hidden="true" />
              <p>{state.notice.message}</p>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {state.step === 'service' && (
                <ServiceStep
                  services={services}
                  selectedId={state.serviceId}
                  onSelect={(serviceId) => dispatch({ type: 'selectService', serviceId })}
                />
              )}
              {state.step === 'barber' && (
                <BarberStep
                  barbers={barbers}
                  selectedId={state.barberId}
                  onSelect={(barberId) => dispatch({ type: 'selectBarber', barberId })}
                />
              )}
              {state.step === 'datetime' && service && (
                <DateTimeStep state={state} dispatch={dispatch} service={service} hours={hours} />
              )}
              {state.step === 'details' && (
                <DetailsStep
                  state={state}
                  dispatch={dispatch}
                  onApplyPromo={verifyPromo}
                  promoPending={promoPending}
                  focusSignal={focusSignal}
                />
              )}
              {state.step === 'review' && (
                <ReviewStep state={state} dispatch={dispatch} service={service} barber={barber} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="booking__actions">
            {index > 0 ? (
              <button type="button" className="btn btn--outline" onClick={() => dispatch({ type: 'back' })} disabled={submitting}>
                <ArrowLeft aria-hidden="true" />
                <span>Back</span>
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className={`btn ${isLast ? 'btn--gold' : 'btn--dark'}`}
              onClick={handleContinue}
              disabled={!canContinue || submitting || promoPending}
              aria-disabled={!canContinue || submitting || promoPending}
            >
              {(submitting || (promoPending && state.step === 'details')) && <span className="spinner" aria-hidden="true" />}
              <span>{continueLabel}</span>
              {!isLast && <ArrowRight className="btn__arrow" aria-hidden="true" />}
            </button>
          </div>
          {!canContinue && (
            <p className="booking__hint" aria-live="polite">
              {state.step === 'service' && 'Select a service to continue.'}
              {state.step === 'barber' && 'Select a barber, or choose any available barber.'}
              {state.step === 'datetime' && 'Select a date and an available time to continue.'}
            </p>
          )}
        </div>

        {state.step !== 'review' && (
          <aside className="booking__aside">
            <BookingSummary state={state} service={service} barber={barber} />
          </aside>
        )}
      </div>
    </div>
  )
}
