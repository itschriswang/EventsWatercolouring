import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { asset, SPRING_SOFT } from '../lib/site.js'
import { KIT } from '../content.js'
import {
  EaselArt,
  BrushesArt,
  PencilArt,
  EraserArt,
  SpritzerArt,
  TubesArt,
  PaletteArt,
} from './KitObjects.jsx'

/**
 * The kit stage — the portrait, and the desk unpacking around it. It IS the
 * "about me" portrait: the flat matted print sits at the centre and the tools
 * start stacked behind it, fanning outward as the section scrolls into view
 * and re-packing when you scroll back up.
 *
 * Everything is sized as a fraction of the stage itself (widths in %, fan
 * spread in fractions of the stage half-width), so the whole scene scales to
 * whatever column it's dropped into — a roomy visual column on desktop, a
 * full-width stack on a phone — rather than to the viewport. The stage width is
 * read via a ResizeObserver so rotation/resize re-lays the desk.
 *
 * Motion tiers, per the site ladder:
 *  - heavy-fx (roomy fine-pointer) devices: the fan is scroll-linked (useScroll
 *    drives every pose), so it plays forward as you scroll down and reverses —
 *    re-stacking behind the print — as you scroll back up, with a soft spring
 *    (pieces trail the thumb like wet pigment) and a residual per-piece parallax
 *    drift after they've landed.
 *  - touch / low-end devices: a cheaper one-shot reveal — the kit springs open
 *    from behind the print once, when the stage scrolls into view, then holds.
 *    Scroll-linking the fan on phones re-transformed six drop-shadowed layers on
 *    every scroll frame, and because `body` is itself a scroll container
 *    (overflow-x:hidden), those moving transforms kept resizing the page's
 *    scrollable area and feeding back into the scroll position — the whole page
 *    juddered. The one-shot open keeps the delight without touching scroll.
 *  - reduced motion: opacity-only reveal straight into the final layout.
 *
 * Each tool tries a real cut-out photograph first (assets/kit/<id>.webp + .png)
 * and falls back to the painted SVG stand-ins in KitObjects.jsx.
 */

// Final desk poses. `fx` is the signed fraction of the stage half-width the
// piece fans out to; `fy` is px from the stage's vertical anchor. `w` is the
// piece width as a fraction of the stage (so it scales with the column). `r0 →
// r` is the rotation journey, deliberately uneven piece to piece so the landing
// reads hand-placed, not radial. `depth` scales the residual parallax. Fan
// order follows array order, balanced around the central portrait.
const PIECES = [
  { id: 'brushes', fx: -0.78, fy: -150, r0: -4, r: -9, w: '30%', depth: 0.9 },
  { id: 'pencil', fx: 0.8, fy: -140, r0: 8, r: 18, w: '25%', depth: 0.7 },
  { id: 'spritzer', fx: -0.98, fy: 6, r0: -2, r: -7, w: '14%', depth: 1.3 },
  { id: 'tubes', fx: 0.98, fy: 20, r0: 3, r: 9, w: '26%', depth: 0.85 },
  { id: 'eraser', fx: -0.66, fy: 196, r0: -4, r: -12, w: '14%', depth: 1.2 },
  { id: 'palette', fx: 0.16, fy: 236, r0: 0, r: -3, w: '36%', depth: 0.5 },
]

const ART = {
  brushes: BrushesArt,
  pencil: PencilArt,
  eraser: EraserArt,
  spritzer: SpritzerArt,
  tubes: TubesArt,
  palette: PaletteArt,
}

// Per-piece fan window inside the scroll progress: staggered starts, long
// overlaps, so the kit opens as one gesture rather than a queue.
const windowFor = (i) => {
  const a = 0.04 + i * 0.07
  return [a, Math.min(a + 0.48, 1)]
}

export default function KitStage({ className = '' }) {
  const reduce = useReducedMotion()
  const heavy = useHeavyFx()
  // The scroll-linked fan is a heavy scroll-linked effect (six drop-shadowed
  // layers re-posed every scroll frame), so it gates on useHeavyFx like the
  // rest of the ladder. Running it on touch/low-end devices drove the whole
  // page into a scroll oscillation (see the tier note above), so those fall
  // back to the one-shot spring reveal below.
  const scrollLinked = heavy && !reduce

  const stageRef = useRef(null)

  // Stage half-width drives the horizontal fan, so the fan breathes with the
  // column it lives in. Read via a ResizeObserver so rotation/resize re-lays it.
  const [halfW, setHalfW] = useState(240)
  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      // -24: keep a soft margin so the outermost pieces stay on the sheet.
      setHalfW(Math.max(entry.contentRect.width / 2 - 24, 40))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The fan itself: runs from the stage entering low in the viewport to it
  // reaching centre stage. On heavy fx a soft spring lets pieces trail the
  // thumb organically; lighter devices ride the raw scroll (still reversible).
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start 0.92', 'center 0.5'],
  })
  const springed = useSpring(scrollYProgress, { stiffness: 55, damping: 17 })
  const fan = heavy ? springed : scrollYProgress

  // Residual drift across the whole section for depth once pieces have
  // landed — each piece rides it by its own `depth` (heavy fx only).
  const { scrollYProgress: through } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  })
  const drift = useTransform(through, [0, 1], [12, -12])

  // The print rises and settles on the leading edge of the same scroll, so it
  // eases back out as you scroll up with the rest of the desk.
  const easelOpacity = useTransform(fan, [0, 0.1], [0, 1])
  const easelY = useTransform(fan, [0, 0.2], [26, 0])

  return (
    <div
      ref={stageRef}
      className={`relative mx-auto h-[clamp(30rem,84vw,40rem)] w-full ${className}`}
      role="group"
      aria-label="Chris's portrait, with the tools of the kit laid out around it"
    >
      {/* Portrait centrepiece — the flat print, rising in on scroll. */}
      <div className="absolute left-1/2 top-[46%] z-10 w-[52%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          {...(scrollLinked
            ? { style: { opacity: easelOpacity, y: easelY } }
            : {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true, margin: '-60px' },
                transition: { duration: 0.4 },
              })}
        >
          <EaselArt className="w-full" />
        </motion.div>
      </div>

      {PIECES.map((piece, i) => {
        const item = KIT.items.find((it) => it.id === piece.id)
        return (
          <KitPiece
            key={piece.id}
            piece={piece}
            item={item}
            order={i}
            fan={fan}
            drift={drift}
            halfW={halfW}
            scrollLinked={scrollLinked}
            driftScale={heavy ? 1 : 0}
            reduce={reduce}
          />
        )
      })}
    </div>
  )
}

/** One object in the fan: the travel from stacked-behind-the-print to its
 *  final desk pose, plus a small hover lift so it feels pick-up-able. */
function KitPiece({ piece, item, order, fan, drift, halfW, scrollLinked, driftScale, reduce }) {
  const [a, b] = windowFor(order)
  const t = useTransform(fan, [a, b], [0, 1])

  const fx = piece.fx * halfW

  // Scroll-linked pose. The x/y path bows very slightly (y arrives on a
  // later ramp than x) so pieces sweep outward in an arc, not on rails.
  const x = useTransform(t, [0, 1], [0, fx])
  const y = useTransform([t, drift], ([v, d]) => piece.fy * Math.min(v * 1.08, 1) + d * piece.depth * driftScale)
  const rotate = useTransform(t, [0, 1], [piece.r0, piece.r])
  const scale = useTransform(t, [0, 1], [0.84, 1])
  const opacity = useTransform(t, [0, 0.22], [0, 1])
  const caption = useTransform(t, [0.78, 1], [0, 1])

  // Reduced motion lands in the final layout with an opacity-only reveal.
  return (
    <div
      className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
      style={{ width: piece.w }}
    >
      <motion.div
        {...(scrollLinked
          ? { style: { x, y, rotate, scale, opacity } }
          : {
              // One-shot open from behind the print. Reduced motion drops the
              // travel and just resolves in place (opacity only); everyone else
              // gets a soft, staggered spring so the kit still fans as one
              // gesture — but once, on reveal, never tied to the scrollbar.
              initial: reduce
                ? { opacity: 0 }
                : { opacity: 0, x: 0, y: 0, rotate: piece.r0, scale: 0.84 },
              whileInView: { opacity: 1, x: fx, y: piece.fy, rotate: piece.r, scale: 1 },
              viewport: { once: true, margin: '-40px' },
              transition: reduce ? { duration: 0 } : { ...SPRING_SOFT, delay: order * 0.06 },
            })}
      >
        <motion.div
          whileHover={reduce ? undefined : { y: -7, scale: 1.04, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="cursor-default"
        >
          <KitObject piece={piece} item={item} />
        </motion.div>
        <motion.p
          {...(scrollLinked ? { style: { opacity: caption } } : {})}
          className="mt-1.5 text-center font-mono text-[0.72rem] leading-tight text-ink-soft"
          title={item?.note}
        >
          {item?.name}
        </motion.p>
      </motion.div>
    </div>
  )
}

/**
 * The tool artwork itself. Tries the real cut-out photo slot first
 * (assets/kit/<id>.webp + .png, transparent background, natural shadow
 * kept in the cut-out); a 404 falls back silently to the painted SVG.
 */
function KitObject({ piece, item }) {
  const [photoOk, setPhotoOk] = useState(true)
  const label = item ? `${item.name}. ${item.note}` : piece.id

  const Art = ART[piece.id]
  if (photoOk) {
    return (
      <span role="img" aria-label={label} className="block">
        <picture>
          <source srcSet={asset(`assets/kit/${piece.id}.webp`)} type="image/webp" />
          <img
            src={asset(`assets/kit/${piece.id}.png`)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setPhotoOk(false)}
            className="block w-full"
            style={{ filter: 'drop-shadow(0 10px 18px rgba(126,40,72,0.22))' }}
          />
        </picture>
      </span>
    )
  }
  return (
    <span role="img" aria-label={label} className="block">
      <Art className="block w-full" />
    </span>
  )
}
