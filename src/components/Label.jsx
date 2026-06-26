import { useId } from 'react'

/** Cymbidium orchid SVG used as a bullet and inside section eyebrows. */
export function Drop({ className = '', fill = '#6E8CA8', gradient }) {
  const uid = useId()
  const gradId = `drop-g${uid.replace(/:/g, '')}`
  const petalFill = gradient ? `url(#${gradId})` : fill

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
      )}

      {/* Top petal */}
      <path
        d="M12 2.8 C9.6 5.2 9.4 7.6 10.9 9.4 C11.4 10.1 12.6 10.1 13.1 9.4 C14.6 7.6 14.4 5.2 12 2.8Z"
        fill={petalFill}
      />

      {/* Left upper petal */}
      <path
        d="M4.6 6.4 C7.6 5.6 10.4 6.7 11.4 9.2 C11.8 10.1 10.7 11.1 9.6 10.7 C7 9.9 5.4 8.4 4.6 6.4Z"
        fill={petalFill}
      />

      {/* Right upper petal */}
      <path
        d="M19.4 6.4 C16.4 5.6 13.6 6.7 12.6 9.2 C12.2 10.1 13.3 11.1 14.4 10.7 C17 9.9 18.6 8.4 19.4 6.4Z"
        fill={petalFill}
      />

      {/* Left lower petal */}
      <path
        d="M6.2 17.2 C5.8 14.2 7.8 11.4 10.6 10.6 C11.8 10.2 12.4 11.6 11.6 12.8 C10.6 14.3 9.2 15.7 6.2 17.2Z"
        fill={petalFill}
      />

      {/* Right lower petal */}
      <path
        d="M17.8 17.2 C18.2 14.2 16.2 11.4 13.4 10.6 C12.2 10.2 11.6 11.6 12.4 12.8 C13.4 14.3 14.8 15.7 17.8 17.2Z"
        fill={petalFill}
      />

      {/* Orchid lip */}
      <path
        d="M12 10 C10.6 10 9.5 11 9.5 12.5 C9.5 14.2 10.8 15.6 12 17.2 C13.2 15.6 14.5 14.2 14.5 12.5 C14.5 11 13.4 10 12 10Z"
        fill="white"
      />

      {/* Centre detail: plain fill, not gradient */}
      <circle cx="12" cy="11.8" r="0.9" fill={fill} />
    </svg>
  )
}

/** Section eyebrow: an orchid glyph + a mono, wide-tracked uppercase label. */
export default function Label({ children, className = '', fill, gradient }) {
  return (
    <span className={'eyebrow inline-flex items-center gap-2 ' + className}>
      <Drop className="h-4 w-auto" fill={fill} gradient={gradient} />
      {children}
    </span>
  )
}
