import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { Drop } from './Label.jsx'
import { SPRING } from '../lib/site.js'
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
    <section id="offerings" className="relative w-full px-[5vw] pt-[clamp(3rem,6vw,5.5rem)] pb-[clamp(5rem,10vw,9rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 50% at 88% 8%, rgba(194,97,60,0.07) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 55% 45% at 12% 92%, rgba(110,140,168,0.06) 0%, transparent 55%)',
        }}
      />
      <Label gradient={['#6E8CA8', '#C2613C']}>{PACKAGES.label}</Label>
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

      {/* ── Mobile: base package as an overlapping editorial pull-quote ──────
          The offer leads — the package name reads as display art, with the
          price kept as a quiet, confident detail rather than the loudest thing
          on the page. A glass card slides up to overlap it. */}
      <div className="relative mt-[clamp(3.5rem,12vw,5rem)] lg:hidden">
        <motion.div {...reveal()} className="relative z-10 max-w-[20rem] pl-1">
          <p className="font-display text-[clamp(2.4rem,11vw,3.4rem)] font-bold leading-[0.95] text-ink">
            {PACKAGES.base.title}
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-ink-soft">
              {PACKAGES.base.priceSmall}
            </span>
            <span className="font-display text-[1.4rem] leading-none text-ink">
              {PACKAGES.base.price}
            </span>
          </p>
        </motion.div>
        <motion.div
          {...reveal(1)}
          className="relative z-20 mt-4 max-w-[calc(100vw-5vw*2)] overflow-hidden rounded-2xl border border-line/60 p-6 shadow-[0_24px_50px_-20px_rgba(150,85,43,0.28)]"
          style={{
            background: 'rgba(244,239,230,0.72)',
            backdropFilter: 'blur(18px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
          }}
        >
          <p className="text-sm text-ink-soft">{PACKAGES.base.note}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {PACKAGES.base.facts.map((f) => (
              <span
                key={f}
                className="border border-line/70 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-ink-soft"
              >
                {f}
              </span>
            ))}
          </div>
          <ul className="mt-6 flex flex-col gap-3 border-t border-line/60 pt-6 text-sm text-ink/85">
            {PACKAGES.base.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <Drop className="mt-0.5 h-4 w-auto shrink-0" gradient={['#6E8CA8', '#C2613C']} />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-12 gap-8">
        {/* Base package card — desktop only; mobile uses the pull-quote above. */}
        <motion.article
          {...reveal()}
          className="col-span-12 hidden flex-col overflow-hidden rounded-2xl border border-line/60 p-8 shadow-[0_24px_50px_-20px_rgba(150,85,43,0.22)] lg:col-span-5 lg:flex"
          style={{
            background: 'rgba(244,239,230,0.72)',
            backdropFilter: 'blur(18px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
          }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-3xl font-normal text-ink">
              {PACKAGES.base.title}
            </h3>
            <p className="shrink-0 text-right">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
                {PACKAGES.base.priceSmall}{' '}
              </span>
              <span className="font-display text-3xl leading-none text-ink">
                {PACKAGES.base.price}
              </span>
            </p>
          </div>
          <p className="mt-2 text-sm text-ink-soft">{PACKAGES.base.note}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {PACKAGES.base.facts.map((f) => (
              <span
                key={f}
                className="border border-line/70 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-ink-soft"
              >
                {f}
              </span>
            ))}
          </div>
          <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-line/60 pt-7 text-sm text-ink/85">
            {PACKAGES.base.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <Drop className="mt-0.5 h-4 w-auto shrink-0" gradient={['#6E8CA8', '#C2613C']} />
                {b}
              </li>
            ))}
          </ul>
        </motion.article>

        {/* Included as standard */}
        <motion.div
          {...reveal(1)}
          className="col-span-12 flex flex-col overflow-hidden rounded-2xl border border-line/60 p-8 shadow-[0_24px_50px_-20px_rgba(150,85,43,0.22)] lg:col-span-7"
          style={{
            background: 'rgba(244,239,230,0.72)',
            backdropFilter: 'blur(18px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
          }}
        >
          <h3 className="font-display text-2xl font-normal text-ink">
            {PACKAGES.included.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            {PACKAGES.included.sub}
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {PACKAGES.included.items.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-ink/85">
                <Drop className="mt-0.5 h-4 w-auto shrink-0" gradient={['#7E8B62', '#AEBF56']} />
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
        <h3 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-bold uppercase tracking-tight text-ink">
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
              <h4 className="font-display text-xl font-normal text-ink [overflow-wrap:anywhere]">{a.h}</h4>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{a.p}</p>
            <p className="mt-5 font-mono text-sm text-rust">
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
