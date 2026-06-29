import { useId } from 'react'

export function Drop({ className = '', fill = '#6E8CA8' }) {
  const uid = useId()
  const maskId = `orchid-mask-${uid.replace(/:/g, '')}`

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect width="100" height="100" fill="white" />
          <path
            fill="black"
            d="M 50,37
               C 53,37 54,41 54,45
               C 58,43 64,47 64,52
               C 64,58 59,59 55,57
               C 54,61 54,68 50,72
               C 46,68 46,61 45,57
               C 41,59 36,58 36,52
               C 36,47 42,43 46,45
               C 46,41 47,37 50,37 Z"
          />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <g transform="translate(50, 50)">
          {/* Lower right */}
          <path
            d="M 0,0 C -12,-4 -14,-24 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={fill}
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(128)"
          />

          {/* Lower left */}
          <path
            d="M 0,0 C -12,-4 -14,-24 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={fill}
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(-128)"
          />

          {/* Upper right */}
          <path
            d="M 0,0 C -12,-4 -14,-24 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={fill}
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(75)"
          />

          {/* Upper left */}
          <path
            d="M 0,0 C -12,-4 -14,-24 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={fill}
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(-75)"
          />

          {/* Top */}
          <path
            d="M 0,0 C -12,-4 -14,-24 0,-36 C 14,-24 12,-4 0,0 Z"
            fill={fill}
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(0)"
          />
        </g>
      </g>
    </svg>
  )
}

/** Section eyebrow: an orchid glyph + a mono, wide-tracked uppercase label.
 *  The drop is a solid colour now (the gradient prop was retired). `gradient`
 *  is still accepted from existing callers — we take its first stop as the
 *  fill — so no call site needs to change. */
export default function Label({ children, className = '', fill, gradient }) {
  const dropFill = fill ?? (gradient && gradient[0])
  return (
    <span className={'eyebrow inline-flex items-center gap-2 ' + className}>
      <Drop className="h-4 w-auto" fill={dropFill} />
      {children}
    </span>
  )
}
