import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING, asset } from '../lib/site.js'
import { PAINTER } from '../content.js'
import CornerBloom from './CornerBloom.jsx'
import Sparkles from './Sparkles.jsx'
import { withUnderline } from './Underline.jsx'

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
      className="relative w-full overflow-visible px-[5vw] pt-[clamp(4rem,8vw,7rem)]"
    >
      <div className="relative pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-12 items-start gap-x-8 gap-y-8">
          {/* Portrait — left on desktop, right on mobile */}
          <motion.figure
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={SPRING}
            className="col-span-12 sm:col-span-6 sm:col-start-7 lg:col-span-6 lg:col-start-1 lg:mt-0 order-2 sm:order-none lg:order-none"
          >
            <div className="relative sm:ml-auto sm:max-w-[20rem]">
              {/* A soft watercolour swatch rests behind the portrait, offset
                  like a hand-laid block of pigment. Its edges are feathered
                  (blur + multiply) so it reads as paint bleeding into the
                  paper — echoing the bloom washes used across the site —
                  rather than a hard geometric outline. The terracotta → rose
                  → ochre run mirrors the section's own label gradient. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-5 -top-5 h-full w-full rounded-[2.25rem]"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(176,74,118,0.55) 0%, rgba(176,74,118,0.50) 55%, rgba(142,99,184,0.42) 100%)',
                  filter: 'blur(22px)',
                  mixBlendMode: 'multiply',
                }}
              />
              <motion.div
                style={{
                  ...(parallax ? { y } : {}),
                  // overflow-hidden + border-radius alone doesn't clip the
                  // bird's rounded corner below — its own `filter` (the rust
                  // drop-shadow) puts it on a separate composited layer that
                  // the ancestor's rounded overflow clip fails to mask, so
                  // the bird's hard bottom/right crop shows past the curve.
                  // clip-path clips that layer correctly.
                  clipPath: 'inset(0 round 1.75rem)',
                }}
                className="relative overflow-hidden rounded-[1.75rem] border border-line bg-paper-deep"
              >
                <CornerBloom from="rgba(176,74,118,0.15)" to="rgba(142,99,184,0.11)" overlay />
                <div className="relative z-10">
                  <picture>
                    <source srcSet={asset(PAINTER.portraitWebp)} type="image/webp" />
                    <img
                      src={asset(PAINTER.portrait)}
                      alt="Christopher Wang, the painter."
                      width="1000"
                      height="1090"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      className="h-full w-full object-cover"
                    />
                  </picture>
                </div>
                {/* The watercolour bird perches in the portrait's corner,
                    fully opaque. The wrapper's clip-path (matching its
                    rounded corners) clips the bird's hard rectangular crop
                    so it stays inside the card's curved shape instead of
                    sticking out past it. The rust drop-shadow (palette, no
                    greys) sits on the wrapper so it traces the bird's own
                    silhouette. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 z-20 w-[72%]"
                  style={{ filter: 'drop-shadow(0 8px 16px rgba(142,68,112,0.28))' }}
                >
                  <picture>
                    <source srcSet={asset('assets/bird-accent.webp')} type="image/webp" />
                    <img
                      src={asset('assets/bird-accent.png')}
                      alt=""
                      aria-hidden="true"
                      width="800"
                      height="685"
                      loading="lazy"
                      decoding="async"
                      className="block w-full"
                    />
                  </picture>
                </div>
              </motion.div>
            </div>
          </motion.figure>

          {/* Title + bio + signature — left on mobile, right on desktop */}
          <div className="relative col-span-12 sm:col-span-6 sm:col-start-1 lg:col-span-6 lg:col-start-7 order-1 sm:order-none lg:order-none lg:pl-4">
            <Sparkles variant="burst" className="absolute -top-4 right-0 h-14 w-14 text-terracotta/80 lg:hidden" />
            <Label gradient={['#B04A76', '#8E63B8']}>{PAINTER.label}</Label>
            <SplitText
              as="h2"
              unit="char"
              lines={PAINTER.title}
              emphasis={PAINTER.emphasis}
              emphasisItalic
              className="display-lg mt-5 text-ink"
            />
            <div className="mt-8 flex flex-col gap-5 text-[clamp(1rem,1.1vw,1.15rem)] leading-relaxed text-ink-soft">
              {PAINTER.body.map((p, i) => (
                <p key={i}>
                  {i === 1
                    ? withUnderline(p, 'something real to take home', { className: 'text-rust' })
                    : p}
                </p>
              ))}
            </div>
            {PAINTER.signature && (
              <p className="mt-6 font-mono text-4xl text-terracotta">
                {PAINTER.signature}
              </p>
            )}
          </div>
        </div>
      </div>

    </section>
  )
}
