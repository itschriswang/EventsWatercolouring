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
          {/* Left column: title + bio + signature + CTA */}
          <div className="relative col-span-12 sm:col-span-6 sm:col-start-1 lg:col-span-6 lg:col-start-1">
            <Sparkles className="absolute -top-4 right-0 h-14 w-14 text-terracotta/80" />
            <Label gradient={['#C2613C', '#C9A23A']}>{PAINTER.label}</Label>
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
  
          {/* Right column: portrait, top aligned near the "me" line */}
          <motion.figure
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={SPRING}
            className="col-span-12 sm:col-span-6 sm:col-start-7 lg:col-span-6 lg:col-start-7 lg:mt-16"
          >
            <div className="relative sm:ml-auto sm:max-w-[20rem]">
              {/* offset accent frame — a gradient stroke, no fill, so the
                  bloom wash behind the portrait stays visible through it.
                  The angle keeps drifting via @property so the gradient
                  itself slowly turns rather than sitting static. */}
              <div
                aria-hidden="true"
                className="gradient-frame absolute -left-4 -top-4 h-full w-full rounded-[1.2rem]"
                style={{
                  background: 'linear-gradient(var(--gf-angle), #C98B8C 0%, #C2613C 100%)',
                  padding: '1px',
                }}
              />
              <motion.div
                style={parallax ? { y } : {}}
                className="relative overflow-hidden rounded-[1.2rem] border border-line bg-paper-deep"
              >
                <CornerBloom from="rgba(194,97,60,0.15)" to="rgba(228,136,156,0.11)" overlay />
                <div className="relative z-10">
                  <picture>
                    <source srcSet={asset(PAINTER.portraitWebp)} type="image/webp" />
                    <img
                      src={asset(PAINTER.portrait)}
                      alt="Christopher Wang, the painter."
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      className="h-full w-full object-cover"
                    />
                  </picture>
                </div>
                {/* The watercolour bird perches in the portrait's corner like
                    a sticker on the photo. Its art has a hard rectangular
                    crop on its bottom and right, so the card's own
                    overflow-hidden rounded edge is exactly where that crop
                    lands — the bird reads as printed to the card's edge. The
                    rust drop-shadow (palette, no greys) lifts it off the
                    photograph. */}
                <picture>
                  <source srcSet={asset('assets/bird-accent.webp')} type="image/webp" />
                  <img
                    src={asset('assets/bird-accent.png')}
                    alt=""
                    aria-hidden="true"
                    width="1200"
                    height="1028"
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none absolute bottom-0 right-0 z-20 w-[58%]"
                    style={{ filter: 'drop-shadow(0 6px 14px rgba(115,46,17,0.30))' }}
                  />
                </picture>
              </motion.div>
            </div>
          </motion.figure>
        </div>
      </div>

    </section>
  )
}
