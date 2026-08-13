import WatercolourBloom from './WatercolourBloom.jsx'
import DitherField from './DitherField.jsx'

/**
 * Wraps a run of homepage sections in a shared WatercolourBloom background
 * layer, so the wash reads as one continuous painting behind them instead
 * of restarting at each section boundary. Two optional finishing touches:
 * `fadeTop` eases the wash in over the first fraction of the run, and
 * `seamGradient` lays a solid-to-transparent gradient over the top to blend
 * into whatever comes immediately before (e.g. carrying the hero's paper
 * tone down into the next section so there's no visible seam).
 *
 * `fadeTop` is expressed as a number rather than a mask string so BloomCanvas
 * can reproduce it: a vertical ramp is the one mask shape the canvas can
 * follow, and stating it this way keeps a faded wash on the canvas instead of
 * dropping it to CSS for the sake of a gradient the shader could have drawn.
 */
export default function SectionWash({ fadeTop = 0, seamGradient, variant, children }) {
  // Still a real mask on the wrapper: it has to clip DitherField too.
  const mask = fadeTop
    ? `linear-gradient(to bottom, transparent 0%, black ${fadeTop * 100}%, black 100%)`
    : null
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
        <WatercolourBloom variant={variant} fadeTop={fadeTop} />
        {/* Break the smooth wash into a printed dither dot-screen so the bloom
            reads as pigment on paper, not a CSS gradient. Sits in the same
            masked, overflow-clipped box as the wash, and — unlike the wash —
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
