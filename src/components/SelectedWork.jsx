import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import useFocusTrap from '../hooks/useFocusTrap.js'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, SPRING_SOFT, asset } from '../lib/site.js'
import { WORK } from '../content.js'
import CornerBloom from './CornerBloom.jsx'
import CoverflowCarousel, { COVERFLOW_SIZING, COVERFLOW_RADIUS } from './CoverflowCarousel.jsx'

// Flatten the curated groups once, giving every entry a stable index. The
// lightbox walks this flat list, and `_idx` (not `item.img`, which repeats
// across the reveal strip) backs the stable React key each painting keeps
// as it moves between the grid tile and a coverflow slat.
const GROUPS = WORK.groups.map((group) => ({ ...group, items: [...group.items] }))
{
  let idx = 0
  for (const group of GROUPS) {
    group.items = group.items.map((item) => ({ ...item, _idx: idx++ }))
  }
}
const ALL_ITEMS = GROUPS.flatMap((g) => g.items)

// The openable paintings (testimonials are not enlargeable). The lightbox
// walks this list, so navigation skips quote cards automatically. Content is
// static, so this is computed once, not per render.
const PAINTINGS = ALL_ITEMS.filter((g) => !g.testimonial)

// Graceful fallback when an image fails to load: hide the broken <img> so the
// paper-toned card remains instead of a broken-image glyph.
const hideOnError = (e) => {
  e.currentTarget.style.display = 'none'
}

/**
 * Selected work — a curated wall driven by `WORK.groups` (see content.js).
 * The wall reads as two rooms of one show: the pieces painted live at real
 * weddings, then the studio studies, each row under its own small label so
 * the two styles never blur into one pile. The reveal strip (drag between
 * the easel shot and the finished keepsake) hangs at the end of the studio
 * row. Tapping a painting opens it in the lightbox; testimonials (when
 * added in content.js) slot into the rows as quote cards.
 */
export default function SelectedWork() {
  const paintings = PAINTINGS

  // Only one of the two layouts is ever mounted at a time. Mounting both
  // (one display:none per breakpoint) would give every tile an invisible
  // twin sharing its layoutId, which breaks the lightbox morph.
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Index of the painting currently enlarged in the lightbox (null when closed).
  const [activeIndex, setActiveIndex] = useState(null)
  const open = activeIndex != null

  // Stable handlers so navigating between pieces doesn't churn the focus trap.
  const close = useCallback(() => setActiveIndex(null), [])
  // Step through the wall, wrapping at either end.
  const navigate = useCallback(
    (dir) => setActiveIndex((i) => (i + dir + paintings.length) % paintings.length),
    [paintings.length],
  )
  // Jump straight to a piece — used when a visitor taps a slat in the coverflow.
  const selectIndex = useCallback((i) => setActiveIndex(i), [])

  // Lock background scroll while the lightbox is open. Escape, focus trapping
  // and focus restoration are handled by useFocusTrap inside the Lightbox.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const openItem = (item) => setActiveIndex(paintings.indexOf(item))

  return (
    <section id="work" className="relative w-full px-[5vw] py-[clamp(3rem,7vw,7rem)]">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Label gradient={['#E3B7C8', '#96385A']}>{WORK.label}</Label>
            <SplitText
              as="h2"
              unit="char"
              lines={WORK.title}
              emphasis={WORK.emphasis}
              emphasisItalic
              inkBleed
              className="display-lg mt-5 text-ink"
            />
          </div>
          <div className="max-w-xs sm:text-right">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
              {WORK.note}
            </p>
            {WORK.zoomHint && (
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-rust">
                {WORK.zoomHint}
              </p>
            )}
          </div>
        </div>

        {GROUPS.map((group) => (
          <div key={group.key} className="mt-[clamp(2.5rem,5vw,4rem)]">
            {/* Room label — a quiet rule with the group's name, so the wall
                reads as curated rooms rather than one mixed pile. */}
            <div className="flex items-baseline gap-4">
              <h3 className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                {group.label}
              </h3>
              <span aria-hidden="true" className="h-px flex-1 self-center bg-line/80" />
            </div>
            {group.note && (
              <p className="mt-2 max-w-md text-xs leading-relaxed text-ink-soft">{group.note}</p>
            )}

            {isDesktop ? (
              <div className="mt-6 grid grid-cols-12 items-end gap-x-[1.4vw] gap-y-6">
                {group.items.map((item) => (
                  <Tile
                    key={item._idx}
                    item={item}
                    onOpen={item.testimonial ? undefined : () => openItem(item)}
                    className={item.landscape ? 'col-span-6' : 'col-span-3'}
                  />
                ))}
                {group.key === 'studio' && WORK.reveal && (
                  <RevealTile reveal={WORK.reveal} className="col-span-3" />
                )}
              </div>
            ) : (
              <>
                <div className="mt-5 columns-2 gap-3">
                  {group.items.map((item) => (
                    <Tile
                      key={item._idx}
                      item={item}
                      onOpen={item.testimonial ? undefined : () => openItem(item)}
                      masonry
                    />
                  ))}
                </div>
                {group.key === 'studio' && WORK.reveal && (
                  <RevealTile reveal={WORK.reveal} className="mx-auto mt-5 max-w-sm" />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <Lightbox
        items={paintings}
        index={activeIndex}
        onClose={close}
        onNavigate={navigate}
        onSelect={selectIndex}
      />
    </section>
  )
}

/**
 * A single gallery tile, captionless. For paintings it is an image card and a
 * tap target that opens the lightbox; for a testimonial it is the same card
 * shape holding a quote. Landscape pieces take the wide slot in their row
 * (3:2); everything else is an upright 3:4.
 */
function Tile({ item, className = '', masonry = false, onOpen }) {
  const reduce = useReducedMotion()

  const aspect = masonry
    ? item.landscape ? 'aspect-[4/3]' : 'aspect-[3/4]'
    : item.landscape ? 'aspect-[3/2]' : 'aspect-[3/4]'
  const cardShape = 'relative overflow-hidden rounded-2xl border border-line ' + aspect

  return (
    <motion.figure
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : (item._idx % 4) * 0.05 }}
      className={
        'group flex flex-col ' +
        (masonry ? 'mb-3 break-inside-avoid ' : '') +
        className
      }
    >
      {item.testimonial ? (
        <div className={cardShape + ' bg-paper-deep'}>
          <CornerBloom from="rgba(176,172,66,0.14)" to="rgba(138,145,67,0.11)" />
          <div className="relative z-10 flex h-full flex-col">
            <Testimonial item={item} masonry={masonry} />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Enlarge ${item.ttl}`}
          className={
            cardShape +
            ' block w-full cursor-zoom-in bg-paper-deep text-left outline-none' +
            ' transition-[transform,box-shadow] duration-500 ease-organic' +
            ' group-hover:-translate-y-1 group-hover:shadow-[0_18px_42px_-26px_rgba(126,40,72,0.32)]' +
            ' focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper'
          }
        >
          <picture>
            <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
            <motion.img
              src={asset(`assets/${item.img}.jpg`)}
              alt={item.alt || item.ttl}
              loading="lazy"
              onError={hideOnError}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </picture>
          <CornerBloom from="rgba(176,74,118,0.14)" to="rgba(140,54,86,0.10)" overlay />
        </button>
      )}
    </motion.figure>
  )
}

/** The quote card body — fills the card shape and scales its type to fit. */
function Testimonial({ item, masonry = false }) {
  return (
    <blockquote
      className={
        'flex h-full flex-col justify-start p-[clamp(1.25rem,2vw,2rem)] ' +
        (masonry ? 'gap-0' : 'gap-1')
      }
    >
      <span
        aria-hidden="true"
        className={
          'font-mono leading-none text-terracotta/60 ' +
          (masonry ? 'text-xl' : 'text-4xl')
        }
      >
        &ldquo;
      </span>
      <p
        className={
          'font-body font-normal leading-snug text-ink ' +
          (masonry
            ? 'text-[clamp(0.6rem,1.4vw,0.75rem)]'
            : 'text-[clamp(0.9rem,1.3vw,1.15rem)]')
        }
      >
        {item.quote}
      </p>
      <footer className={'mt-auto ' + (masonry ? 'pt-2' : 'pt-4')}>
        <span
          className={
            'block font-mono leading-tight text-ink ' +
            (masonry ? 'text-[0.7rem]' : 'text-[0.95rem]')
          }
        >
          {item.author}
        </span>
        <span
          className={
            'mt-0.5 block font-mono uppercase tracking-[0.15em] text-ink-soft ' +
            (masonry ? 'text-[0.45rem]' : 'text-[0.55rem]')
          }
        >
          {item.detail}
        </span>
      </footer>
    </blockquote>
  )
}

/**
 * RevealTile — the before/after strip. The finished keepsake sits over the
 * easel shot, split by a draggable seam: drag (or arrow-key) the handle to
 * wipe between the piece mid-making and the clean scan. Pure pointer events
 * and a clip-path — no dependencies, cheap on mobile.
 */
function RevealTile({ reveal, className = '' }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [pct, setPct] = useState(55)
  const [touched, setTouched] = useState(false)
  const dragging = useRef(false)

  const setFromClientX = useCallback((clientX) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const next = ((clientX - rect.left) / rect.width) * 100
    setPct(Math.min(96, Math.max(4, next)))
  }, [])

  const onPointerDown = (e) => {
    dragging.current = true
    setTouched(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setFromClientX(e.clientX)
  }
  const onPointerMove = (e) => {
    if (dragging.current) setFromClientX(e.clientX)
  }
  const endDrag = () => {
    dragging.current = false
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      setPct((p) => Math.max(4, p - 6))
      setTouched(true)
      e.preventDefault()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      setPct((p) => Math.min(96, p + 6))
      setTouched(true)
      e.preventDefault()
    }
  }

  return (
    <motion.figure
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={SPRING}
      className={'group flex flex-col ' + className}
    >
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative aspect-[3/4] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl border border-line bg-paper-deep"
      >
        {/* Base layer — the piece still on the easel */}
        <picture>
          <source srcSet={asset(`assets/${reveal.before.img}.webp`)} type="image/webp" />
          <img
            src={asset(`assets/${reveal.before.img}.${reveal.before.ext || 'jpg'}`)}
            alt={reveal.before.alt}
            loading="lazy"
            draggable="false"
            onError={hideOnError}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>

        {/* Top layer — the finished keepsake on clean paper, clipped to the
            left of the seam. clip-path only repaints the seam, so dragging
            stays cheap even on phones. */}
        <div
          className="absolute inset-0 bg-paper"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        >
          <div className="paper-grain absolute inset-0" />
          <picture>
            <source srcSet={asset(`assets/${reveal.after.img}.webp`)} type="image/webp" />
            <img
              src={asset(`assets/${reveal.after.img}.${reveal.after.ext || 'jpg'}`)}
              alt={reveal.after.alt}
              loading="lazy"
              draggable="false"
              onError={hideOnError}
              className="absolute inset-0 h-full w-full object-contain p-[7%]"
            />
          </picture>
        </div>

        {/* Seam + handle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-paper shadow-[0_0_8px_rgba(78,38,57,0.45)]"
          style={{ left: `${pct}%` }}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${reveal.ttl}: drag between ${reveal.before.label.toLowerCase()} and ${reveal.after.label.toLowerCase()}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          onKeyDown={onKeyDown}
          className="btn-aurora absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[0.6rem] text-paper outline-none focus-visible:ring-2 focus-visible:ring-paper"
          style={{ left: `${pct}%` }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 8 4 12l4 4" />
            <path d="M16 8l4 4-4 4" />
          </svg>
        </div>

        {/* Corner labels */}
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-ink/55 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-paper">
          {reveal.after.label}
        </span>
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-ink/55 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-paper">
          {reveal.before.label}
        </span>

        {/* Hint — fades once the visitor has had a go */}
        <AnimatePresence>
          {!touched && (
            <motion.span
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-ink/55 px-3 py-1 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-paper"
            >
              {reveal.hint}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.figure>
  )
}

// A circular control matching the lightbox's close button — used for the
// prev/next arrows. Stops propagation so it never reaches the backdrop's close.
function NavControl({ label, onClick, className, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={
        'absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center ' +
        'rounded-full border border-paper/30 text-2xl text-paper transition-colors hover:bg-paper/10 ' +
        className
      }
    >
      {children}
    </button>
  )
}

/**
 * Lightbox — an overlay that opens the gallery into a coverflow: the tapped
 * painting takes the centre at full size, with the rest of the wall fanned
 * out either side as thin slats. Walks the gallery with the on-screen arrows,
 * the ← / → keys, or by tapping a slat directly; closes on backdrop click,
 * the close button, or Escape. Honours reduced-motion by skipping the pop-in
 * and sliding the carousel straight to each new piece. The expensive
 * dressing — backdrop blur, the blurred pigment glow, the wet-bloom SVG
 * filter — is reserved for fine-pointer desktops (heavyFx): phones get a
 * plain dark backdrop and flat colour, transform-only motion, which stays smooth.
 */
function Lightbox({ items, index, onClose, onNavigate, onSelect }) {
  const reduce = useReducedMotion()
  const heavy = useHeavyFx()
  const wide = useMediaQuery('(min-width: 640px)')
  const open = index != null
  const item = open ? items[index] : null
  const trapRef = useFocusTrap(open, onClose)
  const many = items.length > 1
  const dressed = heavy && !reduce
  const sizing = wide ? COVERFLOW_SIZING.wide : COVERFLOW_SIZING.narrow

  // Left / right arrow keys walk the wall while the lightbox is open.
  useEffect(() => {
    if (!open || !many) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') onNavigate(-1)
      else if (e.key === 'ArrowRight') onNavigate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, many, onNavigate])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          ref={trapRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={item.ttl}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={
            'fixed inset-0 z-[120] flex items-center justify-center p-[5vw] ' +
            (dressed ? 'bg-ink/85 backdrop-blur-sm' : 'bg-ink/90')
          }
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-paper/30 text-2xl text-paper transition-colors hover:bg-paper/10"
          >
            ×
          </button>

          {many && (
            <>
              <NavControl label="Previous piece" onClick={() => onNavigate(-1)} className="left-3 sm:left-5">
                ‹
              </NavControl>
              <NavControl label="Next piece" onClick={() => onNavigate(1)} className="right-3 sm:right-5">
                ›
              </NavControl>
            </>
          )}

          {/* A soft pigment glow blooms in behind the enlarged piece, like light
              coming through cotton paper. Desktop-only: a viewport-sized blurred,
              blended layer is exactly the kind of paint mobile GPUs choke on. */}
          {dressed && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(176,74,118,0.42), rgba(140,54,86,0.2) 42%, transparent 72%)',
                filter: 'blur(60px)',
              }}
            />
          )}

          {/* `position: fixed` (not the dialog's flex/padding box) so the
              carousel spans the true browser width — a descendant of the
              scale-animated figure below couldn't do this, since a CSS
              transform on an ancestor traps `position: fixed` children to
              that ancestor's box instead of the viewport. The dialog itself
              only animates opacity, so it stays a valid escape hatch. Empty
              space is `pointer-events: none` so backdrop-click-to-close still
              reaches the dialog underneath; the carousel and caption opt back
              into pointer events for themselves. */}
          <motion.div
            initial={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
            transition={reduce ? { duration: 0.2 } : SPRING_SOFT}
            className="pointer-events-none fixed inset-0 z-[1] flex flex-col items-center justify-center gap-4"
          >
            <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto w-full">
              <CoverflowCarousel
                items={items}
                index={index}
                onSelect={onSelect}
                sizing={sizing}
                radius={COVERFLOW_RADIUS}
                dressed={dressed}
                reduce={reduce}
              />
            </div>
            <figcaption
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto text-center"
            >
              <span className="block font-sentient tracking-[-0.03em] text-lg text-paper">{item.ttl}</span>
              <span className="mt-0.5 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/60">
                {item.meta}
                {item.venue && (
                  <span className="text-paper/80">
                    {'  ·  '}Painted live at {item.venue}
                  </span>
                )}
                {many && (
                  <span className="text-paper/40">
                    {'  ·  '}
                    {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                  </span>
                )}
              </span>
            </figcaption>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
