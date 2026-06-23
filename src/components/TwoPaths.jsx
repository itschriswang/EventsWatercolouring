import { useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, asset } from '../lib/site.js'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { PATHS } from '../content.js'

/**
 * The two offerings, as a high-contrast editorial split. Hovering either path
 * title springs a floating, masked media preview that tracks the cursor — an
 * "interactive media cursor portal" built on useMotionValue + useSpring.
 */
export default function TwoPaths() {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const sectionRef = useRef(null)
  const [active, setActive] = useState(null) // index of hovered path, or null

  // Raw cursor position (section-relative) eased into a spring.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 250, damping: 28 })
  const py = useSpring(my, { stiffness: 250, damping: 28 })

  const handleMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }

  return (
    <section
      id="process"
      ref={sectionRef}
      onMouseMove={reduce || !heavyFx ? undefined : handleMove}
      className="relative w-full overflow-hidden bg-ink px-[5vw] py-[clamp(4rem,10vw,9rem)] text-paper"
    >
      {/* Gradient blends from the paper section above into ink, softening the transition */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-paper to-transparent"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col gap-4">
        <Label fill="#AEBF56" className="!text-paper/60">
          {PATHS.label}
        </Label>
        <SplitText
          as="h2"
          unit="char"
          lines={PATHS.title}
          emphasis={PATHS.emphasis}
          className="display-lg text-paper"
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
            onMouseEnter={heavyFx ? () => setActive(i) : undefined}
            onMouseLeave={heavyFx ? () => setActive((cur) => (cur === i ? null : cur)) : undefined}
            className={
              'col-span-12 lg:col-span-6 ' + (i === 1 ? 'lg:mt-24' : '')
            }
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-paper/50">
              {path.no}
            </span>
            <h3 className="mt-3 inline-block cursor-default font-display text-[clamp(2rem,4.5vw,4rem)] font-light leading-[0.95] tracking-tight transition-colors duration-300 hover:text-lime">
              {path.title}
            </h3>
            <p className="mt-3 max-w-md text-paper/70">{path.sub}</p>

            <ol className="mt-8 flex flex-col gap-6 border-t border-paper/15 pt-8">
              {path.steps.map((s, si) => (
                <li key={si} className="flex gap-5">
                  <span className="mt-1 font-mono text-sm text-lime">{si + 1}</span>
                  <span>
                    <b className="block font-display text-lg font-normal text-paper">
                      {s.b}
                    </b>
                    <span className="mt-1 block max-w-md text-sm leading-relaxed text-paper/65">
                      {s.t}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </motion.article>
        ))}
      </div>

      {/* Cursor portal — floating masked preview that tracks the mouse, desktop only */}
      {!reduce && heavyFx && (
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-20 -ml-[140px] -mt-[170px] h-[340px] w-[280px] overflow-hidden rounded-[1.2rem] shadow-2xl"
          style={{ x: px, y: py }}
          initial={false}
          animate={{
            opacity: active !== null ? 1 : 0,
            scale: active !== null ? 1 : 0.8,
          }}
          transition={SPRING}
          aria-hidden="true"
        >
          <AnimatePresence mode="popLayout">
            {active !== null && (
              <motion.img
                key={active}
                src={asset(PATHS.items[active].art)}
                alt=""
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full object-cover"
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
