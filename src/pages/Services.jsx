import PageHero from '../components/ui/PageHero'
import Reveal, { RevealImage } from '../components/ui/Reveal'
import ButtonLink from '../components/ui/ButtonLink'
import { ErrorBlock, LoadingBlock } from '../components/ui/States'
import ServiceMeta from '../components/services/ServiceMeta'
import { useShopData } from '../context/shopDataContext'
import { EXECUTIVE_PACKAGE_SLUG, serviceMedia } from '../data/services'
import { FIRST_VISIT_OFFER } from '../data/business'
import { IMAGES } from '../data/images'
import { slugify } from '../lib/format'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function Services() {
  useDocumentMeta(
    'Services & Pricing',
    'Haircuts, skin fades, beard sculpting, hot towel shaves, kids cuts and the Executive Package — prices and appointment times at The Crown & Razor Co.',
  )
  const { status, services, error, retry } = useShopData()

  return (
    <>
      <PageHero
        eyebrow="Services & Pricing"
        title={
          <>
            The <em>Menu.</em>
          </>
        }
        intro="Every service begins with a consultation and ends with a considered finish. Prices and appointment lengths are exactly what you'll see when you book."
        image={IMAGES.tools.src}
        imageAlt=""
        index={services.length ? String(services.length).padStart(2, '0') : null}
      />

      {status === 'ready' && services.length > 0 && (
        <nav className="category-nav" aria-label="Service categories">
          <div className="container">
            <ul>
              {services.map((s) => (
                <li key={s.id}>
                  <a href={`#${slugify(s.category)}`}>{s.category}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      <section className="section section--light services-list" aria-label="All services">
        <div className="container">
          {status === 'loading' && <LoadingBlock label="Loading services…" />}
          {status === 'error' && <ErrorBlock message={error?.message} onRetry={retry} />}
          {status === 'ready' && services.length === 0 && (
            <p className="muted">No services are available to book at the moment. Please call the shop.</p>
          )}

          {services.map((service, i) => {
            const media = serviceMedia(service)
            const featured = service.slug === EXECUTIVE_PACKAGE_SLUG
            return (
              <article
                key={service.id}
                id={slugify(service.category)}
                className={`service-row ${i % 2 ? 'service-row--flip' : ''} ${featured ? 'service-row--featured on-dark' : ''}`}
                aria-labelledby={`svc-${service.id}`}
              >
                <RevealImage src={media.image.src} alt={media.image.alt} className="service-row__img" />
                <Reveal className="service-row__body">
                  <div className="service-row__top">
                    <span className="service-row__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="eyebrow eyebrow--plain service-row__cat">{service.category}</p>
                    {featured && <span className="service-row__badge">Signature Package</span>}
                  </div>
                  <h2 id={`svc-${service.id}`} className="h3 service-row__name">
                    {service.name}
                  </h2>
                  <p className="service-row__desc">{service.description}</p>
                  <div className="service-row__foot">
                    <ServiceMeta service={service} />
                    <ButtonLink
                      to={`/booking?service=${service.id}`}
                      variant={featured ? 'gold' : 'outline'}
                      size="sm"
                      aria-label={`Book ${service.name}`}
                    >
                      Book This Service
                    </ButtonLink>
                  </div>
                </Reveal>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section section--cream services-notes" aria-labelledby="notes-title">
        <div className="container services-notes__grid">
          <Reveal>
            <p className="eyebrow">Good to Know</p>
            <h2 id="notes-title" className="h2">
              Before you <em className="italic-accent">arrive.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="services-notes__list">
            <div>
              <h3 className="services-notes__title">First visit?</h3>
              <p className="muted">
                Use code <strong>{FIRST_VISIT_OFFER.code}</strong> for {FIRST_VISIT_OFFER.percent}% off{' '}
                {FIRST_VISIT_OFFER.eligibleLabel}. The discount is shown before you confirm.
              </p>
            </div>
            <div>
              <h3 className="services-notes__title">Timing</h3>
              <p className="muted">
                Appointment lengths above are reserved in full with your barber, so there's time for a proper
                consultation and finish. Please arrive a few minutes early.
              </p>
            </div>
            <div>
              <h3 className="services-notes__title">Young Grooms</h3>
              <p className="muted">Kids cuts are for children 12 and under. A parent or guardian should book.</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
