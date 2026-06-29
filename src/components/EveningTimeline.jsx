import { motion, useReducedMotion } from 'framer-motion'
import Label, { Drop } from './Label.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, asset } from '../lib/site.js'
import { EVENING } from '../content.js'

/**
 * "How the evening runs" — a sticky split-screen. A massive section title is
 * pinned on the left while the beats run down the right as a vertical tracking
 * timeline: a spine, numbered dots that fill as each beat scrolls into view
 * (like watching a parcel move through its stops), and a destination marker on
 * the final beat. Rust-drenched, single layout from phone to desktop so the
 * two never drift apart.
 */
export default function EveningTimeline() {
  const reduce = useReducedMotion()
  // On touch/small devices we keep the entrances simple: a fade with no y
  // translate, and the dot fills on reveal rather than animating its ring.
  const lite = reduce || !useHeavyFx()
  const beats = EVENING.beats

  return (
    <section
      id="night"
      className="relative w-full bg-rust px-[5vw] py-[clamp(4rem,8vw,7rem)] text-paper"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 8% 5%, rgba(201,162,58,0.14) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 50% at 92% 90%, rgba(108,42,62,0.20) 0%, transparent 55%)',
        }}
      />
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

        {/* Tracking timeline — one layout, mobile through desktop. The spine
            sits behind the dots; each step reveals on scroll and fills its dot,
            so the eye reads top-to-bottom like a delivery tracker. */}
        <div className="col-span-12 mt-12 lg:col-span-7 lg:mt-0">
          <ol className="relative">
            {/* Spine: a single line down the dot column. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-6 left-[1.125rem] top-3 w-px bg-paper/25"
            />
            {beats.map((beat, i) => {
              const isLast = i === beats.length - 1
              return (
                <motion.li
                  key={beat.no}
                  initial={{ opacity: 0, y: lite ? 0 : 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={
                    lite ? { duration: 0.4 } : { ...SPRING, delay: 0.05 }
                  }
                  className="relative flex gap-5 pb-10 last:pb-0 sm:gap-6"
                >
                  {/* Step marker. Each dot pops in as its beat reveals, so the
                      column reads like a tracker filling in stop by stop; the
                      final beat becomes a filled orchid — the destination. */}
                  <motion.span
                    initial={lite ? false : { scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-90px' }}
                    transition={lite ? { duration: 0.3 } : { ...SPRING, delay: 0.12 }}
                    className="relative z-10 shrink-0"
                    aria-hidden="true"
                  >
                    {isLast ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper shadow-[0_2px_12px_rgba(100,40,15,0.45)]">
                        <Drop
                          className="h-5 w-auto"
                          gradient={['#C2613C', '#A4502F']}
                        />
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 bg-paper font-mono text-[0.7rem] font-bold uppercase tracking-[0.05em] text-rust shadow-[0_2px_12px_rgba(100,40,15,0.35)]">
                        {beat.no}
                      </span>
                    )}
                  </motion.span>

                  {/* Step card — minimal chrome so the column reads light. */}
                  <motion.div
                    whileHover={reduce ? {} : { y: -3 }}
                    transition={SPRING}
                    className="-mt-px flex-1 rounded-2xl bg-paper/[0.06] p-4 sm:p-5"
                  >
                    <h3 className="font-display text-[clamp(1.25rem,2.4vw,1.9rem)] font-normal leading-tight">
                      {beat.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-paper/80">
                      {beat.body}
                    </p>
                  </motion.div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
