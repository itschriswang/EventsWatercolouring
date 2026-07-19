import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { asset } from '../lib/site.js'
import BloomFilter from './WetBloom.jsx'

// Max slats rendered each side of the active piece before they've faded to
// nothing — keeps the loop seam (where index wraps) safely off-screen.
const RENDER_RANGE = 6

// Card `cardIndex`'s signed distance from the active position `pos`, wrapped
// into (-count/2, count/2] so stepping past either end of the wall is always
// a single short hop, not a long crawl back across every painting.
function relOf(cardIndex, pos, count) {
  let rel = (((cardIndex - pos) % count) + count) % count
  if (rel > count / 2) rel -= count
  return rel
}

// Horizontal offset (px) from centre for a signed distance `rel`. The first
// slot sits a half-active + gap + half-slat out; every slot after that adds a
// uniform slat pitch.
function xForRel(rel, sizing) {
  const ar = Math.abs(rel)
  const c1 = sizing.activeWidth / 2 + sizing.gap + sizing.restWidth / 2
  const pitch = sizing.restWidth + sizing.gap
  const mag = ar <= 1 ? ar * c1 : c1 + (ar - 1) * pitch
  return (rel < 0 ? -1 : 1) * mag
}

// 0 at centre (full active size) → 1 a full slot away (rest/slat size).
function blendForRel(rel) {
  return Math.min(Math.abs(rel), 1)
}

// The box a piece grows into as it nears centre, sized to *its own* real
// image aspect ratio (measured off the loaded <img>, not guessed from the
// `landscape` flag) so `object-fit: contain` never has to pad it with bars —
// the box just *is* the image's shape, clamped inside the height/max-width
// the tier allows. `ar` is null until the image reports its natural size, in
// which case this falls back to the tier's own default portrait box.
// Peripheral slats stay a uniform crop (see `objectFit` below), so this only
// matters once a piece is close enough to centre to be shown uncropped.
function activeBoxFor(ar, sizing) {
  if (!ar) return { width: sizing.activeWidth, height: sizing.activeHeight }
  const byHeight = sizing.activeHeight * ar
  if (byHeight <= sizing.maxActiveWidth) return { width: byHeight, height: sizing.activeHeight }
  return { width: sizing.maxActiveWidth, height: sizing.maxActiveWidth / ar }
}

const hideOnError = (e) => {
  e.currentTarget.style.display = 'none'
}

// One flat slat. Every visual property is derived from the shared `pos`
// motion value via useTransform, so the rAF driver moves cards without
// triggering a React re-render per frame — only the settle (a real
// navigation) ever re-renders.
function Card({ item, cardIndex, pos, count, R, sizing, radius, onSelect, dressed, filterId, active }) {
  const imgRef = useRef(null)
  const [aspect, setAspect] = useState(null)
  const readAspect = (el) => {
    if (el && el.naturalWidth && el.naturalHeight) setAspect(el.naturalWidth / el.naturalHeight)
  }
  // The grid tile above already fetched this same asset, so it's usually
  // already in the image cache and `complete` the instant this mounts —
  // covers that case (onLoad alone would miss it, since a cached image never
  // fires load again for a freshly mounted <img>).
  useEffect(() => {
    if (imgRef.current?.complete) readAspect(imgRef.current)
  }, [])

  const activeBox = activeBoxFor(aspect, sizing)
  const width = useTransform(pos, (p) => {
    const a = blendForRel(relOf(cardIndex, p, count))
    return activeBox.width + (sizing.restWidth - activeBox.width) * a
  })
  const height = useTransform(pos, (p) => {
    const a = blendForRel(relOf(cardIndex, p, count))
    return activeBox.height + (sizing.restHeight - activeBox.height) * a
  })
  // `left: 50%` anchors the card's own top-left corner to the stage centre,
  // so x/y here must also fold in the card's own half-size to land the
  // card's *centre* on that anchor — not just `translate(-50%,-50%)` on a
  // child, which would leave this div's real (hit-testable) box offset from
  // where the card is actually painted, breaking click-to-select on slats.
  // The spacing rhythm (xForRel) stays keyed to the uniform base `sizing`,
  // not this card's own (possibly wider, for landscape) box — otherwise a
  // landscape piece becoming active would reflow every other slot's position.
  const x = useTransform(pos, (p) => {
    const rel = relOf(cardIndex, p, count)
    const a = blendForRel(rel)
    const w = activeBox.width + (sizing.restWidth - activeBox.width) * a
    return xForRel(rel, sizing) - w / 2
  })
  const y = useTransform(pos, (p) => {
    const a = blendForRel(relOf(cardIndex, p, count))
    const h = activeBox.height + (sizing.restHeight - activeBox.height) * a
    return -h / 2
  })
  const opacity = useTransform(pos, (p) => {
    const ar = Math.abs(relOf(cardIndex, p, count))
    return ar <= R ? 1 : ar >= R + 1 ? 0 : 1 - (ar - R)
  })
  const zIndex = useTransform(pos, (p) => Math.round(1000 - Math.abs(relOf(cardIndex, p, count)) * 100))
  const borderRadius = useTransform(pos, (p) => {
    const a = blendForRel(relOf(cardIndex, p, count))
    const w = activeBox.width + (sizing.restWidth - activeBox.width) * a
    const h = activeBox.height + (sizing.restHeight - activeBox.height) * a
    return (Math.max(0, Math.min(20, radius)) / 20) * (Math.min(w, h) / 2)
  })
  // Lift shadows from the site's approved (no-grey) burgundy palette — the
  // centred piece gets the same strong wash the old single-image lightbox
  // used, and the slats grade with distance: the near neighbours keep a
  // tighter, richer shadow (a card held closer), the far ones soften and
  // fade back, so the row reads as a shuffled stack of prints at different
  // depths rather than one flat texture repeated.
  const boxShadow = useTransform(pos, (p) => {
    const ar = Math.abs(relOf(cardIndex, p, count))
    if (ar < 0.5)
      return '0 28px 60px -10px rgba(126,40,72,0.65), inset 0 0 0 1px rgba(255,252,242,0.08)'
    const t = Math.min((ar - 0.5) / 3.5, 1)
    const drop = (16 - 8 * t).toFixed(1)
    const soft = (42 - 20 * t).toFixed(1)
    const alpha = (0.36 - 0.2 * t).toFixed(3)
    return `0 ${drop}px ${soft}px -12px rgba(126,40,72,${alpha}), inset 0 0 0 1px rgba(255,252,242,0.05)`
  })
  // Card-stock thickness: a thin lighter-cream strip down the card's leading
  // edge — the side facing the centre, i.e. the edge a shuffled print shows
  // you — so each slat reads as physical stock with a visible paper edge.
  // The active card, faced straight on, shows a fainter sliver both sides.
  const leftEdge = useTransform(pos, (p) => {
    const rel = relOf(cardIndex, p, count)
    return Math.min(Math.max(rel, 0), 1) * 0.9 + Math.max(0, 0.5 - Math.abs(rel)) * 0.7
  })
  const rightEdge = useTransform(pos, (p) => {
    const rel = relOf(cardIndex, p, count)
    return Math.min(Math.max(-rel, 0), 1) * 0.9 + Math.max(0, 0.5 - Math.abs(rel)) * 0.7
  })
  // The active piece shows the whole painting (letterboxed if needed); the
  // slats either side are just navigational peeks, so they can crop to fill
  // their sliver cleanly.
  const objectFit = useTransform(pos, (p) => (Math.abs(relOf(cardIndex, p, count)) < 0.5 ? 'contain' : 'cover'))

  return (
    <motion.div
      onClick={() => onSelect(cardIndex)}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        x,
        y,
        width,
        height,
        zIndex,
        opacity,
        borderRadius,
        overflow: 'hidden',
        boxShadow,
        cursor: 'pointer',
      }}
      className="bg-paper-deep"
    >
      <picture className="block h-full w-full">
        <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
        <motion.img
          ref={imgRef}
          src={asset(`assets/${item.img}.jpg`)}
          // Only the centred piece carries a meaningful alt; the off-centre
          // slats are navigational peeks, so they go decorative (alt="") — a
          // screen reader in the open dialog otherwise hears the whole wall of
          // images at once. The focused piece is also named by the dialog's
          // aria-label and the figcaption, so nothing is lost.
          alt={active ? item.alt || item.ttl : ''}
          draggable={false}
          onError={hideOnError}
          onLoad={(e) => readAspect(e.currentTarget)}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: dressed ? `url(#${filterId})` : undefined,
          }}
        />
      </picture>
      {/* paper edges — over the image, under nothing; clipped by the card's
          own rounded overflow so they follow the corner radius */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[2.5px]"
        style={{
          opacity: leftEdge,
          background: 'linear-gradient(to right, rgba(255,252,242,0.95), rgba(255,252,242,0.1))',
        }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[2.5px]"
        style={{
          opacity: rightEdge,
          background: 'linear-gradient(to left, rgba(255,252,242,0.95), rgba(255,252,242,0.1))',
        }}
      />
    </motion.div>
  )
}

/**
 * CoverflowCarousel — a flat-slat "cover flow" gallery for the work lightbox.
 * The active painting sits centred at full size; every other piece is a thin
 * flat slat either side, ordered by wrapped distance from the active index so
 * stepping off either end of the wall is always a single short slide. `index`
 * is fully controlled by the parent (arrow buttons / ← → keys live in
 * Lightbox); clicking a slat calls `onSelect` to jump straight to it.
 */
export default function CoverflowCarousel({ items, index, onSelect, sizing, radius, dressed, reduce }) {
  const count = Math.max(1, items.length)
  const R = Math.max(1, Math.min(RENDER_RANGE, Math.floor(count / 2) - 1))
  const filterId = useId()

  // Single rAF-driven position. Card size tracks the same value as position,
  // so a slat grows as it slides toward centre and shrinks as it slides away
  // — growth and travel stay perfectly in sync with one source of truth.
  const pos = useMotionValue(index)
  const targetRef = useRef(index)
  const rafRef = useRef(null)
  const lastTRef = useRef(null)
  const moveDur = 0.5 // seconds per slot

  const tick = useCallback(
    (t) => {
      const last = lastTRef.current ?? t
      const dt = Math.min((t - last) / 1000, 1 / 30)
      lastTRef.current = t

      const cur = pos.get()
      const diff = targetRef.current - cur
      const step = (1 / moveDur) * dt
      const arriving = reduce || Math.abs(diff) <= step

      if (arriving) {
        pos.set(targetRef.current)
        rafRef.current = null
        lastTRef.current = null
        return
      }
      pos.set(cur + Math.sign(diff) * step)
      rafRef.current = requestAnimationFrame(tick)
    },
    [pos, reduce],
  )

  const ensureRunning = useCallback(() => {
    if (rafRef.current == null) {
      lastTRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick])

  // Sync the driver to the controlled `index` prop. First run snaps straight
  // there (the piece that was just opened shouldn't slide in from slot 0);
  // afterwards it chases the shortest wrapped path, so crossing the last↔
  // first seam slides forward instead of crawling back across the wall.
  const initializedRef = useRef(false)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      pos.set(index)
      targetRef.current = index
      return
    }
    const cur = targetRef.current
    let d = index - cur
    d = ((d % count) + count) % count
    if (d > count / 2) d -= count
    targetRef.current = cur + d
    ensureRunning()
  }, [index, count, ensureRunning, pos])

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  return (
    <div
      className="relative overflow-hidden"
      // `100vw`, not a percentage: this stage's only children are absolutely
      // positioned slats, so it has no in-flow content to size a `width:
      // 100%` against inside the lightbox's flex column — it would collapse
      // to ~0 and clip everything outside the active card. The caller (see
      // Lightbox) mounts this stage in a `position: fixed` wrapper specifically
      // so `100vw` here means the true browser width, edge to edge.
      style={{ height: sizing.activeHeight, width: '100vw' }}
    >
      {dressed && <BloomFilter id={filterId} />}
      <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
        {items.map((item, i) => (
          <Card
            key={item._idx}
            item={item}
            cardIndex={i}
            pos={pos}
            count={count}
            R={R}
            sizing={sizing}
            radius={radius}
            onSelect={onSelect}
            dressed={dressed}
            filterId={filterId}
            active={i === index}
          />
        ))}
      </div>
    </div>
  )
}

// Two size tiers — coverflow math needs real pixel numbers (for the slat
// offsets), so it steps rather than fluidly scaling like the rest of the
// site's clamp()-driven type.
// `maxActiveWidth` caps how wide a piece's box can grow for a very wide
// aspect ratio — loose enough to read as landscape, tight enough that it
// never crowds out every slat even at the narrow edge of its tier's viewport
// range (the `wide` tier starts at a 640px viewport).
export const COVERFLOW_SIZING = {
  wide: { activeWidth: 326, activeHeight: 449, restWidth: 173, restHeight: 238, gap: 17, maxActiveWidth: 520 },
  narrow: { activeWidth: 196, activeHeight: 270, restWidth: 104, restHeight: 143, gap: 10, maxActiveWidth: 260 },
}
export const COVERFLOW_RADIUS = 4
