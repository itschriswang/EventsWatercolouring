import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import useMediaQuery, { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, SPRING_SOFT, asset, ENQUIRE_HREF } from '../lib/site.js'
import { HERO } from '../content.js'
import CornerBloom from './CornerBloom.jsx'
import Sparkles from './Sparkles.jsx'
import { withUnderline } from './Underline.jsx'
import BloomFilter from './WetBloom.jsx'

export default function Hero({ revealed }) {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const parallax = heavyFx && !reduce
  const isMobile = useMediaQuery('(max-width: 639px)')
  const ref = useRef(null)

  // The hero card entrance — a rise-and-settle from below, staggered so the
  // bouquet lands a beat after the character study. Stays put (just hidden)
  // until the preloader hands over, then rises into place.
  const cardEntrance = (rot, delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 52, rotate: reduce ? 0 : rot },
    animate: revealed
      ? { opacity: 1, y: 0, rotate: reduce ? 0 : rot }
      : { opacity: 0 },
    transition: { ...SPRING_SOFT, delay },
  })
  const charEntrance = cardEntrance(-6, 0.8)
  const bouquetEntrance = cardEntrance(3, 0.95)
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
      ref={ref}
      className="relative w-full overflow-x-clip px-[5vw] pb-[clamp(2.5rem,5vw,4.5rem)] pt-[clamp(1.5rem,4vw,3rem)] lg:pt-8"
    >
      {/* Static bloom field — soft pigment halos in the site's own warm
          pigments, settled into the margins. One cheap paint on every device;
          the WebGL aurora it replaces cost 50KB and continuous GPU time to
          read as a whisper nobody could name the colour of. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(42% 36% at 14% 22%, rgba(247,195,148, 0.38), transparent 72%), ' +
            'radial-gradient(34% 30% at 88% 12%, rgba(242,194,207, 0.34), transparent 72%), ' +
            'radial-gradient(36% 32% at 86% 82%, rgba(212,226,130, 0.30), transparent 72%), ' +
            'radial-gradient(32% 30% at 6% 86%, rgba(210,196,232, 0.20), transparent 72%), ' +
            'radial-gradient(30% 26% at 60% 6%, rgba(226,232,138, 0.28), transparent 72%), ' +
            'radial-gradient(32% 28% at 100% 48%, rgba(247,195,148, 0.26), transparent 72%), ' +
            'radial-gradient(26% 24% at 34% 54%, rgba(216,218,236, 0.14), transparent 74%)',
        }}
      />

      {/* Local hero bloom — bottom-right, behind artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        {/* The aurora orb — the hero's colour accent, painted to echo the
            action surface's continuous watercolour flow: a cool crown of
            Seafoam (blue) into Lavender (purple) up the leading shoulder,
            dissolving through a Lemon Lime heart, and warming to Blossom
            (pink) then Rose (red) as it sinks to the lower-right rim. One
            unbroken cool → green → warm wash built from overlapping radial
            blooms — no linear sweep — so it reads as pigment bleeding, not a
            band. It hangs behind the artwork cluster like a low sun. Desktop
            only: the big blur is the costly part, so touch devices keep the
            flat wash field above. */}
        {!reduce && heavyFx && (
          <div
            className="absolute rounded-full"
            style={{
              right: '-6vmin',
              bottom: '-4vmin',
              width: '74vmin',
              height: '74vmin',
              background:
                'radial-gradient(48% 48% at 28% 20%, rgba(191,220,209,0.9), transparent 72%), ' +
                'radial-gradient(44% 44% at 14% 50%, rgba(212,182,230,0.82), transparent 72%), ' +
                'radial-gradient(54% 54% at 48% 52%, rgba(204,208,106,0.9), transparent 74%), ' +
                'radial-gradient(46% 46% at 72% 64%, rgba(242,166,193,0.92), transparent 74%), ' +
                'radial-gradient(40% 40% at 86% 84%, rgba(232,143,164,0.86), transparent 72%)',
              filter: 'blur(26px)',
              opacity: 0.62,
              WebkitMaskImage:
                'radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 52%, rgba(0,0,0,0) 72%)',
              maskImage:
                'radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 52%, rgba(0,0,0,0) 72%)',
            }}
          />
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
          {/* Delayed past the headline entrance so the twinkle lands as a
              finishing flick, not part of the type reveal. */}
          <Sparkles
            delay={1.1}
            className="absolute -top-6 right-[6%] hidden h-12 w-12 sm:block"
          />
          <motion.div style={parallax ? { y: copyY } : {}}>
            {revealed && (
              <SplitText
                as="h1"
                unit="char"
                playOnMount
                lines={isMobile ? HERO.linesMobile : HERO.lines}
                emphasis={isMobile ? HERO.emphasisMobile : HERO.emphasis}
                // The accent word carries the action-surface's continuous
                // flow — a real clipped gradient, not per-letter swatches —
                // in the true palette voices: Seafoam, Lavender, Lemon Lime
                // (repeated to hold a flat plateau), Blossom, Rose, exactly as
                // the button and orb. Blue/purple/pink/red are pinned tight
                // against the word's edges as near-instant peaks rather than
                // held plateaus, the Lemon Lime plateau holds a small pocket
                // dead centre, and the purple→green / green→pink blends fill
                // most of the remaining width — the transition itself is the
                // dominant voice, not a seam squeezed out of the way. Those
                // pastels are too light for the display face's warm backlit
                // glow, so the accent swaps that glow for chromatic-aberration
                // fringing instead: a warm cast offset right, a cool cast
                // offset left, plus a soft burgundy ground (approved shadow
                // palette) — the word reads as type seen through curved
                // glass, the light splitting at the letter edges. em-based
                // offsets so the fringe scales with the clamp()ed type.
                emphasisColors={['#BFDCD1', '#D4B6E6', '#D8DB7A', '#D8DB7A', '#F2A6C1', '#E88FA4']}
                emphasisColorStops={[0, 0.04, 0.48, 0.52, 0.96, 1]}
                emphasisShadow="0.032em 0.01em 0.05em rgba(255,138,64,0.8), -0.032em -0.006em 0.05em rgba(96,205,240,0.8), 0 0.05em 0.1em rgba(126,40,72,0.28)"
                className="display-xl text-ink [line-height:0.80] [font-size:clamp(2.75rem,13vw,4.5rem)] lg:[font-size:clamp(2.25rem,5.6vw,5.6rem)] [text-shadow:none]"
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
                  className="relative overflow-hidden rounded-[1.25rem] border border-line bg-paper-deep shadow-[0_28px_52px_-18px_rgba(126,40,72,0.30),0_6px_16px_-6px_rgba(126,40,72,0.12)]"
                >
                  <CornerBloom from="rgba(242,194,207,0.15)" to="rgba(140,54,86,0.11)" overlay />
                  {wick && (
                    <BloomFilter id="hero-wick-1" dur="1.2s" begin="0.8s" />
                  )}
                  <div className="relative z-10">
                    <picture>
                      <source srcSet={asset('assets/art-character-boy.webp')} type="image/webp" />
                      <img
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
              <div className="relative z-10 -ml-[10%] translate-x-[16%] w-[46%] shrink-0 -translate-y-[14%] sm:translate-x-0 sm:-ml-[10%] sm:w-[48%] lg:w-[54%] sm:-translate-y-[22%] lg:-translate-y-[16%]">
                <motion.figure
                  initial={bouquetEntrance.initial}
                  animate={bouquetEntrance.animate}
                  transition={bouquetEntrance.transition}
                  whileHover={reduce ? {} : { rotate: 0, scale: 1.03 }}
                  className="relative overflow-hidden rounded-[1.25rem] border border-line bg-paper-deep shadow-[0_28px_52px_-18px_rgba(126,40,72,0.30),0_6px_16px_-6px_rgba(126,40,72,0.12)]"
                >
                  <CornerBloom from="rgba(247,195,148,0.20)" to="rgba(242,194,207,0.14)" overlay />
                  {wick && (
                    <BloomFilter id="hero-wick-2" dur="1.2s" begin="0.95s" />
                  )}
                  <div className="relative z-10">
                    <picture>
                      <source srcSet={asset('assets/art-bouquet.webp')} type="image/webp" />
                      <img
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
