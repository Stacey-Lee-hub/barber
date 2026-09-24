import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import BookingSummary from './BookingSummary'
import { normalizeCustomer } from '@shared/validation.js'

export default function ReviewStep({ state, dispatch, service, barber }) {
  const customer = normalizeCustomer(state.customer)
  const edit = (step, label) => (
    <button type="button" className="review__edit" onClick={() => dispatch({ type: 'goTo', step })}>
      <Pencil aria-hidden="true" />
      Edit <span className="visually-hidden">{label}</span>
    </button>
  )

  return (
    <div className="review">
      <h2 className="step-title">Review &amp; confirm</h2>
      <p className="muted">Check everything below. Your chair is reserved only once you confirm and see a booking reference.</p>

      <div className="review__grid">
        <div className="review__card">
          <div className="review__card-head">
            <h3>Appointment</h3>
            {edit('datetime', 'date and time')}
          </div>
          <BookingSummary state={state} service={service} barber={barber} variant="review" />
        </div>

        <div className="review__card">
          <div className="review__card-head">
            <h3>Your details</h3>
            {edit('details', 'your details')}
          </div>
          <dl className="review__details">
            <div>
              <dt>Name</dt>
              <dd>{customer.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{customer.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{customer.phone}</dd>
            </div>
            {customer.notes && (
              <div>
                <dt>Notes</dt>
                <dd>{customer.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <p className="details__terms">
        By confirming you agree to our <Link to="/terms">Terms &amp; Conditions</Link> and{' '}
        <Link to="/privacy">Privacy Policy</Link>. The final price is calculated by our booking system when you confirm.
      </p>
    </div>
  )
}
