// POST {
//   service_id, barber_id | "any", date: "YYYY-MM-DD", time: "HH:MM",
//   customer: { name, email, phone, notes? }, promo_code?, preview_only?
// }
// preview_only: validates the service and promo code and returns the price breakdown
// without creating anything. Otherwise creates the appointment and returns the
// confirmed record. Price, discount and duration are always derived server-side;
// the database trigger on appointments remains the final authority.
import { createAdminClient, RELEASED_STATUS_FILTER } from '../_shared/admin.ts'
import { errorResponse, json, readJsonRequest, SERVER_ERROR_MESSAGE } from '../_shared/http.js'
import {
  BUSINESS_TIMEZONE,
  calculateDiscountCents,
  dayOfWeek,
  isUuid,
  isValidDateString,
  isValidTimeString,
  validateRequestedSlot,
} from '../_shared/schedule.js'
import { isValidPromoFormat, normalizeCustomer, normalizePromoCode, validateCustomer } from '../_shared/validation.js'

type Db = ReturnType<typeof createAdminClient>
type Service = { id: string; name: string; price_cents: number; duration_minutes: number }
type Promotion = { id: string; code: string; discount_percentage: number }

const CONFLICT_MESSAGE = 'Sorry — that time was just taken. Please choose another time.'

class BookingError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

async function resolvePromotion(db: Db, rawCode: string, service: Service, email: string, now: Date) {
  const code = normalizePromoCode(rawCode)
  if (!isValidPromoFormat(code)) throw new BookingError(422, 'promo_invalid', "That promo code isn't valid.")

  const { data: promo, error } = await db
    .from('promotions')
    .select('id, code, discount_percentage, active, starts_at, expires_at, first_visit_only')
    .ilike('code', code)
    .maybeSingle()
  if (error) throw error
  const live =
    promo?.active &&
    (!promo.starts_at || new Date(promo.starts_at) <= now) &&
    (!promo.expires_at || new Date(promo.expires_at) > now)
  if (!live) throw new BookingError(422, 'promo_invalid', "That promo code isn't valid or has expired.")

  const { data: link, error: linkError } = await db
    .from('promotion_services')
    .select('service_id')
    .eq('promotion_id', promo.id)
    .eq('service_id', service.id)
    .maybeSingle()
  if (linkError) throw linkError
  if (!link) {
    throw new BookingError(422, 'promo_not_applicable', `${promo.code} can't be applied to ${service.name}.`)
  }

  if (promo.first_visit_only && email) {
    const { count, error: countError } = await db
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('customer_email', email) // the trigger stores emails lower-cased
      .not('status', 'in', RELEASED_STATUS_FILTER)
    if (countError) throw countError
    if ((count ?? 0) > 0) {
      throw new BookingError(
        422,
        'promo_first_visit_only',
        `${promo.code} is for first visits only, and this email address already has a booking with us.`,
      )
    }
  }
  return promo as Promotion
}

function pricing(service: Service, promo: Promotion | null) {
  const discount = promo ? calculateDiscountCents(service.price_cents, promo.discount_percentage) : 0
  return {
    original_price_cents: service.price_cents,
    discount_cents: discount,
    final_price_cents: service.price_cents - discount,
    promo_code: promo?.code ?? null,
    discount_percentage: promo?.discount_percentage ?? 0,
  }
}

// 23P01 = exclusion_violation from the prevent_barber_double_booking constraint.
function isConflictError(err: { code?: string }) {
  return err.code === '23P01'
}

Deno.serve(async (req) => {
  const { body, response } = await readJsonRequest(req)
  if (response) return response

  const { service_id, barber_id, date, time, promo_code, preview_only } = body
  const customer = normalizeCustomer(body.customer ?? {})

  if (!isUuid(service_id)) return errorResponse(400, 'invalid_service', 'Please choose a valid service.')
  if (!preview_only) {
    if (barber_id !== 'any' && !isUuid(barber_id)) {
      return errorResponse(400, 'invalid_barber', 'Please choose a valid barber.')
    }
    if (!isValidDateString(date) || !isValidTimeString(time)) {
      return errorResponse(400, 'invalid_slot', 'Please choose a valid date and time.')
    }
    const fieldErrors = validateCustomer(customer)
    if (Object.keys(fieldErrors).length > 0) {
      return errorResponse(400, 'invalid_customer', 'Please check your details and try again.', { fields: fieldErrors })
    }
  }

  try {
    const db = createAdminClient()
    const now = new Date()

    const { data: service, error: serviceError } = await db
      .from('services')
      .select('id, name, price_cents, duration_minutes')
      .eq('id', service_id)
      .eq('active', true)
      .maybeSingle()
    if (serviceError) throw serviceError
    if (!service) throw new BookingError(404, 'service_not_found', 'That service is no longer available.')

    const promo = promo_code ? await resolvePromotion(db, promo_code, service, customer.email, now) : null
    if (preview_only) return json(200, { quote: pricing(service, promo) })

    const { data: hours, error: hoursError } = await db
      .from('business_hours')
      .select('opening_time, closing_time, is_closed')
      .eq('day_of_week', dayOfWeek(date))
      .maybeSingle()
    if (hoursError) throw hoursError

    const slot = validateRequestedSlot({ date, time, hours, durationMinutes: service.duration_minutes, now })
    if (!slot.ok) throw new BookingError(422, slot.code, slot.message)
    const startsAt = slot.start.toISOString()
    const endsAt = slot.end.toISOString()

    let barberQuery = db.from('barbers').select('id, name').eq('active', true).order('display_order')
    if (barber_id !== 'any') barberQuery = barberQuery.eq('id', barber_id)
    const { data: barbers, error: barberError } = await barberQuery
    if (barberError) throw barberError
    if (!barbers?.length) {
      throw new BookingError(404, 'barber_unavailable', 'That barber is not currently taking appointments.')
    }

    // Friendly pre-check; the database constraint still guards against races.
    const { data: clashes, error: clashError } = await db
      .from('appointments')
      .select('barber_id')
      .in('barber_id', barbers.map((b) => b.id))
      .lt('starts_at', endsAt)
      .gt('ends_at', startsAt)
      .not('status', 'in', RELEASED_STATUS_FILTER)
    if (clashError) throw clashError
    const busyIds = new Set((clashes ?? []).map((c) => c.barber_id))
    const candidates = barbers.filter((b) => !busyIds.has(b.id))
    if (candidates.length === 0) throw new BookingError(409, 'slot_unavailable', CONFLICT_MESSAGE)

    const price = pricing(service, promo)
    for (const barber of candidates) {
      const { data: appt, error: insertError } = await db
        .from('appointments')
        .insert({
          service_id: service.id,
          barber_id: barber.id,
          promotion_id: promo?.id ?? null,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_notes: customer.notes || null,
          starts_at: startsAt,
          ends_at: endsAt,
          original_price_cents: price.original_price_cents,
          discount_cents: price.discount_cents,
          final_price_cents: price.final_price_cents,
        })
        .select('id, status, starts_at, ends_at, original_price_cents, discount_cents, final_price_cents, created_at')
        .single()

      if (insertError) {
        if (isConflictError(insertError)) continue // someone else took this barber's slot; try the next
        console.error('appointment insert rejected', insertError)
        throw new BookingError(422, 'booking_rejected', 'We could not reserve that appointment. Please choose another time.')
      }

      const durationMinutes = Math.round((new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime()) / 60000)
      return json(201, {
        booking: {
          id: appt.id,
          status: appt.status,
          timezone: BUSINESS_TIMEZONE,
          service: { id: service.id, name: service.name },
          barber: { id: barber.id, name: barber.name },
          starts_at: appt.starts_at,
          ends_at: appt.ends_at,
          duration_minutes: durationMinutes,
          original_price_cents: appt.original_price_cents,
          discount_cents: appt.discount_cents,
          final_price_cents: appt.final_price_cents,
          promo_code: promo?.code ?? null,
          customer: { name: customer.name, email: customer.email },
          created_at: appt.created_at,
        },
      })
    }
    throw new BookingError(409, 'slot_unavailable', CONFLICT_MESSAGE)
  } catch (err) {
    if (err instanceof BookingError) return errorResponse(err.status, err.code, err.message)
    console.error('create-booking failed', err)
    return errorResponse(500, 'server_error', SERVER_ERROR_MESSAGE)
  }
})
