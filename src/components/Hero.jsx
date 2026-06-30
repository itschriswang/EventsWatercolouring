import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, SPRING_SOFT, asset, ENQUIRE_HREF } from '../lib/site.js'
import { HERO } from '../content.js'
import CornerBloom from './CornerBloom.jsx'

export default function Hero({ revealed }) {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const parallax = heavyFx && !reduce
  const isMobile = useMediaQuery('(max-width: 639px)')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const { scrollY } = useScroll()
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%'])
  const blurOpacity = useTransform(scrollY, [0, 75], [1, 0])

  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { ...SPRING, delay: 0.7 } },
  }
  const state = revealed ? 'show' : 'hidden'

  return (
    <section
      id="top"
      ref={ref}
      className="relative w-full overflow-x-clip px-[5vw] pb-[clamp(3rem,8vw,7rem)] pt-[clamp(1.5rem,4vw,3rem)] lg:pt-8"
    >
      {/* Local hero bloom — bottom-right, behind artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
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

      {/* Desktop eyebrow row */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        className="hidden sm:flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-[0.3em] text-ink-soft"
      >
        <span>Live event watercolour keepsakes</span>
        <span>Melbourne · Sydney</span>
      </motion.div>

      {/* Mobile eyebrow — context-first, above the artwork */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        className="sm:hidden mb-5 flex items-center gap-3"
      >
        <span
          aria-hidden="true"
          className="block h-px w-5 shrink-0 bg-lime opacity-60"
        />
        <span className="font-mono text-[0.59rem] uppercase tracking-[0.26em] text-ink-soft">
          Live event watercolour keepsakes
        </span>
      </motion.div>

      <div className="relative mt-5 sm:mt-[clamp(2rem,5vw,4rem)] flex flex-col gap-y-[clamp(2.5rem,9vw,4rem)] lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-8 lg:gap-y-0">

        {/* Headline + lede + actions */}
        <div className="relative z-10 order-2 mt-[min(2.5rem,4dvh)] sm:mt-0 lg:order-none lg:col-span-7 lg:col-start-1">
          <motion.div style={parallax ? { y: copyY } : {}}>
            {revealed && (
              <SplitText
                as="h1"
                unit="char"
                playOnMount
                lines={isMobile ? HERO.linesMobile : HERO.lines}
                emphasis={isMobile ? HERO.emphasisMobile : HERO.emphasis}
                className="display-xl text-ink [font-size:clamp(2.75rem,13vw,4.5rem)] lg:[font-size:clamp(2.25rem,5.6vw,5.6rem)]"
              />
            )}
          </motion.div>

          <motion.div
            variants={fade}
            initial="hidden"
            animate={state}
            className="mt-6 block sm:mt-[clamp(1.5rem,3vw,2.5rem)]"
          >
            <div className="relative">
              <p className="max-w-[33ch] text-[0.93rem] leading-relaxed text-ink-soft sm:max-w-md sm:text-[clamp(1rem,1.1vw,1.18rem)]">
                {HERO.lede}
              </p>
              {!reduce && (
                <motion.div
                  aria-hidden="true"
                  className="sm:hidden pointer-events-none absolute inset-0"
                  style={{
                    opacity: blurOpacity,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                />
              )}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-5 sm:mt-8">
              <MagneticButton href={ENQUIRE_HREF}>Enquire about your day</MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Artwork cluster — two staggered study cards */}
        <motion.div
          style={parallax ? { y: artY } : {}}
          className="relative z-10 order-1 lg:order-none lg:col-span-5 lg:col-start-8 lg:mb-[4vh]"
        >
          <div className="flex flex-col sm:block gap-6 sm:gap-0">
            <div className="mx-auto flex w-full max-w-[26rem] items-end px-2 sm:mr-0 sm:grow sm:mx-auto sm:w-[92%] sm:max-w-none sm:px-0 lg:mx-0 lg:w-full lg:justify-end">

              {/* Character — primary card, grounded anchor (left, tilts left) */}
              <div className="relative z-0 w-[54%] shrink-0 translate-x-[2%] sm:translate-x-0 sm:w-[46%] lg:w-[52%] sm:translate-y-0 sm:-ml-[8%] lg:-ml-[10%] lg:-translate-x-[6%] lg:-translate-y-[18%]">
                <motion.figure
                  initial={{ opacity: 0, y: reduce ? 0 : 55, rotate: reduce ? 0 : -6 }}
                  animate={revealed ? { opacity: 1, y: 0, rotate: reduce ? 0 : -6 } : { opacity: 0 }}
                  transition={{ ...SPRING_SOFT, delay: 0.8 }}
                  className="relative overflow-hidden rounded-[1.25rem] border border-line bg-paper-deep shadow-[0_28px_52px_-18px_rgba(150,85,43,0.26),0_6px_16px_-6px_rgba(150,85,43,0.10)]"
                >
                  <CornerBloom from="rgba(201,140,140,0.15)" to="rgba(110,140,168,0.11)" overlay />
                  <div className="relative z-10">
                    <picture>
                      <source srcSet={asset('assets/art-character-boy.webp')} type="image/webp" />
                      <img
                        src={asset('assets/art-character-boy.jpg')}
                        alt="A small watercolour character study at the palette."
                        className="aspect-[4/5] w-full object-cover max-h-[40dvh] [@media(max-height:500px)]:max-h-[22dvh] sm:max-h-none sm:h-[clamp(160px,18vh,260px)] sm:aspect-auto lg:h-[38vh]"
                        loading="eager"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </picture>
                    <figcaption className="bg-paper px-3 py-2 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-ink-soft">
                      No. 001 · Cotton paper
                    </figcaption>
                  </div>
                </motion.figure>
              </div>

              {/* Bouquet — accent card, floats high right (tilts right) */}
              <div className="relative z-10 -ml-[10%] w-[46%] shrink-0 -translate-y-[14%] sm:-ml-[10%] sm:w-[48%] lg:w-[54%] sm:-translate-y-[22%] lg:-translate-y-[28%]">
                <motion.figure
                  initial={{ opacity: 0, y: reduce ? 0 : 50, rotate: reduce ? 0 : 4 }}
                  animate={revealed ? { opacity: 1, y: 0, rotate: reduce ? 0 : 3 } : { opacity: 0 }}
                  transition={{ ...SPRING_SOFT, delay: 0.95 }}
                  whileHover={reduce ? {} : { rotate: 0, scale: 1.03 }}
                  className="relative overflow-hidden rounded-[1.25rem] border border-line bg-paper-deep shadow-[0_28px_52px_-18px_rgba(150,85,43,0.26),0_6px_16px_-6px_rgba(150,85,43,0.10)]"
                >
                  <CornerBloom from="rgba(194,97,60,0.16)" to="rgba(110,140,168,0.12)" overlay />
                  <div className="relative z-10">
                    <picture>
                      <source srcSet={asset('assets/art-bouquet.webp')} type="image/webp" />
                      <img
                        src={asset('assets/art-bouquet.jpg')}
                        alt="A watercolour bouquet study held to the light."
                        className="aspect-[4/5] w-full object-cover max-h-[34dvh] [@media(max-height:500px)]:max-h-[20dvh] sm:max-h-none sm:h-[clamp(175px,20vh,280px)] sm:aspect-auto lg:h-[42vh]"
                        loading="eager"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </picture>
                    <figcaption className="bg-paper px-3 py-2 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-ink-soft">
                      No. 002 · Bouquet
                    </figcaption>
                  </div>
                </motion.figure>
              </div>

              {/* Vertical location tag — editorial punctuation, mobile only */}
              <motion.div
                variants={fade}
                initial="hidden"
                animate={state}
                aria-hidden="true"
                className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-[80%]"
              >
                <span
                  className="font-mono text-[0.48rem] uppercase tracking-[0.28em] text-ink-soft opacity-45"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  Melbourne · Sydney
                </span>
              </motion.div>

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
          className="block h-8 w-px bg-lime"
          animate={reduce ? {} : { scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
        Scroll
      </motion.div>

      {/* Mobile scroll cue — right edge, mirrors desktop cue */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        aria-hidden="true"
        className="sm:hidden absolute right-1 top-1/2 -translate-y-1/4 z-20 flex flex-col items-center gap-2"
      >
        <motion.span
          className="block w-px bg-lime"
          style={{ height: 28, originY: 0 }}
          animate={reduce ? {} : { scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span
          className="font-mono text-[0.45rem] uppercase tracking-[0.28em] text-ink-soft opacity-60"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
      </motion.div>

    </section>
  )
}
