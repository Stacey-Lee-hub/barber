import { Clock } from 'lucide-react'
import Reveal, { RevealImage } from '../ui/Reveal'
import ButtonLink, { TextLink } from '../ui/ButtonLink'
import BarberTeaser from '../barbers/BarberTeaser'
import { IMAGES } from '../../data/images'
import { BUSINESS, FIRST_VISIT_OFFER } from '../../data/business'
import { EXECUTIVE_PACKAGE_SLUG } from '../../data/services'
import { useShopData } from '../../context/shopDataContext'
import { formatDurationLong, formatPrice } from '../../lib/format'

export function Introduction() {
  return (
    <section id="introduction" className="section section--light intro" aria-labelledby="intro-title">
      <div className="container intro__grid">
        <div className="intro__media">
          <RevealImage src={IMAGES.interior.src} alt={IMAGES.interior.alt} className="intro__img-main" />
          <RevealImage src={IMAGES.comb.src} alt={IMAGES.comb.alt} className="intro__img-inset" />
          <span className="intro__est" aria-hidden="true">
            {BUSINESS.established}
          </span>
        </div>
        <Reveal className="intro__copy">
          <p className="eyebrow">Our House</p>
          <h2 id="intro-title" className="h2">
            More Than a Haircut.
            <br />
            <em className="italic-accent">A Tradition of Excellence.</em>
          </h2>
          <p className="lead">
            Since {BUSINESS.established}, The Crown &amp; Razor Co. has brought back the classic barbershop experience —
            where precision cuts, warm towel finishes and genuine conversation come standard.
          </p>
          <p className="muted">
            Whether you need a crisp skin fade, a sculpted beard or a complete style reset, our team takes pride in
            making you look and feel your absolute best.
          </p>
          <TextLink to="/about">Discover our story</TextLink>
        </Reveal>
      </div>
    </section>
  )
}

const CRAFT_POINTS = [
  { title: 'Precision', text: 'Every line measured by eye and blade — clean edges, seamless blends, nothing left to chance.' },
  { title: 'Tradition', text: 'Straight razors, scissor-over-comb and the unhurried rituals of classic barbering.' },
  { title: 'Warm Towel Finish', text: 'Hot towels and a considered finish close every service, the way it should be.' },
  { title: 'Individual Style', text: 'A consultation first, always. Your cut is shaped around your hair, face and routine.' },
]

export function Craft() {
  return (
    <section className="section section--cream craft" aria-labelledby="craft-title">
      <div className="container craft__grid">
        <div className="craft__copy">
          <Reveal>
            <p className="eyebrow">The Craft</p>
            <h2 id="craft-title" className="h2">
              Every Detail <em className="italic-accent">Matters.</em>
            </h2>
          </Reveal>
          <ol className="craft__list">
            {CRAFT_POINTS.map((point, i) => (
              <Reveal as="li" key={point.title} delay={i * 0.08} className="craft__item">
                <span className="craft__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="craft__title">{point.title}</h3>
                  <p className="muted">{point.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
        <div className="craft__mosaic">
          <RevealImage src={IMAGES.fade.src} alt={IMAGES.fade.alt} className="craft__img craft__img--tall" />
          <RevealImage src={IMAGES.lather.src} alt={IMAGES.lather.alt} className="craft__img craft__img--wide" />
          <RevealImage src={IMAGES.tools.src} alt={IMAGES.tools.alt} className="craft__img craft__img--small" />
        </div>
      </div>
    </section>
  )
}

export function MeetTheBarbers() {
  return (
    <section className="section section--light" aria-labelledby="team-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">The Craftsmen</p>
            <h2 id="team-title" className="h2">
              Meet the <em className="italic-accent">Barbers.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="section-head__aside">
            <p className="muted">Three specialists, one standard. Choose your barber when you book.</p>
            <TextLink to="/barbers">Meet the full team</TextLink>
          </Reveal>
        </div>
        <BarberTeaser />
      </div>
    </section>
  )
}

export function ExecutivePackage() {
  const { serviceBySlug, status } = useShopData()
  const pkg = serviceBySlug(EXECUTIVE_PACKAGE_SLUG)
  const inclusions = pkg ? pkg.description.replace(/\.$/, '').split(/\s*\+\s*/) : []

  if (status === 'ready' && !pkg) return null

  return (
    <section className="section section--espresso exec" aria-labelledby="exec-title">
      <div className="container exec__grid">
        <RevealImage src={IMAGES.chair.src} alt={IMAGES.chair.alt} className="exec__img" />
        <div className="exec__copy">
          <Reveal>
            <p className="eyebrow">The Featured Package</p>
            <h2 id="exec-title" className="h2 exec__title">
              The Executive <em className="italic-accent">Package</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="exec__figures">
            <div>
              <span className="small-caps muted">Investment</span>
              <span className="exec__price">{pkg ? formatPrice(pkg.price_cents) : <span className="skeleton exec__skeleton" />}</span>
            </div>
            <div>
              <span className="small-caps muted">Time in the chair</span>
              <span className="exec__duration">
                <Clock aria-hidden="true" />
                {pkg ? formatDurationLong(pkg.duration_minutes) : '—'}
              </span>
            </div>
          </Reveal>
          {inclusions.length > 0 && (
            <Reveal as="ul" delay={0.15} className="exec__list" aria-label="Included in the Executive Package">
              {inclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </Reveal>
          )}
          <Reveal delay={0.2}>
            <ButtonLink to={pkg ? `/booking?service=${pkg.id}` : '/booking'}>Experience the Executive Package</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function FirstVisitOffer() {
  return (
    <section className="section section--cream offer" aria-labelledby="offer-title">
      <div className="container offer__inner">
        <Reveal className="offer__figure" aria-hidden="true">
          <span className="offer__percent">15</span>
          <span className="offer__percent-sign">%</span>
          <span className="offer__off">off</span>
        </Reveal>
        <Reveal delay={0.1} className="offer__copy">
          <p className="eyebrow">First Visit</p>
          <h2 id="offer-title" className="h2">
            15% Off Your <em className="italic-accent">First Visit</em>
          </h2>
          <p className="muted">
            New to the chair? Take {FIRST_VISIT_OFFER.percent}% off {FIRST_VISIT_OFFER.eligibleLabel}. Enter the code
            when you book online and the discount is calculated before you confirm.
          </p>
          <div className="offer__ticket">
            <span className="small-caps">Promo code</span>
            <strong>{FIRST_VISIT_OFFER.code}</strong>
          </div>
          <ButtonLink to={`/booking?promo=${FIRST_VISIT_OFFER.code}`} variant="dark">
            Claim Your Offer
          </ButtonLink>
          <p className="offer__fine">
            Valid on first visits only, checked against previous online bookings made with the same email address.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="final-cta on-dark" aria-labelledby="final-title">
      <div className="final-cta__media">
        <img src={IMAGES.atWork.src} alt="" loading="lazy" />
      </div>
      <div className="container final-cta__inner">
        <Reveal>
          <p className="eyebrow eyebrow--plain final-cta__eyebrow">Reserve Online in Minutes</p>
          <h2 id="final-title" className="final-cta__title">
            Your Next Great Cut <em>Starts Here.</em>
          </h2>
          <ButtonLink to="/booking">Reserve Your Chair</ButtonLink>
        </Reveal>
      </div>
    </section>
  )
}
