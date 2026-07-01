import { useId } from 'react'
import './WatercolourBloom.css'

/**
 * WatercolourBloom — pigment washes spreading through wet cotton paper.
 *
 * Each bloom is a plain circle whose edge is broken up by a static
 * feTurbulence/feDisplacementMap pair (an organic, once-computed distortion —
 * never re-solved on every frame) and finished with a second, finer
 * turbulence pass composited into the shape to granulate the fill the way
 * real pigment settles unevenly into paper tooth. All motion afterwards is
 * just CSS transform/opacity on top of that frozen texture, so the filter
 * cost is paid once rather than every animation tick.
 *
 * cx/cy/r live in the 0–100 viewBox, which doubles as the percentage space
 * for each shape's own `transform-origin` — deliberate, so scale/drift
 * animations pivot around the bloom's own centre without extra bookkeeping.
 */
const BLOOMS = [
  // Dominant wash
  { id: 'terracotta', color: '#C2613C', rim: '#8F4321', cx: 18, cy: 30, r: 47, warm: true,
    freq: 0.052, scale: 11, blur: 3.1, seed: 3, dur: '46s', delay: '-6s', dx: 1.6, dy: 1.1 },
  // Secondary warms
  { id: 'rust', color: '#A4502F', rim: '#7A3A20', cx: 35, cy: 55, r: 29, warm: true,
    freq: 0.07, scale: 8, blur: 2.4, seed: 11, dur: '52s', delay: '-18s', dx: -1.3, dy: 1.7 },
  { id: 'ochre', color: '#C9A23A', rim: '#9C7B26', cx: 88, cy: 14, r: 29, warm: true,
    freq: 0.065, scale: 8, blur: 2.5, seed: 19, dur: '39s', delay: '-11s', dx: -1.5, dy: 1.0 },
  { id: 'blush', color: '#E4889C', rim: '#C06C82', cx: 85, cy: 87, r: 31, warm: true,
    freq: 0.06, scale: 7, blur: 2.6, seed: 27, dur: '58s', delay: '-27s', dx: -1.0, dy: -1.4 },
  { id: 'rose', color: '#C98B8C', rim: '#9C6668', cx: 8, cy: 90, r: 26, warm: true,
    freq: 0.075, scale: 6, blur: 2.1, seed: 35, dur: '44s', delay: '-9s', dx: 1.3, dy: -1.1 },
  { id: 'orange', color: '#ED8A33', rim: '#C0691A', cx: 54, cy: 97, r: 22, warm: true,
    freq: 0.08, scale: 6, blur: 2.0, seed: 43, dur: '49s', delay: '-33s', dx: 0.9, dy: -0.8 },
  // Cool balancing washes (~30%)
  { id: 'lime', color: '#AEBF56', rim: '#84943A', cx: 63, cy: 6, r: 22, warm: false,
    freq: 0.07, scale: 6, blur: 2.1, seed: 51, dur: '55s', delay: '-4s', dx: -0.8, dy: 1.1 },
  { id: 'cornflower', color: '#6E8CA8', rim: '#4F6A85', cx: 99, cy: 50, r: 26, warm: false,
    freq: 0.062, scale: 7, blur: 2.4, seed: 59, dur: '50s', delay: '-21s', dx: -1.1, dy: -0.9 },
]

// Rare "backruns" — small cauliflower blooms that barely surface then fade.
const CAULIFLOWERS = [
  { id: 'c1', color: '#8F4321', cx: 31, cy: 47, r: 8.5, seed: 67, dur: '78s', delay: '-14s' },
  { id: 'c2', color: '#9C7B26', cx: 79, cy: 27, r: 7, seed: 73, dur: '92s', delay: '-52s' },
  { id: 'c3', color: '#9C6668', cx: 17, cy: 74, r: 7.5, seed: 79, dur: '86s', delay: '-30s' },
]

export default function WatercolourBloom({ className = '' }) {
  const rawId = useId()
  const uid = `wcb${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <div aria-hidden="true" className={`wcb-root ${className}`}>
      <svg
        className="wcb-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ colorInterpolationFilters: 'sRGB' }}
      >
        <defs>
          <filter id={`${uid}-paper`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" stitchTiles="stitch" result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.16  0 0 0 0 0.13  0 0 0 0 0.10  0 0 0 0.14 0"
            />
          </filter>

          {BLOOMS.map((b) => (
            <radialGradient key={b.id} id={`${uid}-g-${b.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={b.color} stopOpacity={b.warm ? 0.4 : 0.28} />
              <stop offset="46%" stopColor={b.color} stopOpacity={b.warm ? 0.26 : 0.18} />
              <stop offset="74%" stopColor={b.rim} stopOpacity={b.warm ? 0.22 : 0.15} />
              <stop offset="100%" stopColor={b.rim} stopOpacity="0" />
            </radialGradient>
          ))}

          {BLOOMS.map((b) => (
            <filter key={b.id} id={`${uid}-f-${b.id}`} x="-90%" y="-90%" width="280%" height="280%">
              <feTurbulence type="fractalNoise" baseFrequency={b.freq} numOctaves="3" seed={b.seed} result="warp" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale={b.scale} xChannelSelector="R" yChannelSelector="G" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation={b.blur} result="soft" />
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={b.seed + 5} result="grain" />
              <feComposite in="soft" in2="grain" operator="arithmetic" k1="0.14" k2="0.86" k3="0" k4="0" />
            </filter>
          ))}

          {CAULIFLOWERS.map((c) => (
            <filter key={c.id} id={`${uid}-cf-${c.id}`} x="-140%" y="-140%" width="380%" height="380%">
              <feTurbulence type="fractalNoise" baseFrequency="0.24" numOctaves="3" seed={c.seed} result="warp" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale="5.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="1.1" />
            </filter>
          ))}
        </defs>

        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          filter={`url(#${uid}-paper)`}
          opacity="0.16"
          style={{ mixBlendMode: 'multiply' }}
        />

        <g className="wcb-cloud">
          {BLOOMS.map((b) => (
            <circle
              key={b.id}
              className="wcb-bloom"
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill={`url(#${uid}-g-${b.id})`}
              filter={`url(#${uid}-f-${b.id})`}
              style={{
                transformOrigin: `${b.cx}% ${b.cy}%`,
                mixBlendMode: 'multiply',
                animationDuration: b.dur,
                animationDelay: b.delay,
                '--wcb-dx': `${b.dx}%`,
                '--wcb-dy': `${b.dy}%`,
              }}
            />
          ))}

          {CAULIFLOWERS.map((c) => (
            <circle
              key={c.id}
              className="wcb-cauliflower"
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill={c.color}
              fillOpacity="0.16"
              filter={`url(#${uid}-cf-${c.id})`}
              style={{
                transformOrigin: `${c.cx}% ${c.cy}%`,
                mixBlendMode: 'multiply',
                animationDuration: c.dur,
                animationDelay: c.delay,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
