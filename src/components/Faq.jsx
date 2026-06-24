import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { Drop } from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'

/** The practical bits — an accessible accordion with spring height reveals. */
export default function Faq() {
  const [open, setOpen] = useState(null)
  const reduce = useReducedMotion()

  return (
    <section id="faq" className="relative w-full px-[5vw] py-[clamp(4rem,8vw,7rem)]">
      <div className="grid grid-cols-12 gap-x-8">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Label gradient={['#6E8CA8', '#C2613C']}>{FAQ.label}</Label>
            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.5rem)] font-light uppercase leading-[0.9] tracking-tight text-ink">
              {FAQ.title}
            </h2>
          </div>
        </div>

        <div className="col-span-12 mt-10 lg:col-span-8 lg:mt-0">
          <ul className="border-t border-line">
            {FAQ.items.map((item, i) => {
              const isOpen = open === i
              return (
                <li key={i} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-terracotta"
                    >
                      <span className="font-display text-[clamp(1.15rem,1.8vw,1.6rem)] font-light leading-snug text-ink">
                        {item.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={SPRING}
                        className="shrink-0"
                        aria-hidden="true"
                      >
                        <Drop className="h-5 w-auto" gradient={['#6E8CA8', '#C2613C']} />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={SPRING}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 leading-relaxed text-ink-soft">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
