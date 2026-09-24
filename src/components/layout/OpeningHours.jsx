import { useShopData } from '../../context/shopDataContext'
import { groupBusinessHours } from '../../lib/hours'

/** Opening hours from the Supabase business_hours table. */
export default function OpeningHours({ className = '' }) {
  const { status, hours } = useShopData()

  if (status === 'loading') {
    return (
      <div className={`hours-list ${className}`} role="status" aria-label="Loading opening hours">
        {[0, 1, 2].map((i) => (
          <span key={i} className="skeleton hours-list__skeleton" />
        ))}
      </div>
    )
  }
  if (status === 'error' || hours.length === 0) {
    return <p className={`muted ${className}`}>Opening hours are unavailable right now — please call us.</p>
  }

  return (
    <dl className={`hours-list ${className}`}>
      {groupBusinessHours(hours).map((group) => (
        <div key={group.label} className="hours-list__row">
          <dt>{group.label}</dt>
          <dd>{group.value}</dd>
        </div>
      ))}
    </dl>
  )
}
