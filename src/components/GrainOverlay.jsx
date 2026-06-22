/**
 * Global fuzzy paper texture. A fixed, full-screen, non-interactive SVG noise
 * filter blended over everything to unify the site's physical, tactile feel.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-multiply"
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
