import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, SPRING_SOFT, asset, ENQUIRE_HREF } from '../lib/site.js'
import { HERO } from '../content.js'

/**
 * Sprawling, full-bleed asymmetric hero. Massive char-split headline layered
 * over and behind a floating bouquet painting and a small study card. The
 * entrance holds until the preloader hands over (`revealed`).
 */
export default function Hero({ revealed }) {
  const reduce = useReducedMotion()
  // Scroll-linked parallax is only worth its per-frame cost on capable
  // desktops; touch devices render the art statically to stay smooth.
  const heavyFx = useHeavyFx()
  const parallax = heavyFx && !reduce
  const isMobile = useMediaQuery('(max-width: 639px)')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  // Parallax: art drifts slower than the page (ratio ~0.15+).
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%'])

  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { ...SPRING, delay: 0.7 } },
  }
  const state = revealed ? 'show' : 'hidden'

  return (
    <section
      id="top"
      ref={ref}
      className="relative w-full overflow-hidden px-[5vw] pb-[clamp(3rem,8vw,7rem)] pt-[clamp(1.5rem,4vw,3rem)]"
    >
      {/* Eyebrow row spanning the full width */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        className="flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-[0.3em] text-ink-soft"
      >
        <span>Live wedding watercolour keepsakes</span>
        <span className="hidden sm:inline">Melbourne · Australia-wide</span>
      </motion.div>

      <div className="relative mt-[clamp(2rem,5vw,4rem)] grid grid-cols-4 items-start gap-y-10 lg:min-h-[62vh] lg:grid-cols-12 lg:items-end lg:gap-x-8">
        {/* Floating bouquet painting — sits behind the type, offset right */}
        <motion.div
          style={parallax ? { y: artY } : {}}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.5 }}
          className="pointer-events-none absolute right-[-4vw] top-[-2vw] z-0 col-span-6 w-[46vw] max-w-[640px] sm:w-[40vw] lg:w-[28vw]"
          aria-hidden="true"
        >
          <img
            src={asset('assets/art-bouquet_transparent.webp')}
            alt=""
            className="h-auto w-full drop-shadow-[0_40px_60px_rgba(42,39,36,0.18)]"
          />
        </motion.div>

        {/* Hero character study — its own prominent column on wide screens,
            centred cleanly on mobile so it no longer floats off to one side. */}
        <motion.figure
          initial={{ opacity: 0, y: reduce ? 0 : 50, rotate: reduce ? 0 : 5 }}
          animate={revealed ? { opacity: 1, y: 0, rotate: reduce ? 0 : 3 } : { opacity: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.9 }}
          whileHover={reduce ? {} : { rotate: 0, scale: 1.03 }}
          className="relative z-10 order-2 col-span-4 col-start-1 mx-auto w-[78%] max-w-[320px] overflow-hidden rounded-[1.1rem] border border-line bg-paper-deep shadow-[0_24px_50px_-26px_rgba(42,39,36,0.5)] sm:w-[58%] lg:order-none lg:col-span-5 lg:col-start-8 lg:mx-0 lg:ml-auto lg:w-[92%] lg:max-w-none lg:self-center"
        >
          <img
            src={asset('assets/art-character-boy.webp')}
            alt="A small watercolour character study at the palette."
            className="h-full w-full object-cover"
            loading="eager"
          />
          <figcaption className="bg-paper px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
            No. 001 — Cotton rag
          </figcaption>
        </motion.figure>

        {/* Headline + lede + actions — anchored to the bottom-left on wide
            screens, with a notably smaller display size there. */}
        <div className="relative z-10 order-1 col-span-4 col-start-1 lg:order-none lg:col-span-7 lg:col-start-1">
          <motion.div style={parallax ? { y: copyY } : {}}>
            {revealed && (
              <SplitText
                as="h1"
                unit="char"
                playOnMount
                lines={isMobile ? HERO.linesMobile : HERO.lines}
                emphasis={isMobile ? HERO.emphasisMobile : HERO.emphasis}
                className="display-xl text-ink lg:[font-size:clamp(2.25rem,5.6vw,5.6rem)]"
              />
            )}
          </motion.div>

          <motion.div
            variants={fade}
            initial="hidden"
            animate={state}
            className="mt-[clamp(1.5rem,3vw,2.5rem)]"
          >
            <p className="max-w-md text-[clamp(1rem,1.1vw,1.18rem)] leading-relaxed text-ink-soft">
              {HERO.lede}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <MagneticButton href={ENQUIRE_HREF}>Enquire</MagneticButton>
              <a
                href="#process"
                className="font-mono text-xs uppercase tracking-[0.18em] text-ink underline-offset-8 transition-colors hover:text-terracotta hover:underline"
              >
                How it works
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        className="mt-[clamp(2rem,5vw,4rem)] flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-ink-soft"
      >
        <motion.span
          className="block h-8 w-px bg-ink-soft"
          animate={reduce ? {} : { scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
        Scroll
      </motion.div>
    </section>
  )
}
