import { useReducedMotion } from 'framer-motion'

const ease = 'cubic-bezier(.22,.61,.36,1)'

const BLOOMS = [
  // left margin — magenta top, sage mid, orange low
  { style: { left: '-14vmin', top: '6%',  background: 'radial-gradient(circle at 40% 40%, #B5395B, transparent 68%)', animationName: 'bloom-drift1', animationDuration: '26s' } },
  { style: { left: '-16vmin', top: '42%', background: 'radial-gradient(circle at 50% 50%, #6E7E4E, transparent 70%)', animationName: 'bloom-drift2', animationDuration: '34s' } },
  { style: { left: '-12vmin', top: '74%', background: 'radial-gradient(circle at 45% 45%, #ED8A33, transparent 68%)', animationName: 'bloom-drift3', animationDuration: '30s' } },
  // right margin — teal top, rose mid, gold low
  { style: { right: '-14vmin', top: '12%', background: 'radial-gradient(circle at 60% 40%, #3A7F9D, transparent 70%)', animationName: 'bloom-drift2', animationDuration: '32s' } },
  { style: { right: '-16vmin', top: '48%', background: 'radial-gradient(circle at 55% 55%, #C98B8C, transparent 70%)', animationName: 'bloom-drift3', animationDuration: '28s' } },
  { style: { right: '-12vmin', top: '80%', background: 'radial-gradient(circle at 50% 45%, #C9A23A, transparent 68%)', animationName: 'bloom-drift1', animationDuration: '36s' } },
]

/**
 * Soft watercolour pigment halos fixed in the left and right margins, drifting
 * slowly so the page feels alive without distracting from content.
 * Mirrors the legacy .bloom-field design. Paused for reduced-motion users.
 */
export default function BloomField() {
  const reduce = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden"
    >
      {BLOOMS.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '42vmin',
            height: '42vmin',
            borderRadius: '50%',
            filter: 'blur(46px)',
            mixBlendMode: 'multiply',
            opacity: 0.26,
            willChange: reduce ? 'auto' : 'transform, opacity',
            animationTimingFunction: ease,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            ...b.style,
            ...(reduce ? { animationName: 'none' } : {}),
          }}
        />
      ))}
    </div>
  )
}
