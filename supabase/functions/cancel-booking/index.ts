// POST { booking_id, email } → { cancelled: true }
// The booking reference (a random UUID) plus the email used to book acts as proof of ownership.
// Unknown combinations return the same "not found" answer, so nothing is revealed about other bookings.
import { createAdminClient } from '../_shared/admin.ts'
import { errorResponse, json, readJsonRequest, SERVER_ERROR_MESSAGE } from '../_shared/http.js'
import { CANCELLED_STATUS, isUuid } from '../_shared/schedule.js'

const NOT_FOUND = 'We could not find an upcoming booking with that reference and email address.'

Deno.serve(async (req) => {
  const { body, response } = await readJsonRequest(req)
  if (response) return response

  const bookingId = typeof body.booking_id === 'string' ? body.booking_id.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isUuid(bookingId) || !email) return errorResponse(404, 'not_found', NOT_FOUND)

  try {
    const db = createAdminClient()
    const { data: appt, error } = await db
      .from('appointments')
      .select('id, customer_email, starts_at, status')
      .eq('id', bookingId)
      .maybeSingle()
    if (error) throw error
    if (!appt || appt.customer_email?.toLowerCase() !== email) return errorResponse(404, 'not_found', NOT_FOUND)
    if (appt.status === CANCELLED_STATUS) return json(200, { cancelled: true, already: true })
    if (appt.status !== 'confirmed' || new Date(appt.starts_at) <= new Date()) {
      return errorResponse(422, 'already_started', 'This appointment has already started or passed. Please call the shop.')
    }

    const { error: updateError } = await db
      .from('appointments')
      .update({ status: CANCELLED_STATUS })
      .eq('id', appt.id)
      .eq('status', 'confirmed')
    if (updateError) throw updateError
    return json(200, { cancelled: true })
  } catch (err) {
    console.error('cancel-booking failed', err)
    return errorResponse(500, 'server_error', SERVER_ERROR_MESSAGE)
  }
})
