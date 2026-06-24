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
      className="relative w-full overflow-hidden bg-rust px-[5vw] py-[clamp(4rem,8vw,7rem)] text-paper"
    >
      {/* faint bouquet cut, top-right */}
      <img
        src={asset('assets/art-bouquet_transparent.webp')}
        alt=""
        aria-hidden="true"
        className={
          'pointer-events-none absolute -right-[6vw] -top-[6vw] w-[34vw] max-w-[420px] opacity-20' +
          (lite ? '' : ' mix-blend-soft-light')
        }
      />

      <div className="grid grid-cols-12 gap-x-8">
        {/* Sticky title rail */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Label gradient={['#C9A23A', '#F4EFE6']} className="!text-paper/70">
              {EVENING.label}
            </Label>
            <h2 className="mt-1 font-display text-[clamp(2.5rem,4vw,4.5rem)] font-light uppercase leading-[0.85] tracking-tight">
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
        <div className="col-span-12 mt-14 lg:col-span-7 lg:mt-0">
          <ol className="flex flex-col">
            {EVENING.beats.map((beat, i) => (
              <motion.li
                key={beat.no}
                initial={{ opacity: 0, y: lite ? 0 : 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={lite ? { duration: 0.4 } : { ...SPRING, delay: 0.05 }}
                className="relative border-t border-paper/20 py-9"
              >
                <span
                  className={
                    'pointer-events-none absolute right-0 top-4 font-display text-[clamp(4rem,9vw,8rem)] font-light leading-none text-paper opacity-20 tabular-nums' +
                    (lite ? '' : ' mix-blend-overlay')
                  }
                  aria-hidden="true"
                >
                  {beat.no}
                </span>
                <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-light leading-tight">
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
