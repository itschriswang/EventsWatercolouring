import { useId } from 'react'

/**
 * Water droplet accents — the small-scale companions to DuskRain's window
 * condensation. Two flavours:
 *
 *  - CardDrips: beads hanging off a card's bottom edge. Each breathes slowly;
 *    a bead marked `fall: true` periodically swells, snaps back, and releases
 *    a droplet that drops away (the drip-release / drip-fall keyframe pair in
 *    index.css, kept in sync by sharing one duration + delay).
 *  - DewBeads: settled dew resting on a surface — glassy ellipses with a
 *    cream catchlight and a lilac settled shadow (never grey, per the shadow
 *    palette).
 *
 * All motion is plain CSS animation on purpose: the global reduced-motion
 * safety net in index.css freezes it for free — hanging beads settle at their
 * resting shape and the falling droplet never appears (its resting opacity
 * is 0). No JS gating needed.
 */

// Teardrop hanging from its point: attached to the card edge at the top,
// belly rounding out below.
const BEAD_D = 'M5 .6 C6.2 3.2 8.3 5.4 8.3 8.4 A3.3 3.3 0 1 1 1.7 8.4 C1.7 5.4 3.8 3.2 5 .6 Z'

export function CardDrips({ drops, tint = ['#FFFCF2', '#C9BCE4'], className = '' }) {
  const uid = useId().replace(/:/g, '')
  return (
    <span aria-hidden="true" className={'pointer-events-none absolute inset-x-0 top-full ' + className}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={`drip-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint[0]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={tint[1]} stopOpacity="0.92" />
          </linearGradient>
        </defs>
      </svg>
      {drops.map((d, i) => {
        const s = d.s ?? 1
        // falls run on a slightly longer clock than plain breathers, and the
        // per-drop delay keeps a row of beads from pulsing in unison
        const dur = `${d.dur ?? (d.fall ? 7 : 6.5)}s`
        const delay = `${d.delay ?? 0}s`
        return (
          <span key={i} className="absolute -top-px" style={{ left: `${d.x}%` }}>
            <svg
              viewBox="0 0 10 14"
              className={'block overflow-visible ' + (d.fall ? 'drip-bead-release' : 'drip-bead')}
              style={{ width: 10 * s, height: 14 * s, animationDuration: dur, animationDelay: delay }}
            >
              <path d={BEAD_D} fill={`url(#drip-${uid})`} />
              <ellipse cx="3.8" cy="8" rx="0.9" ry="1.2" fill="#FFFCF2" opacity="0.75" />
            </svg>
            {d.fall && (
              <span
                className="drip-fall h-[7px] w-[5px] rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${tint[0]}, ${tint[1]})`,
                  animationDuration: dur,
                  animationDelay: delay,
                }}
              />
            )}
          </span>
        )
      })}
    </span>
  )
}

// A few preset clusters so neighbouring cells don't wear identical dew;
// callers pick one with `seed` (usually their index).
const DEW_LAYOUTS = [
  [
    { x: 7, y: 14, r: 4.2 },
    { x: 17, y: 7, r: 2.4 },
    { x: 27, y: 16, r: 3.1 },
  ],
  [
    { x: 9, y: 8, r: 3.2 },
    { x: 21, y: 15, r: 4.8 },
  ],
  [
    { x: 6, y: 16, r: 2.8 },
    { x: 15, y: 6, r: 2.2 },
    { x: 28, y: 12, r: 4 },
  ],
]

export function DewBeads({ className = '', seed = 0 }) {
  const uid = useId().replace(/:/g, '')
  const beads = DEW_LAYOUTS[seed % DEW_LAYOUTS.length]
  return (
    <svg aria-hidden="true" viewBox="0 0 36 24" className={'pointer-events-none ' + className}>
      <defs>
        <radialGradient id={`dew-${uid}`} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#FFFCF2" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#E4E6F4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8E6BB8" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      {beads.map((b, i) => (
        <g key={i}>
          <ellipse cx={b.x} cy={b.y + b.r * 0.35} rx={b.r * 0.9} ry={b.r * 0.55} fill="rgba(94,74,140,0.16)" />
          <ellipse cx={b.x} cy={b.y} rx={b.r * 0.92} ry={b.r} fill={`url(#dew-${uid})`} />
          <circle cx={b.x - b.r * 0.32} cy={b.y - b.r * 0.4} r={Math.max(0.5, b.r * 0.18)} fill="#FFFCF2" opacity="0.9" />
        </g>
      ))}
    </svg>
  )
}
