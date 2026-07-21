import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

/**
 * Evening light — the page's ambient ground drifts with the scroll the way
 * the night itself drifts: golden hour at the hero, dusk periwinkle/lilac
 * through the middle stretch, a low blush-burgundy nightfall glow as the
 * offerings and the ask arrive. Three fixed gradient layers whose opacities
 * are scroll-driven; they sit above the shared BloomCanvas (z 0) and below
 * the page content (z 10), so the drift only ever tints the paper's negative
 * space, never the type or the opaque cards.
 *
 * Kept within the anti-mud rules: every layer is a light, low-alpha tint,
 * crossfades are staggered so no two far-apart hues peak together, and the
 * bridge between the warm top and the cool middle runs through butter.
 * Reduced-motion visitors keep the page's existing static washes and skip
 * the drift entirely (scroll-linked colour is still motion).
 */
const LAYERS = [
  {
    // Golden hour — apricot into butter, pouring from the top of the sky.
    background:
      'radial-gradient(120% 60% at 50% 0%, rgba(247,195,148,0.20) 0%, rgba(242,233,130,0.10) 45%, transparent 72%)',
    stops: [0, 0.22, 0.45],
    opacities: [1, 0.45, 0],
  },
  {
    // Dusk — periwinkle and soft lilac drifting in from the margins.
    background:
      'radial-gradient(70% 55% at 10% 42%, rgba(196,202,235,0.16) 0%, transparent 70%), ' +
      'radial-gradient(70% 55% at 90% 58%, rgba(210,196,232,0.14) 0%, transparent 70%)',
    stops: [0.18, 0.45, 0.8],
    opacities: [0, 1, 0.35],
  },
  {
    // Nightfall — a low blush-burgundy glow rising from the page foot as the
    // dusk timeline's wine ground and the deep offerings sheet take over.
    background:
      'linear-gradient(to top, rgba(150,56,90,0.10) 0%, rgba(244,196,210,0.06) 30%, transparent 55%)',
    stops: [0.5, 0.85, 1],
    opacities: [0, 0.85, 1],
  },
]

function Layer({ progress, layer }) {
  const opacity = useTransform(progress, layer.stops, layer.opacities)
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1, background: layer.background, opacity }}
    />
  )
}

export default function EveningLight() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  // A soft spring so the light trails the scroll like a slow sunset rather
  // than tracking the thumb — same wet-pigment lag as the timeline spine.
  const progress = useSpring(scrollYProgress, { stiffness: 55, damping: 20 })

  if (reduce) return null
  return (
    <>
      {LAYERS.map((layer, i) => (
        <Layer key={i} progress={progress} layer={layer} />
      ))}
    </>
  )
}
