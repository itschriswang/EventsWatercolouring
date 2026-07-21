import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * Fireflies — a handful of chartreuse motes waking up in the dusk folder,
 * the garden at night the timeline copy walks through. Pure CSS keyframes
 * (`firefly` in index.css, per-mote drift via custom props), so the loop
 * costs nothing on the main thread and the global reduced-motion safety net
 * freezes it for free.
 *
 * Hand-placed constellation, not randomised: positions cluster low and to
 * the sides so the motes live in the folder's dark negative space, away
 * from the timeline cards. Heavy-fx devices get the full drifting set;
 * everything else gets a smaller, static scatter at half glow — never
 * nothing, never jank.
 */
const MOTES = [
  { left: '8%', top: '26%', s: 3, x: 22, y: -30, dur: 8.5, delay: 0 },
  { left: '16%', top: '68%', s: 2.5, x: -16, y: -24, dur: 10, delay: 1.6 },
  { left: '30%', top: '84%', s: 3.5, x: 18, y: -16, dur: 9, delay: 3.1 },
  { left: '55%', top: '76%', s: 2.5, x: -20, y: -28, dur: 11, delay: 0.9 },
  { left: '72%', top: '30%', s: 3, x: 14, y: -20, dur: 9.5, delay: 2.2 },
  { left: '86%', top: '58%', s: 2.5, x: -18, y: -26, dur: 10.5, delay: 4.0 },
  { left: '44%', top: '20%', s: 2, x: 16, y: -18, dur: 12, delay: 5.2 },
  { left: '64%', top: '88%', s: 3, x: -14, y: -22, dur: 8, delay: 2.8 },
  { left: '92%', top: '18%', s: 2, x: -12, y: -18, dur: 11.5, delay: 1.2 },
]

export default function Fireflies({ className = '' }) {
  const heavy = useHeavyFx()
  const motes = heavy ? MOTES : MOTES.slice(0, 5)
  return (
    <div
      aria-hidden="true"
      className={'pointer-events-none absolute inset-0 overflow-hidden ' + className}
    >
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: m.s,
            height: m.s,
            background: 'rgba(239,239,160,0.9)',
            // A glow, not a shadow — butter into the protected yellow-green.
            boxShadow:
              '0 0 10px 2px rgba(239,239,160,0.55), 0 0 22px 6px rgba(205,215,80,0.25)',
            '--ff-x': `${m.x}px`,
            '--ff-y': `${m.y}px`,
            animation: heavy
              ? `firefly ${m.dur}s ease-in-out ${m.delay}s infinite alternate`
              : 'none',
            opacity: heavy ? undefined : 0.5,
          }}
        />
      ))}
    </div>
  )
}
