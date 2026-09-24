import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import Logo from '../ui/Logo'
import ButtonLink from '../ui/ButtonLink'
import OpeningHours from './OpeningHours'
import { ADDRESS_LINES, BUSINESS, NAV_LINKS } from '../../data/business'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="site-footer__cta">
          <p className="site-footer__cta-title">
            Your chair is <em>waiting.</em>
          </p>
          <ButtonLink to="/booking">Book Now</ButtonLink>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link to="/" aria-label={`${BUSINESS.name} — home`}>
              <Logo />
            </Link>
            <p className="muted">
              Master craftsmanship meets modern comfort. Precision cuts, warm towel finishes and genuine conversation
              since {BUSINESS.established}.
            </p>
          </div>

          <nav className="site-footer__col" aria-label="Footer">
            <h2 className="site-footer__heading">Explore</h2>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/booking">Book an Appointment</Link>
              </li>
              <li>
                <Link to="/booking/cancel">Cancel a Booking</Link>
              </li>
            </ul>
          </nav>

          <div className="site-footer__col">
            <h2 className="site-footer__heading">Visit</h2>
            <address className="site-footer__contact">
              <span>
                <MapPin aria-hidden="true" />
                <span>
                  {ADDRESS_LINES[0]}
                  <br />
                  {ADDRESS_LINES[1]}
                </span>
              </span>
              <a href={BUSINESS.phone.href}>
                <Phone aria-hidden="true" />
                {BUSINESS.phone.display}
              </a>
              <a href={`mailto:${BUSINESS.email}`}>
                <Mail aria-hidden="true" />
                {BUSINESS.email}
              </a>
            </address>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__heading">Hours</h2>
            <OpeningHours />
            <p className="site-footer__tz">All times {BUSINESS.timezoneLabel}</p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div className="site-footer__legal">
            <p>
              © {year} {BUSINESS.name} All rights reserved.
            </p>
            <p className="site-footer__credit">
              Designed &amp; developed by <span>Stacey-Lee Pietersen</span>
            </p>
          </div>
          <ul>
            <li>
              <Link to="/terms">Terms &amp; Conditions</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
