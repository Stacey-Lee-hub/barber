import { motion } from 'motion/react'

const EASE = [0.22, 0.61, 0.36, 1]

/** Dark editorial header used at the top of inner pages. */
export default function PageHero({ eyebrow, title, intro, image, imageAlt = '', index, children, compact = false }) {
  return (
    <header className={`page-hero on-dark ${image ? 'page-hero--image' : ''} ${compact ? 'page-hero--compact' : ''}`}>
      {image && (
        <motion.div
          className="page-hero__media"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        >
          <img src={image} alt={imageAlt} fetchPriority="high" />
        </motion.div>
      )}
      <div className="container page-hero__inner">
        {index && (
          <span className="page-hero__index" aria-hidden="true">
            {index}
          </span>
        )}
        <motion.div
          className="page-hero__copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        >
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="h1 page-hero__title">{title}</h1>
          {intro && <p className="lead page-hero__intro">{intro}</p>}
          {children}
        </motion.div>
      </div>
    </header>
  )
}
