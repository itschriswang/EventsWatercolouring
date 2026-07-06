import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, SPRING_SOFT, asset, ENQUIRE_HREF } from '../lib/site.js'
import { HERO } from '../content.js'
import CornerBloom from './CornerBloom.jsx'
import HeroFlurry, { flurryWillPlay, FLURRY_HANDOFF_DELAY, FLURRY_HANDOFF_DELAY_2 } from './HeroFlurry.jsx'
import Sparkles from './Sparkles.jsx'
import { withUnderline } from './Underline.jsx'
import BloomFilter from './WetBloom.jsx'
import HeroBrush from './HeroBrush.jsx'
import HeroStroke from './HeroStroke.jsx'

export default function Hero({ revealed }) {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const parallax = heavyFx && !reduce
  const isMobile = useMediaQuery('(max-width: 639px)')
  const ref = useRef(null)

  // The two hero-card boxes the flurry's survivors land on. Measured by
  // HeroFlurry so the flying studies grow into these exact positions.
  const charRef = useRef(null)
  const bouquetRef = useRef(null)

  // Whether the load flurry will play. When it does, these two cards are
  // *delivered* by it — they simply fade in as the survivor lands on them,
  // rather than running their own fly-in. Stable for the session (session /
  // hash gate), combined with the live reduced-motion signal.
  const [flurrySession] = useState(() => flurryWillPlay())
  const flurryPlays = revealed && !reduce && flurrySession

  // The hero card entrance. Under the flurry it's a quiet fade in place (the
  // survivor supplies the motion); otherwise the original rise-and-settle.
  const cardEntrance = (rot, delay, handoff) => {
    if (!revealed) {
      return {
        initial: { opacity: 0, y: reduce ? 0 : 52, rotate: reduce ? 0 : rot },
        animate: { opacity: 0 },
        transition: { ...SPRING_SOFT, delay },
      }
    }
    if (flurryPlays) {
      return {
        initial: { opacity: 0, y: 0, rotate: rot },
        animate: { opacity: 1, y: 0, rotate: rot },
        transition: { duration: 0.55, delay: handoff, ease: [0.22, 0.61, 0.36, 1] },
      }
    }
    return {
      initial: { opacity: 0, y: reduce ? 0 : 52, rotate: reduce ? 0 : rot },
      animate: { opacity: 1, y: 0, rotate: reduce ? 0 : rot },
      transition: { ...SPRING_SOFT, delay },
    }
  }
  const charEntrance = cardEntrance(-6, 0.8, FLURRY_HANDOFF_DELAY)
  const bouquetEntrance = cardEntrance(3, 0.95, FLURRY_HANDOFF_DELAY_2)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%'])

  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { ...SPRING, delay: 0.7 } },
  }
  const state = revealed ? 'show' : 'hidden'

  // The artwork arrives the way a watercolour does: wet. As each card rises,
  // its painting settles from a displaced, blurred wash into focus — the same
  // pigment-wick the lightbox plays, timed to the card entrances. Reserved
  // for fine-pointer desktops; the filters mount only once the preloader
  // hands over so the wick isn't spent behind it.
  const wick = revealed && parallax

  return (
    <section
      id="top"
      ref={ref}
      className="relative w-full overflow-x-clip px-[5vw] pb-[clamp(2.5rem,5vw,4.5rem)] pt-[clamp(1.5rem,4vw,3rem)] lg:pt-8"
    >
      {/* Pigment that trails the cursor across the hero — perceivable, and
          asleep (no render loop) until the pointer moves. Desktop / motion /
          WebGL only; renders nothing elsewhere. */}
      <HeroBrush />

      {/* Load flourish: the body of work swirls in a cylinder and drifts down
          toward the gallery, leaving the two studies below. Self-gating —
          plays once per session, sits out reduced-motion, and unmounts after. */}
      {revealed && (
        <HeroFlurry
          heroTargets={[
            { ref: charRef, img: 'art-character-boy', tilt: -6 },
            { ref: bouquetRef, img: 'art-bouquet', tilt: 3 },
          ]}
        />
      )}

      {/* Static bloom field — soft pigment halos in the site's own warm
          pigments, settled into the margins. One cheap paint on every device;
          the WebGL aurora it replaces cost 50KB and continuous GPU time to
          read as a whisper nobody could name the colour of. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(38% 32% at 16% 26%, rgba(201, 139, 140, 0.16), transparent 72%), ' +
            'radial-gradient(30% 26% at 88% 14%, rgba(212, 161, 46, 0.15), transparent 72%), ' +
            'radial-gradient(34% 30% at 85% 84%, rgba(228, 136, 156, 0.13), transparent 72%), ' +
            'radial-gradient(30% 28% at 8% 88%, rgba(201, 139, 140, 0.12), transparent 72%), ' +
            'radial-gradient(30% 26% at 62% 8%, rgba(212, 161, 46, 0.10), transparent 72%), ' +
            'radial-gradient(32% 28% at 99% 50%, rgba(232, 114, 42, 0.09), transparent 72%), ' +
            'radial-gradient(26% 24% at 36% 52%, rgba(164, 80, 47, 0.10), transparent 74%)',
        }}
      />

      {/* Local hero bloom — bottom-right, behind artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        {/* Desktop animated blooms */}
        {!reduce && heavyFx && (
          <>
            <div
              className="absolute rounded-full"
              style={{
                right: '-8vmin',
                bottom: '8vmin',
                width: '53vmin',
                height: '63vmin',
                background: 'radial-gradient(circle at 55% 55%, #c9a23a, transparent 65%)',
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
                background: 'radial-gradient(circle at 55% 55%, #E4889C, transparent 65%)',
                filter: 'blur(60px)',
                opacity: 0.32,
                mixBlendMode: 'hard-light',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
                maskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
              }}
            />
          </>
        )}
      </div>

      {/* Desktop eyebrow row */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        className="relative z-20 hidden sm:flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-[0.3em] text-ink-soft"
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
        <span className="font-mono text-[0.59rem] uppercase tracking-[0.3em] text-ink-soft">
          Live event watercolour keepsakes
        </span>
      </motion.div>

      <div className="relative mt-5 sm:mt-[clamp(2rem,5vw,4rem)] flex flex-col gap-y-[clamp(2.5rem,9vw,4rem)] lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-8 lg:gap-y-0">

        {/* Headline + lede + actions */}
        <div className="relative z-10 order-2 mt-[min(2.5rem,4dvh)] sm:mt-0 lg:order-none lg:col-span-7 lg:col-start-1">
          {/* Scroll-drawn vine, tucked behind the headline (negative z keeps
              it under the static title/lede/CTA regardless of paint order) */}
          <HeroStroke
            scrollYProgress={scrollYProgress}
            className="pointer-events-none absolute -z-10 -right-[6%] top-[6%] h-[85%] w-[34%] opacity-60 sm:-right-[4%] sm:w-[26%] lg:-right-[9%] lg:top-0 lg:h-full lg:w-[22%] lg:opacity-70"
          />
          {/* Delayed past the headline entrance so the twinkle lands as a
              finishing flick, not part of the type reveal. */}
          <Sparkles
            delay={1.1}
            className="absolute -top-6 right-[6%] hidden h-12 w-12 text-ochre sm:block"
          />
          <motion.div style={parallax ? { y: copyY } : {}}>
            {revealed && (
              <SplitText
                as="h1"
                unit="char"
                playOnMount
                lines={isMobile ? HERO.linesMobile : HERO.lines}
                emphasis={isMobile ? HERO.emphasisMobile : HERO.emphasis}
                emphasisItalic
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
                {withUnderline(HERO.lede, 'watercolour', { className: 'text-rust' })}
              </p>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-5 sm:mt-8">
              <MagneticButton href={ENQUIRE_HREF}>Enquire about your day</MagneticButton>
            </div>
            <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft/85">
              {HERO.note}
            </p>
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
              <div className="relative z-0 w-[54%] shrink-0 translate-x-[2%] translate-y-[6%] sm:translate-x-0 sm:w-[46%] lg:w-[52%] sm:translate-y-0 sm:-ml-[8%] lg:-ml-[10%] lg:-translate-x-[6%] lg:-translate-y-[8%]">
                <motion.figure
                  initial={charEntrance.initial}
                  animate={charEntrance.animate}
                  transition={charEntrance.transition}
                  whileHover={reduce ? {} : { rotate: -2, scale: 1.03 }}
                  className="relative overflow-hidden rounded-[1.25rem] border border-line bg-paper-deep shadow-[0_28px_52px_-18px_rgba(173,98,49,0.30),0_6px_16px_-6px_rgba(173,98,49,0.12)]"
                >
                  <CornerBloom from="rgba(201,140,140,0.15)" to="rgba(228,136,156,0.11)" overlay />
                  {wick && (
                    <BloomFilter
                      id="hero-wick-1"
                      dur="1.2s"
                      begin={flurryPlays ? `${FLURRY_HANDOFF_DELAY}s` : '0.8s'}
                    />
                  )}
                  <div className="relative z-10">
                    <picture>
                      <source srcSet={asset('assets/art-character-boy.webp')} type="image/webp" />
                      <img
                        ref={charRef}
                        src={asset('assets/art-character-boy.jpg')}
                        alt="A small watercolour character study at the palette."
                        style={wick ? { filter: 'url(#hero-wick-1)' } : undefined}
                        className="aspect-[4/5] w-full object-cover max-h-[40dvh] [@media(max-height:500px)]:max-h-[22dvh] sm:max-h-none sm:h-[clamp(160px,18vh,260px)] sm:aspect-auto lg:h-[38vh]"
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                        width="1242"
                        height="1800"
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
              <div className="relative z-10 -ml-[10%] w-[46%] shrink-0 -translate-y-[14%] sm:-ml-[10%] sm:w-[48%] lg:w-[54%] sm:-translate-y-[22%] lg:-translate-y-[16%]">
                <motion.figure
                  initial={bouquetEntrance.initial}
                  animate={bouquetEntrance.animate}
                  transition={bouquetEntrance.transition}
                  whileHover={reduce ? {} : { rotate: 0, scale: 1.03 }}
                  className="relative overflow-hidden rounded-[1.25rem] border border-line bg-paper-deep shadow-[0_28px_52px_-18px_rgba(173,98,49,0.30),0_6px_16px_-6px_rgba(173,98,49,0.12)]"
                >
                  <CornerBloom from="rgba(201,139,140,0.16)" to="rgba(228,136,156,0.12)" overlay />
                  {wick && (
                    <BloomFilter
                      id="hero-wick-2"
                      dur="1.2s"
                      begin={flurryPlays ? `${FLURRY_HANDOFF_DELAY_2}s` : '0.95s'}
                    />
                  )}
                  <div className="relative z-10">
                    <picture>
                      <source srcSet={asset('assets/art-bouquet.webp')} type="image/webp" />
                      <img
                        ref={bouquetRef}
                        src={asset('assets/art-bouquet.jpg')}
                        alt="A watercolour bouquet study held to the light."
                        style={wick ? { filter: 'url(#hero-wick-2)' } : undefined}
                        className="aspect-[4/5] w-full object-cover max-h-[34dvh] [@media(max-height:500px)]:max-h-[20dvh] sm:max-h-none sm:h-[clamp(175px,20vh,280px)] sm:aspect-auto lg:h-[42vh]"
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                        width="1200"
                        height="1600"
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
