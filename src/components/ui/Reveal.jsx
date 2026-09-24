import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

const EASE = [0.22, 0.61, 0.36, 1]

/**
 * Gentle scroll-triggered entrance. Motion's global reducedMotion="user" setting
 * removes the movement for visitors who prefer reduced motion.
 */
export default function Reveal({ as = 'div', delay = 0, y = 28, className, children, ...rest }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Component>
  )
}

/** Image that uncovers itself with a clip-path wipe as it scrolls into view. */
export function RevealImage({ src, alt, className = '', imgClassName = '', loading = 'lazy', sizes, ...rest }) {
  // Observe the unclipped frame: a fully clipped element never reports as intersecting.
  const frameRef = useRef(null)
  const inView = useInView(frameRef, { once: true, amount: 0.2 })
  return (
    <div ref={frameRef} className={`img-frame ${className}`} {...rest}>
      <motion.div
        className="img-frame__reveal"
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={inView ? { clipPath: 'inset(0 0 0% 0)' } : undefined}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <motion.img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          className={imgClassName}
          initial={{ scale: 1.12 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ duration: 1.6, ease: EASE }}
        />
      </motion.div>
    </div>
  )
}
