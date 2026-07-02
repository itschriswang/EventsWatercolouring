import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { Drop } from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'

/**
 * The same terracotta → ochre → rust → blush → dusty-pink wash used to sit
 * on the shared <ul> background — sampled per-card instead, so each cell
 * carries its own slice of the wash rather than the whole list sharing one
 * background that shows through (and blurs into) the gaps between cards.
 */
const WASH_STOPS = [
  { at: 0, rgb: [194, 97, 60], a: 0.22 },
  { at: 0.26, rgb: [201, 162, 58], a: 0.19 },
  { at: 0.52, rgb: [164, 80, 47], a: 0.2 },
  { at: 0.76, rgb: [228, 136, 156], a: 0.18 },
  { at: 1, rgb: [201, 139, 140], a: 0.17 },
]

function sampleWash(t) {
  for (let i = 0; i < WASH_STOPS.length - 1; i++) {
    const a = WASH_STOPS[i]
    const b = WASH_STOPS[i + 1]
    if (t >= a.at && t <= b.at) {
      const lt = (t - a.at) / (b.at - a.at)
      const lerp = (x, y) => x + (y - x) * lt
      const [r1, g1, b1] = a.rgb
      const [r2, g2, b2] = b.rgb
      const rgb = [lerp(r1, r2), lerp(g1, g2), lerp(b1, b2)].map(Math.round)
      return `rgba(${rgb.join(', ')}, ${lerp(a.a, b.a).toFixed(3)})`
    }
  }
  const last = WASH_STOPS[WASH_STOPS.length - 1]
  return `rgba(${last.rgb.join(', ')}, ${last.a})`
}

function cardWash(i, count) {
  const top = sampleWash(i / count)
  const bottom = sampleWash((i + 1) / count)
  return `linear-gradient(172deg, ${top} 0%, ${bottom} 100%)`
}

/** The practical bits — an accessible accordion with spring height reveals. */
export default function Faq() {
  const [open, setOpen] = useState(null)
  const reduce = useReducedMotion()

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(3rem,6vw,5.5rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      <div className="grid grid-cols-12 gap-x-8">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Label gradient={['#6E8CA8', '#C2613C']}>{FAQ.label}</Label>
            <h2 className="mt-5 font-sentient text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-ink">
              {FAQ.title}
            </h2>
          </div>
        </div>

        <div className="col-span-12 mt-10 lg:col-span-8 lg:mt-0">
          {/*
            The terracotta → ochre → rust → blush → dusty-pink wash runs the
            same way it always did top to bottom, but each card now samples
            its own slice via cardWash() and paints it on its own <li>
            (clipped by that card's own rounded corners) instead of one
            gradient shared across the whole <ul> — that let colour show
            through, and blur past the card edges, into the gaps between
            cards.
          */}
          <ul className="space-y-3">
            {FAQ.items.map((item, i) => {
              const isOpen = open === i

              return (
                <li
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-line/45 bg-paper transition-all duration-200"
                  style={{ backgroundImage: cardWash(i, FAQ.items.length) }}
                >
                  <div className="relative z-10">
                    <h3>
                      <button
                        type="button"
                        id={`faq-q-${i}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${i}`}
                        onClick={() => setOpen(isOpen ? null : i)}
                        className={`flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-all duration-200 ${
                          isOpen
                            ? 'text-terracotta'
                            : 'text-ink hover:text-terracotta'
                        }`}
                      >
                        <span className="font-sentient text-[clamp(0.95rem,1.3vw,1.15rem)] tracking-[-0.01em] leading-snug">
                          {item.q}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={SPRING}
                          className="shrink-0 rounded-full bg-[rgba(251,248,242,0.6)] p-2.5 transition-all duration-200 group-hover:bg-[rgba(251,248,242,0.85)]"
                          aria-hidden="true"
                        >
                          <Drop className="h-4 w-auto" gradient={['#C9A23A', '#C2613C']} />
                        </motion.span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-a-${i}`}
                          role="region"
                          aria-labelledby={`faq-q-${i}`}
                          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={SPRING}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl px-6 pb-5 leading-relaxed text-ink-soft/85">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
