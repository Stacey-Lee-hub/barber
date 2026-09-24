import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Check, Tag, X } from 'lucide-react'
import { LIMITS } from '@shared/validation.js'
import { formatPrice } from '../../lib/format'
import { FIRST_VISIT_OFFER } from '../../data/business'

const FIELD_ORDER = ['name', 'email', 'phone', 'notes']

function Field({ id, label, error, hint, optional, children }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional ? <span className="field__optional"> (optional)</span> : <span aria-hidden="true"> *</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          <AlertCircle aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

export default function DetailsStep({ state, dispatch, onApplyPromo, promoPending, focusSignal }) {
  const { customer, fieldErrors, promoInput, appliedPromo, promoError } = state
  const formRef = useRef(null)
  const update = (key) => (event) => dispatch({ type: 'updateCustomer', patch: { [key]: event.target.value } })

  // Move focus to the first invalid field whenever a validation attempt fails.
  useEffect(() => {
    if (!focusSignal) return
    const first = FIELD_ORDER.find((key) => fieldErrors[key])
    if (first) formRef.current?.querySelector(`#customer-${first}`)?.focus()
  }, [focusSignal, fieldErrors])

  const errorCount = Object.keys(fieldErrors).length

  return (
    <div className="details" ref={formRef}>
      <h2 className="step-title">Your details</h2>
      <p className="muted details__intro">
        No account needed. We only use these details to manage your appointment.
      </p>

      {errorCount > 0 && (
        <div className="form-summary" role="alert">
          <AlertCircle aria-hidden="true" />
          Please correct {errorCount === 1 ? 'the highlighted field' : `the ${errorCount} highlighted fields`}.
        </div>
      )}

      <div className="details__grid">
        <Field id="customer-name" label="Full name" error={fieldErrors.name}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              maxLength={LIMITS.name}
              value={customer.name}
              onChange={update('name')}
              required
            />
          )}
        </Field>
        <Field id="customer-email" label="Email address" error={fieldErrors.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={LIMITS.email}
              value={customer.email}
              onChange={update('email')}
              required
            />
          )}
        </Field>
        <Field id="customer-phone" label="Phone number" error={fieldErrors.phone} hint="So we can reach you if anything changes.">
          {(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={LIMITS.phone}
              value={customer.phone}
              onChange={update('phone')}
              required
            />
          )}
        </Field>
        <Field
          id="customer-notes"
          label="Appointment notes"
          optional
          error={fieldErrors.notes}
          hint={`${customer.notes.length}/${LIMITS.notes} — e.g. the style you're after.`}
        >
          {(props) => (
            <textarea {...props} rows={3} maxLength={LIMITS.notes} value={customer.notes} onChange={update('notes')} />
          )}
        </Field>
      </div>

      <div className={`promo-field ${promoError ? 'has-error' : ''}`}>
        <label htmlFor="promo-code" className="field__label">
          <Tag aria-hidden="true" /> Promo code <span className="field__optional">(optional)</span>
        </label>
        {appliedPromo && appliedPromo.code === promoInput.trim().toUpperCase() ? (
          <div className="promo-field__applied" role="status">
            <Check aria-hidden="true" />
            <span>
              <strong>{appliedPromo.code}</strong> applied — {formatPrice(appliedPromo.quote.discount_cents)} off
            </span>
            <button type="button" className="promo-field__remove" onClick={() => dispatch({ type: 'removePromo' })}>
              <X aria-hidden="true" />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <div className="promo-field__row">
            <input
              id="promo-code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={LIMITS.promo}
              value={promoInput}
              onChange={(e) => dispatch({ type: 'setPromoInput', value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onApplyPromo()
                }
              }}
              aria-invalid={Boolean(promoError)}
              aria-describedby={promoError ? 'promo-error' : 'promo-hint'}
              placeholder={FIRST_VISIT_OFFER.code}
            />
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onApplyPromo}
              disabled={promoPending || !promoInput.trim()}
            >
              {promoPending && <span className="spinner" aria-hidden="true" />}
              <span>{promoPending ? 'Checking…' : 'Apply'}</span>
            </button>
          </div>
        )}
        {promoError ? (
          <p id="promo-error" className="field__error" role="alert">
            <AlertCircle aria-hidden="true" />
            {promoError}
          </p>
        ) : (
          <p id="promo-hint" className="field__hint">
            First visit? {FIRST_VISIT_OFFER.code} takes {FIRST_VISIT_OFFER.percent}% off {FIRST_VISIT_OFFER.eligibleLabel}.
          </p>
        )}
      </div>

      <p className="details__terms">
        By booking you agree to our <Link to="/terms">Terms &amp; Conditions</Link> and{' '}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  )
}
