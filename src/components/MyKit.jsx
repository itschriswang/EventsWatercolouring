import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
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
 * The kit stage — the portrait, and the desk unpacking around it. It IS the
 * "about me" portrait: the flat matted print sits at the centre and the tools
 * start stacked behind it, then move on scroll in two linked phases:
 *
 *  1. FAN — as the stage climbs to the middle of the viewport (the portrait
 *     "halfway up the page"), the tools fan out from behind the print into
 *     their desk poses.
 *  2. ORBIT — keep scrolling and the whole fanned constellation revolves
 *     around the portrait, each tool turning with it and drawing a touch
 *     inward, so they wheel around the print like hands on a clock.
 *
 * Both phases are scroll-linked and reversible on every device (scroll back up
 * and the ring un-turns, then re-stacks behind the print). Only genuine
 * reduced-motion visitors fall back to an opacity-only reveal into the settled
 * fan.
 *
 * Everything is sized as a fraction of the stage itself (widths in %, fan
 * spread in fractions of the stage half-width), so the whole scene scales to
 * whatever column it's dropped into — a roomy visual column on desktop, a
 * full-width stack on a phone — rather than to the viewport. The stage width is
 * read via a ResizeObserver so rotation/resize re-lays the desk.
 *
 * Why scroll-linking is now safe on phones: the earlier build kept phones on a
 * one-shot reveal because scroll-linking six drop-shadowed layers let their
 * downward transforms grow the page's scrollable height every frame, and since
 * `body` is a scroll container that fed back into the scroll position and the
 * whole page juddered. Two things fix that here: the stage clips its VERTICAL
 * overflow (`overflowY: 'clip'`, horizontal left visible so the wide tools
 * still spill past the column edge), so no child transform can enlarge the
 * page's scroll height; and the stage reserves enough height to enclose the
 * settled fan, so nothing is actually cut. The orbit only ever draws pieces
 * inward (never past their fanned reach), so the enclosed envelope never grows.
 *
 * Motion tiers, per the site ladder:
 *  - reduced motion: opacity-only reveal straight into the final fan layout.
 *  - everyone else: the scroll-linked fan + orbit, softened by a spring so the
 *    pieces trail the thumb like wet pigment.
 *  - heavy-fx (roomy fine-pointer) devices additionally get a residual
 *    per-piece parallax drift once they've landed, for depth.
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

// The orbit phase. The constellation revolves counter-clockwise around the
// portrait by ORBIT_SWEEP_DEG — a good arc, so the travel reads clearly — while
// each piece only turns a hair on its own axis (ORBIT_SELF_DEG): the tools stay
// upright as they're carried around, rather than tumbling. They also draw
// ORBIT_PULL inward toward the portrait as they turn, so the ring tucks close
// and the outer pieces stay on the sheet (see the enclosure note above).
const ORBIT_SWEEP_DEG = -52
const ORBIT_SWEEP_RAD = (ORBIT_SWEEP_DEG * Math.PI) / 180
const ORBIT_SELF_DEG = -7
const ORBIT_PULL = 0.24

// The 2.5D "diorama". The flat cut-outs aren't given real geometry — instead the
// whole scene is a CSS perspective space: each tool rests at its own depth (so
// it parallaxes), turns a little on the yaw/pitch as it revolves (a shallow
// turntable — enough to read as a solid object catching the light, never so far
// that the flat art shows its paper-thin edge), and the entire scene leans to
// follow the cursor on desktop. Kept deliberately shallow so nothing breaks the
// vertical clip or the flat watercolour voice.
const PERSPECTIVE = '900px'
const DEPTH_Z = 54 // px of resting translateZ per unit of (piece.depth − 0.9)
const LIFT_Z = 30 // px the ring floats toward the viewer as it turns
const TURN_Y_DEG = 18 // per-piece yaw across the orbit
const TURN_X_DEG = 9 // per-piece pitch across the orbit
const TILT_X_DEG = 7 // cursor lean, pitch (heavy-fx only)
const TILT_Y_DEG = 10 // cursor lean, yaw (heavy-fx only)

const ART = {
  brushes: BrushesArt,
  pencil: PencilArt,
  eraser: EraserArt,
  spritzer: SpritzerArt,
  tubes: TubesArt,
  palette: PaletteArt,
}

// Per-piece fan window inside the fan phase progress: staggered starts, long
// overlaps, so the kit opens as one gesture rather than a queue.
const windowFor = (i) => {
  const a = 0.04 + i * 0.07
  return [a, Math.min(a + 0.48, 1)]
}

export default function KitStage({ className = '' }) {
  const reduce = useReducedMotion()
  const heavy = useHeavyFx()
  // The fan + orbit is scroll-linked for everyone but reduced-motion visitors.
  // (Phones used to be excluded to dodge a scroll-judder feedback loop; the
  // stage's vertical overflow clip below removes that loop — see the file note.)
  const scrollLinked = !reduce

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

  // Phase 1, the fan: runs from the stage entering low in the viewport to the
  // portrait reaching the middle of the page. A soft spring lets pieces trail
  // the thumb organically as they open (and re-stack, scrolling back up).
  const { scrollYProgress: fanRaw } = useScroll({
    target: stageRef,
    offset: ['start 0.92', 'center 0.55'],
  })
  // Phase 2, the orbit: picks up where the fan lands (portrait around centre)
  // and runs as you keep scrolling it up and out, wheeling the ring around.
  const { scrollYProgress: orbitRaw } = useScroll({
    target: stageRef,
    offset: ['center 0.55', 'end 0.2'],
  })
  const fan = useSpring(fanRaw, { stiffness: 55, damping: 17 })
  const orbit = useSpring(orbitRaw, { stiffness: 60, damping: 20 })

  // Residual drift across the whole section for depth once pieces have
  // landed — each piece rides it by its own `depth` (heavy fx only).
  const { scrollYProgress: through } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  })
  const drift = useTransform(through, [0, 1], [12, -12])

  // The print rises and settles on the leading edge of the fan, so it eases
  // back out as you scroll up with the rest of the desk.
  const easelOpacity = useTransform(fan, [0, 0.1], [0, 1])
  const easelY = useTransform(fan, [0, 0.2], [26, 0])

  // Cursor lean for the diorama — the whole scene tips toward the pointer, and
  // the depth-staggered tools parallax against each other. Fine-pointer devices
  // only (there's no hovering cursor on a phone); reduced motion keeps it flat.
  const tiltActive = heavy && !reduce
  const tiltXRaw = useMotionValue(0)
  const tiltYRaw = useMotionValue(0)
  const tiltX = useSpring(tiltXRaw, { stiffness: 120, damping: 20 })
  const tiltY = useSpring(tiltYRaw, { stiffness: 120, damping: 20 })
  const onPointerMove = (e) => {
    if (!tiltActive) return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5 // −0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    tiltYRaw.set(px * TILT_Y_DEG * 2) // pointer right → scene yaws right
    tiltXRaw.set(-py * TILT_X_DEG * 2) // pointer down → scene pitches down
  }
  const onPointerLeave = () => {
    tiltXRaw.set(0)
    tiltYRaw.set(0)
  }

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      // h clamp: tall enough to enclose the settled fan (palette sits near the
      // bottom) so the vertical clip never cuts real content, only guards the
      // page's scroll height. overflowY:clip breaks the phone scroll-judder
      // loop; overflowX stays visible so the wide tools (tubes, spritzer) can
      // still spill past the column edge as designed. `perspective` makes this
      // the vanishing point for the 2.5D scene (a clip boundary is fine for
      // perspective — only preserve-3d, on the inner scene, would be flattened).
      style={{
        overflowX: 'visible',
        overflowY: 'clip',
        perspective: scrollLinked ? PERSPECTIVE : undefined,
      }}
      className={`relative mx-auto h-[clamp(34rem,88vw,40rem)] w-full ${className}`}
      role="group"
      aria-label="Chris's portrait, with the tools of the kit laid out around it"
    >
      {/* The 3D scene: holds the print + tools in one preserve-3d space so they
          share the perspective and tip together under the cursor lean. Living
          inside the clipped stage, its rendered depth is flattened and clipped
          on the way out — 3D look and scroll-safety both kept. */}
      <motion.div
        className="absolute inset-0"
        style={
          scrollLinked
            ? { transformStyle: 'preserve-3d', rotateX: tiltX, rotateY: tiltY }
            : undefined
        }
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
              orbit={orbit}
              drift={drift}
              halfW={halfW}
              scrollLinked={scrollLinked}
              driftScale={heavy ? 1 : 0}
              heavy={heavy}
              reduce={reduce}
            />
          )
        })}
      </motion.div>
    </div>
  )
}

/** One object in the fan: the travel from stacked-behind-the-print to its
 *  fanned desk pose, then its revolution around the portrait, plus a small
 *  hover lift so it feels pick-up-able. No label — the motion carries it. */
function KitPiece({ piece, item, order, fan, orbit, drift, halfW, scrollLinked, driftScale, heavy, reduce }) {
  const [a, b] = windowFor(order)
  const t = useTransform(fan, [a, b], [0, 1])

  const fx = piece.fx * halfW

  // The fanned vector (portrait centre → piece), unrolled over the fan phase.
  // The y arrives on a later ramp than x (`* 1.08`, clamped) so pieces sweep
  // outward in an arc, not on rails.
  const baseX = (tv) => fx * tv
  const baseY = (tv) => piece.fy * Math.min(tv * 1.08, 1)

  // Phase 2 rotates that fanned vector around the portrait and reels it inward.
  // At orbit 0 (still fanning) this is identity, so the two phases meet cleanly.
  const x = useTransform([t, orbit], ([tv, ov]) => {
    const ang = ov * ORBIT_SWEEP_RAD
    const rad = 1 - ov * ORBIT_PULL
    return (baseX(tv) * Math.cos(ang) - baseY(tv) * Math.sin(ang)) * rad
  })
  const y = useTransform([t, orbit, drift], ([tv, ov, d]) => {
    const ang = ov * ORBIT_SWEEP_RAD
    const rad = 1 - ov * ORBIT_PULL
    return (baseX(tv) * Math.sin(ang) + baseY(tv) * Math.cos(ang)) * rad + d * piece.depth * driftScale
  })
  // The piece keeps its hand-placed fan rotation and only turns a hair on its
  // own axis as it revolves — it's carried around the portrait, not tumbling.
  const rotate = useTransform([t, orbit], ([tv, ov]) =>
    piece.r0 + (piece.r - piece.r0) * tv + ov * ORBIT_SELF_DEG,
  )
  const scale = useTransform(t, [0, 1], [0.84, 1])
  const opacity = useTransform(t, [0, 0.22], [0, 1])

  // 2.5D depth. Each tool rests at its own Z (from its `depth`, the same field
  // that scales its parallax), so the cursor lean parallaxes them apart. As the
  // ring revolves it floats forward (LIFT_Z) and each tool turns a little on the
  // yaw/pitch — left/right pieces yaw opposite ways, top/bottom pitch opposite
  // ways, so the constellation reads as a shallow dish wheeling in space.
  const restZ = (piece.depth - 0.9) * DEPTH_Z
  const z = useTransform(orbit, [0, 1], [restZ, restZ + LIFT_Z])
  const rotateY = useTransform(orbit, [0, 1], [0, TURN_Y_DEG * Math.sign(piece.fx || 1)])
  const rotateX = useTransform(orbit, [0, 1], [0, -TURN_X_DEG * Math.sign(piece.fy || 1)])

  return (
    <div
      className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
      style={{ width: piece.w }}
    >
      <motion.div
        {...(scrollLinked
          ? {
              style: { x, y, z, rotate, rotateX, rotateY, scale, opacity },
              className: '[transform-style:preserve-3d]',
            }
          : {
              // Reduced motion: no travel, no orbit, no depth — resolve in the
              // settled fan pose with an opacity reveal only.
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              viewport: { once: true, margin: '-40px' },
              transition: { duration: 0.01 },
              style: { x: fx, y: piece.fy, rotate: piece.r, scale: 1 },
            })}
      >
        <motion.div
          whileHover={reduce ? undefined : { y: -7, z: heavy ? 44 : 0, scale: 1.04, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="cursor-default [transform-style:preserve-3d]"
        >
          <KitObject piece={piece} item={item} />
        </motion.div>
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
