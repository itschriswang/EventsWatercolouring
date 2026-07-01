import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { WHY } from '../content.js'
import { withUnderline } from './Underline.jsx'

// Notes that get a hand-drawn underline under a key phrase, and which phrase.
// Not every note needs one — that's what keeps it feeling picked out rather
// than applied uniformly.
const NOTE_UNDERLINES = {
  '02': { phrase: 'one of a kind', className: 'text-terracotta' },
  '03': { phrase: 'archival cotton paper', className: 'text-sage' },
}

/** "Why live watercolour" — a big italic lede over three offset notes. */
export default function WhyWatercolour() {
  const reduce = useReducedMotion()

  return (
    <section id="why" className="relative w-full px-[5vw] pt-[clamp(2.5rem,6vw,5rem)] pb-[clamp(4rem,10vw,9rem)]">
      {/* Visually the eyebrow + italic lede read as this section's heading; this
          keeps the document outline correct (an h2 before the note h3s). */}
      <h2 className="sr-only">{WHY.label}</h2>
      <Label gradient={['#C9A23A', '#C2613C']}>{WHY.label}</Label>

      <motion.p
        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={SPRING}
        className="mt-8 max-w-[18ch] font-body text-[clamp(0.8rem,1vw,0.98rem)] font-normal leading-[1.4] text-ink sm:max-w-[28ch]"
      >
        {beforeEmph(WHY.lede, 'all in one evening.')}
        <em className="text-terracotta">all in one evening.</em>
      </motion.p>

      <div className="mt-[clamp(1.5rem,3.5vw,3rem)] grid grid-cols-12 gap-x-6 gap-y-12">
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
              ['lg:col-span-5', 'lg:col-span-5 lg:col-start-8 lg:mt-12', 'lg:col-span-7 lg:mt-6'][i],
            ].join(' ')}
          >
            <span className="num-wide text-sm text-lime">{n.no}</span>
            <h3 className="mt-4 font-sentient text-[clamp(1.4rem,2vw,2rem)] leading-tight tracking-[-0.01em] text-ink">
              {n.title}
            </h3>
            <p className="mt-3 max-w-sm leading-relaxed text-ink-soft">
              {NOTE_UNDERLINES[n.no]
                ? withUnderline(n.body, NOTE_UNDERLINES[n.no].phrase, { className: NOTE_UNDERLINES[n.no].className })
                : n.body}
            </p>
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
