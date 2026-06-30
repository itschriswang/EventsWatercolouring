import { useReducedMotion } from 'framer-motion'
import { useEffect, useId, useMemo, useState } from 'react'
import { MARQUEE } from '../content.js'

// Smooth sine-wave path: 4 quarter-period cubic beziers per tile.
// Control handles at quarter-period distance give near-perfect sine shape.
// All peak/trough junctions have horizontal tangents → C1 continuity.
function buildPath(vw, h) {
  const mid = h / 2
  const amp = h * 0.28
  const top = mid - amp
  const bot = mid + amp
  const ctrl = vw * 0.14
  const tile = (ox) => [
    `C${ox + ctrl},${mid} ${ox + vw * 0.25 - ctrl},${top} ${ox + vw * 0.25},${top}`,
    `C${ox + vw * 0.25 + ctrl},${top} ${ox + vw * 0.5 - ctrl},${mid} ${ox + vw * 0.5},${mid}`,
    `C${ox + vw * 0.5 + ctrl},${mid} ${ox + vw * 0.75 - ctrl},${bot} ${ox + vw * 0.75},${bot}`,
    `C${ox + vw * 0.75 + ctrl},${bot} ${ox + vw - ctrl},${mid} ${ox + vw},${mid}`,
  ].join(' ')
  return `M0,${mid} ${tile(0)} ${tile(vw)}`
}

export default function Marquee() {
  const reduce = useReducedMotion()

  // Sanitise useId output → valid XML id (no colons)
  const rawId = useId()
  const pathId = `m${rawId.replace(/[^a-z0-9]/gi, '')}`

  const [vw, setVw] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  )

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Section height scales with viewport: 100 px min (mobile) → 200 px max (desktop)
  const h = Math.max(100, Math.min(vw * 0.14, 200))
  // Font size mirrors original clamp(2rem, 6vw, 5rem)
  const fontSize = Math.max(32, Math.min(vw * 0.06, 80))
  const path = useMemo(() => buildPath(vw, h), [vw, h])

  // Repeated phrase + bullet nodes; 4 repeats ensures the full 2-tile path
  // always has text even at the widest viewports.
  const textNodes = useMemo(
    () =>
      Array.from({ length: 4 }, (_, rep) =>
        MARQUEE.flatMap((phrase, i) => [
          <tspan key={`${rep}t${i}`} fill="#2A2724">
            {phrase.toUpperCase()}{'  '}
          </tspan>,
          <tspan key={`${rep}b${i}`} fill={i % 2 === 0 ? '#C2613C' : '#AEBF56'}>
            {'✦  '}
          </tspan>,
        ])
      ).flat(),
    []
  )

  return (
    <section
      aria-label="Live wedding watercolour"
      className="relative overflow-hidden"
      style={{ height: h }}
    >
      {/*
        SVG is 2× viewport wide. The path stays completely static — only the
        text's startOffset animates (0 % → 50 %, i.e. one full tile width).
        Because both tiles are identical the loop is seamless.
        The section's overflow-hidden clips the second tile from view so the
        wave line itself appears fixed in place.
      */}
      <svg
        key={vw}
        viewBox={`0 0 ${2 * vw} ${h}`}
        width={2 * vw}
        height={h}
        className="absolute top-0 left-0"
        aria-hidden="true"
      >
        <defs>
          <path id={pathId} d={path} />
        </defs>

        {/* Static ink wave line */}
        <use
          href={`#${pathId}`}
          fill="none"
          stroke="#2A2724"
          strokeWidth={1.5}
          strokeOpacity={0.18}
        />

        {/* Text undulates along the static path; only the offset moves */}
        <text
          fontSize={fontSize}
          fontFamily="Sora, sans-serif"
          fontWeight="700"
          dominantBaseline="middle"
          style={{ letterSpacing: '-0.025em' }}
        >
          <textPath href={`#${pathId}`}>
            {!reduce && (
              <animate
                attributeName="startOffset"
                from="0%"
                to="50%"
                dur="26s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            )}
            {textNodes}
          </textPath>
        </text>
      </svg>
    </section>
  )
}
