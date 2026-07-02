import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { Drop } from './Label.jsx'
import CornerBloom from './CornerBloom.jsx'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'

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
            One continuous gradient painted on the <ul> itself — terracotta,
            ochre, rust and blush washing top to bottom — rather than a
            separate gradient per item. Each <li> below is transparent, so it
            acts as a window onto whichever slice of this gradient sits behind
            it: the list reads as one connected wash the questions are cut
            from, instead of five unrelated cards.
          */}
          <ul
            className="space-y-3"
            style={{
              backgroundImage:
                'linear-gradient(172deg, ' +
                'rgba(194,97,60,0.16) 0%, ' +
                'rgba(201,162,58,0.14) 26%, ' +
                'rgba(164,80,47,0.15) 52%, ' +
                'rgba(228,136,156,0.13) 76%, ' +
                'rgba(201,139,140,0.12) 100%)',
              backgroundColor: '#FBF8F2',
            }}
          >
            {FAQ.items.map((item, i) => {
              const isOpen = open === i

              return (
                <li
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-line/45 bg-transparent transition-all duration-200"
                >
                  <CornerBloom from="rgba(194,97,60,0.12)" to="rgba(110,140,168,0.08)" />
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
