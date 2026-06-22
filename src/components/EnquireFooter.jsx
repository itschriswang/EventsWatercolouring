import { motion, useReducedMotion } from 'framer-motion'
import MagneticButton from './MagneticButton.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'

/** Closing CTA band with a large split headline and the magnetic button. */
export default function EnquireFooter() {
  const reduce = useReducedMotion()

  return (
    <footer
      id="enquire"
      className="relative mt-[clamp(2rem,6vw,5rem)] overflow-hidden bg-ink text-paper"
    >
      <div className="mx-auto max-w-wrap px-[clamp(1.25rem,4vw,4rem)] py-[clamp(4rem,10vw,8rem)]">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={SPRING}
          className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-paper/60"
        >
          Limited weddings each season
        </motion.span>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          <SplitText
            as="h2"
            unit="word"
            lines={['Hold your', 'date in', 'pigment.']}
            className="mt-6 font-display text-[clamp(2.5rem,9vw,7rem)] font-light uppercase leading-[0.88] tracking-[-0.04em]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...SPRING, delay: 0.2 }}
          className="mt-[clamp(2rem,4vw,3rem)] flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="max-w-sm text-paper/70">
            Send your date, venue and a favourite photograph or two. I'll reply
            with availability and a quote shaped around your day.
          </p>
          <MagneticButton
            href={ENQUIRE_HREF}
            className="!bg-paper !text-ink hover:!bg-terracotta hover:!text-paper"
          >
            Enquire Now
          </MagneticButton>
        </motion.div>

        <div className="mt-[clamp(3rem,7vw,6rem)] flex flex-col gap-2 border-t border-paper/15 pt-8 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-paper/50 sm:flex-row sm:justify-between">
          <span>Watercolour Studio · Greater Sydney</span>
          <span>Archival cotton-rag · Lightfast pigment</span>
        </div>
      </div>
    </footer>
  )
}
