import { useEffect, useId, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { asset, artSrcset } from '../lib/site.js'
import { hideOnError } from '../lib/imageRetry.js'
import BloomFilter from './WetBloom.jsx'

// Slide physics for the coverflow position. A spring (not the old constant-
// velocity linear chase) so the slat travel eases in and out and stays
// interruptible: tapping through pieces quickly retargets mid-flight and
// carries velocity across, instead of restarting an abrupt linear crawl.
// Critically damped (damping ratio ≈ 1.05, no overshoot) so a painting never
// springs past centre; a touch softer than the shared SPRING for a longer
// gliding travel. Reduced-motion snaps instantly (see below), bypassing it.
const COVERFLOW_SPRING = { stiffness: 90, damping: 20, restDelta: 0.0005 }

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
// the sizing allows. `ar` is null until the image reports its natural size,
// in which case a 3:4 portrait (the wall's default shape) stands in so the
// placeholder box already has a painting's proportions.
// Peripheral slats stay a uniform crop (see `objectFit` below), so this only
// matters once a piece is close enough to centre to be shown uncropped.
function activeBoxFor(ar, sizing) {
  const ratio = ar || 3 / 4
  const byHeight = sizing.activeHeight * ratio
  if (byHeight <= sizing.maxActiveWidth) return { width: byHeight, height: sizing.activeHeight }
  return { width: sizing.maxActiveWidth, height: sizing.maxActiveWidth / ratio }
}

// Image error recovery comes from lib/imageRetry.js — the naive permanent
// display:none this file used to carry was exactly the iOS transient-decode
// bug SelectedWork's retrying handler documents fixing.

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
      // The slats are real controls, not just pointer targets: button
      // semantics + Enter/Space so keyboard and AT users can jump to a piece
      // the same way a tap does. The centred card is the current piece —
      // selecting it is a no-op — so it drops out of the tab order and
      // reads as the dialog's image instead of a button. Focus ring is an
      // outline (not a ring shadow) because boxShadow here is animated.
      role={active ? undefined : 'button'}
      tabIndex={active ? -1 : 0}
      aria-label={active ? undefined : `View ${item.ttl}`}
      onKeyDown={(e) => {
        if (active) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(cardIndex)
        }
      }}
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
      className="bg-paper-deep outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
    >
      <picture className="block h-full w-full">
        {/* sizes tracks the card's role, not one shared number: the centred
            piece declares the widest box the current viewport lets it grow
            into, so the enlargement actually gets enlargement-grade pixels,
            while the slats declare only their sliver — one shared active-size
            `sizes` would make every off-centre slat fetch the near-master
            variant the active piece needs. A slat promoted to active
            re-renders with the bigger declaration and the browser swaps the
            sharper file in over the cached small one; it never downgrades. */}
        <source
          srcSet={artSrcset(item.img)}
          sizes={active ? `${sizing.maxActiveWidth}px` : `${sizing.restWidth}px`}
          type="image/webp"
        />
        <motion.img
          ref={imgRef}
          src={asset(`assets/${item.img}.jpg`)}
          // Only the centred piece carries a meaningful alt; the off-centre
          // slats are navigational peeks, so they go decorative (alt="") — a
          // screen reader in the open dialog otherwise hears the whole wall of
          // images at once. The focused piece is also named by the dialog's
          // aria-label and the figcaption, so nothing is lost.
          alt={active ? item.alt || item.ttl : ''}
          decoding="async"
          loading={active ? 'eager' : 'lazy'}
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
export default function CoverflowCarousel({ items, index, onSelect, onNavigate, sizing, radius, dressed, reduce }) {
  const count = Math.max(1, items.length)
  const R = Math.max(1, Math.min(RENDER_RANGE, Math.floor(count / 2) - 1))
  const filterId = useId()

  // Single spring-driven position. Card size tracks the same value as
  // position, so a slat grows as it slides toward centre and shrinks as it
  // slides away — growth and travel stay perfectly in sync with one source of
  // truth. The spring runs off framer-motion's own rAF, so cards still move
  // without a React re-render per frame; only a real navigation re-renders.
  const pos = useSpring(index, COVERFLOW_SPRING)
  // `targetRef` holds the last *unwrapped* target the spring is chasing, so the
  // shortest-path wrap math below measures from where we last commanded, not
  // from the live (mid-flight) spring value.
  const targetRef = useRef(index)

  // Sync the spring to the controlled `index` prop. First run snaps straight
  // there (the piece that was just opened shouldn't slide in from slot 0);
  // afterwards it springs along the shortest wrapped path, so crossing the
  // last↔first seam slides forward instead of crawling back across the wall.
  // Reduced-motion jumps instantly rather than springing.
  const initializedRef = useRef(false)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      pos.jump(index)
      targetRef.current = index
      return
    }
    const cur = targetRef.current
    let d = index - cur
    d = ((d % count) + count) % count
    if (d > count / 2) d -= count
    const target = cur + d
    targetRef.current = target
    if (reduce) pos.jump(target)
    else pos.set(target)
  }, [index, count, reduce, pos])

  return (
    <motion.div
      className="relative touch-pan-y overflow-hidden"
      // `100vw`, not a percentage: this stage's only children are absolutely
      // positioned slats, so it has no in-flow content to size a `width:
      // 100%` against inside the lightbox's flex column — it would collapse
      // to ~0 and clip everything outside the active card. The caller (see
      // Lightbox) mounts this stage in a `position: fixed` wrapper specifically
      // so `100vw` here means the true browser width, edge to edge.
      style={{ height: sizing.activeHeight, width: '100vw' }}
      // Swipe navigation: on a phone the two arrow buttons were the only way
      // to move between pieces — a horizontal swipe is the expected gesture
      // on a full-screen carousel. A pan (not `drag`) so the spring keeps
      // sole ownership of card positions; the 60px / 500px-per-second
      // thresholds keep slat taps (tiny offsets) falling through to onClick.
      // touch-pan-y above leaves vertical gestures to the browser so the
      // pan only ever claims deliberate horizontal movement.
      onPanEnd={(e, info) => {
        if (!onNavigate) return
        const dx = info.offset.x
        if (Math.abs(dx) < 60 && Math.abs(info.velocity.x) < 500) return
        onNavigate(dx < 0 ? 1 : -1)
      }}
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
    </motion.div>
  )
}

// Sizing is solved from the live viewport — coverflow math needs real pixel
// numbers (for the slat offsets), so it can't ride clamp()-driven CSS like
// the rest of the site's type; instead the caller measures the window and
// this derives the numbers (Lightbox re-runs it on resize).
//
// It used to be two fixed tiers (326×449 / 196×270), and that is why the
// lightbox felt pointless: measured against the wall it was meant to
// enlarge, a grid tile renders ~338 CSS px wide at a 768px viewport and
// ~177px on a 390px phone, so "enlarging" a painting produced an image the
// same size as — at tablet widths, *smaller* than — the tile just tapped.
// Solving from the viewport is what makes the carousel actually a viewer:
// the centred piece now takes most of the height the dialog's chrome leaves
// free, whatever the screen.
export function coverflowSizing(vw, vh) {
  // Same rhythm as the old tiers' 10/17px gaps, now scaled with the stage.
  const gap = Math.round(Math.min(20, Math.max(10, vw * 0.02)))
  // How much stage each side of the active piece stays visible: on a phone a
  // slat only needs to peek past the edge to read as "more this way"; on a
  // pointer viewport the reserve also keeps the piece clear of the absolute
  // prev/next arrows (48px buttons at ~20px insets) with a sliver of slat
  // beyond them.
  const peek = vw < 640 ? 24 : 110
  // The dialog's vertical chrome around the stage: the close button's row
  // above, the caption + its gap below (~168px in total across both). 66% of
  // the viewport keeps breathing room inside that on ordinary screens; the
  // vh - 168 bound takes over on short landscape phones, and the 240px floor
  // keeps the artwork legible even there.
  const activeHeight = Math.round(Math.max(240, Math.min(vh * 0.66, vh - 168)))
  // Widest box any aspect ratio may claim: wide enough for a 3:2 landscape
  // piece to read as landscape (1.7 × height covers it with margin), but
  // never past the peek reserve — the slats are the affordance that this is
  // a carousel at all, and a centred piece must not push every one off-screen.
  const maxActiveWidth = Math.round(Math.min(activeHeight * 1.7, vw - 2 * (gap + peek)))
  // Base (pre-aspect) box keeps the wall's default 3:4 portrait shape; the
  // slot pitch in xForRel is keyed to this, so it must stay uniform per
  // viewport rather than per painting.
  const activeWidth = Math.min(Math.round(activeHeight * (3 / 4)), maxActiveWidth)
  // Slats keep the old tiers' measured ratio (rest ≈ 0.53 × active).
  return {
    activeWidth,
    activeHeight,
    restWidth: Math.round(activeWidth * 0.53),
    restHeight: Math.round(activeHeight * 0.53),
    gap,
    maxActiveWidth,
  }
}
export const COVERFLOW_RADIUS = 4
