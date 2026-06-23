import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, asset } from '../lib/site.js'
import { WORK } from '../content.js'

/**
 * Selected work — a gallery wall driven entirely by `WORK.gallery` (see
 * content.js). Wide screens lay the pieces out on a six-column grid where any
 * `feature` piece fills a 2×2 block for focus; narrower screens flow the same
 * pieces into a 2/3-column masonry.
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

      {/* Wide screens — a six-column wall; `feature` pieces fill a 2×2 block.
          A 1vw gap with matching square rows keeps the blocks truly square,
          and dense flow tucks the smaller pieces in around the features. */}
      <div className="mt-[clamp(2.5rem,6vw,5rem)] hidden lg:grid lg:grid-cols-6 lg:auto-rows-[14.2vw] lg:gap-[1vw] lg:[grid-auto-flow:dense]">
        {WORK.gallery.map((item, i) => (
          <Tile
            key={i}
            item={item}
            index={i}
            className={item.feature ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
          />
        ))}
      </div>

      {/* Narrow / medium — a masonry wall (2 columns, then 3). Feature pieces
          stand a touch taller for the same emphasis. */}
      <div className="mt-[clamp(2rem,8vw,3rem)] columns-2 gap-3 sm:columns-3 lg:hidden">
        {WORK.gallery.map((item, i) => (
          <Tile
            key={i}
            item={item}
            index={i}
            masonry
            imgClass={item.feature ? 'aspect-[3/4]' : 'aspect-[4/5]'}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * A single gallery tile. In the wide grid the surrounding cell sets the size
 * (so the image fills a square); in masonry the `imgClass` aspect sets it. The
 * caption overlays the foot of the image so tiles stay flush in the grid.
 */
function Tile({ item, index, className = '', imgClass = '', masonry = false }) {
  const reduce = useReducedMotion()

  return (
    <motion.figure
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : (index % 6) * 0.05 }}
      className={
        'group relative overflow-hidden rounded-[1rem] border border-line bg-paper-deep ' +
        (masonry ? 'mb-3 break-inside-avoid ' : '') +
        className
      }
    >
      <picture>
        <source srcSet={asset(`assets/${item.img}.webp`)} type="image/webp" />
        <img
          src={asset(`assets/${item.img}.jpg`)}
          alt={item.alt || item.ttl}
          loading="lazy"
          className={
            'h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ' +
            imgClass
          }
        />
      </picture>
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/65 via-ink/20 to-transparent p-2.5 pt-9 sm:p-3 sm:pt-10">
        <span className="font-display text-[0.95rem] leading-tight text-paper sm:text-base">
          {item.ttl}
        </span>
        <span className="shrink-0 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-paper/85 sm:text-[0.55rem]">
          {item.meta}
        </span>
      </figcaption>
    </motion.figure>
  )
}
