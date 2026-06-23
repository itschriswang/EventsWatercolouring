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

      <div className="mt-[clamp(2.5rem,6vw,5rem)] grid grid-cols-12 gap-6">
        {WORK.pieces.map((piece, i) => (
          <Piece key={piece.ttl} piece={piece} index={i} />
        ))}
      </div>
    </section>
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
  const layout = [
    'col-span-12 sm:col-span-3',
    'col-span-12 sm:col-span-2 sm:mt-9',
    'col-span-12 sm:col-span-3 sm:col-start-2 sm:-mt-4',
  ][index]

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : index * 0.08 }}
      className={layout}
    >
      <motion.div
        style={parallax ? { y } : {}}
        className="overflow-hidden rounded-[1.2rem] border border-line bg-paper-deep max-w-[320px]"
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
