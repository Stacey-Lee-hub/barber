import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ButtonLink({ to, variant = 'gold', size, arrow = true, className = '', children, ...rest }) {
  const classes = ['btn', `btn--${variant}`, size && `btn--${size}`, className].filter(Boolean).join(' ')
  return (
    <Link to={to} className={classes} {...rest}>
      <span>{children}</span>
      {arrow && <ArrowRight className="btn__arrow" aria-hidden="true" />}
    </Link>
  )
}

export function TextLink({ to, children, className = '', ...rest }) {
  return (
    <Link to={to} className={`text-link ${className}`} {...rest}>
      {children}
      <ArrowRight aria-hidden="true" />
    </Link>
  )
}
