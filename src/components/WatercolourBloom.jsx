import './WatercolourBloom.css'

/**
 * WatercolourBloom — a static pigment wash echoing watercolour blooms
 * spreading through wet cotton paper.
 *
 * Painted once as CSS radial-gradients: no SVG filters, no mix-blend
 * recompositing, no continuous animation, so it never touches the frame
 * budget while scrolling.
 */
export default function WatercolourBloom({ className = '', variant = 'default' }) {
  const recipe = variant === 'warm' ? 'wcb-warm' : 'wcb-static'
  return <div aria-hidden="true" className={`wcb-root ${recipe} ${className}`} />
}
