import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, asset } from '../lib/site.js'
import { WORK } from '../content.js'

/** Selected work — a three-piece gallery with irregular spans and parallax. */
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

      {/* Desktop / tablet — the curated three-piece gallery. */}
      <div className="mt-[clamp(2.5rem,6vw,5rem)] hidden grid-cols-12 gap-x-8 gap-y-10 sm:grid sm:items-start">
        {WORK.pieces.map((piece, i) => (
          <Piece key={piece.ttl} piece={piece} index={i} />
        ))}
      </div>

      {/* Mobile — a fuller two-column masonry. Placeholder pieces (the real
          images repeated) with every other tile a touch taller for emphasis. */}
      <MobileGallery />
    </section>
  )
}

/**
 * Mobile-only masonry gallery. Uses CSS columns so tiles of differing height
 * pack without row gaps; alternating tiles are slightly taller as emphasis.
 * The images repeat the three real studies as stand-ins for a fuller wall.
 */
function MobileGallery() {
  const reduce = useReducedMotion()
  // Repeat the real pieces to stand in for a fuller gallery wall.
  const tiles = Array.from({ length: 8 }, (_, i) => WORK.pieces[i % WORK.pieces.length])

  return (
    <div className="mt-[clamp(2rem,8vw,3rem)] columns-2 gap-3 sm:hidden">
      {tiles.map((piece, i) => (
        <motion.figure
          key={i}
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ ...SPRING, delay: reduce ? 0 : (i % 4) * 0.06 }}
          className="mb-3 break-inside-avoid"
        >
          <div className="overflow-hidden rounded-[1rem] border border-line bg-paper-deep">
            <picture>
              <source srcSet={asset(piece.webp)} type="image/webp" />
              <img
                src={asset(piece.src)}
                alt={piece.alt}
                loading="lazy"
                // Every other tile a touch taller — a subtle emphasis rhythm.
                className={
                  'w-full object-cover ' +
                  (i % 2 === 1 ? 'aspect-[3/4]' : 'aspect-[4/5]')
                }
              />
            </picture>
          </div>
        </motion.figure>
      ))}
    </div>
  )
}

function Piece({ piece, index }) {
  const reduce = useReducedMotion()
  const parallax = useHeavyFx() && !reduce
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])

  
// Irregular column spans + vertical offsets per piece.
// Mobile stacks normally; from sm and up, all three are forced into the same grid row.


const layout = [
  'col-span-12 sm:col-span-5 sm:mt-2',
  'col-span-12 sm:col-span-3 sm:mt-10',
  'col-span-12 sm:col-span-4 sm:mt-0',
]



  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : index * 0.08 }}
      className={layout[index]}
    >
      <motion.div
        style={parallax ? { y } : {}}
        className="overflow-hidden rounded-[1.2rem] border border-line bg-paper-deep w-full"
      >
        <picture>
          <source srcSet={asset(piece.webp)} type="image/webp" />
          <img
            src={asset(piece.src)}
            alt={piece.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        </picture>
      </motion.div>
      <figcaption className="mt-4 flex items-baseline justify-between">
        <span className="font-display text-lg text-ink">{piece.ttl}</span>
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft">
          {piece.meta}
        </span>
      </figcaption>
    </motion.figure>
  )
}
