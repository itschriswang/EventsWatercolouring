import { useRef } from 'react'
import {
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionTemplate,
  motion,
} from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * Negative-space seam — a boundary-spanning wordmark that straddles the tonal
 * fold between the cream editorial body above and the dark rust field of the
 * evening-timeline section below. The word ("On the night") is painted twice
 * and split at the seam line: the portion sitting in the paper zone reads rust
 * (a preview of the section you are entering), the portion in the rust zone
 * reads paper (the cream carried down). The letterforms bridge the two fields,
 * so the tonal change reads as the title being cut out of one and revealed in
 * the other.
 *
 * On roomy fine-pointer devices the split line tracks scroll, so the rust field
 * appears to rise and "fill" the word as it passes. Touch devices and
 * reduced-motion visitors get the same composition frozen at a static split —
 * no scroll listener, no motion. The wordmark is decorative (aria-hidden); the
 * section's real <h2> still carries the heading for assistive tech.
 */
export default function NegativeSeam({ word = 'On the night' }) {
  const reduce = useReducedMotion()
  const animate = useHeavyFx() && !reduce
  const ref = useRef(null)

  // Progress of the band through the viewport: 0 as it enters from below,
  // 1 as it leaves off the top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // The split travels from 62% down to 38% as the band scrolls up, so the rust
  // field grows upward and the word fills with rust. Static at 50% otherwise.
  const splitPct = useTransform(scrollYProgress, [0, 1], [62, 38])
  const split = useMotionTemplate`${splitPct}%`

  // Background: transparent above the split (lets the page's paper/bloom show
  // through, so the seam melds with whatever sits above it) and solid rust
  // below — this half butts seamlessly into the rust section that follows.
  const bg = useMotionTemplate`linear-gradient(to bottom, transparent 0%, transparent ${splitPct}%, #9A4A2B ${splitPct}%, #9A4A2B 100%)`

  // Each text layer is clipped to its half of the split. Rust text shows above
  // the line; paper text shows below it.
  const rustClip = useMotionTemplate`inset(0 0 ${useTransform(splitPct, (v) => 100 - v)}% 0)`
  const paperClip = useMotionTemplate`inset(${split} 0 0 0)`

  // Frozen composition for touch / reduced-motion: a fixed 50% split.
  const staticBg =
    'linear-gradient(to bottom, transparent 0%, transparent 50%, #9A4A2B 50%, #9A4A2B 100%)'

  const wordClass =
    'absolute inset-0 flex items-center justify-center whitespace-nowrap ' +
    'font-sentient leading-none tracking-[-0.03em] ' +
    'text-[clamp(3rem,17vw,13rem)]'

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative w-full overflow-hidden select-none"
    >
      {/* Height carries the fold; the two halves each take about half of it. */}
      <div className="relative h-[clamp(9rem,26vw,20rem)]">
        {/* Tonal fields */}
        <motion.div
          className="absolute inset-0"
          style={{ background: animate ? bg : staticBg }}
        />

        {/* Rust copy — the letters sitting in the paper zone. */}
        <motion.span
          className={wordClass + ' text-rust'}
          style={{ clipPath: animate ? rustClip : 'inset(0 0 50% 0)' }}
        >
          {word}
        </motion.span>

        {/* Paper copy — the letters carried down into the rust zone. */}
        <motion.span
          className={wordClass + ' text-paper'}
          style={{ clipPath: animate ? paperClip : 'inset(50% 0 0 0)' }}
        >
          {word}
        </motion.span>
      </div>
    </div>
  )
}
