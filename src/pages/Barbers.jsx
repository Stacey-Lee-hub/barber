import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import ButtonLink from '../components/ui/ButtonLink'
import { ErrorBlock, LoadingBlock } from '../components/ui/States'
import BarberPortrait from '../components/barbers/BarberPortrait'
import { useShopData } from '../context/shopDataContext'
import { firstName } from '../lib/format'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function Barbers() {
  useDocumentMeta(
    'Our Barbers',
    'Meet Marcus, Elena and Julian — the master barber, fade specialist and beard specialist at The Crown & Razor Co. Book with your preferred barber.',
  )
  const { status, barbers, error, retry } = useShopData()

  return (
    <>
      <PageHero
        eyebrow="Our Barbers"
        title={
          <>
            Three specialists. <em>One standard.</em>
          </>
        }
        intro="Choose the barber whose craft suits you best — or book with whoever is available first."
        index={barbers.length ? String(barbers.length).padStart(2, '0') : null}
      />

      <section className="section section--light barbers" aria-label="Barber profiles">
        <div className="container">
          {status === 'loading' && <LoadingBlock label="Loading our team…" />}
          {status === 'error' && <ErrorBlock message={error?.message} onRetry={retry} />}

          {barbers.map((barber, i) => (
            <article
              key={barber.id}
              id={barber.slug}
              className={`barber-profile ${i % 2 ? 'barber-profile--flip' : ''}`}
              aria-labelledby={`barber-${barber.id}`}
            >
              <Reveal className="barber-profile__portrait">
                <BarberPortrait barber={barber} />
              </Reveal>
              <Reveal delay={0.12} className="barber-profile__body">
                <span className="barber-profile__index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="eyebrow">{barber.role}</p>
                <h2 id={`barber-${barber.id}`} className="h2 barber-profile__name">
                  {barber.name}
                </h2>
                <dl className="barber-profile__facts">
                  <div>
                    <dt className="small-caps">Specialty</dt>
                    <dd>{barber.specialty}</dd>
                  </div>
                  <div>
                    <dt className="small-caps">Background</dt>
                    <dd>{barber.bio}</dd>
                  </div>
                </dl>
                <ButtonLink to={`/booking?barber=${barber.id}`}>Book With {firstName(barber.name)}</ButtonLink>
              </Reveal>
            </article>
          ))}

          {status === 'ready' && (
            <p className="barbers__note">
              Portraits on this page are illustrations and do not depict our team members.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
