import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

/**
 * A thin pigment bar pinned to the very top of the page that fills left-to-right
 * as you scroll — the same "tracking" motif as the evening timeline, scaled to
 * the whole page. Springed so it eases rather than snaps. Hidden entirely under
 * reduced-motion, where a constantly redrawing bar is the wrong call.
 */
export default function ScrollProgress() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  if (reduce) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-ochre via-terracotta to-rust"
    />
  )
}
