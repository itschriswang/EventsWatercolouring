/**
 * Hidden SVG defs powering `.display-xl/-lg/-md`'s stamped-ink look (see
 * index.css). Split into its own component so each page entry (App,
 * CorporatePage, FaqPage) can mount it once regardless of which titles it
 * actually renders — filters resolve by `url(#id)` from anywhere in the
 * document, so there's nothing to prop-thread.
 */
export default function StampFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="stamp-distress" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          {/* Wobble the glyph outline itself — a hand-pressed stamp never
              lands with a digital-perfect edge. Increased scale (5.6) and
              lower frequency for more dramatic, jagged distress than subtle softness. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.05" numOctaves="2" seed="6" result="wobbleNoise" />
          <feDisplacementMap in="SourceGraphic" in2="wobbleNoise" scale="5.6" xChannelSelector="R" yChannelSelector="G" result="wobbled" />

          {/* Dry, cracked-paper ink texture — coarse grain that reads as pigment
              embedded into distressed fibre, not soft blur. Desaturated to grayscale,
              clipped to the wobbled glyph, then darkened via hard-light for pronounced
              ink density variation that catches light like stamped paper. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.32" numOctaves="5" seed="11" stitchTiles="stitch" result="grainRGB" />
          <feColorMatrix in="grainRGB" type="matrix"
            values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
            result="grain" />
          <feComposite in="grain" in2="wobbled" operator="in" result="grainInGlyph" />
          <feBlend in="grainInGlyph" in2="wobbled" mode="multiply" />
        </filter>
      </defs>
    </svg>
  )
}
