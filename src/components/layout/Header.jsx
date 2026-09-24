import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Menu, Phone, X } from 'lucide-react'
import Logo from '../ui/Logo'
import { BUSINESS, NAV_LINKS } from '../../data/business'
import useFocusTrap from '../../hooks/useFocusTrap'

const EASE = [0.22, 0.61, 0.36, 1]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const menuRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onResize = () => window.innerWidth >= 1080 && setOpen(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useFocusTrap(menuRef, open, close)

  return (
    <header className={`site-header ${scrolled || open ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container site-header__inner" ref={menuRef}>
        <Link to="/" className="site-header__brand" aria-label={`${BUSINESS.name} — home`}>
          <Logo />
        </Link>

        <nav className="site-nav" aria-label="Main">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.to === '/'} className="site-nav__link">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link to="/booking" className="btn btn--gold btn--sm site-header__book">
            Book Now
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              className="mobile-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <nav aria-label="Mobile">
                <ul className="mobile-menu__list">
                  {NAV_LINKS.map((link, i) => (
                    <motion.li
                      key={link.to}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.05 + i * 0.05 }}
                    >
                      <NavLink to={link.to} end={link.to === '/'} className="mobile-menu__link" onClick={close}>
                        <span className="mobile-menu__num" aria-hidden="true">
                          0{i + 1}
                        </span>
                        {link.label}
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mobile-menu__footer">
                <Link to="/booking" className="btn btn--gold btn--block" onClick={close}>
                  <span>Book Your Appointment</span>
                  <ArrowRight className="btn__arrow" aria-hidden="true" />
                </Link>
                <a href={BUSINESS.phone.href} className="mobile-menu__phone">
                  <Phone aria-hidden="true" /> {BUSINESS.phone.display}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
