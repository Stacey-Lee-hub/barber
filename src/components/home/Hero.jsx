import { motion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import ButtonLink from '../ui/ButtonLink'
import { IMAGES } from '../../data/images'
import { BUSINESS } from '../../data/business'

const EASE = [0.22, 0.61, 0.36, 1]
const PILLARS = ['Precision.', 'Craftsmanship.', 'Confidence.']

const rise = (delay) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, ease: EASE, delay },
})

export default function Hero() {
  return (
    <section className="hero on-dark" aria-labelledby="hero-title">
      <motion.div
        className="hero__media"
        initial={{ clipPath: 'inset(0 0 0 100%)' }}
        animate={{ clipPath: 'inset(0 0 0 0%)' }}
        transition={{ duration: 1.5, ease: EASE }}
      >
        <motion.img
          src={IMAGES.hero.src}
          alt={IMAGES.hero.alt}
          fetchPriority="high"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        />
      </motion.div>

      <div className="container hero__inner">
        <div className="hero__copy">
          <motion.p className="eyebrow hero__eyebrow" {...rise(0.3)}>
            Est. {BUSINESS.established} — The Art of Grooming
          </motion.p>
          <h1 id="hero-title" className="hero__title">
            <motion.span className="hero__line" {...rise(0.45)}>
              A Cut Above.
            </motion.span>
            <motion.span className="hero__line hero__line--accent" {...rise(0.6)}>
              A Crown Apart.
            </motion.span>
          </h1>
          <motion.p className="hero__sub" {...rise(0.8)}>
            {BUSINESS.tagline}.
          </motion.p>
          <motion.div className="btn-row" {...rise(0.95)}>
            <ButtonLink to="/booking">Book Your Appointment</ButtonLink>
            <ButtonLink to="/services" variant="light" arrow={false}>
              Explore Our Services
            </ButtonLink>
          </motion.div>
        </div>

        <motion.ul
          className="hero__pillars"
          aria-label="Our values"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {PILLARS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </motion.ul>

        <a href="#introduction" className="hero__scroll" aria-label="Scroll to introduction">
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
