import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { WHY } from '../content.js'

/** "Why live watercolour" — a big italic lede over three offset notes. */
export default function WhyWatercolour() {
  const reduce = useReducedMotion()

  return (
    <section id="why" className="relative w-full px-[5vw] pt-[clamp(2.5rem,6vw,5rem)] pb-[clamp(4rem,10vw,9rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 90% 5%, rgba(194,97,60,0.07) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 50% 50% at 8% 95%, rgba(110,140,168,0.06) 0%, transparent 55%)',
        }}
      />
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
            className={[
              'col-span-12 sm:col-span-6',
              // Zig-zag asymmetric layout: note 0 anchors top-left, note 1
              // bridges right with a deep drop, note 2 reclaims the left wider.
              ['lg:col-span-5', 'lg:col-span-5 lg:col-start-8 lg:mt-28', 'lg:col-span-7 lg:mt-16'][i],
            ].join(' ')}
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
