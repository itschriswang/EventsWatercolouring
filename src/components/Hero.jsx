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
      className="relative w-full overflow-hidden px-[5vw] pb-[clamp(3rem,8vw,7rem)] pt-[clamp(1.5rem,4vw,3rem)] lg:pt-8"
    >
      {/* Local hero bloom — bottom-right, behind artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute rounded-full"
          style={{
            right: '-18vmin',
            bottom: '-14vmin',
            width: '60vmin',
            height: '60vmin',
            background: 'radial-gradient(circle at 55% 55%, #B5395B, transparent 65%)',
            filter: 'blur(60px)',
            opacity: 0.32,
            mixBlendMode: 'multiply',
          }}
        />
      </div>
      id="top"
      ref={ref}
      className="relative w-full overflow-hidden px-[5vw] pb-[clamp(3rem,8vw,7rem)] pt-[clamp(1.5rem,4vw,3rem)] lg:pt-8"
    >
      {/* Eyebrow row spanning the full width */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        className="flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-[0.3em] text-ink-soft"
      >
        <span>Live wedding watercolour keepsakes</span>
        <span className="hidden sm:inline">Melbourne · Sydney</span>
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

          {/* Sub-text + actions. On wide screens this sits under the headline;
              on mobile the sub-text moves beside the artwork (below), so this
              copy is desktop-only. */}
          <motion.div
            variants={fade}
            initial="hidden"
            animate={state}
            className="mt-[clamp(1.5rem,3vw,2.5rem)] hidden sm:block"
          >
            <p className="max-w-md text-[clamp(1rem,1.1vw,1.18rem)] leading-relaxed text-ink-soft">
              {HERO.lede}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <MagneticButton href={ENQUIRE_HREF}>Enquire about your day</MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Lower-right composition — two staggered study cards: the character
            raised much higher and in front, the bouquet sitting lower and
            slightly behind but still fully visible from the start. On mobile
            this becomes a loose three-column row: the sub-text, then the two
            layered artworks. */}
        <motion.div
          style={parallax ? { y: artY } : {}}
          className="relative z-10 col-span-4 col-start-1 lg:col-span-5 lg:col-start-8 lg:mb-[4vh]"
        >
          <div className="flex items-start gap-3 sm:block">
            {/* Mobile-only sub-text (the desktop copy lives under the headline). */}
            <motion.p
              variants={fade}
              initial="hidden"
              animate={state}
              className="mt-1 w-[30%] shrink-0 text-[0.78rem] leading-relaxed text-ink-soft sm:hidden"
            >
              {HERO.lede}
            </motion.p>

            {/* Two layered artworks, bottom-aligned so the character can be
                lifted well above the bouquet — staggered and overlapping, with
                the bouquet sitting lower but still fully visible. */}
            <div className="flex grow items-end justify-center sm:mx-auto sm:w-[92%] lg:mx-0 lg:w-full lg:justify-end">
              {/* Bouquet — lower, slightly behind, still very visible. The
                  mobile drop lives on this wrapper so the figure's entrance
                  transform doesn't clobber it. */}
              <div className="relative z-0 w-[56%] shrink-0 translate-x-[6%] translate-y-[32%] sm:translate-x-0 sm:w-[52%] sm:translate-y-0 sm:-ml-[8%] lg:-ml-[10%]">
                <motion.figure
                  initial={{ opacity: 0, y: reduce ? 0 : 50, rotate: reduce ? 0 : -6 }}
                  animate={revealed ? { opacity: 1, y: 0, rotate: reduce ? 0 : -6 } : { opacity: 0 }}
                  transition={{ ...SPRING_SOFT, delay: 0.8 }}
                  className="overflow-hidden rounded-[1.1rem] border border-line bg-paper-deep shadow-[0_24px_50px_-26px_rgba(42,39,36,0.5)]"
                >
                  <picture>
                    <source srcSet={asset('assets/art-bouquet.webp')} type="image/webp" />
                    <img
                      src={asset('assets/art-bouquet.jpg')}
                      alt="A watercolour bouquet study held to the light."
                      className="aspect-[4/5] w-full object-cover sm:aspect-auto sm:h-auto lg:h-[38vh]"
                      loading="eager"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </picture>
                  <figcaption className="bg-paper px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-ink-soft sm:px-3 sm:py-2 sm:text-[0.6rem] sm:tracking-[0.2em]">
                    No. 002 · Bouquet
                  </figcaption>
                </motion.figure>
              </div>

              {/* Character — raised much higher, in front, overlapping. The
                  lift lives on this wrapper so the figure's hover transform
                  doesn't clobber it. */}
              <div className="relative z-10 -ml-[12%] w-[58%] shrink-0 -translate-y-[10%] sm:-ml-[14%] sm:w-[54%] sm:-translate-y-[30%] lg:translate-y-0">
                <motion.figure
                  initial={{ opacity: 0, y: reduce ? 0 : 50, rotate: reduce ? 0 : 4 }}
                  animate={revealed ? { opacity: 1, y: 0, rotate: reduce ? 0 : 3 } : { opacity: 0 }}
                  transition={{ ...SPRING_SOFT, delay: 0.95 }}
                  whileHover={reduce ? {} : { rotate: 0, scale: 1.03 }}
                  className="overflow-hidden rounded-[1.1rem] border border-line bg-paper-deep shadow-[0_24px_50px_-26px_rgba(42,39,36,0.5)]"
                >
                  <picture>
                    <source srcSet={asset('assets/art-character-boy.webp')} type="image/webp" />
                    <img
                      src={asset('assets/art-character-boy.jpg')}
                      alt="A small watercolour character study at the palette."
                      className="aspect-[4/5] w-full object-cover sm:aspect-auto sm:h-auto lg:h-[42vh]"
                      loading="eager"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </picture>
                  <figcaption className="bg-paper px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-ink-soft sm:px-3 sm:py-2 sm:text-[0.6rem] sm:tracking-[0.2em]">
                    No. 001 · Cotton paper
                  </figcaption>
                </motion.figure>
              </div>
            </div>
          </div>
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
