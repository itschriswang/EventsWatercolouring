import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, asset } from '../lib/site.js'
import { BEYOND } from '../content.js'

/** "Beyond weddings" — a teal-drenched block of three cards. */
export default function BeyondWeddings() {
  const reduce = useReducedMotion()

  return (
    <section
      id="beyond"
      className="relative w-full overflow-hidden bg-teal px-[5vw] py-[clamp(4rem,10vw,9rem)] text-paper"
    >
      <img
        src={asset('assets/art-bouquet_transparent.webp')}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[6vw] -left-[5vw] w-[32vw] max-w-[400px] opacity-20 mix-blend-soft-light"
      />

      <Label fill="#F4EFE6" className="!text-paper/70">
        {BEYOND.label}
      </Label>
      <SplitText
        as="h2"
        unit="char"
        lines={BEYOND.title}
        emphasis={BEYOND.emphasis}
        className="display-lg mt-5 text-paper"
      />
      <motion.p
        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={SPRING}
        className="mt-8 max-w-2xl leading-relaxed text-paper/80"
      >
        {BEYOND.intro}
      </motion.p>

      <div className="mt-[clamp(2.5rem,6vw,5rem)] grid grid-cols-12 gap-6">
        {BEYOND.cards.map((card, i) => (
          <motion.article
            key={card.tag}
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ ...SPRING, delay: reduce ? 0 : i * 0.1 }}
            whileHover={reduce ? {} : { y: -8 }}
            className={
              'col-span-12 flex flex-col border border-paper/25 p-7 backdrop-blur-sm sm:col-span-6 lg:col-span-4 ' +
              (i === 1 ? 'lg:mt-10' : i === 2 ? 'lg:mt-5' : '')
            }
          >
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-paper/60">
              {card.tag}
            </span>
            <h3 className="mt-4 font-display text-[clamp(1.4rem,2vw,2rem)] font-light leading-tight">
              {card.title}
            </h3>
            <p className="mt-3 leading-relaxed text-paper/80">{card.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
