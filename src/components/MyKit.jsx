import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, asset } from '../lib/site.js'
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
 * "What's in my kit" — the desk, unpacked. The tools start stacked behind the
 * easel and fan outward as the section scrolls into view, like a toolkit
 * being opened, settling into a curated desk layout.
 *
 * Layout maths: every piece is anchored to the stage centre and travels to
 * its final pose on two axes measured differently on purpose — x as a
 * fraction of the stage's half-width (so the fan breathes with the viewport
 * and never walks off a phone screen), y in fixed px (vertical room is free).
 *
 * Motion tiers, per the site ladder:
 *  - heavy fx: the fan is scroll-linked (useScroll + a soft spring, so pieces
 *    trail the thumb like wet pigment) with a residual per-piece parallax
 *    drift after they've landed.
 *  - lite (touch / low-end): a one-shot staggered whileInView fan on the
 *    shared SPRING — same destinations, no scroll link.
 *  - reduced motion: opacity-only reveal straight into the final layout.
 *
 * Each object tries a real cut-out photograph first (assets/kit/<id>.webp +
 * .png — drop files in and they take over) and falls back to the painted
 * SVG stand-ins in KitObjects.jsx. The portrait is always the real photo.
 */

// Final desk poses. `fx` is the signed fraction of the stage half-width the
// piece fans out to; `fy` is px from the stage's vertical anchor. `r0 → r` is
// the rotation journey, deliberately uneven piece to piece so the landing
// reads hand-placed, not radial. `depth` scales the residual parallax.
// Fan order follows array order (top row first, palette landing last).
const PIECES = [
  { id: 'portrait', fx: -0.74, fy: -150, r0: -3, r: -7, w: 'clamp(88px,12vw,150px)', depth: 1.15 },
  { id: 'brushes', fx: 0.68, fy: -140, r0: 4, r: 9, w: 'clamp(104px,14vw,180px)', depth: 0.8 },
  { id: 'spritzer', fx: -0.92, fy: 18, r0: -2, r: -6, w: 'clamp(56px,7.5vw,96px)', depth: 1.3 },
  { id: 'pencil', fx: 0.9, fy: 25, r0: 8, r: 21, w: 'clamp(92px,12vw,150px)', depth: 0.6 },
  { id: 'tubes', fx: -0.64, fy: 158, r0: 2, r: 7, w: 'clamp(96px,13vw,155px)', depth: 0.9 },
  { id: 'eraser', fx: 0.7, fy: 168, r0: -4, r: -12, w: 'clamp(56px,7.5vw,92px)', depth: 1.2 },
  { id: 'palette', fx: 0.1, fy: 235, r0: 0, r: -3, w: 'clamp(132px,18vw,235px)', depth: 0.5 },
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
  const scrollLinked = heavy && !reduce
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
  // reaching centre stage. Spring-smoothed so pieces trail organically.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start 0.92', 'center 0.5'],
  })
  const fan = useSpring(scrollYProgress, { stiffness: 55, damping: 17 })

  // Residual drift across the whole section for depth once pieces have
  // landed — each piece rides it by its own `depth`.
  const { scrollYProgress: through } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  })
  const drift = useTransform(through, [0, 1], [16, -16])

  // Vertical spread compresses a touch on phones, where the fan is narrower
  // and the pieces smaller.
  const fyScale = wide ? 1 : 0.82

  return (
    <section id="kit" className="relative w-full px-[5vw] pt-[clamp(3rem,6vw,5rem)] pb-[clamp(3rem,5vw,4rem)]">
      <div className="max-w-xl">
        <Label gradient={['#EFEFA0', '#B0AC42']}>{KIT.label}</Label>
        <SplitText
          as="h2"
          unit="char"
          lines={KIT.title}
          emphasis={KIT.emphasis}
          emphasisItalic
          inkBleed
          className="display-lg mt-5 text-ink"
        />
        <p className="mt-6 leading-relaxed text-ink-soft">{KIT.lede}</p>
        <p className="mt-3 font-mono text-sm text-ink-soft/80">{KIT.hint}</p>
      </div>

      {/* The desk. Everything inside is anchored to the stage centre; the
          easel holds the middle and the pieces fan out around it. */}
      <div
        ref={stageRef}
        className="relative mx-auto h-[clamp(34rem,62vw,40rem)] w-full"
        role="group"
        aria-label="The tools in my kit, laid out around the easel"
      >
        {/* Easel centrepiece — always visible, simple settle-in. */}
        <div className="absolute left-1/2 top-[47%] z-10 w-[clamp(160px,22vw,250px)] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={SPRING}
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
function KitPiece({ piece, item, order, fan, drift, halfW, fyScale, scrollLinked, reduce }) {
  const [a, b] = windowFor(order)
  const t = useTransform(fan, [a, b], [0, 1])

  const fx = piece.fx * halfW
  const fy = piece.fy * fyScale

  // Scroll-linked pose. The x/y path bows very slightly (y arrives on a
  // later ramp than x) so pieces sweep outward in an arc, not on rails.
  const x = useTransform(t, [0, 1], [0, fx])
  const y = useTransform([t, drift], ([v, d]) => fy * Math.min(v * 1.08, 1) + d * piece.depth)
  const rotate = useTransform(t, [0, 1], [piece.r0, piece.r])
  const scale = useTransform(t, [0, 1], [0.84, 1])
  const opacity = useTransform(t, [0, 0.22], [0, 1])
  const caption = useTransform(t, [0.78, 1], [0, 1])

  // Lite tiers land on the same fx/fy poses without the scroll link.
  const liteInitial = reduce
    ? { opacity: 0 }
    : { opacity: 0, x: 0, y: 0, rotate: piece.r0, scale: 0.84 }
  const liteInView = reduce
    ? { opacity: 1, x: fx, y: fy, rotate: piece.r }
    : { opacity: 1, x: fx, y: fy, rotate: piece.r, scale: 1 }

  return (
    <div
      className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2"
      style={{ width: piece.w }}
    >
      <motion.div
        {...(scrollLinked
          ? { style: { x, y, rotate, scale, opacity } }
          : {
              initial: liteInitial,
              whileInView: liteInView,
              viewport: { once: true, margin: '-40px' },
              transition: reduce ? { duration: 0 } : { ...SPRING, delay: 0.1 + order * 0.09 },
            })}
      >
        <motion.div
          whileHover={reduce ? undefined : { y: -7, scale: 1.04, rotate: 2 }}
          transition={SPRING}
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
 * The portrait is the one guaranteed photo — the real portrait in a small
 * taped instant-print frame.
 */
function KitObject({ piece, item }) {
  const [photoOk, setPhotoOk] = useState(true)
  const label = item ? `${item.name}. ${item.note}` : piece.id

  if (piece.id === 'portrait') {
    return (
      <figure
        className="relative rounded-[3px] bg-[#FFFDF7] p-[6%] pb-[16%] shadow-[0_10px_30px_-14px_rgba(78,38,57,0.5)]"
        aria-label={label}
      >
        {/* washi tape holding the print down */}
        <span
          aria-hidden="true"
          className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-3 rounded-[1px] bg-blush/60"
        />
        <picture>
          <source srcSet={asset('assets/portrait-christopher.webp')} type="image/webp" />
          <img
            src={asset('assets/portrait-christopher.jpg')}
            alt="Chris Wang, the painter, in a small instant-print frame"
            loading="lazy"
            decoding="async"
            className="aspect-[10/11] w-full rounded-[2px] object-cover"
          />
        </picture>
      </figure>
    )
  }

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
