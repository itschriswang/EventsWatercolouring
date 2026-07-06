import { useId } from 'react'

export function Drop({ className = '', fill = '#A85450', gradient }) {
  const uid = useId()
  const maskId = `orchid-mask-${uid.replace(/:/g, '')}`
  const gradId = `orchid-grad-${uid.replace(/:/g, '')}`
  const petalFill = gradient ? `url(#${gradId})` : fill

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        {gradient && (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        )}
        <clipPath id={maskId}>
          <path
            fillRule="evenodd"
            d="M 0 0 H 100 V 100 H 0 Z
               M 50,37
               C 53,37 54,41 54,45
               C 58,43 64,47 64,52
               C 64,58 59,59 55,57
               C 54,61 54,68 50,72
               C 46,68 46,61 45,57
               C 41,59 36,58 36,52
               C 36,47 42,43 46,45
               C 46,41 47,37 50,37 Z"
          />
        </clipPath>
      </defs>

      <g clipPath={`url(#${maskId})`}>
        <g transform="translate(50, 50)">
          {/* Lower right */}
          <path
            d="M 0,0 C -12,-4 -14,-24 -2,-35 C 0,-36 2,-35 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={petalFill}
            transform="rotate(128)"
          />

          {/* Lower left */}
          <path
            d="M 0,0 C -12,-4 -14,-24 -2,-35 C 0,-36 2,-35 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={petalFill}
            transform="rotate(-128)"
          />

          {/* Upper right */}
          <path
            d="M 0,0 C -12,-4 -14,-24 -2,-35 C 0,-36 2,-35 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={petalFill}
            transform="rotate(75)"
          />

          {/* Upper left */}
          <path
            d="M 0,0 C -12,-4 -14,-24 -2,-35 C 0,-36 2,-35 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={petalFill}
            transform="rotate(-75)"
          />

          {/* Top */}
          <path
            d="M 0,0 C -12,-4 -14,-24 -2,-35 C 0,-36 2,-35 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={petalFill}
            transform="rotate(0)"
          />
        </g>
      </g>
    </svg>
  )
}

/** Section eyebrow: an orchid glyph + a Mynerve, wide-tracked uppercase
 *  label. The pigment passed via `fill` (or a `gradient` pair) tints the
 *  orchid so each section keeps its accent colour. */
export default function Label({ children, className = '', fill, gradient }) {
  return (
    <span className={'eyebrow inline-flex items-center gap-2 ' + className}>
      <Drop className="h-6 w-auto" fill={fill} gradient={gradient} />
      {children}
    </span>
  )
}
