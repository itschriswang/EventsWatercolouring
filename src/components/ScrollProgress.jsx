import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

/**
 * A thin pigment bar pinned to the very top of the page that fills left-to-right
 * as you scroll — the same "tracking" motif as the evening timeline, scaled to
 * the whole page. Springed so it eases rather than snaps. Hidden entirely under
 * reduced-motion, where a constantly redrawing bar is the wrong call.
 *
 * Desktop only: on iOS the OS status bar / Dynamic Island sits above the
 * browser's content area, so a `top-0` bar can never reach the physical top of
 * the screen and reads as misaligned. We hide it below the `md` breakpoint
 * (matching the site's mobile/desktop split) rather than fight an OS limit.
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
      className="fixed inset-x-0 top-0 z-[60] hidden h-[3px] origin-left bg-gradient-to-r from-ochre via-terracotta to-rust md:block"
    />
  )
}
