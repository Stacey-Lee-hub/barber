import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { LogoMark } from '../ui/Logo'
import { FIRST_VISIT_OFFER } from '../../data/business'
import useFocusTrap from '../../hooks/useFocusTrap'

const STORAGE_KEY = 'crown-razor:offer-dismissed-at'
const SESSION_KEY = 'crown-razor:offer-shown'
const SUPPRESS_DAYS = 14
const DELAY_MS = 14000
const SCROLL_TRIGGER = 0.45
// Don't interrupt people who are already booking or reading policies.
const QUIET_PATHS = ['/booking', '/terms', '/privacy']

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(STORAGE_KEY))
    return at > 0 && Date.now() - at < SUPPRESS_DAYS * 86400000
  } catch {
    return false
  }
}

function alreadyShownThisSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function remember() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* storage unavailable — popup simply may show again next visit */
  }
}

export default function PromoPopup() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const quiet = QUIET_PATHS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (quiet || open || recentlyDismissed() || alreadyShownThisSession()) return undefined
    let fired = false
    const show = () => {
      if (fired) return
      fired = true
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* ignore */
      }
      setOpen(true)
    }
    const timer = setTimeout(show, DELAY_MS)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max > SCROLL_TRIGGER) show()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [quiet, open])

  const dismiss = useCallback(() => {
    remember()
    setOpen(false)
  }, [])

  const claim = () => {
    remember()
    setOpen(false)
    navigate(`/booking?promo=${FIRST_VISIT_OFFER.code}`)
  }

  useFocusTrap(dialogRef, open, dismiss, closeRef)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="promo-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onMouseDown={(e) => e.target === e.currentTarget && dismiss()}
        >
          <motion.div
            ref={dialogRef}
            className="promo on-dark"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-title"
            aria-describedby="promo-desc"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <button ref={closeRef} type="button" className="promo__close" onClick={dismiss} aria-label="Close offer">
              <X aria-hidden="true" />
            </button>
            <LogoMark className="promo__mark" />
            <p className="eyebrow eyebrow--plain promo__kicker">First Visit to The Crown &amp; Razor?</p>
            <h2 id="promo-title" className="promo__title">
              Take <em>15% Off</em> Your First Visit
            </h2>
            <p id="promo-desc" className="promo__text">
              Book today to claim {FIRST_VISIT_OFFER.percent}% off any Signature Cut or Executive Package.
            </p>
            <div className="promo__code" aria-label={`Promo code ${FIRST_VISIT_OFFER.code}`}>
              <span className="small-caps">Promo code</span>
              <strong>{FIRST_VISIT_OFFER.code}</strong>
            </div>
            <button type="button" className="btn btn--gold btn--block" onClick={claim}>
              Claim 15% Off &amp; Book Now
            </button>
            <button type="button" className="promo__decline" onClick={dismiss}>
              No thanks
            </button>
            <p className="promo__fine">
              Added to your booking automatically when you continue. First visits only; one code per booking.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
