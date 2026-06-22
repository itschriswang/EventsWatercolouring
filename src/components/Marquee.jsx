import { motion, useReducedMotion } from 'framer-motion'
import { MARQUEE } from '../content.js'

/**
 * Seamless infinite typography marquee. Two identical tracks sit side by side
 * and the pair translates by exactly -50%, so the loop is perfectly continuous
 * with no jump. High-contrast bold display type on an ink band.
 */
export default function Marquee() {
  const reduce = useReducedMotion()
  const phrase = MARQUEE

  const Track = () => (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {phrase.map((p, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 font-display text-[clamp(2rem,6vw,5rem)] font-light uppercase tracking-tight text-paper">
            {p}
          </span>
          <span className="text-terracotta text-[clamp(1.5rem,4vw,3rem)]">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <section
      aria-label="Live wedding watercolour"
      className="relative overflow-hidden border-y border-ink bg-ink py-6"
    >
      <motion.div
        className="flex w-max flex-nowrap"
        animate={reduce ? {} : { x: ['0%', '-50%'] }}
        transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
      >
        <Track />
        <Track />
      </motion.div>
    </section>
  )
}
