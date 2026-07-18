import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Drop } from './Label.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING } from '../lib/site.js'
import { EVENING } from '../content.js'
import WatercolourBloom from './WatercolourBloom.jsx'
import GlassPill from './GlassPill.jsx'
import GlassCardRim from './GlassCardRim.jsx'
import FolderCell from './FolderCell.jsx'
import { withUnderline } from './Underline.jsx'
import usePinchZoomed from '../hooks/usePinchZoom.js'

/**
 * "How the evening runs" — a sticky split-screen. A massive section title is
 * pinned on the left while the beats run down the right as a vertical tracking
 * timeline: a spine, numbered dots that fill as each beat scrolls into view
 * (like watching a parcel move through its stops), and a destination marker on
 * the final beat. Dusk-drenched — the aurora palette after sundown — single
 * layout from phone to desktop so the two never drift apart.
 */
export default function EveningTimeline() {
  const reduce = useReducedMotion()
  const zoomed = usePinchZoomed()
  // On touch/small devices we keep the entrances simple: a fade with no y
  // translate, and the dot fills on reveal rather than animating its ring.
  const lite = reduce || !useHeavyFx()
  const beats = EVENING.beats

  // The spine fills top-to-bottom as the beats scroll past — the "parcel
  // moving through its stops" the dots already gesture at. Progress runs
  // from the list entering mid-viewport to its end clearing the same line,
  // smoothed with a spring so the fill trails the scroll like wet pigment
  // wicking down the page. Lite devices keep the static spine instead.
  const listRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.72', 'end 0.72'],
  })
  const spineFill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    // The section itself is now just spacing on the paper page; the whole
    // evening is filed as one big dusk folder floating on it. Crucially the
    // folder keeps the section's OWN dusk colour and blooms — we only clip the
    // shape (see FolderCell / `.folder-cell`), never repaint it to a cream
    // manila. The sticky title rail still pins: `.folder-cell` clips with
    // `clip-path`, not `overflow`, so it never traps the pin.
    <section
      id="night"
      className="relative w-full px-[5vw] py-[clamp(4rem,8vw,7rem)] text-paper"
    >
      <FolderCell
        tone="dusk"
        label={EVENING.label}
        gradient={['#EFEFA0', '#F7F4EF']}
        labelClassName="!text-paper/90"
        tabWidth="min(58%, 17rem)"
        bg="#2A2226"
        bloom={
          <>
            {/* Overlay for text readability and ambience — same blooms as
                before, now clipped to the folder shape. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 55% at 8% 5%, rgba(255,165,95,0.20) 0%, transparent 60%), ' +
                  'radial-gradient(ellipse 55% 45% at 90% 10%, rgba(250,170,200,0.17) 0%, transparent 55%), ' +
                  'radial-gradient(ellipse 60% 50% at 92% 92%, rgba(175,140,230,0.17) 0%, transparent 55%), ' +
                  'radial-gradient(ellipse 45% 40% at 30% 100%, rgba(236,232,108,0.14) 0%, transparent 60%), ' +
                  'radial-gradient(ellipse 48% 40% at 55% 48%, rgba(205,215,80,0.17) 0%, transparent 55%), ' +
                  'linear-gradient(170deg, rgba(34,26,30,0.25) 0%, rgba(44,34,39,0.45) 35%, rgba(54,42,48,0.65) 100%)',
              }}
            />
            {/* Watercolour pigment wash, bottom-left — a soft glow lifting off
                the dusk ground, masked to a radial fade and now tucked inside
                the folder's own bottom-left. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-[52vw] w-[52vw] max-h-[560px] max-w-[560px] overflow-hidden opacity-90"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 70% at 32% 72%, black 0%, black 38%, transparent 76%)',
                maskImage:
                  'radial-gradient(ellipse 70% 70% at 32% 72%, black 0%, black 38%, transparent 76%)',
              }}
            >
              <WatercolourBloom />
            </div>
          </>
        }
        contentClassName="grid grid-cols-12 gap-x-8 px-4 pb-6 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12"
      >
        {/* Sticky title rail */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            {/* No backlight glow here: the section runs light type on the
                dark dusk ground, so the display glow (a warm near-white) would
                read as the same colour as the letters and just blur them.
                Dropped for crisp type. */}
            <h2 className="display-lg mt-1 [text-shadow:none]">
              {EVENING.title[0]}
              <br />
              <em>{EVENING.title[1]}</em>
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-paper/90">
              {withUnderline(EVENING.lede, 'the two of you', { className: 'text-ochre-light' })}
            </p>
          </div>
        </div>

        {/* Tracking timeline — one layout, mobile through desktop. The spine
            sits behind the dots; each step reveals on scroll and fills its dot,
            so the eye reads top-to-bottom like a delivery tracker. */}
        <div className="col-span-12 mt-12 lg:col-span-7 lg:mt-0">
          <ol ref={listRef} className="relative">
            {/* Spine: a faint track down the dot column, with a warm fill
                that draws in as the beats scroll past (static when lite). */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-6 left-[1.125rem] top-3 w-px bg-paper/25"
            />
            {!lite && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 left-[1.125rem] top-3 w-px bg-ochre-light/80"
                style={{ scaleY: spineFill, transformOrigin: 'top' }}
              />
            )}
            {beats.map((beat, i) => {
              const isLast = i === beats.length - 1
              return (
                <motion.li
                  key={beat.no}
                  initial={{ opacity: 0, y: lite ? 0 : 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  animate={zoomed ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={
                    lite ? { duration: 0.4 } : { ...SPRING, delay: 0.05 }
                  }
                  className="relative flex gap-5 pb-10 last:pb-0 sm:gap-6"
                >
                  {/* Step marker. Each dot pops in as its beat reveals, so the
                      column reads like a tracker filling in stop by stop; the
                      final beat becomes a filled orchid — the destination. */}
                  <motion.span
                    initial={lite ? false : { scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    animate={zoomed ? { scale: 1, opacity: 1 } : undefined}
                    viewport={{ once: true, margin: '-90px' }}
                    transition={lite ? { duration: 0.3 } : { ...SPRING, delay: 0.12 }}
                    className="relative z-10 shrink-0"
                    aria-hidden="true"
                  >
                    {isLast ? (
                      <GlassPill
                        opaque
                        tint={['#BFDCD1', '#8FB5A8']}
                        rim={['rgba(191,220,209,0.55)', 'rgba(143,181,168,0.4)']}
                        className="h-9 w-9 justify-center shadow-[0_2px_12px_rgba(78,38,57,0.55)]"
                      >
                        <Drop
                          className="h-5 w-auto"
                          gradient={['#BFDCD1', '#8FB5A8']}
                        />
                      </GlassPill>
                    ) : (
                      <GlassPill
                        opaque
                        className="h-9 w-9 justify-center border border-paper/40 font-mono text-[0.7rem] text-wine shadow-[0_2px_12px_rgba(78,38,57,0.42)]"
                      >
                        {beat.no}
                      </GlassPill>
                    )}
                  </motion.span>

                  {/* Step card — a pinned watercolour note: paper-toned,
                      lifting slightly on hover. Ported from the keepsake
                      cards this timeline absorbed, minus their tilt — a
                      rotation that reads fine on a roughly-square card looks
                      like a lean on a strip this long and thin. */}
                  <motion.div
                    whileHover={reduce ? {} : { y: -6 }}
                    transition={SPRING}
                    className="group relative -mt-px flex-1 rounded-2xl border border-paper/15 bg-paper-deep/95 p-4 shadow-[0_10px_30px_-18px_rgba(78,38,57,0.58)] backdrop-blur-[1px] sm:p-5"
                  >
                    <GlassCardRim />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-terracotta/0 transition-colors duration-500 group-hover:ring-terracotta/30"
                    />
                    <h3 className="relative font-mono text-[clamp(1.25rem,2.4vw,1.9rem)] leading-tight tracking-[-0.01em] text-ink">
                      {beat.title}
                    </h3>
                    <p className="relative mt-2 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">
                      {beat.body}
                    </p>
                  </motion.div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </FolderCell>
    </section>
  )
}
