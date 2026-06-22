import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { SPRING, asset } from '../lib/site.js'
import { EVENING } from '../content.js'

/**
 * "How the evening unfolds" — a sticky split-screen. A massive section title is
 * pinned on the left while the five beats scroll past on the right with
 * staggered reveals. Rust-drenched, with mix-blend numerals.
 */
export default function EveningTimeline() {
  const reduce = useReducedMotion()

  return (
    <section
      id="night"
      className="relative w-full overflow-hidden bg-rust px-[5vw] py-[clamp(4rem,10vw,9rem)] text-paper"
    >
      {/* faint bouquet cut, top-right */}
      <img
        src={asset('assets/art-bouquet_transparent.webp')}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-[6vw] -top-[6vw] w-[34vw] max-w-[420px] opacity-20 mix-blend-soft-light"
      />

      <div className="grid grid-cols-12 gap-x-8">
        {/* Sticky title rail */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Label fill="#F4EFE6" className="!text-paper/70">
              {EVENING.label}
            </Label>
            <h2 className="mt-6 font-display text-[clamp(2.5rem,7vw,6.5rem)] font-light uppercase leading-[0.85] tracking-tight">
              {EVENING.title[0]}
              <br />
              <em>{EVENING.title[1]}</em>
            </h2>
            <p className="mt-8 max-w-md leading-relaxed text-paper/80">
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
                initial={{ opacity: 0, y: reduce ? 0 : 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ ...SPRING, delay: reduce ? 0 : 0.05 }}
                className="relative border-t border-paper/20 py-9"
              >
                <span
                  className="pointer-events-none absolute right-0 top-4 font-display text-[clamp(4rem,9vw,8rem)] font-light leading-none text-paper opacity-20 mix-blend-overlay"
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
