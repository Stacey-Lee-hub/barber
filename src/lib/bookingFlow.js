// Pure state machine for the booking journey. No React or network code here.
import { normalizeCustomer, normalizePromoCode } from '@shared/validation.js'

export const STEPS = [
  { id: 'service', label: 'Service' },
  { id: 'barber', label: 'Barber' },
  { id: 'datetime', label: 'Date & Time' },
  { id: 'details', label: 'Your Details' },
  { id: 'review', label: 'Review' },
]

export const ANY_BARBER = 'any'

const EMPTY_CUSTOMER = { name: '', email: '', phone: '', notes: '' }

// Errors from create-booking that mean the chosen time must be re-picked.
const SLOT_ERROR_CODES = new Set([
  'slot_unavailable',
  'past_time',
  'past_date',
  'after_closing',
  'outside_hours',
  'closed',
  'beyond_window',
  'invalid_slot',
])

export function createInitialState({ serviceId = null, barberId = null, promoCode = '' } = {}) {
  let step = 'service'
  if (serviceId) step = barberId ? 'datetime' : 'barber'
  return {
    step,
    serviceId,
    barberId,
    date: null,
    slot: null,
    customer: EMPTY_CUSTOMER,
    fieldErrors: {},
    promoInput: promoCode,
    appliedPromo: null, // { code, quote, email } — verified by the server for this service and email
    promoError: null,
    notice: null, // { tone: 'error' | 'info', message }
    availabilityKey: 0,
    booking: null,
  }
}

/** True when the promo code typed matches one the server verified for this service and email. */
export function isPromoVerified(state) {
  const typed = normalizePromoCode(state.promoInput)
  if (!typed) return true
  const applied = state.appliedPromo
  return Boolean(applied && applied.code === typed && applied.email === normalizeCustomer(state.customer).email)
}

export function stepIndex(step) {
  return STEPS.findIndex((s) => s.id === step)
}

/** Whether the data needed to open a given step has been chosen. */
export function canOpenStep(state, step) {
  switch (step) {
    case 'service':
      return true
    case 'barber':
      return Boolean(state.serviceId)
    case 'datetime':
      return Boolean(state.serviceId && state.barberId)
    case 'details':
      return Boolean(state.serviceId && state.barberId && state.slot)
    case 'review':
      return canOpenStep(state, 'details')
    default:
      return false
  }
}

export function bookingReducer(state, action) {
  switch (action.type) {
    case 'goTo':
      if (!canOpenStep(state, action.step)) return state
      return { ...state, step: action.step, notice: null }

    case 'selectService':
      if (action.serviceId === state.serviceId) return state
      // Duration and promo eligibility depend on the service, so the time and quote must be re-chosen.
      return { ...state, serviceId: action.serviceId, slot: null, appliedPromo: null, promoError: null }

    case 'selectBarber':
      if (action.barberId === state.barberId) return state
      return { ...state, barberId: action.barberId, slot: null }

    case 'selectDate':
      if (action.date === state.date) return state
      return { ...state, date: action.date, slot: null }

    case 'selectSlot':
      return { ...state, slot: action.slot }

    case 'updateCustomer': {
      const fieldErrors = { ...state.fieldErrors }
      for (const key of Object.keys(action.patch)) delete fieldErrors[key]
      return { ...state, customer: { ...state.customer, ...action.patch }, fieldErrors }
    }

    case 'setFieldErrors':
      return { ...state, fieldErrors: action.errors }

    case 'setPromoInput':
      return { ...state, promoInput: action.value, promoError: null }

    case 'promoApplied':
      return {
        ...state,
        appliedPromo: { code: action.code, quote: action.quote, email: action.email },
        promoInput: action.code,
        promoError: null,
      }

    case 'promoRejected':
      return { ...state, appliedPromo: null, promoError: action.message }

    case 'removePromo':
      return { ...state, appliedPromo: null, promoInput: '', promoError: null }

    case 'next': {
      const i = stepIndex(state.step)
      const nextStep = STEPS[i + 1]?.id
      if (!nextStep || !canOpenStep(state, nextStep)) return state
      return { ...state, step: nextStep, notice: null }
    }

    case 'back': {
      const i = stepIndex(state.step)
      return i > 0 ? { ...state, step: STEPS[i - 1].id, notice: null } : state
    }

    case 'bookingFailed':
      return applyBookingError(state, action.error)

    case 'confirmed':
      return { ...state, step: 'confirmed', booking: action.booking, notice: null }

    case 'reset':
      return createInitialState()

    default:
      return state
  }
}

function applyBookingError(state, error) {
  const notice = { tone: 'error', message: error.message }
  if (SLOT_ERROR_CODES.has(error.code)) {
    return { ...state, step: 'datetime', slot: null, notice, availabilityKey: state.availabilityKey + 1 }
  }
  if (error.code === 'invalid_customer') {
    return { ...state, step: 'details', fieldErrors: error.fields ?? {}, notice }
  }
  if (error.code === 'service_not_found' || error.code === 'invalid_service') {
    return { ...state, step: 'service', serviceId: null, slot: null, appliedPromo: null, notice }
  }
  if (error.code === 'barber_unavailable' || error.code === 'invalid_barber') {
    return { ...state, step: 'barber', barberId: null, slot: null, notice }
  }
  if (error.code?.startsWith('promo_')) {
    return { ...state, step: 'details', appliedPromo: null, promoError: error.message, notice }
  }
  // Network or server problem: stay on the review step so the customer can retry.
  return { ...state, notice }
}
