import WatercolourBloom from './WatercolourBloom.jsx'
import DitherField from './DitherField.jsx'

/**
 * Wraps a run of homepage sections in a shared WatercolourBloom background
 * layer, so the wash reads as one continuous painting behind them instead
 * of restarting at each section boundary. Two optional finishing touches:
 * `mask` fades the bloom in/out with a mask-image gradient, and
 * `seamGradient` lays a solid-to-transparent gradient over the top to blend
 * into whatever comes immediately before (e.g. carrying the hero's paper
 * tone down into the next section so there's no visible seam).
 */
export default function SectionWash({ mask, seamGradient, variant, children }) {
  return (
    <div
      className="relative overflow-visible"
      data-wash=""
      {...(variant === 'warm' ? { 'data-warm': '' } : {})}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          zIndex: 0,
          ...(mask ? { WebkitMaskImage: mask, maskImage: mask } : {}),
        }}
      >
        <WatercolourBloom variant={variant} />
        {/* Break the smooth wash into a printed dither dot-screen so the bloom
            reads as pigment on paper, not a CSS gradient. Sits in the same
            masked, overflow-clipped box as the wash, and — unlike `.wcb-root` —
            is NOT hidden when the live WebGL wash takes over, so it dithers
            that live bloom too. It's behind the section's content, so text and
            photographs above stay crisp and undithered. */}
        <DitherField />
      </div>
      {seamGradient && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full"
          style={{ zIndex: 0, background: seamGradient }}
        />
      )}
      {children}
    </div>
  )
}
