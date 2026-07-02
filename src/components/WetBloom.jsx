/**
 * Watercolour bloom — an SVG turbulence + displacement filter that "wicks" an
 * image into focus, like wet pigment spreading into cotton paper. The
 * displacement amplitude and a soft wet-edge blur settle to zero on mount, so
 * remounting the filter (one fresh id per use) replays the bloom each time.
 * Shared by the gallery lightbox (replays per painting) and the hero cards
 * (plays once as the preloader hands over). Only render it when motion is
 * allowed — callers gate on reduced-motion / heavyFx themselves.
 */
export default function BloomFilter({ id, dur = '0.9s', begin = '0s' }) {
  // Organic, paper-soft easing — mirrors the site's `ease-organic` curve.
  const ease = '0.22 0.61 0.36 1'
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute" style={{ position: 'absolute' }}>
      <filter id={id} x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.011 0.016"
          numOctaves="2"
          seed="7"
          result="paper"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="paper"
          scale="24"
          xChannelSelector="R"
          yChannelSelector="G"
          result="wet"
        >
          <animate
            attributeName="scale"
            from="24"
            to="0"
            dur={dur}
            begin={begin}
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keySplines={ease}
          />
        </feDisplacementMap>
        <feGaussianBlur in="wet" stdDeviation="4">
          <animate
            attributeName="stdDeviation"
            from="4"
            to="0"
            dur={dur}
            begin={begin}
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keySplines={ease}
          />
        </feGaussianBlur>
      </filter>
    </svg>
  )
}
