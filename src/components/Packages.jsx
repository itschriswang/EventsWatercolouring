import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label, { Drop } from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, CARD_BG } from '../lib/site.js'
import { PACKAGES } from '../content.js'
import CornerBloom from './CornerBloom.jsx'
import Sparkles from './Sparkles.jsx'
import GlassPill from './GlassPill.jsx'
import GlassCardRim from './GlassCardRim.jsx'
import FolderCell from './FolderCell.jsx'
import NightPlanner from './NightPlanner.jsx'
import { withUnderline } from './Underline.jsx'
import usePinchZoomed from '../hooks/usePinchZoom.js'

// The add-on accordion opens on a quick ease-out tween rather than the shared
// SPRING — a spring that feels right for entrances reads as sluggish on a
// tap-to-reveal, where the row should snap open the moment it's asked.
const ACCORDION = { duration: 0.22, ease: [0.25, 1, 0.5, 1] }

export default function Packages() {
  const reduce = useReducedMotion()
  const zoomed = usePinchZoomed()
  const [openAddons, setOpenAddons] = useState(() => new Set())
  const toggleAddon = (i) =>
    setOpenAddons((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  const reveal = (i = 0) => ({
    // Reduced-motion resting state is visible (see CorporatePage rise()).
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 36 },
    whileInView: { opacity: 1, y: 0 },
    // Post-pinch, IO-driven reveals can strand invisible (see usePinchZoom);
    // `animate` bypasses the observer so the content always arrives.
    animate: zoomed ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, margin: '-60px' },
    transition: { ...SPRING, delay: reduce ? 0 : i * 0.06 },
  })

  return (
    <section id="offerings" className="relative isolate w-full px-[5vw] pt-[clamp(3rem,6vw,5.5rem)] pb-[clamp(5rem,10vw,9rem)]">
      {/* A richer bloom pooled behind the cards, over the section's ambient
          warm wash. The cards are opaque cream tiles, so this only shows in
          the gutters and margins around them — giving the negative space more
          colour so the bright tiles read with stronger contrast against it.
          `isolate` on the section keeps this -z-10 layer above the ambient
          WatercolourBloom but behind all the section's content. Blooms are
          ordered left→right along the palette arc (apricot → butter →
          yellow-green → periwinkle → lilac → blush) so every overlap is
          between hue neighbours, and a near-white cream radial lifts the
          centre where they meet so it glows rather than averaging to grey
          (Pastel Bloom anti-mud rules). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle 20vw at 50% 56%, rgba(255,252,242,0.5), transparent 66%), ' +
            'radial-gradient(circle 26vw at 10% 46%, rgba(247,195,148,0.20), transparent 70%), ' +
            'radial-gradient(circle 22vw at 30% 66%, rgba(226,232,138,0.18), transparent 70%), ' +
            'radial-gradient(circle 24vw at 47% 40%, rgba(212,226,130,0.20), transparent 70%), ' +
            'radial-gradient(circle 24vw at 65% 62%, rgba(216,218,236,0.18), transparent 72%), ' +
            'radial-gradient(circle 22vw at 82% 44%, rgba(210,196,232,0.18), transparent 72%), ' +
            'radial-gradient(circle 24vw at 94% 68%, rgba(244,196,210,0.18), transparent 72%)',
        }}
      />
      <Sparkles className="absolute right-[5vw] top-[clamp(3rem,6vw,5.5rem)] hidden h-12 w-12 md:block" />
      <Label gradient={['#D8DB7A', '#9BA03E']}>{PACKAGES.label}</Label>
      <SplitText
        as="h2"
        unit="char"
        lines={PACKAGES.title}
        emphasis={PACKAGES.emphasis}
        emphasisItalic
        inkBleed
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
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
              {PACKAGES.base.priceSmall}
            </span>
            <span className="font-mono text-[1.4rem] leading-none text-ink">
              {PACKAGES.base.price}
            </span>
          </p>
        </motion.div>
        <motion.div
          {...reveal(1)}
          className="relative z-20 mt-4 max-w-[calc(100vw-5vw*2)] overflow-hidden rounded-2xl border border-line p-6 shadow-[0_24px_50px_-20px_rgba(126,40,72,0.32)]"
          style={{ background: CARD_BG }}
        >
          <CornerBloom from="rgba(176,74,118,0.12)" to="rgba(140,54,86,0.08)" />
          <GlassCardRim />
          <div className="relative z-10">
            <p className="text-sm text-ink-soft">{PACKAGES.base.note}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PACKAGES.base.facts.map((f) => (
                <GlassPill key={f} className="px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-sage-deep">
                  {f}
                </GlassPill>
              ))}
            </div>
            <ul className="mt-6 flex flex-col gap-3 border-t border-line/60 pt-6 text-sm text-ink/85">
              {PACKAGES.base.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <Drop className="mt-0.5 h-4 w-auto shrink-0" gradient={['#D8DB7A', '#9BA03E']} />
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
                      transition={ACCORDION}
                      className="shrink-0 rounded-full bg-paper-deep/70 p-2"
                      aria-hidden="true"
                    >
                      <Drop className="h-3.5 w-auto" gradient={['#D8DB7A', '#9BA03E']} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`mobile-addon-${i}`}
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={ACCORDION}
                        className="overflow-hidden"
                      >
                        <p className={a.tag ? 'pb-3 text-xs leading-relaxed text-ink-soft' : 'pb-4 text-xs leading-relaxed text-ink-soft'}>
                          {a.p}
                        </p>
                        {a.tag && (
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
                        )}
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
        {/* Base package card — filed as a folder, tab flush-left */}
        <FolderCell
          as="article"
          label="The package"
          gradient={['#B04A76', '#8C3656']}
          bg={CARD_BG}
          reveal={reveal()}
          topGap="1.5rem"
          wrapperClassName="col-span-5"
          bloom={<CornerBloom from="rgba(176,74,118,0.12)" to="rgba(140,54,86,0.08)" />}
          contentClassName="flex h-full flex-col px-7 pb-7"
        >
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
              <GlassPill key={f} className="px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-sage-deep">
                {f}
              </GlassPill>
            ))}
          </div>
          <ul className="mt-6 flex flex-col gap-3 border-t border-line/60 pt-6 text-sm text-ink/85">
            {PACKAGES.base.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <Drop className="mt-0.5 h-4 w-auto shrink-0" gradient={['#D8DB7A', '#9BA03E']} />
                {b}
              </li>
            ))}
          </ul>
        </FolderCell>

        {/* Add-ons — right column. The folder tab carries the "Add-ons" name
            (as the card's heading), so the row below only needs the pricing note. */}
        <FolderCell
          label={PACKAGES.addonsHead.title}
          labelAs="h3"
          gradient={['#8A9143', '#5F662B']}
          bg={CARD_BG}
          reveal={reveal(1)}
          topGap="1.5rem"
          wrapperClassName="col-span-7"
          bloom={<CornerBloom from="rgba(176,172,66,0.10)" to="rgba(138,145,67,0.08)" />}
          contentClassName="flex h-full flex-col"
        >
            <div className="flex items-baseline justify-end border-b border-line/50 px-8 pb-5">
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
                  {a.tag && (
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
                  )}
                </motion.div>
              ))}
            </div>
        </FolderCell>
      </div>

      <NightPlanner />

      {/* FAQ pointer — a banner-scale card rather than a small pill, so it
          reads as the obvious next stop after the packages instead of a
          footnote. Same paper-card treatment as the package cards above so
          it sits in their family, with a readable sentient headline in
          place of the eyebrow-sized mono text. */}
      <FolderCell
        as="a"
        href="/faq/"
        label="FAQ"
        gradient={['#D8DB7A', '#9BA03E']}
        bg={CARD_BG}
        reveal={reveal()}
        hover={!reduce}
        wrapperClassName="group mt-12 w-full"
        bloom={<CornerBloom from="rgba(176,172,66,0.10)" to="rgba(232,155,99,0.09)" />}
        contentClassName="flex items-center justify-between gap-4 px-6 pb-6 sm:px-7 sm:pb-7"
      >
        <span className="relative z-10 flex items-center gap-4 sm:gap-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper shadow-[0_2px_10px_rgba(126,40,72,0.30)]"
            aria-hidden="true"
          >
            <Drop className="h-5 w-auto" gradient={['#D8DB7A', '#9BA03E']} />
          </span>
          <span>
            <span className="block font-sentient text-xl tracking-[-0.02em] text-ink sm:text-2xl">
              {withUnderline('Got a question? Read the FAQ', 'FAQ', {
                className: 'text-hero-flow',
              })}
            </span>
            <span className="mt-1 block text-sm text-ink-soft">
              Booking, travel, timing and materials, all answered plainly.
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className="relative z-10 shrink-0 text-2xl text-terracotta transition-transform duration-300 group-hover:translate-x-1.5"
        >
          →
        </span>
      </FolderCell>

      <motion.p {...reveal()} className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
        <b className="text-ink">A note on style.</b>{' '}
        {PACKAGES.licence.replace('A note on style. ', '')}
      </motion.p>
    </section>
  )
}
