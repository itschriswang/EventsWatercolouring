import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { Drop } from './Label.jsx'
import MagneticButton from './MagneticButton.jsx'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'
import { PACKAGES } from '../content.js'

/**
 * Packages — one base package, an "included as standard" grid, and an irregular
 * add-on grid with strong ink borders, like a premium physical catalogue.
 */
export default function Packages() {
  const reduce = useReducedMotion()
  const reveal = (i = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SPRING, delay: reduce ? 0 : i * 0.06 },
  })

  return (
    <section id="offerings" className="relative w-full px-[5vw] py-[clamp(4rem,10vw,9rem)]">
      <Label>{PACKAGES.label}</Label>
      <SplitText
        as="h2"
        unit="char"
        lines={PACKAGES.title}
        emphasis={PACKAGES.emphasis}
        className="display-lg mt-5 text-ink"
      />
      <motion.p
        {...reveal(1)}
        className="mt-8 max-w-2xl text-[clamp(1rem,1.1vw,1.15rem)] leading-relaxed text-ink-soft"
      >
        {PACKAGES.intro}
      </motion.p>

      <div className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-12 gap-8">
        {/* Base package card */}
        <motion.article
          {...reveal()}
          className="col-span-12 flex flex-col border-2 border-ink bg-paper p-8 lg:col-span-5"
        >
          <div className="flex items-start justify-between">
            <h3 className="font-display text-3xl font-light text-ink">
              {PACKAGES.base.title}
            </h3>
            <p className="text-right font-display text-4xl leading-none text-ink">
              <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
                {PACKAGES.base.priceSmall}
              </span>
              {PACKAGES.base.price}
            </p>
          </div>
          <p className="mt-2 text-sm text-ink-soft">{PACKAGES.base.note}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {PACKAGES.base.facts.map((f) => (
              <span
                key={f}
                className="border border-line px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-ink-soft"
              >
                {f}
              </span>
            ))}
          </div>
          <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-line pt-7 text-sm text-ink/85">
            {PACKAGES.base.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <Drop className="mt-0.5 h-4 w-auto shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <MagneticButton href={ENQUIRE_HREF}>Enquire</MagneticButton>
          </div>
        </motion.article>

        {/* Included as standard */}
        <motion.div
          {...reveal(1)}
          className="col-span-12 flex flex-col border border-line bg-paper-deep/40 p-8 lg:col-span-7"
        >
          <h3 className="font-display text-2xl font-light text-ink">
            {PACKAGES.included.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            {PACKAGES.included.sub}
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {PACKAGES.included.items.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-ink/85">
                <Drop className="mt-0.5 h-4 w-auto shrink-0" fill="#7E8B62" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.p {...reveal()} className="mt-10 max-w-2xl text-ink-soft">
        {PACKAGES.baseNote}
      </motion.p>

      {/* Add-ons */}
      <div className="mt-[clamp(3rem,7vw,5rem)] flex items-baseline justify-between border-b border-ink pb-4">
        <h3 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-light uppercase tracking-tight text-ink">
          {PACKAGES.addonsHead.title}
        </h3>
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-soft">
          {PACKAGES.addonsHead.note}
        </span>
      </div>

      <div className="grid grid-cols-12">
        {PACKAGES.addons.map((a, i) => (
          <motion.div
            key={a.h}
            {...reveal(i % 3)}
            className={
              'col-span-12 flex flex-col border-b border-line p-7 sm:col-span-6 lg:col-span-4 ' +
              // Strong vertical rules between catalogue cells.
              'lg:border-r ' +
              (i % 3 === 2 ? 'lg:border-r-0 ' : '') +
              (i % 2 === 1 ? 'sm:border-r-0 lg:border-r ' : 'sm:border-r ')
            }
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-display text-xl font-normal text-ink">{a.h}</h4>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{a.p}</p>
            <p className="mt-5 font-mono text-sm text-terracotta">
              {a.small && (
                <span className="mr-1 text-[0.6rem] uppercase tracking-[0.15em] text-ink-soft">
                  {a.small}
                </span>
              )}
              {a.tag}
              {a.extra && (
                <span className="ml-1 text-[0.6rem] uppercase tracking-[0.15em] text-ink-soft">
                  {a.extra}
                </span>
              )}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.p {...reveal()} className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
        <b className="text-ink">A note on style.</b>{' '}
        {PACKAGES.licence.replace('A note on style. ', '')}
      </motion.p>
    </section>
  )
}
