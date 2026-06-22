import { motion, useReducedMotion } from 'framer-motion'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import { SPRING, SPRING_SOFT, asset, ENQUIRE_HREF } from '../lib/site.js'

/**
 * Section B — the staggered editorial hero.
 * Asymmetric, uneven columns: a type-forward left rail and an overlapping
 * stack of painting cards on the right, with deliberate whitespace.
 */
export default function Hero({ revealed }) {
  const reduce = useReducedMotion()

  // Hold the entrance until the preloader has handed over, so the headline
  // doesn't animate behind the overlay.
  const animateState = revealed ? 'show' : 'hidden'

  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { ...SPRING, delay: 0.5 } },
  }

  return (
    <section className="relative mx-auto max-w-wrap px-[clamp(1.25rem,4vw,4rem)] pb-[clamp(4rem,9vw,8rem)] pt-[clamp(2rem,6vw,5rem)]">
      {/* Eyebrow row */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={animateState}
        className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.3em] text-ink-soft"
      >
        <span>Watercolour Studio</span>
        <span className="hidden sm:inline">Est. Greater Sydney</span>
      </motion.div>

      <div className="mt-[clamp(2.5rem,7vw,6rem)] grid grid-cols-1 gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-12">
        {/* Left rail — uneven, wider type column */}
        <div className="lg:col-span-7 lg:pt-10">
          {revealed && (
            <SplitText
              as="h1"
              unit="word"
              lines={['Painted', 'by hand,', 'on the day.']}
              className="font-display text-[clamp(3rem,11vw,8.5rem)] font-light uppercase leading-[0.86] tracking-[-0.04em] text-ink"
            />
          )}

          <motion.p
            variants={fade}
            initial="hidden"
            animate={animateState}
            className="mt-[clamp(1.5rem,3vw,2.5rem)] max-w-md text-[clamp(1rem,1.1vw,1.15rem)] leading-relaxed text-ink-soft"
          >
            Hand-painted watercolour portraits for weddings — composed live as
            your day unfolds, or commissioned quietly from your favourite
            photographs. Archival cotton-rag, lightfast pigment, made to outlast
            the album.
          </motion.p>

          <motion.div
            variants={fade}
            initial="hidden"
            animate={animateState}
            className="mt-[clamp(2rem,4vw,3rem)] flex flex-wrap items-center gap-5"
          >
            <MagneticButton href={ENQUIRE_HREF}>Enquire Now</MagneticButton>
            <a
              href="#process"
              className="font-mono text-xs uppercase tracking-[0.18em] text-ink underline-offset-8 transition-colors hover:text-terracotta hover:underline"
            >
              How it works
            </a>
          </motion.div>
        </div>

        {/* Right rail — overlapping painting cards */}
        <div className="relative lg:col-span-5">
          <motion.figure
            initial={{ opacity: 0, y: reduce ? 0 : 40, rotate: reduce ? 0 : -3 }}
            animate={
              revealed
                ? { opacity: 1, y: 0, rotate: -2 }
                : { opacity: 0, y: 40 }
            }
            transition={{ ...SPRING_SOFT, delay: 0.65 }}
            whileHover={reduce ? {} : { rotate: 0, scale: 1.02 }}
            className="relative z-10 ml-auto w-[78%] overflow-hidden rounded-[1.5rem] bg-paper-deep shadow-[0_30px_60px_-30px_rgba(42,39,36,0.45)]"
          >
            <img
              src={asset('assets/art-bouquet.webp')}
              alt="A loose watercolour bouquet in magenta, orange and petrol blue."
              className="h-full w-full object-cover"
              loading="eager"
            />
          </motion.figure>

          <motion.figure
            initial={{ opacity: 0, y: reduce ? 0 : 50, rotate: reduce ? 0 : 5 }}
            animate={
              revealed ? { opacity: 1, y: 0, rotate: 4 } : { opacity: 0, y: 50 }
            }
            transition={{ ...SPRING_SOFT, delay: 0.82 }}
            whileHover={reduce ? {} : { rotate: 0, scale: 1.03 }}
            className="absolute -bottom-[clamp(2rem,5vw,4rem)] left-0 z-20 w-[52%] overflow-hidden rounded-[1.2rem] border border-line bg-paper shadow-[0_24px_50px_-26px_rgba(42,39,36,0.5)]"
          >
            <img
              src={asset('assets/art-character-girl.webp')}
              alt="A small watercolour study of a figure."
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </motion.figure>

          {/* Floating mono caption tag */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0 }}
            transition={{ ...SPRING, delay: 1 }}
            className="absolute -right-2 top-1/2 z-30 hidden rotate-90 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ink-soft lg:block"
          >
            No. 001 — Cotton rag
          </motion.span>
        </div>
      </div>
    </section>
  )
}
