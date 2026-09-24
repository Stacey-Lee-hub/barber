import { formatCalendarDate, formatClock, formatDurationLong, formatPrice, formatZonedTime } from '../../lib/format'
import { ANY_BARBER, isPromoVerified } from '../../lib/bookingFlow'

function summaryPricing(state, service) {
  const promo = isPromoVerified(state) ? state.appliedPromo : null
  const original = service?.price_cents ?? 0
  const discount = promo?.quote.discount_cents ?? 0
  return { original, discount, total: original - discount, code: promo?.code ?? null }
}

/** Running summary of the selections, shown beside the steps. */
export default function BookingSummary({ state, service, barber, variant = 'aside' }) {
  const price = summaryPricing(state, service)
  const barberLabel = state.barberId === ANY_BARBER ? 'Any available barber' : barber?.name

  const rows = [
    ['Service', service?.name],
    ['Barber', barberLabel],
    ['Date', state.date ? formatCalendarDate(state.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : null],
    ['Time', state.slot ? `${formatClock(state.slot.time)} – ${formatZonedTime(state.slot.ends_at)}` : null],
    ['Duration', service ? formatDurationLong(service.duration_minutes) : null],
  ]

  return (
    <section className={`summary summary--${variant}`} aria-labelledby={`summary-${variant}`}>
      <h2 id={`summary-${variant}`} className="summary__title">
        Your appointment
      </h2>
      <dl className="summary__list">
        {rows.map(([label, value]) => (
          <div key={label} className="summary__row">
            <dt>{label}</dt>
            <dd className={value ? '' : 'summary__empty'}>{value ?? '—'}</dd>
          </div>
        ))}
      </dl>
      {service && (
        <dl className="summary__prices">
          <div className="summary__row">
            <dt>Price</dt>
            <dd>{formatPrice(price.original)}</dd>
          </div>
          {price.discount > 0 && (
            <div className="summary__row summary__row--discount">
              <dt>Discount ({price.code})</dt>
              <dd>−{formatPrice(price.discount)}</dd>
            </div>
          )}
          <div className="summary__row summary__row--total">
            <dt>Total</dt>
            <dd>{formatPrice(price.total)}</dd>
          </div>
        </dl>
      )}
      <p className="summary__note">Pay at the shop. Times in Pacific Time.</p>
    </section>
  )
}
