import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, asset } from '../lib/site.js'
import { EVENING } from '../content.js'

/**
 * "How the evening unfolds" — a sticky split-screen. A massive section title is
 * pinned on the left while the five beats scroll past on the right with
 * staggered reveals. Rust-drenched, with mix-blend numerals.
 */
export default function EveningTimeline() {
  const reduce = useReducedMotion()
  // On touch/small devices, the big overlay-blended numeral sits inside a beat
  // that translates on reveal — re-compositing the blend every frame stutters.
  // There we drop the blend modes and fade the beats in without a y translate.
  const lite = reduce || !useHeavyFx()

  return (
    <section
      id="night"
      className="relative w-full bg-rust px-[5vw] py-[clamp(4rem,8vw,7rem)] text-paper"
    >
      {/* faint bouquet cut, top-right. Clipped by its own wrapper rather than
          the section: putting overflow-hidden on the <section> would make it a
          scroll container and silently break the sticky title rail below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src={asset('assets/bloom-accent-1.png')}
          alt=""
          className={
            'absolute -right-[6vw] -top-[6vw] w-[34vw] max-w-[420px] opacity-20' +
            (lite ? '' : ' mix-blend-screen')
          }
        />
      </div>

      <div className="grid grid-cols-12 gap-x-8">
        {/* Sticky title rail */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Label gradient={['#C9A23A', '#F4EFE6']} className="!text-paper/70">
              {EVENING.label}
            </Label>
            <h2 className="mt-1 font-display text-[clamp(2.5rem,4vw,4.5rem)] font-bold uppercase leading-[0.85] tracking-tight">
              {EVENING.title[0]}
              <br />
              <em>{EVENING.title[1]}</em>
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-paper/80">
              {EVENING.lede}
            </p>
          </div>
        </div>

        {/* Scrolling beats */}
        <div className="col-span-12 mt-16 lg:col-span-7 lg:mt-0">
          {/* ── Mobile: asymmetric scatter ───────────────────────────────────
              Each beat alternates sides — a giant numeral pinned to one edge
              (allowed to bleed past the gutter), with the small description
              pinned to the opposite side. Varying top offsets break the grid
              so the eye travels diagonally down the page. */}
          <ol className="flex flex-col gap-14 sm:gap-16 lg:hidden">
            {EVENING.beats.map((beat, i) => {
              const numberLeft = i % 2 === 0
              // Hand-tuned vertical scatter so the column never reads as a list.
              const offset = ['mt-0', 'mt-2', 'mt-0', 'mt-3', 'mt-1'][i] || 'mt-0'
              return (
                <motion.li
                  key={beat.no}
                  initial={{ opacity: 0, y: lite ? 0 : 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={lite ? { duration: 0.4 } : { ...SPRING, delay: 0.05 }}
                  className={'relative ' + offset}
                >
                  <div
                    className={
                      'flex items-start justify-between gap-3 ' +
                      (numberLeft ? '' : 'flex-row-reverse')
                    }
                  >
                    <span
                      className={
                        'pointer-events-none block font-display text-[17vw] leading-[0.82] text-paper/50 tabular-nums ' +
                        (numberLeft ? '-ml-[1vw]' : '-mr-[1vw]')
                      }
                      aria-hidden="true"
                    >
                      {beat.no}
                    </span>
                    <p
                      className={
                        'mt-3 w-[42%] shrink-0 text-[0.76rem] leading-relaxed text-paper/75 ' +
                        (numberLeft ? 'text-right' : 'text-left')
                      }
                    >
                      {beat.body}
                    </p>
                  </div>
                  <h3
                    className={
                      'mt-1 font-display text-[2rem] font-normal leading-[0.95] ' +
                      (numberLeft ? 'text-left' : 'text-right')
                    }
                  >
                    {beat.title}
                  </h3>
                </motion.li>
              )
            })}
          </ol>

          {/* ── Desktop: the original beat list (unchanged) ──────────────── */}
          <ol className="hidden flex-col lg:flex">
            {EVENING.beats.map((beat) => (
              <motion.li
                key={beat.no}
                initial={{ opacity: 0, y: lite ? 0 : 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={lite ? { duration: 0.4 } : { ...SPRING, delay: 0.05 }}
                className="relative border-t border-paper/20 py-9"
              >
                <span
                  className="pointer-events-none absolute right-0 top-4 font-display text-[clamp(3rem,7vw,6rem)] leading-none text-paper/50 tabular-nums"
                  aria-hidden="true"
                >
                  {beat.no}
                </span>
                <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-normal leading-tight">
                  {beat.title}
                </h3>
                <p className="mt-3 max-w-lg leading-relaxed text-paper/80">
                  {beat.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
