import { useId } from 'react'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
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
 * for each shape's own `transform-origin` — deliberate, so the grow/fade
 * animation pivots around the bloom's own centre without extra bookkeeping.
 *
 * `variant` picks one of three wcb-bloom-fade-N keyframes (see the CSS) —
 * each has a differently shaped rise/hold/fade curve — so paired with the
 * per-bloom duration/delay, no two blooms read as the same pulse.
 */
const BLOOMS = [
  // Dominant wash
  { id: 'terracotta', color: '#C2613C', rim: '#8F4321', cx: 16, cy: 28, r: 36, warm: true,
    freq: 0.058, scale: 9, blur: 2.6, seed: 3, dur: '22s', delay: '-6s', variant: 1 },
  // Secondary warms
  { id: 'rust', color: '#A4502F', rim: '#7A3A20', cx: 36, cy: 52, r: 22, warm: true,
    freq: 0.078, scale: 7, blur: 2.0, seed: 11, dur: '31s', delay: '-18s', variant: 2 },
  { id: 'rust2', color: '#A4502F', rim: '#7A3A20', cx: 24, cy: 69, r: 14, warm: true,
    freq: 0.09, scale: 5, blur: 1.6, seed: 87, dur: '17s', delay: '-10s', variant: 3 },
  { id: 'ochre', color: '#C9A23A', rim: '#9C7B26', cx: 88, cy: 13, r: 22, warm: true,
    freq: 0.072, scale: 7, blur: 2.1, seed: 19, dur: '26s', delay: '-11s', variant: 1 },
  { id: 'ochre2', color: '#C9A23A', rim: '#9C7B26', cx: 70, cy: 33, r: 13, warm: true,
    freq: 0.095, scale: 5, blur: 1.5, seed: 93, dur: '15s', delay: '-4s', variant: 2 },
  { id: 'blush', color: '#E4889C', rim: '#C06C82', cx: 85, cy: 86, r: 24, warm: true,
    freq: 0.068, scale: 6, blur: 2.2, seed: 27, dur: '36s', delay: '-27s', variant: 3 },
  { id: 'rose', color: '#C98B8C', rim: '#9C6668', cx: 8, cy: 90, r: 20, warm: true,
    freq: 0.082, scale: 5, blur: 1.8, seed: 35, dur: '20s', delay: '-9s', variant: 1 },
  { id: 'orange', color: '#ED8A33', rim: '#C0691A', cx: 54, cy: 96, r: 17, warm: true,
    freq: 0.09, scale: 5, blur: 1.7, seed: 43, dur: '28s', delay: '-33s', variant: 2 },
  // Cool balancing washes (~30%)
  { id: 'lime', color: '#AEBF56', rim: '#84943A', cx: 62, cy: 6, r: 17, warm: false,
    freq: 0.078, scale: 5, blur: 1.8, seed: 51, dur: '24s', delay: '-4s', variant: 3 },
  { id: 'cornflower', color: '#6E8CA8', rim: '#4F6A85', cx: 99, cy: 50, r: 20, warm: false,
    freq: 0.07, scale: 6, blur: 2.0, seed: 59, dur: '33s', delay: '-21s', variant: 1 },
  { id: 'cornflower2', color: '#6E8CA8', rim: '#4F6A85', cx: 46, cy: 15, r: 12, warm: false,
    freq: 0.1, scale: 4, blur: 1.4, seed: 97, dur: '18s', delay: '-15s', variant: 2 },
]

// "Backruns" — small cauliflower blooms that surface then fade, now often
// enough that the paper always has one or two settling somewhere.
const CAULIFLOWERS = [
  { id: 'c1', color: '#8F4321', cx: 31, cy: 47, r: 8.5, seed: 67, dur: '46s', delay: '-14s', variant: 1 },
  { id: 'c2', color: '#9C7B26', cx: 79, cy: 27, r: 7, seed: 73, dur: '55s', delay: '-40s', variant: 2 },
  { id: 'c3', color: '#9C6668', cx: 17, cy: 74, r: 7.5, seed: 79, dur: '38s', delay: '-24s', variant: 3 },
  { id: 'c4', color: '#7A3A20', cx: 58, cy: 60, r: 6.5, seed: 103, dur: '61s', delay: '-6s', variant: 1 },
  { id: 'c5', color: '#4F6A85', cx: 90, cy: 70, r: 6, seed: 109, dur: '43s', delay: '-34s', variant: 2 },
]

export default function WatercolourBloom({ className = '', blend = 'multiply' }) {
  const rawId = useId()
  const uid = `wcb${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const heavyFx = useHeavyFx()

  // On touch / small devices the animated version is far too expensive: up to
  // three instances mount at once, each with 16 continuously-animating circles
  // carrying their own feTurbulence/feDisplacementMap/feGaussianBlur filter and
  // a mix-blend pass. That is a per-frame GPU repaint the whole time the page is
  // open — the main cause of scroll/interaction lag on phones. There we render a
  // static CSS radial-gradient wash instead: same warm pigment feel, painted
  // once, no filters, no blend re-compositing, no animation.
  if (!heavyFx) {
    return <div aria-hidden="true" className={`wcb-root wcb-static ${className}`} />
  }

  return (
    <div aria-hidden="true" className={`wcb-root ${className}`}>
      <svg
        className="wcb-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ colorInterpolationFilters: 'sRGB' }}
      >
        <defs>
          <filter id={`${uid}-paper`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="8" stitchTiles="stitch" result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.16  0 0 0 0 0.13  0 0 0 0 0.10  0 0 0 0.08 0"
            />
          </filter>

          {BLOOMS.map((b) => (
            <radialGradient key={b.id} id={`${uid}-g-${b.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={b.color} stopOpacity={b.warm ? 0.4 : 0.28} />
              <stop offset="38%" stopColor={b.color} stopOpacity={b.warm ? 0.32 : 0.22} />
              <stop offset="60%" stopColor={b.rim} stopOpacity={b.warm ? 0.24 : 0.16} />
              <stop offset="82%" stopColor={b.rim} stopOpacity={b.warm ? 0.08 : 0.05} />
              <stop offset="100%" stopColor={b.rim} stopOpacity="0" />
            </radialGradient>
          ))}

          {BLOOMS.map((b) => (
            <filter key={b.id} id={`${uid}-f-${b.id}`} x="-100%" y="-100%" width="300%" height="300%">
              <feTurbulence type="fractalNoise" baseFrequency={b.freq} numOctaves="3" seed={b.seed} result="warp" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale={b.scale} xChannelSelector="R" yChannelSelector="G" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation={b.blur + 0.4} result="soft" />
              <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed={b.seed + 5} result="grain" />
              <feComposite in="soft" in2="grain" operator="arithmetic" k1="0.09" k2="0.91" k3="0" k4="0" />
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
          opacity="0.09"
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
                mixBlendMode: blend,
                animationName: `wcb-bloom-fade-${b.variant}`,
                animationDuration: b.dur,
                animationDelay: b.delay,
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
                mixBlendMode: blend,
                animationName: `wcb-backrun-${c.variant}`,
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
