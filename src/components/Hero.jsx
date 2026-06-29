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
      className="relative w-full overflow-x-clip px-[5vw] pb-[clamp(3rem,8vw,7rem)] pt-[clamp(1.5rem,4vw,3rem) lg:pt-8"
        >
      {/* Local hero bloom — bottom-right, behind artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        {/* Lime bloom layer behind */}
        <div
          className="absolute rounded-full"
          style={{
            right: '-8vmin',
            bottom: '8vmin',
            width: '53vmin',
            height: '63vmin',
            background: 'radial-gradient(circle at 55% 55%, #aebf56, transparent 65%)',
            filter: 'blur(60px)',
            opacity: 0.32,
            mixBlendMode: 'hard-light',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
          }}
        />
        {/* Cornflower bloom layer in front */}
        <div
          className="absolute rounded-full"
          style={{
            right: '-18vmin',
            bottom: '0vmin',
            width: '63vmin',
            height: '53vmin',
            background: 'radial-gradient(circle at 55% 55%, #e4889c, transparent 65%)',
            filter: 'blur(60px)',
            opacity: 0.32,
            mixBlendMode: 'hard-light',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>

      {/* Eyebrow row spanning the full width */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        className="hidden sm:flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-[0.3em] text-ink-soft"
      >
        <span>Live event watercolour keepsakes</span>
        <span className="hidden sm:inline">Melbourne · Sydney</span>
      </motion.div>

      <div className="relative mt-[clamp(2rem,5vw,4rem)] flex flex-col gap-y-[clamp(2.5rem,9vw,4rem)] lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-8 lg:gap-y-0">
        {/* Headline + lede + actions — on wide screens this sits in the
            bottom-left column beside the study card (placement fixed by
            col-start, so DOM order is free). On mobile it is ordered BELOW the
            artwork, so the big headline lands low on the screen with the images
            stacked above it — the editorial hero arrangement. */}
        <div className="relative z-10 order-2 lg:order-none lg:col-span-7 lg:col-start-1">
          <motion.div style={parallax ? { y: copyY } : {}}>
            {revealed && (
              <SplitText
                as="h1"
                unit="char"
                playOnMount
                lines={isMobile ? HERO.linesMobile : HERO.lines}
                emphasis={isMobile ? HERO.emphasisMobile : HERO.emphasis}
                className="display-xl text-ink [font-size:clamp(2.6rem,12.5vw,4.25rem)] lg:[font-size:clamp(2.25rem,5.6vw,5.6rem)]"
              />
            )}
          </motion.div>
          
          {/* Mobile eyebrow — sits directly under the headline */}
          <motion.div
            variants={fade}
            initial="hidden"
            animate={state}
            className="mt-3 flex flex-col items-center text-center font-mono text-[0.62rem] uppercase tracking-[0.26em] text-ink-soft sm:hidden"
          >
            <span>Live event watercolour keepsakes</span>
          </motion.div>

          {/* Sub-text + actions sit directly under the headline on every size. */}
          <motion.div
            variants={fade}
            initial="hidden"
            animate={state}
            className="mt-5 block sm:mt-[clamp(1.5rem,3vw,2.5rem)]"
          >
            <p className="max-w-md text-[0.92rem] leading-relaxed text-ink-soft sm:text-[clamp(1rem,1.1vw,1.18rem)]">
              {HERO.lede}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5 sm:mt-8">
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
          className="relative z-10 order-1 lg:order-none lg:col-span-5 lg:col-start-8 lg:mb-[4vh]"
        >
          <div className="flex flex-col sm:block gap-6 sm:gap-0">
            {/* Two layered artworks, bottom-aligned so the character can be
                lifted well above the bouquet — staggered and overlapping, with
                the bouquet sitting lower but still fully visible. */}
            <div className="mx-auto flex w-full max-w-[24rem] items-end justify-center gap-7 px-2 sm:mr-0 sm:grow sm:mx-auto sm:w-[92%] sm:max-w-none sm:gap-0 sm:px-0 lg:mx-0 lg:w-full lg:justify-end">
              {/* Bouquet — lower, slightly behind, still very visible. The
                  mobile drop lives on this wrapper so the figure's entrance
                  transform doesn't clobber it. */}
              <div className="relative z-0 w-[49%] shrink-0 translate-x-[6%] -translate-y-[10%] sm:translate-x-0 sm:w-[46%] lg:w-[52%] sm:translate-y-0 sm:-ml-[8%] lg:-ml-[10%] lg:-translate-x-[6%]  lg:-translate-y-[18%]">
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
                      className="aspect-[4/5] w-full object-cover sm:h-[clamp(160px,18vh,260px)] sm:aspect-auto lg:h-[38vh]"
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
              <div className="relative z-10 -ml-[5%] w-[54%] shrink-0 translate-y-[12%] sm:-ml-[10%] sm:w-[48%] lg:w-[54%] sm:-translate-y-[22%] lg:-translate-y-[28%]">
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
                      className="aspect-[4/5] w-full object-cover sm:h-[clamp(175px,20vh,280px)] sm:aspect-auto lg:h-[42vh]"
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
