import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING } from '../lib/site.js'
import { PATHS } from '../content.js'

export default function TwoPaths() {
  const reduce = useReducedMotion()

  return (
    <section
      id="process"
      className="relative w-full overflow-hidden bg-lime px-[5vw] py-[clamp(4rem,10vw,9rem)] text-ink"
    >
      
      <div className="relative z-10 flex flex-col gap-4">
        <Label fill="#A4502F" className="!text-ink/60">
          {PATHS.label}
        </Label>
        <SplitText
          as="h2"
          unit="char"
          lines={PATHS.title}
          emphasis={PATHS.emphasis}
          className="display-lg text-ink"
        />
      </div>

      <div className="relative z-10 mt-[clamp(2.5rem,6vw,5rem)] grid grid-cols-12 gap-x-8 gap-y-16">
        {PATHS.items.map((path, i) => (
          <motion.article
            key={path.no}
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ ...SPRING, delay: reduce ? 0 : i * 0.12 }}
            className={
              'col-span-12 lg:col-span-6 ' + (i === 1 ? 'lg:mt-24' : '')
            }
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-ink/50">
              {path.no}
            </span>
            <h3 className="mt-3 font-display text-[clamp(2rem,4.5vw,4rem)] font-light leading-[0.95] tracking-tight text-ink">
              {path.title}
            </h3>
            <p className="mt-3 max-w-md text-ink/70">{path.sub}</p>

            <ol className="mt-8 flex flex-col gap-6 border-t border-ink/15 pt-8">
              {path.steps.map((s, si) => (
                <li key={si} className="flex gap-5">
                  <span className="mt-1 font-mono text-sm text-blush">{si + 1}</span>
                  <span>
                    <b className="block font-display text-lg font-normal text-ink">
                      {s.b}
                    </b>
                    <span className="mt-1 block max-w-md text-sm leading-relaxed text-ink/65">
                      {s.t}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
