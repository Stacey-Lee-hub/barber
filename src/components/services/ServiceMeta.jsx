import { Clock } from 'lucide-react'
import { formatDuration, formatPrice } from '../../lib/format'

/** Price + duration pair, always taken from the Supabase service record. */
export default function ServiceMeta({ service, className = '' }) {
  return (
    <div className={`service-meta ${className}`}>
      <span className="service-meta__price">{formatPrice(service.price_cents)}</span>
      <span className="service-meta__duration">
        <Clock aria-hidden="true" />
        {formatDuration(service.duration_minutes)}
      </span>
    </div>
  )
}
