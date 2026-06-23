import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, SPRING_SOFT, asset, ENQUIRE_HREF } from '../lib/site.js'
import { HERO } from '../content.js'

/**
 * Sprawling, full-bleed asymmetric hero. A char-split headline on the left,
 * with two study cards stacked on the right — a bouquet painting layered
 * behind the character study. The entrance holds until the preloader hands
 * over (`revealed`).
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

      <div className="relative mt-[clamp(2rem,5vw,4rem)] grid grid-cols-4 items-start gap-y-10 lg:grid-cols-12 lg:items-end lg:gap-x-8">
        {/* Headline + lede + actions — sits in the bottom-left column on wide
            screens, at a notably smaller display size. Kept first in the DOM so
            grid auto-placement seats it beside (not below) the study card, and
            so it leads the stack on mobile. */}
        <div className="relative z-10 col-span-4 col-start-1 lg:col-span-7 lg:col-start-1">
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
              {/* Hidden on mobile so the artwork leads the landing view — the
                  persistent bottom dock still carries the Enquire CTA there. */}
              <span className="hidden sm:contents">
                <MagneticButton href={ENQUIRE_HREF}>Enquire</MagneticButton>
              </span>
              <a
                href="#process"
                className="font-mono text-xs uppercase tracking-[0.18em] text-ink underline-offset-8 transition-colors hover:text-terracotta hover:underline"
              >
                How it works
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stacked study cards — the bouquet painting layered behind the
            character study like two photos laid on top of each other. Centred
            on mobile; pinned to the right column on wide screens. The wrapper's
            width is set by the front (character) card; the bouquet is absolute
            and peeks out from behind it. */}
        <motion.div
          style={parallax ? { y: artY } : {}}
          className="relative z-10 col-span-4 col-start-1 mx-auto w-[74%] max-w-[300px] sm:w-[56%] lg:col-span-5 lg:col-start-8 lg:mx-0 lg:ml-auto lg:w-[82%] lg:max-w-none"
        >
          {/* Bouquet card — behind */}
          <motion.figure
            initial={{ opacity: 0, y: reduce ? 0 : 50, rotate: reduce ? 0 : -3 }}
            animate={revealed ? { opacity: 1, y: 0, rotate: reduce ? 0 : -7 } : { opacity: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.78 }}
            className="absolute -left-[8%] -top-[7%] z-0 w-[86%] origin-bottom-right overflow-hidden rounded-[1.1rem] border border-line bg-paper-deep shadow-[0_24px_50px_-26px_rgba(42,39,36,0.5)] lg:-left-[15%] lg:-top-[8%] lg:w-[84%]"
          >
            <img
              src={asset('assets/art-bouquet.webp')}
              alt="A watercolour bouquet study held to the light."
              className="h-full w-full object-cover lg:h-[44vh]"
              loading="eager"
            />
            <figcaption className="bg-paper px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
              No. 002 — Bouquet
            </figcaption>
          </motion.figure>

          {/* Character study — in front */}
          <motion.figure
            initial={{ opacity: 0, y: reduce ? 0 : 50, rotate: reduce ? 0 : 5 }}
            animate={revealed ? { opacity: 1, y: 0, rotate: reduce ? 0 : 3 } : { opacity: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.95 }}
            whileHover={reduce ? {} : { rotate: 0, scale: 1.03 }}
            className="relative z-10 w-full overflow-hidden rounded-[1.1rem] border border-line bg-paper-deep shadow-[0_24px_50px_-26px_rgba(42,39,36,0.5)]"
          >
            <img
              src={asset('assets/art-character-boy.webp')}
              alt="A small watercolour character study at the palette."
              className="h-full w-full object-cover lg:h-[52vh]"
              loading="eager"
            />
            <figcaption className="bg-paper px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
              No. 001 — Cotton rag
            </figcaption>
          </motion.figure>
        </motion.div>
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
