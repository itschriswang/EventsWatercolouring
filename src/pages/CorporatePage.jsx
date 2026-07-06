import { motion, useReducedMotion } from 'framer-motion'
import GrainOverlay from '../components/GrainOverlay.jsx'
import ScrollProgress from '../components/ScrollProgress.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import MobileNav from '../components/MobileNav.jsx'
import WatercolourBloom from '../components/WatercolourBloom.jsx'
import SectionWash from '../components/SectionWash.jsx'
import DeckleEdge from '../components/DeckleEdge.jsx'
import Label, { Drop } from '../components/Label.jsx'
import SplitText from '../components/SplitText.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import CornerBloom from '../components/CornerBloom.jsx'
import Sparkles from '../components/Sparkles.jsx'
import EnquireForm from '../components/EnquireForm.jsx'
import Footer from '../components/Footer.jsx'
import { SPRING, asset } from '../lib/site.js'
import { withUnderline } from '../components/Underline.jsx'
import { CORPORATE } from '../content.js'

// The card ground shared with the homepage's package cards, so the two pages
// read as one paper system.
const CARD_BG = { background: 'linear-gradient(150deg, rgba(158,201,223,0.18) 0%, rgba(216,198,234,0.13) 48%, rgba(242,194,207,0.14) 100%), radial-gradient(ellipse 120% 90% at 50% 0%, #FDFBF7 0%, #F7F4EF 62%)' }

/**
 * The corporate landing page (/corporate/) — a standalone static page like
 * /faq/, aimed at planners, marketers and EAs rather than couples. Same
 * paper, same pigments, same components; different argument. No preloader:
 * this audience is skimming at their desk, so the page opens ready. The
 * enquiry card is the same reply card as the homepage, opened with the
 * corporate option preselected.
 */
export default function CorporatePage() {
  const reduce = useReducedMotion()

  const rise = (i = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { ...SPRING, delay: reduce ? 0 : i * 0.06 },
  })

  return (
    <div className="relative min-h-screen bg-paper">
      <GrainOverlay />
      <ScrollProgress />
      <SiteHeader revealed enquireHref="#enquiry" />
      <MobileNav revealed enquireHref="#enquiry" />

      <main className="relative z-10 pb-28 md:pb-0">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-x-clip px-[5vw] pt-[clamp(6rem,14vw,9rem)] pb-[clamp(2.5rem,5vw,4.5rem)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage:
                'radial-gradient(42% 36% at 14% 22%, rgba(158,201,223, 0.32), transparent 72%), ' +
                'radial-gradient(32% 28% at 88% 12%, rgba(216,198,234, 0.30), transparent 72%), ' +
                'radial-gradient(34% 30% at 86% 84%, rgba(140,158,214, 0.24), transparent 72%), ' +
                'radial-gradient(30% 28% at 6% 88%, rgba(93,157,218, 0.20), transparent 72%), ' +
                'radial-gradient(28% 24% at 60% 6%, rgba(247,212,174, 0.22), transparent 72%)',
            }}
          />
          <div className="relative z-10 grid grid-cols-12 items-end gap-x-8 gap-y-12">
            <div className="col-span-12 lg:col-span-7">
              <span className="eyebrow">{CORPORATE.eyebrow}</span>
              <div className="relative mt-5">
                <Sparkles
                  delay={0.6}
                  className="absolute -top-7 right-[8%] hidden h-12 w-12 text-ochre sm:block"
                />
                <SplitText
                  as="h1"
                  unit="char"
                  playOnMount
                  lines={CORPORATE.lines}
                  emphasis={CORPORATE.emphasis}
                  emphasisItalic
                  className="display-xl text-ink"
                />
              </div>
              <motion.div {...rise(2)}>
                <p className="mt-7 max-w-xl text-[clamp(1rem,1.15vw,1.2rem)] leading-relaxed text-ink-soft">
                  {withUnderline(CORPORATE.lede, 'live in watercolour', { className: 'text-rust' })}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <MagneticButton href="#enquiry">{CORPORATE.cta}</MagneticButton>
                </div>
                <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft/85">
                  {CORPORATE.note}
                </p>
              </motion.div>
            </div>

            {/* One study card — proof of the hand, not a gallery. */}
            <motion.figure
              initial={{ opacity: 0, y: reduce ? 0 : 45, rotate: reduce ? 0 : 3 }}
              animate={{ opacity: 1, y: 0, rotate: reduce ? 0 : 3 }}
              transition={{ ...SPRING, delay: 0.35 }}
              whileHover={reduce ? {} : { rotate: 0, scale: 1.02 }}
              className="relative col-span-8 col-start-3 sm:col-span-5 sm:col-start-7 lg:col-span-3 lg:col-start-9 overflow-hidden rounded-[1.25rem] border border-line bg-paper-deep shadow-[0_28px_52px_-18px_rgba(61,101,158,0.30),0_6px_16px_-6px_rgba(61,101,158,0.12)]"
            >
              <CornerBloom from="rgba(56,109,180,0.16)" to="rgba(110,128,192,0.12)" overlay />
              <div className="relative z-10">
                <picture>
                  <source srcSet={asset('assets/art-character-girl.webp')} type="image/webp" />
                  <img
                    src={asset('assets/art-character-girl.jpg')}
                    alt="A small watercolour character study in olive green and ochre."
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </picture>
                <figcaption className="bg-paper px-3 py-2 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-ink-soft">
                  Painted live · Cotton paper
                </figcaption>
              </div>
            </motion.figure>
          </div>
        </section>

        <SectionWash mask="linear-gradient(to bottom, transparent 0%, black 25%, black 100%)">
          {/* ── Why it works ───────────────────────────────────────────── */}
          <section className="relative w-full px-[5vw] py-[clamp(3rem,7vw,6rem)]">
            <Label gradient={['#386DB4', '#DFA455']}>{CORPORATE.why.label}</Label>
            <SplitText
              as="h2"
              unit="char"
              lines={CORPORATE.why.title}
              emphasis={CORPORATE.why.emphasis}
              emphasisItalic
              className="display-lg mt-5 text-ink"
            />
            <div className="mt-[clamp(2rem,5vw,3.5rem)] grid grid-cols-1 gap-6 sm:grid-cols-3">
              {CORPORATE.why.cards.map((c, i) => (
                <motion.article
                  key={c.h}
                  {...rise(i)}
                  className="relative overflow-hidden rounded-2xl border border-line/45 p-6 shadow-[0_24px_50px_-20px_rgba(61,101,158,0.25)] sm:p-7"
                  style={CARD_BG}
                >
                  <CornerBloom from="rgba(56,109,180,0.16)" to="rgba(110,128,192,0.11)" />
                  <div className="relative z-10">
                    <Drop className="h-5 w-auto" gradient={['#386DB4', '#DFA455']} />
                    <h3 className="mt-4 font-sentient text-2xl tracking-[-0.02em] text-ink">{c.h}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.p}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          {/* ── Occasions ──────────────────────────────────────────────── */}
          <section className="relative w-full px-[5vw] py-[clamp(2.5rem,6vw,5rem)]">
            <div className="grid grid-cols-12 gap-x-8 gap-y-10">
              <div className="col-span-12 lg:col-span-5">
                <Label gradient={['#DFA455', '#386DB4']}>{CORPORATE.occasions.label}</Label>
                <SplitText
                  as="h2"
                  unit="char"
                  lines={CORPORATE.occasions.title}
                  emphasis={CORPORATE.occasions.emphasis}
                  emphasisItalic
                  className="display-lg mt-5 text-ink"
                />
                <motion.p {...rise(1)} className="mt-6 max-w-md leading-relaxed text-ink-soft">
                  {CORPORATE.occasions.note}
                </motion.p>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                <ul className="flex flex-col">
                  {CORPORATE.occasions.items.map((item, i) => (
                    <motion.li
                      key={item}
                      {...rise(i % 3)}
                      className="flex items-center gap-4 border-b border-line py-4 first:border-t"
                    >
                      <Drop className="h-4 w-auto shrink-0" gradient={['#386DB4', '#DFA455']} />
                      <span className="font-sentient text-xl tracking-[-0.01em] text-ink sm:text-2xl">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </SectionWash>

        {/* Hard editorial break onto the deeper ground, same as the
            homepage's packages-and-enquiry sheet. */}
        <div className="relative bg-paper-deep">
          <DeckleEdge className="absolute inset-x-0 top-0 z-10 h-[18px] w-full md:h-6" />
          <SectionWash>
            {/* ── How it runs ──────────────────────────────────────────── */}
            <section className="relative w-full px-[5vw] pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(1rem,3vw,2rem)]">
              <Label gradient={['#386DB4', '#DFA455']}>{CORPORATE.how.label}</Label>
              <SplitText
                as="h2"
                unit="char"
                lines={CORPORATE.how.title}
                emphasis={CORPORATE.how.emphasis}
                emphasisItalic
                className="display-lg mt-5 text-ink"
              />
              <div className="mt-[clamp(2rem,5vw,3.5rem)] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {CORPORATE.how.steps.map((s, i) => (
                  <motion.div key={s.no} {...rise(i)} className="flex flex-col">
                    <span className="num-wide text-3xl text-rust">{s.no}</span>
                    <h3 className="mt-3 font-sentient text-xl tracking-[-0.01em] text-ink">{s.h}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.p}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── The engagement ───────────────────────────────────────── */}
            <section className="relative w-full px-[5vw] pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2rem,4vw,3rem)]">
              <Label gradient={['#386DB4', '#DFA455']}>{CORPORATE.offer.label}</Label>
              <SplitText
                as="h2"
                unit="char"
                lines={CORPORATE.offer.title}
                emphasis={CORPORATE.offer.emphasis}
                emphasisItalic
                className="display-lg mt-5 text-ink"
              />
              <div className="mt-[clamp(2rem,5vw,3.5rem)] grid grid-cols-12 gap-8">
                <motion.article
                  {...rise()}
                  className="relative col-span-12 flex flex-col overflow-hidden rounded-2xl border border-line/45 p-7 shadow-[0_24px_50px_-20px_rgba(61,101,158,0.32)] lg:col-span-5"
                  style={CARD_BG}
                >
                  <CornerBloom from="rgba(56,109,180,0.18)" to="rgba(110,128,192,0.12)" />
                  <div className="relative z-10 flex flex-1 flex-col">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">
                        {CORPORATE.offer.base.title}
                      </h3>
                      <p className="shrink-0 text-right">
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
                          {CORPORATE.offer.base.priceSmall}{' '}
                        </span>
                        <span className="font-mono text-3xl leading-none text-ink">
                          {CORPORATE.offer.base.price}
                        </span>
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {CORPORATE.offer.base.facts.map((f) => (
                        <span
                          key={f}
                          className="border border-lime/40 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-sage-deep"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-6 flex flex-col gap-3 border-t border-line/60 pt-6 text-sm text-ink/85">
                      {CORPORATE.offer.base.bullets.map((b) => (
                        <li key={b} className="flex gap-3">
                          <Drop className="mt-0.5 h-4 w-auto shrink-0" gradient={['#386DB4', '#DFA455']} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.article>

                <motion.div
                  {...rise(1)}
                  className="relative col-span-12 overflow-hidden rounded-2xl border border-line/45 shadow-[0_24px_50px_-20px_rgba(61,101,158,0.25)] lg:col-span-7"
                  style={CARD_BG}
                >
                  <CornerBloom from="rgba(223,164,85,0.16)" to="rgba(110,128,192,0.12)" />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="border-b border-line/50 px-7 pb-5 pt-7">
                      <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">
                        {CORPORATE.offer.scale.h}
                      </h3>
                    </div>
                    <div className="grid flex-1 grid-cols-1 sm:grid-cols-2">
                      {CORPORATE.offer.scale.items.map((a, i) => (
                        <div
                          key={a.h}
                          className={
                            'flex flex-col border-b border-line/50 p-6 ' +
                            (i % 2 === 0 ? 'sm:border-r ' : '')
                          }
                        >
                          <h4 className="font-sentient text-base tracking-[-0.01em] text-ink">{a.h}</h4>
                          <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-soft">{a.p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.p {...rise()} className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-soft">
                {CORPORATE.offer.note}
              </motion.p>
            </section>

            <EnquireForm
              initialPackage="Corporate event or brand activation"
              dateLabel="Event date"
            />
          </SectionWash>
        </div>
      </main>

      <Footer enquireHref="#enquiry" />
    </div>
  )
}
