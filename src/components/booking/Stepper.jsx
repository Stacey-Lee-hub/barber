import { Check } from 'lucide-react'
import { STEPS, canOpenStep, stepIndex } from '../../lib/bookingFlow'

export default function Stepper({ state, onGoTo }) {
  const current = stepIndex(state.step)
  return (
    <nav className="stepper" aria-label="Booking progress">
      <ol>
        {STEPS.map((step, i) => {
          const done = i < current
          const isCurrent = i === current
          const reachable = done && canOpenStep(state, step.id)
          const content = (
            <>
              <span className="stepper__dot" aria-hidden="true">
                {done ? <Check /> : i + 1}
              </span>
              <span className="stepper__label">{step.label}</span>
              <span className="visually-hidden">{done ? ' (completed)' : isCurrent ? ' (current step)' : ''}</span>
            </>
          )
          return (
            <li key={step.id} className={`stepper__item ${done ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}>
              {reachable ? (
                <button type="button" className="stepper__btn" onClick={() => onGoTo(step.id)}>
                  {content}
                </button>
              ) : (
                <span className="stepper__btn" aria-current={isCurrent ? 'step' : undefined}>
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
