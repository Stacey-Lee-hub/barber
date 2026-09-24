import { BUSINESS } from '../../data/business'

/** Crown-over-razor monogram. Inherits colour from `currentColor`, with a gold accent. */
export function LogoMark({ className = '', title }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeOpacity="0.55" />
      <circle cx="24" cy="24" r="19.5" stroke="var(--gold)" strokeOpacity="0.9" strokeWidth="0.75" />
      {/* crown */}
      <path
        d="M14.5 27.5 13 17.8l5.6 4.6L24 14.5l5.4 7.9 5.6-4.6-1.5 9.7Z"
        fill="var(--gold)"
      />
      <circle cx="13" cy="16.6" r="1.35" fill="var(--gold)" />
      <circle cx="24" cy="13.1" r="1.35" fill="var(--gold)" />
      <circle cx="35" cy="16.6" r="1.35" fill="var(--gold)" />
      <rect x="14.5" y="28.6" width="19" height="1.7" fill="var(--gold)" />
      {/* straight razor */}
      <path d="M11.5 34.2h18.4l3.1 1.6-3.1 1.6H11.5Z" fill="currentColor" />
      <path d="M33.8 35.8 37 34" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ className = '', compact = false }) {
  return (
    <span className={`logo ${compact ? 'logo--compact' : ''} ${className}`}>
      <LogoMark className="logo__mark" />
      <span className="logo__text">
        <span className="logo__name">
          The Crown <span className="logo__amp">&amp;</span> Razor Co.
        </span>
        {!compact && <span className="logo__est">Est. {BUSINESS.established} · Barbers</span>}
      </span>
    </span>
  )
}
