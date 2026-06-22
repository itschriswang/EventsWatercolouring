import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import { SPRING, asset, ENQUIRE_HREF } from '../lib/site.js'
import { PAINTER } from '../content.js'

/** "The painter" — bio set against an asymmetric framed portrait. */
export default function AboutMe() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])

  return (
    <section
      id="painter"
      ref={ref}
      className="relative w-full px-[5vw] py-[clamp(4rem,10vw,9rem)]"
    >
      <div className="grid grid-cols-12 items-center gap-x-8 gap-y-12">
        {/* Asymmetric framed portrait */}
        <motion.figure
          initial={{ opacity: 0, y: reduce ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={SPRING}
          className="col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-1"
        >
          <div className="relative">
            {/* offset accent frame */}
            <div
              aria-hidden="true"
              className="absolute -left-4 -top-4 h-full w-full rounded-[1.2rem] border border-terracotta/60"
            />
            <motion.div
              style={reduce ? {} : { y }}
              className="relative overflow-hidden rounded-[1.2rem] border border-line bg-paper-deep"
            >
              <picture>
                <source srcSet={asset(PAINTER.portraitWebp)} type="image/webp" />
                <img
                  src={asset(PAINTER.portrait)}
                  alt="Christopher Wang, the painter."
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </picture>
            </motion.div>
            <figcaption className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-soft">
              {PAINTER.caption}
            </figcaption>
          </div>
        </motion.figure>

        {/* Bio */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-6 lg:col-start-7">
          <Label>{PAINTER.label}</Label>
          <SplitText
            as="h2"
            unit="char"
            lines={PAINTER.title}
            emphasis={PAINTER.emphasis}
            className="display-lg mt-5 text-ink"
          />
          <div className="mt-8 flex max-w-lg flex-col gap-5 text-[clamp(1rem,1.1vw,1.15rem)] leading-relaxed text-ink-soft">
            {PAINTER.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-6 font-display text-4xl italic text-terracotta">
            {PAINTER.signature}
          </p>
          <div className="mt-8">
            <MagneticButton href={ENQUIRE_HREF}>Enquire</MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
