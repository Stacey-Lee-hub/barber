import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal'
import { ErrorBlock } from '../ui/States'
import BarberPortrait from './BarberPortrait'
import { useShopData } from '../../context/shopDataContext'

/** Compact three-up barber introduction used on Home and About. */
export default function BarberTeaser() {
  const { status, barbers, retry, error } = useShopData()

  if (status === 'error') return <ErrorBlock message={error?.message} onRetry={retry} />

  return (
    <div className="barber-teaser">
      {status === 'loading' &&
        [0, 1, 2].map((i) => <div key={i} className="barber-teaser__item skeleton barber-teaser__skeleton" />)}
      {barbers.map((barber, i) => (
        <Reveal key={barber.id} as="article" delay={i * 0.12} className="barber-teaser__item">
          <Link to={`/barbers#${barber.slug}`} className="barber-teaser__link">
            <BarberPortrait barber={barber} decorative />
            <div className="barber-teaser__text">
              <p className="barber-teaser__role">{barber.role}</p>
              <h3 className="barber-teaser__name">{barber.name}</h3>
              <p className="barber-teaser__specialty">{barber.specialty}</p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}
