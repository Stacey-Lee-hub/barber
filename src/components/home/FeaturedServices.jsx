import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Reveal from '../ui/Reveal'
import { TextLink } from '../ui/ButtonLink'
import { ErrorBlock } from '../ui/States'
import ServiceMeta from '../services/ServiceMeta'
import { useShopData } from '../../context/shopDataContext'
import { serviceMedia } from '../../data/services'

export default function FeaturedServices() {
  const { status, services, retry, error } = useShopData()
  const featured = services.filter((s) => s.featured)
  const [activeId, setActiveId] = useState(null)
  const active = featured.find((s) => s.id === activeId) ?? featured[0]
  const media = serviceMedia(active)

  return (
    <section className="section section--dark featured" aria-labelledby="featured-title">
      <div className="container">
        <div className="featured__head">
          <Reveal>
            <p className="eyebrow">Featured Services</p>
            <h2 id="featured-title" className="h2">
              The house <em className="italic-accent">favorites.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <TextLink to="/services">View the full menu</TextLink>
          </Reveal>
        </div>

        <div className="featured__body">
          <div className="featured__visual" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              {active && (
                <motion.img
                  key={active.id}
                  src={media.image.src}
                  alt=""
                  loading="lazy"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                />
              )}
            </AnimatePresence>
            {active && <span className="featured__visual-label">{media.note}</span>}
          </div>

          <div className="featured__list">
            {status === 'loading' &&
              [0, 1, 2, 3].map((i) => <div key={i} className="featured__row featured__row--skeleton skeleton" />)}
            {status === 'error' && <ErrorBlock message={error?.message} onRetry={retry} />}
            {featured.map((service, i) => (
              <Reveal
                key={service.id}
                as="article"
                delay={i * 0.08}
                className={`featured__row ${active?.id === service.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveId(service.id)}
                onFocus={() => setActiveId(service.id)}
              >
                <span className="featured__num" aria-hidden="true">
                  0{i + 1}
                </span>
                <div className="featured__main">
                  <p className="featured__cat">{service.category}</p>
                  <h3 className="featured__name">{service.name}</h3>
                  <p className="featured__desc">{service.description}</p>
                </div>
                <div className="featured__side">
                  <ServiceMeta service={service} />
                  <Link
                    to={`/booking?service=${service.id}`}
                    className="text-link"
                    aria-label={`Book ${service.name}`}
                  >
                    Book This Service
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
