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
import BloomField from './BloomField.jsx'
import { fieldCss } from '../lib/watercolour.js'

// The hero's two washes, as paint. Geometry is inherited from the hand-written
// gradients these replace, and each thickness was solved to reproduce that
// bloom's area-weighted load, so the conversion changed the model and not the
// weight. Both are declared as data so BloomField can render them as CSS and
// BloomCanvas can render the same paint optically.
const HERO_FIELD = [
  { pigment: 'apricot', x: 0.281, at: [0.14, 0.22], size: [0.42, 0.36], extent: 0.72 },
  { pigment: 'blush', x: 0.263, at: [0.88, 0.12], size: [0.34, 0.3], extent: 0.72 },
  { pigment: 'yellowgreen', x: 0.229, at: [0.86, 0.82], size: [0.36, 0.32], extent: 0.72 },
  { pigment: 'lilac', x: 0.151, at: [0.06, 0.86], size: [0.32, 0.3], extent: 0.72 },
  { pigment: 'butter', x: 0.215, at: [0.6, 0.06], size: [0.3, 0.26], extent: 0.72 },
  { pigment: 'apricot', x: 0.191, at: [1.0, 0.48], size: [0.32, 0.28], extent: 0.72 },
  { pigment: 'periwinkle', x: 0.099, at: [0.34, 0.54], size: [0.26, 0.24], extent: 0.74 },
]

// The aurora orb — the client's swatch sheet, wet-in-wet (§2.2), so it feathers
// with no pinned contact line and takes no rim.
const HERO_ORB = [
  { pigment: 'seafoam', x: 0.803, at: [0.28, 0.2], size: [0.48, 0.48], extent: 0.72, wetness: 'wet' },
  { pigment: 'lavender', x: 0.741, at: [0.14, 0.5], size: [0.44, 0.44], extent: 0.72, wetness: 'wet' },
  { pigment: 'lemonlime', x: 0.787, at: [0.48, 0.52], size: [0.54, 0.54], extent: 0.74, wetness: 'wet' },
  { pigment: 'blossom', x: 0.842, at: [0.72, 0.64], size: [0.46, 0.46], extent: 0.74, wetness: 'wet' },
  { pigment: 'aurora_rose', x: 0.788, at: [0.86, 0.84], size: [0.4, 0.4], extent: 0.72, wetness: 'wet' },
]

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
          read as a whisper nobody could name the colour of.

          Each halo is named as paint, not as a colour: `bloom()` runs the
          Kubelka-Munk model (lib/watercolour.js) and hands CSS the stops that
          pigment actually produces as it thins, so the hue drifts along its
          characteristic curve instead of one rgba fading out. These are
          wet-on-dry — laid on the paper — so they carry the edge-darkened rim.
          Geometry is unchanged, and each x was solved to reproduce the
          area-weighted load of the hand-written bloom it replaces. */}
      <BloomField blooms={HERO_FIELD} className="pointer-events-none absolute inset-0 z-0" />

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
              // Stays CSS rather than joining BloomCanvas: this orb is one
              // composed element with its own blur, mask and opacity, and it
              // isn't a field of overlapping washes competing to turn muddy —
              // which is the problem the canvas exists to solve. Reproducing a
              // 26px blur and a radial mask on the canvas would buy nothing and
              // cost a second render target.
              background: fieldCss(HERO_ORB),
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
                // dominant voice, not a seam squeezed out of the way. No
                // chromatic-aberration fringe or backlit glow: the word now
                // sits on the dark wine brush stroke below, and the pastel
                // gradient reads cleanly against it — the earlier orange/cyan
                // fringe read as a glitch on the light ground and is gone.
                emphasisColors={['#BFDCD1', '#D4B6E6', '#D8DB7A', '#D8DB7A', '#F2A6C1', '#E88FA4']}
                emphasisColorStops={[0, 0.04, 0.48, 0.52, 0.96, 1]}
                // A real hand-painted watercolour brush stroke behind the word
                // — a scanned stroke recoloured to the title's own ink (its
                // bristles, feathered edges and splatter kept as alpha) —
                // shown at full opacity. See EmphasisBrush +
                // public/assets/brush-ink.*.
                emphasisStroke="assets/brush-ink"
                emphasisStrokeOpacity={1}
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
              <MagneticButton href={ENQUIRE_HREF} flow>Enquire about your day</MagneticButton>
            </div>
            <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
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
                  <CornerBloom from={['blossom', 0.067]} to={['blush', 0.382]} overlay />
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
                  <CornerBloom from={['apricot', 0.142]} to={['blossom', 0.062]} overlay />
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
