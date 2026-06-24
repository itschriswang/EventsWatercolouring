import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, SPRING_SOFT, asset } from '../lib/site.js'
import { WORK } from '../content.js'

/**
 * Selected work — a gallery wall driven entirely by `WORK.gallery` (see
 * content.js). Most tiles are a 3:4 portrait with its caption below; a tile
 * flagged `testimonial` takes the same card shape but holds a client quote.
 * Wide screens lay the pieces on a six-column grid where any `feature` piece
 * fills a larger 2-wide focus block; narrower screens flow into a 2/3-column
 * masonry. Tapping a painting opens it in a lightbox.
 */
export default function SelectedWork() {
  // The painting currently enlarged in the lightbox (null when closed).
  const [active, setActive] = useState(null)

  // Close the lightbox on Escape, and lock background scroll while it is open.
  useEffect(() => {
    if (!active) return
    const onKey = (e) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  return (
    <section id="work" className="relative w-full px-[5vw] py-[clamp(4rem,10vw,9rem)]">
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
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-terracotta">
              {WORK.zoomHint}
            </p>
          )}
        </div>
      </div>

      {/* Wide screens — a six-column wall of 3:4 portraits. `feature` pieces
          fill a larger 2-wide focus block (still 3:4); dense flow tucks the
          rest in around them. The cell height is tuned so the image card holds
          a 3:4 ratio with the caption sitting just below it. */}
      <div className="mt-[clamp(2.5rem,6vw,5rem)] hidden lg:grid lg:grid-cols-6 lg:auto-rows-[21vw] lg:gap-x-[1.4vw] lg:gap-y-6 lg:[grid-auto-flow:dense]">
        {WORK.gallery.map((item, i) => (
          <Tile
            key={i}
            item={item}
            index={i}
            onOpen={item.testimonial ? undefined : () => setActive(item)}
            className={
              item.feature ? 'col-span-2 row-span-2'
              : item.wide  ? 'col-span-2 row-span-1'
              :               'col-span-1 row-span-1'
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
            onOpen={item.testimonial ? undefined : () => setActive(item)}
            masonry
          />
        ))}
      </div>

      <Lightbox item={active} onClose={() => setActive(null)} />
    </section>
  )
}

/**
 * A single gallery tile. For paintings it is a 3:4 image card with the caption
 * beneath it (and a tap target that opens the lightbox); for a testimonial it
 * is the same card shape holding a quote. In the wide grid the surrounding cell
 * sets the height, so the contents fill it; in masonry the card keeps an
 * explicit 3:4 aspect.
 */
function Tile({ item, index, className = '', masonry = false, onOpen }) {
  const reduce = useReducedMotion()

  const cardShape =
    'relative overflow-hidden rounded-[1rem] border border-line ' +
    (masonry ? 'aspect-[3/4]' : 'min-h-0 flex-1')

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
            ' block w-full cursor-zoom-in bg-paper-deep text-left outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper'
          }
        >
          <picture>
            <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
            <img
              src={asset(`assets/${item.img}.jpg`)}
              alt={item.alt || item.ttl}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </picture>
        </button>
      )}

      <figcaption className="mt-2.5">
        <span className="block font-display text-[0.95rem] leading-tight text-ink">
          {item.testimonial ? item.author : item.ttl}
        </span>
        <span className="mt-0.5 block font-mono text-[0.55rem] uppercase tracking-[0.16em] text-ink-soft">
          {item.testimonial ? item.detail : item.meta}
        </span>
      </figcaption>
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
        'flex h-full flex-col justify-between p-[clamp(1.25rem,2vw,2rem)] ' +
        (masonry ? 'gap-1' : compact ? 'gap-2' : 'gap-4')
      }
    >
      <span
        aria-hidden="true"
        className={
          'font-display leading-none text-terracotta/60 ' +
          (masonry ? 'text-xl' : compact ? 'text-3xl' : 'text-5xl')
        }
      >
        &ldquo;
      </span>
      <p
        className={
          'font-display font-light leading-snug text-ink ' +
          (masonry
            ? 'text-[clamp(0.6rem,1.4vw,0.75rem)]'
            : compact
            ? 'text-[clamp(0.75rem,1.05vw,1rem)]'
            : 'text-[clamp(0.95rem,1.4vw,1.4rem)]')
        }
      >
        {item.quote}
      </p>
      <footer className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
        {item.author} · {item.detail}
      </footer>
    </blockquote>
  )
}

/**
 * Lightbox — an overlay that grows the selected painting to fill the screen.
 * Closes on backdrop click, the close button, or Escape (handled by the
 * parent). Honours reduced-motion by skipping the scale-in.
 */
function Lightbox({ item, onClose }) {
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
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
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-paper/30 text-2xl text-paper transition-colors hover:bg-paper/10"
          >
            ×
          </button>

          <motion.figure
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: reduce ? 1 : 0.92, opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
            transition={SPRING_SOFT}
            className="flex max-h-full max-w-5xl flex-col items-center"
          >
            <picture>
              <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
              <img
                src={asset(`assets/${item.img}.jpg`)}
                alt={item.alt || item.ttl}
                className="max-h-[80vh] w-auto rounded-[1rem] object-contain shadow-2xl"
              />
            </picture>
            <figcaption className="mt-4 text-center">
              <span className="block font-display text-lg text-paper">{item.ttl}</span>
              <span className="mt-0.5 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/60">
                {item.meta}
              </span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
