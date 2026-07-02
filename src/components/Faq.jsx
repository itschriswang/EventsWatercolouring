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
          <ul className="space-y-3">
            {FAQ.items.map((item, i) => {
              const isOpen = open === i
              // Create a cohesive gradient across all FAQ items using warm editorial colors
              const totalItems = FAQ.items.length
              const progress = i / (totalItems - 1 || 1) // 0 to 1 across all items

              // Gradient positions cycle through warm tones: terracotta → ochre → rust → blush
              const gradients = [
                'radial-gradient(ellipse 140% 100% at 45% -10%, rgba(201,97,60,0.08) 0%, rgba(251,248,242,0.95) 35%, rgba(244,239,230,0.98) 100%)',
                'radial-gradient(ellipse 140% 100% at 55% -10%, rgba(201,162,58,0.07) 0%, rgba(251,248,242,0.96) 38%, rgba(244,239,230,0.98) 100%)',
                'radial-gradient(ellipse 140% 100% at 65% -10%, rgba(164,80,47,0.08) 0%, rgba(251,248,242,0.96) 40%, rgba(244,239,230,0.99) 100%)',
                'radial-gradient(ellipse 140% 100% at 75% -10%, rgba(228,136,156,0.07) 0%, rgba(251,248,242,0.97) 38%, rgba(244,239,230,0.99) 100%)',
                'radial-gradient(ellipse 140% 100% at 50% -10%, rgba(201,139,140,0.06) 0%, rgba(251,248,242,0.97) 42%, rgba(244,239,230,0.99) 100%)',
              ]
              const backgroundGradient = gradients[i % gradients.length]

              return (
                <li
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-line/45 transition-all duration-200"
                  style={{
                    background: backgroundGradient,
                  }}
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
                          className="shrink-0 rounded-full bg-white/40 p-2.5 transition-all duration-200 group-hover:bg-white/60"
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
