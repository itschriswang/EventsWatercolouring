import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import GlassEffect from './GlassEffect.jsx'

/**
 * GlassCurve — a flowing, organic curly shape that runs through the page
 * background with the glass effect overlay. Renders as SVG with a glass
 * effect positioned within it.
 */
export default function GlassCurve() {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()

  // The curve path — a flowing, organic wave that spans the viewport width
  // Multiple segments create a gentle S-curve effect
  const curvePath = `
    M 0,400
    Q 200,250 400,350
    T 800,300
    T 1200,400
    T 1600,280
    L 1600,600
    L 0,600
    Z
  `

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[20%] z-0 h-[40vh] overflow-visible opacity-60"
      viewBox="0 0 1600 600"
      preserveAspectRatio="xMidYMid slice"
      style={{
        filter: reduce ? 'none' : 'drop-shadow(0 18px 38px rgba(78,38,57,0.15))',
      }}
    >
      <defs>
        <filter id="glass-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          <feColorMatrix
            type="saturate"
            values="1.2"
          />
        </filter>
      </defs>

      {/* Base curve shape with gradient */}
      <path
        d={curvePath}
        fill="url(#curveGradient)"
        opacity="0.4"
        filter="url(#glass-blur)"
      />

      {/* Semi-transparent glass overlay on curve */}
      <path
        d={curvePath}
        fill="rgba(255, 252, 242, 0.5)"
        opacity="0.3"
        style={{
          backdropFilter: 'blur(8px)',
          mixBlendMode: 'lighten',
        }}
      />

      {/* Gradient definition — uses the site's pastel palette */}
      <defs>
        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(204, 208, 106, 0.6)" /> {/* Lemon Lime */}
          <stop offset="25%" stopColor="rgba(212, 182, 230, 0.5)" /> {/* Lavender */}
          <stop offset="50%" stopColor="rgba(191, 220, 209, 0.4)" /> {/* Seafoam */}
          <stop offset="75%" stopColor="rgba(242, 194, 207, 0.5)" /> {/* Blossom */}
          <stop offset="100%" stopColor="rgba(232, 143, 164, 0.6)" /> {/* Rose */}
        </linearGradient>
      </defs>

      {/* Sparkle dots along the curve for detail */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={`spark-${i}`}
          cx={i * 320}
          cy={300 + Math.sin(i) * 60}
          r="3"
          fill="rgba(255, 252, 242, 0.8)"
          opacity="0.5"
        />
      ))}
    </svg>
  )
}
