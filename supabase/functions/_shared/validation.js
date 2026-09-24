// Customer-detail validation shared by the booking form and the create-booking Edge Function.

export const LIMITS = { name: 80, email: 254, phone: 25, notes: 500, promo: 32 }

// Same pattern the validate_appointment database trigger enforces.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const PHONE_CHARS_RE = /^[+\d\s().-]+$/
const PROMO_RE = /^[A-Z0-9-]{2,32}$/

export function normalizePromoCode(code) {
  return typeof code === 'string' ? code.trim().toUpperCase() : ''
}

export function isValidPromoFormat(code) {
  return PROMO_RE.test(normalizePromoCode(code))
}

export function normalizeCustomer(input = {}) {
  const str = (v) => (typeof v === 'string' ? v.trim() : '')
  return {
    name: str(input.name).replace(/\s+/g, ' '),
    email: str(input.email).toLowerCase(),
    phone: str(input.phone),
    notes: str(input.notes),
  }
}

/** Returns an object of field → message. Empty object means valid. */
export function validateCustomer(input) {
  const c = normalizeCustomer(input)
  const errors = {}

  if (c.name.length < 2) errors.name = 'Please enter your full name.'
  else if (c.name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`

  if (!c.email) errors.email = 'Please enter your email address.'
  else if (c.email.length > LIMITS.email || !EMAIL_RE.test(c.email)) {
    errors.email = 'Please enter a valid email address, e.g. name@example.com.'
  }

  const digits = c.phone.replace(/\D/g, '')
  if (!c.phone) errors.phone = 'Please enter a phone number.'
  else if (!PHONE_CHARS_RE.test(c.phone) || digits.length < 7 || digits.length > 15 || c.phone.length > LIMITS.phone) {
    errors.phone = 'Please enter a valid phone number (7–15 digits).'
  }

  if (c.notes.length > LIMITS.notes) errors.notes = `Notes must be ${LIMITS.notes} characters or fewer.`

  return errors
}
