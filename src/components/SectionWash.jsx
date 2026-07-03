import WatercolourBloom from './WatercolourBloom.jsx'

/**
 * Wraps a run of homepage sections in a shared WatercolourBloom background
 * layer, so the wash reads as one continuous painting behind them instead
 * of restarting at each section boundary. Two optional finishing touches:
 * `mask` fades the bloom in/out with a mask-image gradient, and
 * `seamGradient` lays a solid-to-transparent gradient over the top to blend
 * into whatever comes immediately before (e.g. carrying the hero's paper
 * tone down into the next section so there's no visible seam).
 */
export default function SectionWash({ mask, seamGradient, children }) {
  return (
    <div className="relative overflow-visible">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          zIndex: 0,
          ...(mask ? { WebkitMaskImage: mask, maskImage: mask } : {}),
        }}
      >
        <WatercolourBloom />
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
