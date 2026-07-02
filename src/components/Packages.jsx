import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { Drop } from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { PACKAGES } from '../content.js'
import CornerBloom from './CornerBloom.jsx'
import NightPlanner from './NightPlanner.jsx'
import { withUnderline } from './Underline.jsx'

export default function Packages() {
  const reduce = useReducedMotion()
  const [openAddons, setOpenAddons] = useState(() => new Set())
  const toggleAddon = (i) =>
    setOpenAddons((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  const reveal = (i = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SPRING, delay: reduce ? 0 : i * 0.06 },
  })

  return (
    <section id="offerings" className="relative w-full px-[5vw] pt-[clamp(3rem,6vw,5.5rem)] pb-[clamp(5rem,10vw,9rem)]">
      <Label gradient={['#6E8CA8', '#C2613C']}>{PACKAGES.label}</Label>
      <SplitText
        as="h2"
        unit="char"
        lines={PACKAGES.title}
        emphasis={PACKAGES.emphasis}
        emphasisItalic
        className="display-lg mt-5 text-ink"
      />
      <motion.p
        {...reveal(1)}
        className="mt-8 max-w-2xl text-[clamp(1rem,1.1vw,1.15rem)] leading-relaxed text-ink-soft"
      >
        {withUnderline(PACKAGES.intro, 'painted live', { className: 'text-rust' })}
      </motion.p>

      {/* ── Mobile: base package pull-quote + detail card ─────────────────── */}
      <div className="relative mt-[clamp(3.5rem,12vw,5rem)] lg:hidden">
        <motion.div {...reveal()} className="relative z-10 max-w-[20rem] pl-1">
          <p className="font-sentient text-2xl leading-tight tracking-[-0.02em] text-ink">
            {PACKAGES.base.title}
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-ink-soft">
              {PACKAGES.base.priceSmall}
            </span>
            <span className="font-mono text-[1.4rem] leading-none text-ink">
              {PACKAGES.base.price}
            </span>
          </p>
        </motion.div>
        <motion.div
          {...reveal(1)}
          className="relative z-20 mt-4 max-w-[calc(100vw-5vw*2)] overflow-hidden rounded-2xl border border-line/45 p-6 shadow-[0_24px_50px_-20px_rgba(173,98,49,0.32)]"
          style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 0%, #FBF8F2 0%, #F4EFE6 62%)' }}
        >
          <CornerBloom from="rgba(194,97,60,0.18)" to="rgba(110,140,168,0.13)" />
          <div className="relative z-10">
            <p className="text-sm text-ink-soft">{PACKAGES.base.note}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PACKAGES.base.facts.map((f) => (
                <span
                  key={f}
                  className="border border-lime/40 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-sage-deep"
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
          </div>
        </motion.div>

        {/* Mobile add-ons — every add-on name is visible up front, and each
            drops open independently to reveal its description and price.
            All eight are scannable at a glance; nothing is hidden behind a
            single group toggle, and pricing stays tucked away until you
            actually open one up. */}
        <motion.div {...reveal(2)} className="mt-8">
          <div className="flex items-baseline justify-between border-b border-ink pb-3">
            <h3 className="font-sentient text-xl tracking-[-0.02em] text-ink">
              {PACKAGES.addonsHead.title}
            </h3>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
              {PACKAGES.addonsHead.note}
            </span>
          </div>
          <ul>
            {PACKAGES.addons.map((a, i) => {
              const isOpen = openAddons.has(i)
              return (
                <motion.li key={a.h} {...reveal(i % 3)} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => toggleAddon(i)}
                    aria-expanded={isOpen}
                    aria-controls={`mobile-addon-${i}`}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="font-sentient text-base tracking-[-0.01em] text-ink">
                      {a.h}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={SPRING}
                      className="shrink-0 rounded-full bg-paper-deep/70 p-2"
                      aria-hidden="true"
                    >
                      <Drop className="h-3.5 w-auto" gradient={['#C9A23A', '#C2613C']} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`mobile-addon-${i}`}
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={SPRING}
                        className="overflow-hidden"
                      >
                        <p className="pb-3 text-xs leading-relaxed text-ink-soft">{a.p}</p>
                        <p className="pb-4 text-xs text-rust">
                          {a.small && (
                            <span className="mr-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-ink-soft">
                              {a.small}
                            </span>
                          )}
                          <span className="font-mono">{a.tag}</span>
                          {a.extra && (
                            <span className="ml-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-ink-soft">
                              {a.extra}
                            </span>
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>
      </div>

      {/* ── Desktop: base package left, add-ons right ────────────────────── */}
      <div className="mt-[clamp(2.5rem,6vw,4rem)] hidden grid-cols-12 gap-8 lg:grid">
        {/* Base package card */}
        <motion.article
          {...reveal()}
          className="relative col-span-5 flex flex-col overflow-hidden rounded-2xl border border-line/45 p-7 shadow-[0_24px_50px_-20px_rgba(173,98,49,0.25)]"
          style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 0%, #FBF8F2 0%, #F4EFE6 62%)' }}
        >
          <CornerBloom from="rgba(194,97,60,0.18)" to="rgba(110,140,168,0.13)" />
          <div className="relative z-10 flex flex-1 flex-col">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">
                {PACKAGES.base.title}
              </h3>
              <p className="shrink-0 text-right">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
                  {PACKAGES.base.priceSmall}{' '}
                </span>
                <span className="font-mono text-3xl leading-none text-ink">
                  {PACKAGES.base.price}
                </span>
              </p>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{PACKAGES.base.note}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PACKAGES.base.facts.map((f) => (
                <span
                  key={f}
                  className="border border-lime/40 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-sage-deep"
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
          </div>
        </motion.article>

        {/* Add-ons — right column, replacing "Included as standard" */}
        <motion.div
          {...reveal(1)}
          className="relative col-span-7 overflow-hidden rounded-2xl border border-line/45 shadow-[0_24px_50px_-20px_rgba(173,98,49,0.25)]"
          style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 0%, #FBF8F2 0%, #F4EFE6 62%)' }}
        >
          <CornerBloom from="rgba(201,162,58,0.16)" to="rgba(110,140,168,0.13)" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-baseline justify-between border-b border-line/50 px-8 pb-5 pt-8">
              <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">
                {PACKAGES.addonsHead.title}
              </h3>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                {PACKAGES.addonsHead.note}
              </span>
            </div>
            <div className="grid flex-1 grid-cols-2">
              {PACKAGES.addons.map((a, i) => (
                <motion.div
                  key={a.h}
                  {...reveal(i % 2)}
                  className={
                    'flex flex-col border-b border-line/50 p-6 ' +
                    (i % 2 === 0 ? 'border-r ' : '')
                  }
                >
                  <h4 className="font-sentient text-base tracking-[-0.01em] text-ink [overflow-wrap:anywhere]">{a.h}</h4>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-soft">{a.p}</p>
                  <p className="mt-4 text-xs text-rust">
                    {a.small && (
                      <span className="mr-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-ink-soft">
                        {a.small}
                      </span>
                    )}
                    <span className="font-mono">{a.tag}</span>
                    {a.extra && (
                      <span className="ml-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-ink-soft">
                        {a.extra}
                      </span>
                    )}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <NightPlanner />

      {/* FAQ pointer — the eyebrow-icon + arrow-on-hover device used
          throughout the site (Label's Drop icon, SealButton's arrow),
          rather than a link buried mid-sentence. */}
      <motion.a
        href="/faq/"
        {...reveal()}
        whileHover={reduce ? {} : { y: -2 }}
        transition={SPRING}
        className="group mt-10 inline-flex items-center gap-3 rounded-full border border-line/60 bg-paper-deep/40 py-2.5 pl-2.5 pr-5 shadow-[0_10px_24px_-16px_rgba(173,98,49,0.35)] transition-colors duration-300 hover:border-terracotta/40 hover:bg-paper-deep/70"
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper"
          aria-hidden="true"
        >
          <Drop className="h-4 w-auto" gradient={['#C9A23A', '#C2613C']} />
        </span>
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-ink">
          Got a question? Check the FAQ
        </span>
        <span
          aria-hidden="true"
          className="text-ink transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </motion.a>

      <motion.p {...reveal()} className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
        <b className="text-ink">A note on style.</b>{' '}
        {PACKAGES.licence.replace('A note on style. ', '')}
      </motion.p>
    </section>
  )
}
