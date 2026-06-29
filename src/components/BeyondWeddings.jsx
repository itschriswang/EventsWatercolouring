import { motion, useReducedMotion } from 'framer-motion'
import Label, { Drop } from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, asset } from '../lib/site.js'
import { BEYOND } from '../content.js'

/** "Beyond weddings" — a teal-drenched block of three cards. */
export default function BeyondWeddings() {
  const reduce = useReducedMotion()

  return (
    <section
      id="beyond"
      className="relative w-full overflow-hidden bg-rose px-[5vw] pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(5rem,11vw,10rem)] text-paper"
    >
      <img
        src={asset('assets/bloom-accent-1.png')}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[6vw] -left-[5vw] w-[32vw] max-w-[400px] opacity-25 mix-blend-screen"
      />
      <img
        src={asset('assets/bloom-accent-2.png')}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[6vw] -right-[5vw] w-[38vw] max-w-[460px] opacity-30 mix-blend-screen"
      />

      <Label gradient={['#F4EFE6', '#E4889C']} className="!text-paper/70">
        {BEYOND.label}
      </Label>
      <SplitText
        as="h2"
        unit="char"
        lines={BEYOND.title}
        emphasis={BEYOND.emphasis}
        emphasisClassName="text-wine"
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
            className={[
              // Lighter chrome than a bordered box: a soft rounded panel so the
              // three cards read as a set, not stacked outlines. backdrop-blur
              // is costly on mobile, so enable it only from md up over a faint fill.
              'col-span-12 flex flex-col rounded-2xl bg-paper/[0.07] p-7 md:bg-paper/[0.05] md:backdrop-blur-sm sm:col-span-6',
              // Asymmetric widths + dramatic vertical drop so the three cards
              // read as a cascading staircase, not three equal siblings.
              i === 0 ? 'lg:col-span-4'
              : i === 1 ? 'lg:col-span-5 lg:mt-24'
              : 'lg:col-span-3 lg:mt-10',
            ].join(' ')}
          >
            <Drop
              className="h-5 w-5 self-start"
              gradient={['#F4EFE6', '#E4889C']}
              aria-hidden="true"
            />
            <span className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-paper/60">
              {card.tag}
            </span>
            <h3 className="mt-4 font-display text-[clamp(1.4rem,2vw,2rem)] font-normal leading-tight">
              {card.title}
            </h3>
            <p className="mt-3 leading-relaxed text-paper/80">{card.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
