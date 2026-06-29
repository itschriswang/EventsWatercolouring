import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useMemo, useState } from 'react'
import { MARQUEE } from '../content.js'

// Build a 2-tile asymmetric wave path in screen pixel coords.
// Both endpoints share the same y (mid) with horizontal tangents,
// guaranteeing C1 continuity where tiles meet — seamless loop.
// Crest at ~26% width (early), trough at ~72% (late), matching the
// original ribbon's character.
function buildPath(vw, h) {
  const mid = h / 2
  const amp = h * 0.22
  const top = mid - amp
  const bot = mid + amp
  const tile = (ox) => [
    `C${ox + vw * 0.06},${mid} ${ox + vw * 0.13},${top} ${ox + vw * 0.26},${top}`,
    `C${ox + vw * 0.38},${top} ${ox + vw * 0.46},${mid} ${ox + vw * 0.50},${mid}`,
    `C${ox + vw * 0.58},${mid} ${ox + vw * 0.62},${bot} ${ox + vw * 0.72},${bot}`,
    `C${ox + vw * 0.86},${bot} ${ox + vw * 0.94},${mid} ${ox + vw},${mid}`,
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
          <tspan key={`${rep}b${i}`} fill="#C2613C">
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
        Single SVG, 2× viewport wide.
        Animation: slide left by exactly one viewport width → seamless loop
        because both tiles are identical (key={vw} restarts on resize).
      */}
      <motion.svg
        key={vw}
        viewBox={`0 0 ${2 * vw} ${h}`}
        width={2 * vw}
        height={h}
        className="absolute top-0 left-0"
        animate={reduce ? {} : { x: [0, -vw] }}
        transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
        aria-hidden="true"
      >
        <defs>
          <path id={pathId} d={path} />
        </defs>

        {/* Single-weight ink line — the "path not a shape" */}
        <use
          href={`#${pathId}`}
          fill="none"
          stroke="#2A2724"
          strokeWidth={1.5}
          strokeOpacity={0.18}
        />

        {/* Marquee text flowing along the wave */}
        <text
          fontSize={fontSize}
          fontFamily="Sora, sans-serif"
          fontWeight="700"
          dominantBaseline="middle"
          style={{ letterSpacing: '-0.025em' }}
        >
          <textPath href={`#${pathId}`}>
            {textNodes}
          </textPath>
        </text>
      </motion.svg>
    </section>
  )
}
