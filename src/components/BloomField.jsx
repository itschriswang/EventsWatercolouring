import { useReducedMotion } from 'framer-motion'
import useMediaQuery from '../hooks/useMediaQuery.js'

const ease = 'cubic-bezier(.22,.61,.36,1)'

// Desktop: soft halos peeking from the left/right content margins.
const BLOOMS_DESKTOP = [
  { style: { left: '-14vmin', top: '6%',  background: 'radial-gradient(circle at 40% 40%, #B5395B, transparent 68%)', animationName: 'bloom-drift1', animationDuration: '18s' } },
  { style: { left: '-16vmin', top: '42%', background: 'radial-gradient(circle at 50% 50%, #AEBF56, transparent 70%)', animationName: 'bloom-drift2', animationDuration: '23s' } },
  { style: { left: '-12vmin', top: '74%', background: 'radial-gradient(circle at 45% 45%, #ED8A33, transparent 68%)', animationName: 'bloom-drift3', animationDuration: '20s' } },
  { style: { right: '-14vmin', top: '12%', background: 'radial-gradient(circle at 60% 40%, #3A7F9D, transparent 70%)', animationName: 'bloom-drift2', animationDuration: '22s' } },
  { style: { right: '-16vmin', top: '48%', background: 'radial-gradient(circle at 55% 55%, #C98B8C, transparent 70%)', animationName: 'bloom-drift3', animationDuration: '19s' } },
  { style: { right: '-12vmin', top: '80%', background: 'radial-gradient(circle at 50% 45%, #C9A23A, transparent 68%)', animationName: 'bloom-drift1', animationDuration: '24s' } },
]

// Mobile: same pigments, brought inward so they're actually visible on narrow
// viewports. Larger radius + gradient centres shifted toward the interior +
// raised opacity ensures the haze reads through the warm paper without
// overwhelming content.
const BLOOMS_MOBILE = [
  { opacity: 0.32, size: '58vmin', style: { left: '-4vw',  top: '2%',  background: 'radial-gradient(circle at 62% 50%, #B5395B, transparent 64%)', animationName: 'bloom-drift1', animationDuration: '26s' } },
  { opacity: 0.28, size: '52vmin', style: { left: '-5vw',  top: '55%', background: 'radial-gradient(circle at 60% 45%, #ED8A33, transparent 64%)', animationName: 'bloom-drift3', animationDuration: '30s' } },
  { opacity: 0.24, size: '48vmin', style: { left: '-6vw', top: '35%', background: 'radial-gradient(circle at 64% 50%, #AEBF56, transparent 64%)', animationName: 'bloom-drift1', animationDuration: '36s' } },
  { opacity: 0.32, size: '58vmin', style: { right: '-4vw', top: '20%', background: 'radial-gradient(circle at 38% 50%, #3A7F9D, transparent 64%)', animationName: 'bloom-drift2', animationDuration: '32s' } },
  { opacity: 0.28, size: '52vmin', style: { right: '-5vw', top: '74%', background: 'radial-gradient(circle at 38% 55%, #C98B8C, transparent 64%)', animationName: 'bloom-drift1', animationDuration: '28s' } },
]

export default function BloomField() {
  const reduce = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const blooms = isDesktop ? BLOOMS_DESKTOP : BLOOMS_MOBILE
  // On phones the slow drift is imperceptible but the per-frame recompositing of
  // blurred, blended, fixed layers is the main scroll-jank source. Render the
  // blooms statically there and lighten the blur (the dominant compositing cost).
  const still = reduce || !isDesktop

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {blooms.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: b.size ?? '42vmin',
            height: b.size ?? '42vmin',
            borderRadius: '50%',
            filter: isDesktop ? 'blur(46px)' : 'blur(26px)',
            mixBlendMode: 'multiply',
            opacity: b.opacity ?? 0.26,
            willChange: still ? 'auto' : 'transform, opacity',
            animationTimingFunction: ease,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            ...b.style,
            ...(still ? { animationName: 'none' } : {}),
          }}
        />
      ))}
    </div>
  )
}
