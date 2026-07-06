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
              lands with a digital-perfect edge. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.09" numOctaves="2" seed="6" result="wobbleNoise" />
          <feDisplacementMap in="SourceGraphic" in2="wobbleNoise" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="wobbled" />

          {/* Paper-grain ink texture, clipped to the wobbled glyph shape so
              it only ever mottles the letterforms, then pressed into them
              with hard-light for uneven, worn ink density. Desaturated to
              grayscale first — fractalNoise's independently-random R/G/B
              channels otherwise fringe every edge with stray colour, which
              reads as a rendering glitch rather than paper grain. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="11" stitchTiles="stitch" result="grainRGB" />
          <feColorMatrix in="grainRGB" type="matrix"
            values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
            result="grain" />
          <feComposite in="grain" in2="wobbled" operator="in" result="grainInGlyph" />
          <feBlend in="grainInGlyph" in2="wobbled" mode="hard-light" />
        </filter>
      </defs>
    </svg>
  )
}
