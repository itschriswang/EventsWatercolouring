import './WatercolourBloom.css'

/**
 * WatercolourBloom — a static pigment wash echoing watercolour blooms
 * spreading through wet cotton paper.
 *
 * Painted once as CSS radial-gradients: no SVG filters, no mix-blend
 * recompositing, no continuous animation, so it never touches the frame
 * budget while scrolling.
 *
 * `negative` swaps the wash to its colour-inverted twin — the same bloom
 * shapes, but the warm terracotta/ochre/blush palette flips to cool
 * blues and indigos. Used to give a page a distinct, calmer mood without
 * a second set of gradients to hand-tune and keep in sync.
 */
export default function WatercolourBloom({ className = '', negative = false }) {
  return (
    <div
      aria-hidden="true"
      className={`wcb-root wcb-static ${negative ? 'wcb-negative' : ''} ${className}`}
    />
  )
}
