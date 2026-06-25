import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, asset, ENQUIRE_HREF } from '../lib/site.js'
import { PAINTER } from '../content.js'

/** "The painter" — bio set against an asymmetric framed portrait. */
export default function AboutMe() {
  const reduce = useReducedMotion()
  const parallax = useHeavyFx() && !reduce
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
      className="relative w-full overflow-hidden px-[5vw] py-[clamp(4rem,8vw,7rem)]"
    >
      <div className="grid grid-cols-12 items-start gap-x-8 gap-y-8">
        {/* Left column: title + bio + signature + CTA */}
        <div className="col-span-12 sm:col-span-6 sm:col-start-1 lg:col-span-6 lg:col-start-1">
          <Label gradient={['#6E8CA8', '#C2613C']}>{PAINTER.label}</Label>
          <SplitText
            as="h2"
            unit="char"
            lines={PAINTER.title}
            emphasis={PAINTER.emphasis}
            className="display-lg mt-5 text-ink"
          />
          <div className="mt-8 flex flex-col gap-5 text-[clamp(1rem,1.1vw,1.15rem)] leading-relaxed text-ink-soft">
            {PAINTER.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-6 font-display text-4xl italic text-terracotta">
            {PAINTER.signature}
          </p>
          <div className="mt-8">
            <MagneticButton href={ENQUIRE_HREF}>Enquire about your day</MagneticButton>
          </div>
        </div>

        {/* Right column: portrait, top aligned near the "me" line */}
        <motion.figure
          initial={{ opacity: 0, y: reduce ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={SPRING}
          className="col-span-12 sm:col-span-6 sm:col-start-7 lg:col-span-6 lg:col-start-7 lg:mt-16"
        >
          <div className="relative">
            {/* offset accent frame */}
            <div
              aria-hidden="true"
              className="absolute -left-4 -top-4 h-full w-full rounded-[1.2rem] border border-terracotta/60"
            />
            <motion.div
              style={parallax ? { y } : {}}
              className="relative overflow-hidden rounded-[1.2rem] border border-line bg-paper-deep"
            >
              <picture>
                <source srcSet={asset(PAINTER.portraitWebp)} type="image/webp" />
                <img
                  src={asset(PAINTER.portrait)}
                  alt="Christopher Wang, the painter."
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  className="h-full w-full object-cover"
                />
              </picture>
            </motion.div>
          </div>
        </motion.figure>
      </div>

      {/* Dove painting — bottom-right corner decoration */}
      <img
        src={asset('assets/bloom-accent-2.png')}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-48"
      />
    </section>
  )
}
