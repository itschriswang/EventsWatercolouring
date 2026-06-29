import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { WHY } from '../content.js'

/** "Why live watercolour" — a big italic lede over three offset notes. */
export default function WhyWatercolour() {
  const reduce = useReducedMotion()

  return (
    <section id="why" className="relative w-full px-[5vw] py-[clamp(3rem,8vw,7rem)]">
      {/* Visually the eyebrow + italic lede read as this section's heading; this
          keeps the document outline correct (an h2 before the note h3s). */}
      <h2 className="sr-only">{WHY.label}</h2>
      <Label gradient={['#6E8CA8', '#C2613C']}>{WHY.label}</Label>

      <motion.p
        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={SPRING}
        className="mt-8 max-w-[18ch] font-display text-[clamp(1.25rem,3vw,2.25rem)] font-normal leading-[1.0] tracking-tight text-ink sm:max-w-[24ch]"
      >
        {beforeEmph(WHY.lede, 'all in one evening.')}
        <em className="text-terracotta">all in one evening.</em>
      </motion.p>

      <div className="mt-[clamp(3rem,7vw,6rem)] grid grid-cols-12 gap-x-6 gap-y-12">
        {WHY.notes.map((n, i) => (
          <motion.article
            key={n.no}
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ ...SPRING, delay: reduce ? 0 : i * 0.1 }}
            whileHover={reduce ? {} : { y: -4 }}
            className={
              'col-span-12 sm:col-span-6 lg:col-span-4 ' +
              // Staggered vertical offsets for an organic, non-aligned grid.
              (i === 1 ? 'lg:mt-16' : i === 2 ? 'lg:mt-8' : '')
            }
          >
            <span className="font-display text-sm text-rust">{n.no}</span>
            <h3 className="mt-4 font-display text-[clamp(1.4rem,2vw,2rem)] font-normal leading-tight text-ink">
              {n.title}
            </h3>
            <p className="mt-3 max-w-sm leading-relaxed text-ink-soft">{n.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

// Render the lede with the final clause emphasised.
function beforeEmph(full, clause) {
  return full.replace(clause, '').trimEnd() + ' '
}
