import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import useFocusTrap from '../hooks/useFocusTrap.js'
import { SPRING, SPRING_SOFT, asset } from '../lib/site.js'
import { WORK } from '../content.js'

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
  const paintings = WORK.gallery.filter((g) => !g.testimonial)

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
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Label gradient={['#6E8CA8', '#C2613C']}>{WORK.label}</Label>
            <SplitText
              as="h2"
              unit="char"
              lines={WORK.title}
              emphasis={WORK.emphasis}
              className="display-lg mt-5 text-ink"
            />
          </div>
          <div className="max-w-xs">
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

        {/* Wide screens — a six-column wall of 3:4 portraits. `feature` pieces
            fill a larger 2-wide focus block; dense flow tucks the rest in around
            them. Row height is capped so tiles stay a sensible size on very wide
            screens. */}
        <div className="mt-[clamp(2rem,4vw,3.5rem)] hidden lg:grid lg:grid-cols-6 lg:auto-rows-[16vw] 2xl:auto-rows-[14rem] lg:gap-x-[1.4vw] lg:gap-y-5 lg:[grid-auto-flow:dense]">
          {WORK.gallery.map((item, i) => (
            <Tile
              key={i}
              item={item}
              index={i}
              onOpen={item.testimonial ? undefined : () => setActiveIndex(paintings.indexOf(item))}
              className={
                item.feature              ? 'col-span-2 row-span-2'
                : item.wide || item.landscape ? 'col-span-2 row-span-1'
                :                           'col-span-1 row-span-1'
              }
            />
          ))}
        </div>

        {/* Narrow / medium — a masonry wall (2 columns, then 3). */}
        <div className="mt-[clamp(2rem,8vw,3rem)] columns-2 gap-3 sm:columns-3 lg:hidden">
          {WORK.gallery.map((item, i) => (
            <Tile
              key={i}
              item={item}
              index={i}
              onOpen={item.testimonial ? undefined : () => setActiveIndex(paintings.indexOf(item))}
              masonry
            />
          ))}
        </div>
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
function Tile({ item, index, className = '', masonry = false, onOpen }) {
  const reduce = useReducedMotion()

  const cardShape =
    'relative overflow-hidden rounded-[1rem] border border-line ' +
    (masonry ? (item.landscape ? 'aspect-[4/3]' : 'aspect-[3/4]') : 'min-h-0 flex-1')

  return (
    <motion.figure
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : (index % 6) * 0.05 }}
      className={
        'group flex flex-col ' +
        (masonry ? 'mb-6 break-inside-avoid ' : '') +
        className
      }
    >
      {item.testimonial ? (
        <div className={cardShape + ' bg-paper-deep'}>
          <Testimonial item={item} compact={!!item.wide} masonry={masonry} />
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
            ' group-hover:-translate-y-1 group-hover:shadow-[0_18px_42px_-26px_rgba(150,85,43,0.28)]' +
            ' focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper'
          }
        >
          <picture>
            <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
            <img
              src={asset(`assets/${item.img}.jpg`)}
              alt={item.alt || item.ttl}
              loading="lazy"
              onError={hideOnError}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </picture>
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
          'font-display leading-none text-terracotta/60 ' +
          (masonry ? 'text-xl' : compact ? 'text-4xl' : 'text-5xl')
        }
      >
        &ldquo;
      </span>
      <p
        className={
          'font-display font-normal leading-snug text-ink ' +
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
            'block font-display leading-tight text-ink ' +
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

          <motion.figure
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: reduce ? 1 : 0.92, opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
            transition={SPRING_SOFT}
            className="flex max-h-full max-w-5xl flex-col items-center"
          >
            {/* Keyed by index so the image crossfades as you move along the wall. */}
            <AnimatePresence mode="wait">
              <motion.picture
                key={index}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="block"
              >
                <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
                <img
                  src={asset(`assets/${item.img}.jpg`)}
                  alt={item.alt || item.ttl}
                  onError={hideOnError}
                  className="max-h-[80vh] w-auto rounded-[1rem] object-contain shadow-[0_28px_60px_-10px_rgba(0,0,0,0.65)]"
                />
              </motion.picture>
            </AnimatePresence>
            <figcaption className="mt-4 text-center">
              <span className="block font-zt-oskon text-lg text-paper">{item.ttl}</span>
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
