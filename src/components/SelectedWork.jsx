import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import useFocusTrap from '../hooks/useFocusTrap.js'
import useMediaQuery from '../hooks/useMediaQuery.js'
import { SPRING, SPRING_SOFT, asset } from '../lib/site.js'
import { WORK } from '../content.js'
import CornerBloom from './CornerBloom.jsx'

// Every gallery entry gets a stable index up front. Several paintings reuse
// the same source image (e.g. `art-bouquet` appears three times), so `_idx`
// — not `item.img` — is what backs each tile's layoutId. Framer Motion
// requires layoutId to be unique among simultaneously mounted elements; a
// shared id across lookalike tiles breaks the projection system badly enough
// that the affected images stop painting entirely, not just the morph.
const GALLERY = WORK.gallery.map((g, i) => ({ ...g, _idx: i }))

// Thumbnail-size options for the desktop wall — swapping the column count
// (and the row height that keeps cells roughly square) reshuffles every
// tile's size at once. `feature`/`wide` pieces keep their 2-track span
// regardless, so they simply read as a bigger or smaller fraction of a
// denser or looser wall. Mobile stays a fixed 2/3-column masonry, since
// there isn't the width to spare for a size control there.
const DENSITIES = [
  { key: 'compact', label: 'Compact', cols: 9, row: '11vw', row2xl: '9.5rem' },
  { key: 'comfortable', label: 'Standard', cols: 6, row: '16vw', row2xl: '14rem' },
  { key: 'spacious', label: 'Spacious', cols: 4, row: '22vw', row2xl: '19rem' },
]

// Graceful fallback when an image fails to load: hide the broken <img> so the
// paper-toned card remains instead of a broken-image glyph.
const hideOnError = (e) => {
  e.currentTarget.style.display = 'none'
}

/**
 * Selected work — a gallery wall driven entirely by `WORK.gallery` (see
 * content.js). The wall carries no captions: most tiles are a bare 3:4 portrait,
 * a `landscape` piece takes a wide 2×1 letterbox tile, and a tile flagged
 * `testimonial` takes that same wide shape but holds a client quote with its
 * attribution inside the card. Wide screens lay the pieces on a six-column grid
 * where any `feature` piece fills a larger 2-wide focus block; narrower screens
 * flow into a 2/3-column masonry. Tapping a painting opens it in a lightbox.
 */
export default function SelectedWork() {
  // The openable paintings (testimonials are not enlargeable). The lightbox
  // walks this list, so navigation skips quote cards automatically.
  const paintings = GALLERY.filter((g) => !g.testimonial)

  // Only one of the two grid layouts is ever mounted at a time. Both grids
  // used to render simultaneously (one hidden via CSS per breakpoint), which
  // meant every tile had a second, invisible sibling sharing its layoutId —
  // the same class of bug the reused-image case above causes.
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Which thumbnail size the desktop wall is showing. Resets to the default
  // on reload rather than persisting — a lightweight view preference, not a
  // setting worth remembering across visits.
  const [density, setDensity] = useState('comfortable')
  const activeDensity = useMemo(
    () => DENSITIES.find((d) => d.key === density) ?? DENSITIES[1],
    [density],
  )

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

  // Lock background scroll while the lightbox is open. Escape, focus trapping
  // and focus restoration are handled by useFocusTrap inside the Lightbox.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <section id="work" className="relative w-full px-[5vw] py-[clamp(3rem,7vw,7rem)]">
      {/* Smooth transition bloom from gallery to packages — warm editorial gradient
          blending the white gallery background into the bloom-backed packages section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px left-0 right-0 h-[clamp(100px,15vw,200px)] z-10"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 180% 80% at 50% 100%, rgba(201,97,60,0.08) 0%, rgba(228,136,156,0.04) 25%, transparent 60%), ' +
            'radial-gradient(ellipse 160% 100% at 30% 120%, rgba(201,162,58,0.06) 0%, transparent 50%), ' +
            'radial-gradient(ellipse 160% 100% at 70% 120%, rgba(164,80,47,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Label gradient={['#C98B8C', '#C2613C']}>{WORK.label}</Label>
            <SplitText
              as="h2"
              unit="char"
              lines={WORK.title}
              emphasis={WORK.emphasis}
              emphasisItalic
              className="display-lg mt-5 text-ink"
            />
          </div>
          <div className="flex max-w-xs flex-col items-start gap-4 sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
                {WORK.note}
              </p>
              {WORK.zoomHint && (
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-rust">
                  {WORK.zoomHint}
                </p>
              )}
            </div>

            {/* Thumbnail size control — desktop wall only. */}
            {isDesktop && (
              <div
                role="group"
                aria-label="Gallery thumbnail size"
                className="flex items-center gap-1 rounded-full border border-line bg-paper-deep/70 p-1 font-mono text-[0.58rem] uppercase tracking-[0.15em]"
              >
                {DENSITIES.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDensity(d.key)}
                    aria-pressed={density === d.key}
                    className={
                      'rounded-full px-3 py-1.5 transition-colors duration-300 ' +
                      (density === d.key
                        ? 'bg-ink text-paper'
                        : 'text-ink-soft hover:text-ink')
                    }
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wide screens get a six-column wall of 3:4 portraits (`feature` pieces
            fill a larger 2-wide focus block, dense flow tucks the rest in
            around them); narrower screens get a 2/3-column masonry. Only one
            of the two ever mounts — see the `isDesktop` note above. */}
        {isDesktop ? (
          <div
            className="mt-[clamp(2rem,4vw,3.5rem)] grid auto-rows-[var(--gallery-row)] grid-cols-[repeat(var(--gallery-cols),minmax(0,1fr))] gap-x-[1.4vw] gap-y-5 [grid-auto-flow:dense] 2xl:auto-rows-[var(--gallery-row-2xl)]"
            style={{
              '--gallery-cols': activeDensity.cols,
              '--gallery-row': activeDensity.row,
              '--gallery-row-2xl': activeDensity.row2xl,
            }}
          >
            {GALLERY.map((item) => (
              <Tile
                key={item._idx}
                item={item}
                reflow
                onOpen={item.testimonial ? undefined : () => setActiveIndex(paintings.indexOf(item))}
                className={
                  item.feature              ? 'col-span-2 row-span-2'
                  : item.wide || item.landscape ? 'col-span-2 row-span-1'
                  :                           'col-span-1 row-span-1'
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-[clamp(2rem,8vw,3rem)] columns-2 gap-3 sm:columns-3">
            {GALLERY.map((item) => (
              <Tile
                key={item._idx}
                item={item}
                onOpen={item.testimonial ? undefined : () => setActiveIndex(paintings.indexOf(item))}
                masonry
              />
            ))}
          </div>
        )}
      </div>

      <Lightbox
        items={paintings}
        index={activeIndex}
        onClose={close}
        onNavigate={navigate}
      />
    </section>
  )
}

/**
 * A single gallery tile, captionless. For paintings it is an image card and a
 * tap target that opens the lightbox; for a testimonial it is the same card
 * shape holding a quote. In the wide grid the surrounding cell sets the height,
 * so the contents fill it; in masonry the card keeps an explicit aspect — 3:4
 * upright, or 4:3 for a `landscape` piece.
 */
function Tile({ item, className = '', masonry = false, onOpen, reflow = false }) {
  const reduce = useReducedMotion()

  const cardShape =
    'relative overflow-hidden rounded-[1rem] border border-line ' +
    (masonry ? (item.landscape ? 'aspect-[4/3]' : 'aspect-[3/4]') : 'min-h-0 flex-1')

  return (
    <motion.figure
      // `layout` lets Framer Motion FLIP each tile into its new grid cell
      // when the desktop thumbnail-size control changes the column count,
      // instead of it just jumping.
      layout={reflow && !reduce ? true : undefined}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : (item._idx % 6) * 0.05 }}
      className={
        'group flex flex-col ' +
        (masonry ? 'mb-6 break-inside-avoid ' : '') +
        className
      }
    >
      {item.testimonial ? (
        <div className={cardShape + ' bg-paper-deep'}>
          <CornerBloom from="rgba(201,162,58,0.14)" to="rgba(110,140,168,0.11)" />
          <div className="relative z-10 flex h-full flex-col">
            <Testimonial item={item} compact={!!item.wide} masonry={masonry} />
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
            ' group-hover:-translate-y-1 group-hover:shadow-[0_18px_42px_-26px_rgba(173,98,49,0.32)]' +
            ' focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper'
          }
        >
          <picture>
            <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
            {/* Shared-layout source: morphs into the lightbox image on open.
                Disabled under reduced-motion so framer leaves layout untouched. */}
            <motion.img
              layoutId={reduce ? undefined : `work-${item._idx}`}
              src={asset(`assets/${item.img}.jpg`)}
              alt={item.alt || item.ttl}
              loading="lazy"
              onError={hideOnError}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </picture>
          <CornerBloom from="rgba(194,97,60,0.14)" to="rgba(110,140,168,0.10)" overlay />
        </button>
      )}
    </motion.figure>
  )
}

/** The quote card body — fills the card shape and scales its type to fit.
 *  `compact` is true for wide (2-col, 1-row) tiles where vertical space is halved.
 *  `masonry` squeezes the open-quote mark and tightens the gap so the text fits the half-width 3:4 card. */
function Testimonial({ item, compact = false, masonry = false }) {
  return (
    <blockquote
      className={
        'flex h-full flex-col justify-start p-[clamp(1.25rem,2vw,2rem)] ' +
        (masonry ? 'gap-0' : compact ? 'gap-0.5' : 'gap-1')
      }
    >
      <span
        aria-hidden="true"
        className={
          'font-mono leading-none text-terracotta/60 ' +
          (masonry ? 'text-xl' : compact ? 'text-4xl' : 'text-5xl')
        }
      >
        &ldquo;
      </span>
      <p
        className={
          'font-body font-normal leading-snug text-ink ' +
          (masonry
            ? 'text-[clamp(0.6rem,1.4vw,0.75rem)]'
            : compact
            ? 'text-[clamp(0.9rem,1.5vw,1.35rem)]'
            : 'text-[clamp(0.95rem,1.4vw,1.4rem)]')
        }
      >
        {item.quote}
      </p>
      {/* Attribution lives inside the card now that the wall carries no captions. */}
      <footer className={'mt-auto ' + (masonry ? 'pt-2' : 'pt-4')}>
        <span
          className={
            'block font-mono leading-tight text-ink ' +
            (masonry ? 'text-[0.7rem]' : compact ? 'text-[0.95rem]' : 'text-[1.05rem]')
          }
        >
          {item.author}
        </span>
        <span
          className={
            'mt-0.5 block font-mono uppercase tracking-[0.16em] text-ink-soft ' +
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
 * Watercolour bloom — an SVG turbulence + displacement filter that "wicks" the
 * painting into focus, like wet pigment spreading into cotton paper. The
 * displacement amplitude and a soft wet-edge blur settle to zero on mount, so
 * remounting the filter (one fresh id per painting) replays the bloom each time
 * a new piece appears. Rendered only when motion is allowed — see Lightbox.
 */
function BloomFilter({ id }) {
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
            dur="0.9s"
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
            dur="0.9s"
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
 * Lightbox — an overlay that grows the selected painting to fill the screen.
 * Walks the gallery with the on-screen arrows or the ← / → keys; closes on
 * backdrop click, the close button, or Escape. The image crossfades between
 * pieces. Honours reduced-motion by skipping the scale-in and crossfade.
 */
function Lightbox({ items, index, onClose, onNavigate }) {
  const reduce = useReducedMotion()
  const open = index != null
  const item = open ? items[index] : null
  const trapRef = useFocusTrap(open, onClose)
  const many = items.length > 1

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
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/85 p-[5vw] backdrop-blur-sm"
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
              coming through cotton paper. Decorative, behind the image, screen-
              blended so it lifts the dark backdrop warmly without competing with
              the painting. Static (no fade) under reduced-motion. */}
          <motion.div
            aria-hidden="true"
            initial={reduce ? { opacity: 0.6 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: reduce ? 0.6 : 0.7, scale: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(194,97,60,0.42), rgba(228,136,156,0.2) 42%, transparent 72%)',
              filter: 'blur(60px)',
            }}
          />

          <motion.figure
            onClick={(e) => e.stopPropagation()}
            // The shared-layout morph carries the figure open, so it no longer
            // scales itself in. Reduced-motion keeps the original gentle scale-in.
            initial={reduce ? { scale: 1, opacity: 0, y: 0 } : false}
            animate={reduce ? { scale: 1, opacity: 1, y: 0 } : false}
            exit={reduce ? { scale: 1, opacity: 0 } : { opacity: 0 }}
            transition={SPRING_SOFT}
            className="relative z-[1] flex max-h-full max-w-5xl flex-col items-center"
          >
            {/* Keyed by index so each painting crossfades — and re-wicks through
                the watercolour bloom — as you move along the wall. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="relative block"
              >
                {!reduce && <BloomFilter id={`wc-bloom-${index}`} />}
                <picture className="block">
                  <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
                  {/* Shared-layout target: morphs from the gallery tile of the
                      same painting, then settles through the pigment-bloom filter. */}
                  <motion.img
                    layoutId={reduce ? undefined : `work-${item._idx}`}
                    transition={SPRING_SOFT}
                    src={asset(`assets/${item.img}.jpg`)}
                    alt={item.alt || item.ttl}
                    onError={hideOnError}
                    style={reduce ? undefined : { filter: `url(#wc-bloom-${index})` }}
                    className="max-h-[80vh] w-auto rounded-[1rem] object-contain shadow-[0_28px_60px_-10px_rgba(150,85,43,0.65)]"
                  />
                </picture>
              </motion.div>
            </AnimatePresence>
            <figcaption className="mt-4 text-center">
              <span className="block font-sentient tracking-[-0.03em] text-lg text-paper">{item.ttl}</span>
              <span className="mt-0.5 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/60">
                {item.meta}
                {many && (
                  <span className="text-paper/40">
                    {'  ·  '}
                    {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                  </span>
                )}
              </span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
