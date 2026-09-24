import { AlertCircle, RotateCcw } from 'lucide-react'

export function LoadingBlock({ label = 'Loading…', className = '' }) {
  return (
    <div className={`state-block ${className}`} role="status" aria-live="polite">
      <span className="state-block__title">
        <span className="spinner" aria-hidden="true" />
        {label}
      </span>
    </div>
  )
}

export function ErrorBlock({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again', children }) {
  return (
    <div className="state-block state-block--error" role="alert">
      <span className="state-block__title">
        <AlertCircle aria-hidden="true" />
        {title}
      </span>
      {message && <p>{message}</p>}
      {children}
      {onRetry && (
        <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
          <RotateCcw aria-hidden="true" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  )
}
