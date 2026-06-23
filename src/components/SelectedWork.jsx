import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, asset } from '../lib/site.js'
import { WORK } from '../content.js'

/**
 * Selected work — a gallery wall driven entirely by `WORK.gallery` (see
 * content.js). Every tile is a 3:4 portrait with its caption below. Wide
 * screens lay the pieces on a six-column grid where any `feature` piece fills a
 * larger 2-wide focus block; narrower screens flow into a 2/3-column masonry.
 */
export default function SelectedWork() {
  return (
    <section id="work" className="relative w-full px-[5vw] py-[clamp(4rem,10vw,9rem)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Label>{WORK.label}</Label>
          <SplitText
            as="h2"
            unit="char"
            lines={WORK.title}
            emphasis={WORK.emphasis}
            className="display-lg mt-5 text-ink"
          />
        </div>
        <p className="max-w-xs font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
          {WORK.note}
        </p>
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
            className={item.feature ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
          />
        ))}
      </div>

      {/* Narrow / medium — a masonry wall (2 columns, then 3). */}
      <div className="mt-[clamp(2rem,8vw,3rem)] columns-2 gap-3 sm:columns-3 lg:hidden">
        {WORK.gallery.map((item, i) => (
          <Tile key={i} item={item} index={i} masonry />
        ))}
      </div>
    </section>
  )
}

/**
 * A single gallery tile: a 3:4 image card with the caption beneath it. In the
 * wide grid the surrounding cell sets the height, so the image fills it
 * (object-cover) while the caption sits at the foot; in masonry the image keeps
 * an explicit 3:4 aspect.
 */
function Tile({ item, index, className = '', masonry = false }) {
  const reduce = useReducedMotion()

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
      <div
        className={
          'relative overflow-hidden rounded-[1rem] border border-line bg-paper-deep ' +
          (masonry ? 'aspect-[3/4]' : 'min-h-0 flex-1')
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
      </div>
      <figcaption className="mt-2.5">
        <span className="block font-display text-[0.95rem] leading-tight text-ink">
          {item.ttl}
        </span>
        <span className="mt-0.5 block font-mono text-[0.55rem] uppercase tracking-[0.16em] text-ink-soft">
          {item.meta}
        </span>
      </figcaption>
    </motion.figure>
  )
}
