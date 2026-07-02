import { useId } from 'react'
import './MobileHeroBloom.css'

/**
 * MobileHeroBloom — a lightweight static bloom for mobile hero.
 * Uses cute pastel colors that echo the desktop Aurora palette,
 * with soft, blurred edges to avoid harsh lines.
 */
export default function MobileHeroBloom() {
  const rawId = useId()
  const uid = `mhb${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <div aria-hidden="true" className="mhb-root">
      <svg
        className="mhb-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ colorInterpolationFilters: 'sRGB' }}
      >
        <defs>
          {/* Soft blur filters to eliminate harsh edges */}
          <filter id={`${uid}-soft`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>

          {/* Radial gradients with cute pastel colors */}
          <radialGradient id={`${uid}-rose`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#F0B8C8" stopOpacity="0.24" />
            <stop offset="60%" stopColor="#E8A0B8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#E8A0B8" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-sage`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#D4E5C4" stopOpacity="0.20" />
            <stop offset="60%" stopColor="#C8DDB8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#C8DDB8" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-peach`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#F5D4B8" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#F0C8AC" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#F0C8AC" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-lavender`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#D9C8E8" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#D0BCDF" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#D0BCDF" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-mint`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#C8E5D8" stopOpacity="0.19" />
            <stop offset="60%" stopColor="#BCDCD0" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#BCDCD0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Layer 1: Primary rose bloom — top left */}
        <circle
          cx="18"
          cy="22"
          r="28"
          fill={`url(#${uid}-rose)`}
          filter={`url(#${uid}-soft)`}
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Layer 2: Sage bloom — top center-right */}
        <circle
          cx="72"
          cy="16"
          r="24"
          fill={`url(#${uid}-sage)`}
          filter={`url(#${uid}-soft)`}
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Layer 3: Peach bloom — right side */}
        <circle
          cx="88"
          cy="58"
          r="26"
          fill={`url(#${uid}-peach)`}
          filter={`url(#${uid}-soft)`}
          style={{ mixBlendMode: 'hard-light' }}
        />

        {/* Layer 4: Lavender bloom — bottom left */}
        <circle
          cx="22"
          cy="78"
          r="22"
          fill={`url(#${uid}-lavender)`}
          filter={`url(#${uid}-soft)`}
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Layer 5: Mint bloom — bottom center, subtle */}
        <circle
          cx="62"
          cy="84"
          r="20"
          fill={`url(#${uid}-mint)`}
          filter={`url(#${uid}-soft)`}
          style={{ mixBlendMode: 'screen' }}
        />
      </svg>
    </div>
  )
}
