import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * Global fuzzy paper texture. A fixed, full-screen, non-interactive SVG noise
 * filter blended over everything to unify the site's physical, tactile feel.
 *
 * Performance: because this is `fixed` *and* `mix-blend-multiply`, the browser
 * has to re-composite the whole viewport against the scrolling page on every
 * frame. On mobile GPUs that alone causes visible scroll jank, so the live
 * filter is restricted to fine-pointer desktops. Touch devices simply skip it —
 * the texture is decorative and its absence is imperceptible in motion.
 */
export default function GrainOverlay() {
  const enabled = useHeavyFx()
  if (!enabled) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="paperNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paperNoise)" />
      </svg>
    </div>
  )
}
