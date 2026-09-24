import { useId } from 'react'
import { barberStyle } from '../../data/barbers'

const HAIR = {
  classic:
    'M137 250C131 188 166 162 206 164c42 2 66 30 58 84-7-30-26-44-52-46-30-2-58 8-70 38-4 3-5 7-5 10Z',
  crop:
    'M139 240c-9-58 26-84 67-84 42 0 67 30 57 82-4-18-14-30-27-35 3 10 1 18-5 22-5-12-16-20-29-21 2 9-2 16-9 19-4-10-14-16-25-15-15 3-24 14-29 32Z',
  beard:
    'M140 232c0-56 34-72 60-72 32 0 62 17 60 70-9-26-30-38-60-38-28 0-50 12-60 40Z',
}

const FACIAL = {
  classic: (
    <path
      d="M141 272c8 52 36 70 59 70s51-18 59-70c-8 24-28 38-59 38s-51-14-59-38Z"
      fill="#171717"
      opacity="0.88"
    />
  ),
  crop: null,
  beard: (
    <>
      <path d="M139 258c0 84 36 118 61 118s61-34 61-118c-10 42-28 62-61 64-33-2-51-22-61-64Z" fill="#171717" />
      <path
        d="M174 300c10-9 20-8 26-3 6-5 16-6 26 3-10 7-19 6-26 3-7 3-16 4-26-3Z"
        fill="#171717"
      />
    </>
  ),
}

/**
 * Stylised editorial portrait. These are illustrations, not photographs of staff,
 * and are captioned as such wherever they appear.
 */
export default function BarberPortrait({ barber, className = '', decorative = false }) {
  const style = barberStyle(barber)
  const gradientId = useId()
  const variant = HAIR[style.portrait] ? style.portrait : 'classic'

  return (
    <figure className={`barber-portrait ${className}`} aria-hidden={decorative || undefined}>
      <svg
        viewBox="0 0 400 500"
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : `Illustrated portrait representing ${barber.name}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={style.tone} />
            <stop offset="1" stopColor="#171717" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill={`url(#${gradientId})`} />
        <text
          x="200"
          y="300"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontSize="250"
          fontStyle="italic"
          fill="#b89b65"
          opacity="0.09"
        >
          {style.initials}
        </text>
        <path d="M58 500V206a142 142 0 0 1 284 0v294" fill="none" stroke="#b89b65" strokeOpacity="0.55" />
        <path d="M74 500V210a126 126 0 0 1 252 0v290" fill="none" stroke="#b89b65" strokeOpacity="0.2" />
        {/* shoulders and collar */}
        <path d="M66 500c8-78 58-110 134-114 76 4 126 36 134 114Z" fill="#171717" />
        <path d="M172 388 200 446l28-58c-9-3-18-4-28-4s-19 1-28 4Z" fill="#e7dfd2" opacity="0.9" />
        <path d="M200 446 188 500h24Z" fill="#8c6b43" />
        {/* neck, ears, head */}
        <path d="M177 318h46v72c-8 6-16 8-23 8s-15-2-23-8Z" fill="#6f5540" />
        <ellipse cx="138" cy="262" rx="9" ry="17" fill="#7a5d46" />
        <ellipse cx="262" cy="262" rx="9" ry="17" fill="#7a5d46" />
        <ellipse cx="200" cy="256" rx="62" ry="80" fill="#8c6b43" />
        <path d="M200 176c34 0 62 36 62 80s-28 80-62 80" fill="none" stroke="#b89b65" strokeOpacity="0.5" />
        <path d={HAIR[variant]} fill="#171717" />
        {FACIAL[variant]}
      </svg>
      <figcaption className="barber-portrait__caption">Illustrative portrait</figcaption>
    </figure>
  )
}
