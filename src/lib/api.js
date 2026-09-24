import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'

export class ApiError extends Error {
  constructor(code, message, extra = {}) {
    super(message)
    this.code = code
    Object.assign(this, extra)
  }
}

const NETWORK_MESSAGE = "We couldn't reach our booking system. Check your connection and try again."
const GENERIC_MESSAGE = 'Something went wrong. Please try again, or call the shop to book.'

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new ApiError('not_configured', 'Online booking is temporarily unavailable. Please call the shop to book.')
  }
}

async function invoke(name, body) {
  assertConfigured()
  let result
  try {
    result = await supabase.functions.invoke(name, { body })
  } catch {
    throw new ApiError('network', NETWORK_MESSAGE)
  }
  const { data, error } = result
  if (!error) return data

  if (error instanceof FunctionsHttpError) {
    let payload = null
    try {
      payload = await error.context.json()
    } catch {
      /* non-JSON error body */
    }
    const e = payload?.error
    if (e?.code) throw new ApiError(e.code, e.message || GENERIC_MESSAGE, { fields: e.fields, status: error.context.status })
    throw new ApiError('server_error', GENERIC_MESSAGE)
  }
  if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
    throw new ApiError('network', NETWORK_MESSAGE)
  }
  throw new ApiError('unknown', GENERIC_MESSAGE)
}

/** Public catalogue: active services, active barbers and opening hours. */
export async function fetchShopData() {
  assertConfigured()
  const [services, barbers, hours] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, category, description, price_cents, duration_minutes, featured, display_order')
      .eq('active', true)
      .order('display_order'),
    supabase
      .from('barbers')
      .select('id, name, role, specialty, bio, display_order')
      .eq('active', true)
      .order('display_order'),
    supabase.from('business_hours').select('day_of_week, opening_time, closing_time, is_closed').order('day_of_week'),
  ])
  const failed = [services, barbers, hours].find((r) => r.error)
  if (failed) throw new ApiError('load_failed', "We couldn't load our menu just now. Please try again.")
  return { services: services.data, barbers: barbers.data, hours: hours.data }
}

export function getAvailability({ serviceId, barberId, date }) {
  return invoke('get-availability', { service_id: serviceId, barber_id: barberId, date })
}

export function previewPromo({ serviceId, promoCode, email }) {
  return invoke('create-booking', {
    preview_only: true,
    service_id: serviceId,
    promo_code: promoCode,
    customer: { email },
  })
}

export function createBooking({ serviceId, barberId, date, time, customer, promoCode }) {
  return invoke('create-booking', {
    service_id: serviceId,
    barber_id: barberId,
    date,
    time,
    customer,
    promo_code: promoCode || undefined,
  })
}

export function cancelBooking({ bookingId, email }) {
  return invoke('cancel-booking', { booking_id: bookingId, email })
}
