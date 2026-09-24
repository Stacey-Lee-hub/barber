import { Mail, MapPin, Phone } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import ButtonLink from '../components/ui/ButtonLink'
import OpeningHours from '../components/layout/OpeningHours'
import { LogoMark } from '../components/ui/Logo'
import { ADDRESS_LINES, BUSINESS } from '../data/business'
import useDocumentMeta from '../hooks/useDocumentMeta'

/** Stylised, not-to-scale location graphic. The business is fictional, so no real map is embedded. */
function LocationIllustration() {
  return (
    <figure className="location-art">
      <svg viewBox="0 0 600 460" role="img" aria-label="Illustrative map showing the shop on Bree Street, Cape Town">
        <rect width="600" height="460" fill="#29231e" />
        <g stroke="#b89b65" strokeOpacity="0.12">
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="460" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
          ))}
        </g>
        <g fill="#342c25" stroke="#b89b65" strokeOpacity="0.25">
          <rect x="40" y="40" width="150" height="110" />
          <rect x="230" y="40" width="120" height="110" />
          <rect x="390" y="40" width="170" height="110" />
          <rect x="40" y="290" width="150" height="130" />
          <rect x="230" y="290" width="120" height="130" />
          <rect x="390" y="290" width="170" height="130" />
        </g>
        <rect x="0" y="180" width="600" height="80" fill="#171717" />
        <line x1="0" y1="220" x2="600" y2="220" stroke="#b89b65" strokeDasharray="14 12" strokeOpacity="0.45" />
        <rect x="200" y="0" width="20" height="460" fill="#171717" />
        <rect x="370" y="0" width="12" height="460" fill="#171717" />
        <text x="30" y="210" fill="#e7dfd2" fillOpacity="0.7" fontFamily="DM Sans, sans-serif" fontSize="13" letterSpacing="4">
          BREE STREET
        </text>
        <g transform="translate(288 150)">
          <circle r="46" fill="#b89b65" fillOpacity="0.12" />
          <circle r="28" fill="#b89b65" fillOpacity="0.2" />
          <path d="M0 26C-14 8-20-2-20-10a20 20 0 0 1 40 0c0 8-6 18-20 36Z" fill="#b89b65" transform="translate(0 -18)" />
          <circle cy="-28" r="6.5" fill="#171717" />
        </g>
        <text x="330" y="118" fill="#f4f0e8" fontFamily="Cormorant Garamond, serif" fontSize="24" fontStyle="italic">
          No. 142
        </text>
      </svg>
      <figcaption>Illustrative map — not to scale</figcaption>
    </figure>
  )
}

export default function Contact() {
  useDocumentMeta(
    'Contact & Location',
    `Visit The Crown & Razor Co. at ${BUSINESS.address.street}, ${BUSINESS.address.city}. Call ${BUSINESS.phone.display} or book online.`,
  )

  return (
    <>
      <PageHero
        compact
        eyebrow="Contact & Location"
        title={
          <>
            Come in. <em>Sit down.</em>
          </>
        }
        intro="Book online any time, or reach the shop directly by phone or email."
      />

      <section className="section section--light contact" aria-label="Contact details">
        <div className="container contact__grid">
          <Reveal className="contact__details">
            <div className="contact__block">
              <h2 className="contact__label">
                <MapPin aria-hidden="true" /> Address
              </h2>
              <address className="contact__value">
                {BUSINESS.name}
                <br />
                {ADDRESS_LINES[0]}
                <br />
                {ADDRESS_LINES[1]}
                <br />
                {BUSINESS.address.country}
              </address>
            </div>
            <div className="contact__block">
              <h2 className="contact__label">
                <Phone aria-hidden="true" /> Phone
              </h2>
              <a className="contact__value contact__link" href={BUSINESS.phone.href}>
                {BUSINESS.phone.display}
              </a>
            </div>
            <div className="contact__block">
              <h2 className="contact__label">
                <Mail aria-hidden="true" /> Email
              </h2>
              <a className="contact__value contact__link" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>
            </div>
            <div className="contact__block">
              <h2 className="contact__label">Opening Hours</h2>
              <OpeningHours className="contact__hours" />
              <p className="muted contact__tz">All times {BUSINESS.timezoneLabel}.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="contact__aside">
            <LocationIllustration />
            <div className="contact__book on-dark">
              <LogoMark className="contact__book-mark" />
              <div>
                <h2 className="h3">Ready when you are.</h2>
                <p className="muted">Choose your service, barber and time — it takes about a minute.</p>
              </div>
              <ButtonLink to="/booking">Book an Appointment</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
