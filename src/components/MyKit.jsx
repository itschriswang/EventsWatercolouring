import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { asset } from '../lib/site.js'
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
 * The closing beat of "about me": the desk, unpacked. It carries no heading of
 * its own — it reads as a continuation of the painter section above it. The
 * easel holds the portrait (that's me, on the board), and the tools start
 * stacked behind it and fan outward as the section scrolls into view, like a
 * kit being opened. Scroll back up and it all re-packs behind the easel.
 *
 * Layout maths: every piece is anchored to the stage centre and travels to
 * its final pose on two axes measured differently on purpose — x as a
 * fraction of the stage's half-width (so the fan breathes with the viewport
 * and never walks off a phone screen), y in fixed px (vertical room is free).
 *
 * Motion tiers, per the site ladder:
 *  - any motion-OK device: the fan is scroll-linked (useScroll drives every
 *    pose), so it plays forward as you scroll down and reverses — re-stacking
 *    behind the easel — as you scroll back up. Heavy-fx devices additionally
 *    get a soft spring (pieces trail the thumb like wet pigment) and a residual
 *    per-piece parallax drift after they've landed.
 *  - reduced motion: opacity-only reveal straight into the final layout.
 *
 * Each object tries a real cut-out photograph first (assets/kit/<id>.webp +
 * .png — drop files in and they take over) and falls back to the painted
 * SVG stand-ins in KitObjects.jsx. The portrait on the easel is the real photo.
 */

// Final desk poses. `fx` is the signed fraction of the stage half-width the
// piece fans out to; `fy` is px from the stage's vertical anchor. `r0 → r` is
// the rotation journey, deliberately uneven piece to piece so the landing
// reads hand-placed, not radial. `depth` scales the residual parallax.
// Fan order follows array order (top row first, palette landing last), balanced
// around the larger central easel now that the portrait lives on the board.
const PIECES = [
  { id: 'brushes', fx: -0.7, fy: -172, r0: -4, r: -9, w: 'clamp(104px,14vw,180px)', depth: 0.9 },
  { id: 'pencil', fx: 0.72, fy: -162, r0: 8, r: 18, w: 'clamp(92px,12vw,150px)', depth: 0.7 },
  { id: 'spritzer', fx: -0.95, fy: 24, r0: -2, r: -7, w: 'clamp(56px,7.5vw,96px)', depth: 1.3 },
  { id: 'tubes', fx: 0.94, fy: 36, r0: 3, r: 9, w: 'clamp(96px,13vw,155px)', depth: 0.85 },
  { id: 'eraser', fx: -0.6, fy: 182, r0: -4, r: -12, w: 'clamp(56px,7.5vw,92px)', depth: 1.2 },
  { id: 'palette', fx: 0.16, fy: 244, r0: 0, r: -3, w: 'clamp(132px,18vw,235px)', depth: 0.5 },
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

export default function MyKit() {
  const reduce = useReducedMotion()
  const heavy = useHeavyFx()
  // Scroll-links (and so reverses) on every motion-OK device; heavy fx adds the
  // spring lag and residual drift on top.
  const scrollLinked = !reduce
  const wide = useMediaQuery('(min-width: 640px)')

  const stageRef = useRef(null)

  // Stage half-width drives the horizontal fan (capped so an ultrawide
  // desktop doesn't fling the tools into the gutters). Read via a
  // ResizeObserver so rotation/resize re-lays the desk.
  const [halfW, setHalfW] = useState(480)
  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      // -40: keep a soft margin so the outermost pieces stay on the sheet.
      setHalfW(Math.min(entry.contentRect.width / 2 - 40, 540))
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
  const drift = useTransform(through, [0, 1], [16, -16])

  // The easel rises and settles on the leading edge of the same scroll, so it
  // eases back out as you scroll up with the rest of the desk.
  const easelOpacity = useTransform(fan, [0, 0.1], [0, 1])
  const easelY = useTransform(fan, [0, 0.2], [26, 0])

  // Vertical spread compresses a touch on phones, where the fan is narrower
  // and the pieces smaller.
  const fyScale = wide ? 1 : 0.82

  return (
    <section id="kit" className="relative w-full px-[5vw] pt-[clamp(0.5rem,2vw,1.5rem)] pb-[clamp(3rem,5vw,4rem)]">
      {/* The desk. Everything inside is anchored to the stage centre; the
          easel holds the middle and the pieces fan out around it. */}
      <div
        ref={stageRef}
        className="relative mx-auto h-[clamp(34rem,64vw,42rem)] w-full"
        role="group"
        aria-label="The tools in my kit, laid out around the easel that holds my portrait"
      >
        {/* Easel centrepiece — holds the portrait, rises in on scroll. */}
        <div className="absolute left-1/2 top-[46%] z-10 w-[clamp(200px,28vw,330px)] -translate-x-1/2 -translate-y-1/2">
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
              fyScale={fyScale}
              scrollLinked={scrollLinked}
              driftScale={heavy ? 1 : 0}
              reduce={reduce}
            />
          )
        })}
      </div>
    </section>
  )
}

/** One object in the fan: the travel from stacked-behind-the-easel to its
 *  final desk pose, plus a small hover lift so it feels pick-up-able. */
function KitPiece({ piece, item, order, fan, drift, halfW, fyScale, scrollLinked, driftScale, reduce }) {
  const [a, b] = windowFor(order)
  const t = useTransform(fan, [a, b], [0, 1])

  const fx = piece.fx * halfW
  const fy = piece.fy * fyScale

  // Scroll-linked pose. The x/y path bows very slightly (y arrives on a
  // later ramp than x) so pieces sweep outward in an arc, not on rails.
  const x = useTransform(t, [0, 1], [0, fx])
  const y = useTransform([t, drift], ([v, d]) => fy * Math.min(v * 1.08, 1) + d * piece.depth * driftScale)
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
              initial: { opacity: 0 },
              whileInView: { opacity: 1, x: fx, y: fy, rotate: piece.r },
              viewport: { once: true, margin: '-40px' },
              transition: { duration: 0 },
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
          className="mt-1.5 text-center font-mono text-[0.8rem] leading-tight text-ink-soft"
          title={item?.note}
        >
          {item?.name}
        </motion.p>
      </motion.div>
    </div>
  )
}

/**
 * The object artwork itself. Tries the real cut-out photo slot first
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
