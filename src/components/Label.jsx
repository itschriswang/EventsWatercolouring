import { useId } from 'react'

/** Cymbidium orchid SVG used as a bullet and inside section eyebrows. */
export function Drop({ className = '', fill = '#6E8CA8', gradient }) {
  const uid = useId()
  const gradId = `drop-g${uid.replace(/:/g, '')}`
  const petalFill = gradient ? `url(#${gradId})` : fill

  return (
    <svg className={className} viewBox="0 0 28.8 28.8" aria-hidden="true">
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
        d="M14.4 3.36 C11.52 6.24 11.28 9.12 13.08 11.28 C13.68 12.12 15.12 12.12 15.72 11.28 C17.52 9.12 17.28 6.24 14.4 3.36Z"
        fill={petalFill}
      />

      {/* Left upper petal */}
      <path
        d="M5.52 7.68 C9.12 6.72 12.48 8.04 13.68 11.04 C14.16 12.12 12.84 13.32 11.52 12.84 C8.4 11.88 6.48 10.08 5.52 7.68Z"
        fill={petalFill}
      />

      {/* Right upper petal */}
      <path
        d="M23.28 7.68 C19.68 6.72 16.32 8.04 15.12 11.04 C14.64 12.12 15.96 13.32 17.28 12.84 C20.4 11.88 22.32 10.08 23.28 7.68Z"
        fill={petalFill}
      />

      {/* Left lower petal */}
      <path
        d="M7.44 20.64 C6.96 17.04 9.36 13.68 12.72 12.72 C14.16 12.24 14.88 13.92 13.92 15.36 C12.72 17.16 11.04 18.84 7.44 20.64Z"
        fill={petalFill}
      />

      {/* Right lower petal */}
      <path
        d="M21.36 20.64 C21.84 17.04 19.44 13.68 16.08 12.72 C14.64 12.24 13.92 13.92 14.88 15.36 C16.08 17.16 17.76 18.84 21.36 20.64Z"
        fill={petalFill}
      />

      {/* Orchid lip */}
      <path
        d="M14.4 12 C12.72 12 11.4 13.2 11.4 15 C11.4 17.04 12.96 18.72 14.4 20.64 C15.84 18.72 17.4 17.04 17.4 15 C17.4 13.2 16.08 12 14.4 12Z"
        fill="white"
      />

      {/* Centre detail: plain fill, not gradient */}
      <circle cx="14.4" cy="14.16" r="1.08" fill={fill} />
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
