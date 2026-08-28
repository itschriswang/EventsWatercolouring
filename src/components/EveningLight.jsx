import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { fieldCss } from '../lib/watercolour.js'

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
// Golden hour — apricot into butter, pouring from the top of the sky.
export const GOLDEN_HOUR = [
  { pigment: 'apricot', x: 0.146, at: [0.5, 0], size: [1.2, 0.6], extent: 0.72 },
  { pigment: 'butter', x: 0.08, at: [0.5, 0], size: [1.2, 0.6], extent: 0.45 },
]

// Dusk — periwinkle and soft lilac drifting in from the margins.
export const DUSK = [
  { pigment: 'periwinkle', x: 0.185, at: [0.1, 0.42], size: [0.7, 0.55], extent: 0.7 },
  { pigment: 'lilac', x: 0.105, at: [0.9, 0.58], size: [0.7, 0.55], extent: 0.7 },
]

const LAYERS = [
  {
    background: fieldCss(GOLDEN_HOUR),
    stops: [0, 0.22, 0.45],
    opacities: [1, 0.45, 0],
  },
  {
    background: fieldCss(DUSK),
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
  const heavy = useHeavyFx()
  const { scrollYProgress } = useScroll()
  // A soft spring so the light trails the scroll like a slow sunset rather
  // than tracking the thumb — same wet-pigment lag as the timeline spine.
  const progress = useSpring(scrollYProgress, { stiffness: 55, damping: 20 })

  // heavyFx-gated like the site's other ambient layers: three fixed
  // full-viewport gradients recomposited through every scroll frame is
  // exactly the paint mobile GPUs shed frames on, and the drift is subtle
  // enough that phones lose nothing the static section washes don't cover.
  if (reduce || !heavy) return null
  return (
    <>
      {LAYERS.map((layer, i) => (
        <Layer key={i} progress={progress} layer={layer} />
      ))}
    </>
  )
}
