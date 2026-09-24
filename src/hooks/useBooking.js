import { useReducer, useRef, useState } from 'react'
import { bookingReducer, createInitialState, isPromoVerified } from '../lib/bookingFlow'
import { createBooking, previewPromo } from '../lib/api'
import { isValidPromoFormat, normalizeCustomer, normalizePromoCode, validateCustomer } from '@shared/validation.js'

/** Booking journey state plus the actions that talk to the Edge Functions. */
export default function useBooking(initial) {
  const [state, dispatch] = useReducer(bookingReducer, initial, createInitialState)
  const [promoPending, setPromoPending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  /** Ask the server to validate the typed promo code for this service (and email, when known). */
  async function verifyPromo() {
    const code = normalizePromoCode(state.promoInput)
    if (!code) {
      if (state.appliedPromo) dispatch({ type: 'removePromo' })
      return true
    }
    if (!isValidPromoFormat(code)) {
      dispatch({ type: 'promoRejected', message: "That promo code isn't valid." })
      return false
    }
    const emailKnown = !validateCustomer(state.customer).email
    const email = emailKnown ? normalizeCustomer(state.customer).email : ''
    setPromoPending(true)
    try {
      const { quote } = await previewPromo({ serviceId: state.serviceId, promoCode: code, email: email || undefined })
      dispatch({ type: 'promoApplied', code: quote.promo_code ?? code, quote, email })
      return true
    } catch (error) {
      dispatch({ type: 'promoRejected', message: error.message })
      return false
    } finally {
      setPromoPending(false)
    }
  }

  /** Validate details and promo; returns field errors (if any) so the form can move focus. */
  async function continueFromDetails() {
    const errors = validateCustomer(state.customer)
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'setFieldErrors', errors })
      return errors
    }
    if (!isPromoVerified(state) && !(await verifyPromo())) return {}
    dispatch({ type: 'next' })
    return null
  }

  async function submitBooking() {
    if (submitLock.current) return // guards against double clicks and repeated Enter presses
    submitLock.current = true
    setSubmitting(true)
    try {
      const { booking } = await createBooking({
        serviceId: state.serviceId,
        barberId: state.barberId,
        date: state.date,
        time: state.slot.time,
        customer: normalizeCustomer(state.customer),
        promoCode: state.appliedPromo?.code,
      })
      dispatch({ type: 'confirmed', booking })
    } catch (error) {
      dispatch({ type: 'bookingFailed', error })
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return { state, dispatch, verifyPromo, continueFromDetails, submitBooking, promoPending, submitting }
}
