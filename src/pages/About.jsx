import PageHero from '../components/ui/PageHero'
import Reveal, { RevealImage } from '../components/ui/Reveal'
import ButtonLink, { TextLink } from '../components/ui/ButtonLink'
import BarberTeaser from '../components/barbers/BarberTeaser'
import { IMAGES } from '../data/images'
import { BUSINESS } from '../data/business'
import useDocumentMeta from '../hooks/useDocumentMeta'

const ART = [
  {
    title: 'The Consultation',
    text: 'Every visit starts with a conversation about your hair, your face shape and how you live with your style day to day.',
  },
  {
    title: 'The Cut',
    text: 'Scissor-over-comb, clipper work and razor detailing — the right tool for each part of the job, used with patience.',
  },
  {
    title: 'The Finish',
    text: 'Warm towels, a clean neckline and styling you can recreate at home. You leave looking finished, not just trimmed.',
  },
]

export default function About() {
  useDocumentMeta(
    'About Us',
    `Established in ${BUSINESS.established}, The Crown & Razor Co. brings master craftsmanship and modern comfort together in a classic barbershop.`,
  )

  return (
    <>
      <PageHero
        eyebrow={`Our Story · Since ${BUSINESS.established}`}
        title={
          <>
            Master craftsmanship, <em>modern comfort.</em>
          </>
        }
        image={IMAGES.interior.src}
        imageAlt=""
      />

      <section className="section section--light story" aria-labelledby="story-title">
        <div className="container story__grid">
          <Reveal className="story__label">
            <p className="eyebrow">01 — Our Story</p>
            <h2 id="story-title" className="h2">
              Built on a <em className="italic-accent">simple premise.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="story__text">
            <p className="story__dropcap">
              Established in {BUSINESS.established}, The Crown &amp; Razor Co. was built on a simple premise: master
              craftsmanship meets modern comfort. We brought back the classic barbershop experience—where precision
              cuts, warm towel finishes, and genuine conversation come standard.
            </p>
            <p className="lead">
              Whether you need a crisp skin fade, a sculpted beard, or a complete style reset, our team takes pride in
              making you look and feel your absolute best.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section--dark art" aria-labelledby="art-title">
        <div className="container">
          <div className="art__head">
            <Reveal>
              <p className="eyebrow">02 — The Art of Barbering</p>
              <h2 id="art-title" className="h2">
                Unhurried. <em className="italic-accent">Exact.</em>
              </h2>
            </Reveal>
          </div>
          <div className="art__grid">
            <RevealImage src={IMAGES.shave.src} alt={IMAGES.shave.alt} className="art__img" />
            <ol className="art__steps">
              {ART.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 0.1} className="art__step">
                  <span className="art__num" aria-hidden="true">
                    {['I', 'II', 'III'][i]}
                  </span>
                  <div>
                    <h3 className="h3">{step.title}</h3>
                    <p className="muted">{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section section--cream tradition" aria-labelledby="tradition-title">
        <div className="container tradition__grid">
          <Reveal className="tradition__copy">
            <p className="eyebrow">03 — Tradition Meets Modern Comfort</p>
            <h2 id="tradition-title" className="h2">
              The old ways, <em className="italic-accent">kept well.</em>
            </h2>
            <p className="lead">
              Leather chairs, straight razors and hot towels sit alongside online booking, a clear menu and appointment
              times reserved in full with your barber.
            </p>
            <ul className="tradition__pairs">
              <li>
                <span className="small-caps">Tradition</span>
                <span>Straight-razor shaves &amp; hot towel finishes</span>
              </li>
              <li>
                <span className="small-caps">Comfort</span>
                <span>Book your barber and time online, any hour</span>
              </li>
              <li>
                <span className="small-caps">Tradition</span>
                <span>Scissor cuts shaped by hand and eye</span>
              </li>
              <li>
                <span className="small-caps">Comfort</span>
                <span>Transparent prices and appointment lengths</span>
              </li>
            </ul>
          </Reveal>
          <div className="tradition__media">
            <RevealImage src={IMAGES.beard.src} alt={IMAGES.beard.alt} className="tradition__img-a" />
            <RevealImage src={IMAGES.clipper.src} alt={IMAGES.clipper.alt} className="tradition__img-b" />
          </div>
        </div>
      </section>

      <section className="section section--light" aria-labelledby="craftsmen-title">
        <div className="container">
          <div className="section-head">
            <Reveal>
              <p className="eyebrow">04 — Meet the Craftsmen</p>
              <h2 id="craftsmen-title" className="h2">
                The hands <em className="italic-accent">behind the chair.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="section-head__aside">
              <TextLink to="/barbers">Full barber profiles</TextLink>
            </Reveal>
          </div>
          <BarberTeaser />
        </div>
      </section>

      <section className="section section--espresso cta-band" aria-labelledby="about-cta-title">
        <div className="container cta-band__inner">
          <Reveal>
            <p className="eyebrow">05 — Book Your Experience</p>
            <h2 id="about-cta-title" className="h2">
              Take a seat. <em className="italic-accent">We'll take it from here.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="btn-row">
            <ButtonLink to="/booking">Book Your Appointment</ButtonLink>
            <ButtonLink to="/services" variant="light" arrow={false}>
              View Services
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  )
}
