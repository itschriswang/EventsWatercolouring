/**
 * DitherField — an ordered halftone/dither dot-screen laid over a layer to give
 * it the tooth of pigment printed (or painted) onto real paper. It ties the
 * page's soft washes and blooms together the way a single sheet's grain would:
 * everything sits in the same dotted screen instead of floating as separate
 * smooth gradients.
 *
 * The screen is TWO offset dot grids (the second nudged half a cell on both
 * axes), which reads as an ordered dither checkerboard rather than a plain
 * halftone lattice. Dots are tinted burgundy — the palette's deep decorative
 * anchor, never grey (see CLAUDE.md) — and multiplied into whatever sits
 * beneath, so on the cream paper and pastel washes they darken to a faint
 * printed stipple and leave lighter passages almost untouched.
 *
 * Pure static CSS (radial-gradients + background-size): it paints once and
 * composites for free, no filter graph or per-frame work, so it can carry the
 * texture onto every device without the tiering the live washes need. It's
 * always a decorative, non-interactive sibling — drop it `absolute inset-0`
 * inside a `relative`/`overflow-hidden` parent (or over a wash layer).
 *
 * Props:
 *   cell    — dot grid pitch in px (smaller = finer screen). Default 3.
 *   opacity — layer opacity. Default 0.42 (kept low; the multiply does the rest).
 *   tint    — dot colour (rgba). Default a low-alpha burgundy.
 *   blend   — mix-blend-mode. Default 'multiply'.
 *   className — extra classes (positioning, masking).
 */
export default function DitherField({
  cell = 3,
  opacity = 0.42,
  tint = 'rgba(126,40,72,0.16)',
  blend = 'multiply',
  className = 'absolute inset-0',
}) {
  const half = cell / 2
  return (
    <div
      aria-hidden="true"
      className={'pointer-events-none ' + className}
      style={{
        opacity,
        mixBlendMode: blend,
        backgroundImage:
          `radial-gradient(${tint} 0.6px, transparent 0.7px), ` +
          `radial-gradient(${tint} 0.6px, transparent 0.7px)`,
        backgroundSize: `${cell}px ${cell}px, ${cell}px ${cell}px`,
        backgroundPosition: `0 0, ${half}px ${half}px`,
      }}
    />
  )
}
