import BloomField from './BloomField.jsx'

/**
 * WatercolourBloom — the site's shared pigment wash, as paint.
 *
 * The recipes below are the hand-written gradient field this replaces, run
 * through §6.2 colour separation to find which paint each colour was and then
 * solved for the thickness that reproduces its area-weighted load. Blooms sit
 * in hue-adjacent clusters along the palette arc (apricot → butter →
 * yellow-green → periwinkle → lilac → blush) and the near-white cores are
 * LIFTS — unpainted paper held open where the clusters meet — rather than
 * paint, because that is what they always were.
 *
 * Sized as circles in vw rather than percentage ellipses: the sections these
 * sit behind can run many viewport-heights tall, and a two-axis percentage
 * resolves against width and height independently, which stretches every wash
 * into a tall sliver. One radius keyed to viewport width keeps each bloom round
 * however tall its section is.
 *
 * `canvas={false}` for the instances an ancestor masks or clips — see
 * BloomField for why the shared canvas cannot follow those.
 */

export const WASH_STATIC = [
  { lift: 0.36, sizeVw: 20, at: [0.46, 0.4], extent: 0.72 },
  { lift: 0.28, sizeVw: 18, at: [0.7, 0.78], extent: 0.72 },
  { pigment: 'apricot', x: 0.266, sizeVw: 34, at: [0.16, 0.26], extent: 0.72 },
  { pigment: 'butter', x: 0.247, sizeVw: 26, at: [0.3, 0.14], extent: 0.72 },
  { pigment: 'yellowgreen', x: 0.229, sizeVw: 28, at: [0.42, 0.28], extent: 0.72 },
  { pigment: 'lemonlime', x: 0.128, sizeVw: 20, at: [0.5, 0.2], extent: 0.74 },
  { pigment: 'blush', x: 0.248, sizeVw: 28, at: [0.88, 0.14], extent: 0.72 },
  { pigment: 'blossom', x: 0.181, sizeVw: 22, at: [0.8, 0.28], extent: 0.74 },
  { pigment: 'lilac', x: 0.212, sizeVw: 30, at: [0.99, 0.5], extent: 0.72 },
  { pigment: 'butter', x: 0.241, sizeVw: 32, at: [0.85, 0.84], extent: 0.72 },
  { pigment: 'butter', x: 0.184, sizeVw: 24, at: [0.72, 0.92], extent: 0.74 },
  { pigment: 'periwinkle', x: 0.17, sizeVw: 29, at: [0.08, 0.88], extent: 0.72 },
  { pigment: 'lilac', x: 0.181, sizeVw: 24, at: [0.2, 0.74], extent: 0.74 },
  { pigment: 'blossom', x: 0.111, sizeVw: 24, at: [0.36, 0.52], extent: 0.74 },
  { pigment: 'rose', x: 0.18, sizeVw: 22, at: [0.45, 0.96], extent: 0.74 },
  { pigment: 'aurora_rose', x: 0.071, sizeVw: 20, at: [0.56, 0.88], extent: 0.74 },
]

// Warmer recipe for sections on the deeper `paper-deep` ground — the sunlit
// arc (apricot, butter, the yellow-green glow) with blush/rose accents, so the
// wash reads as warm light rather than compounding into a muddy grey.
export const WASH_WARM = [
  { lift: 0.32, sizeVw: 18, at: [0.52, 0.34], extent: 0.72 },
  { pigment: 'apricot', x: 0.236, sizeVw: 32, at: [0.14, 0.2], extent: 0.72 },
  { pigment: 'butter', x: 0.231, sizeVw: 26, at: [0.32, 0.1], extent: 0.72 },
  { pigment: 'rose', x: 0.127, sizeVw: 30, at: [0.9, 0.12], extent: 0.72 },
  { pigment: 'blush', x: 0.258, sizeVw: 22, at: [0.78, 0.26], extent: 0.74 },
  { pigment: 'butter', x: 0.241, sizeVw: 30, at: [0.86, 0.86], extent: 0.72 },
  { pigment: 'butter', x: 0.184, sizeVw: 22, at: [0.7, 0.94], extent: 0.74 },
  { pigment: 'lilac', x: 0.197, sizeVw: 26, at: [0.06, 0.86], extent: 0.72 },
  { pigment: 'periwinkle', x: 0.141, sizeVw: 20, at: [0.22, 0.96], extent: 0.74 },
  { pigment: 'yellowgreen', x: 0.182, sizeVw: 24, at: [0.6, 0.06], extent: 0.72 },
  { pigment: 'aurora_rose', x: 0.071, sizeVw: 20, at: [0.44, 0.62], extent: 0.74 },
]

export default function WatercolourBloom({ className = '', variant = 'default', canvas = true, fadeTop = 0 }) {
  return (
    <BloomField
      blooms={variant === 'warm' ? WASH_WARM : WASH_STATIC}
      canvas={canvas}
      fadeTop={fadeTop}
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  )
}
