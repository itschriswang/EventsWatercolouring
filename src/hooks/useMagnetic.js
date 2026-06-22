import { useRef, useEffect } from 'react'
import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'

/**
 * Magnetic pull for primary CTAs. A window-level pointer listener checks
 * whether the cursor is within `radius` pixels of the element's bounding box;
 * if so the element translates toward the cursor, eased by a spring. No-op on
 * touch pointers and under reduced-motion.
 *
 * Usage:
 *   const { ref, style } = useMagnetic()
 *   <motion.a ref={ref} style={style}>…</motion.a>
 */
export default function useMagnetic({ radius = 45, strength = 0.5 } = {}) {
  const reduce = useReducedMotion()
  const ref = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)

  useEffect(() => {
    if (reduce) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMove = (e) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right)
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom)
      if (Math.hypot(dx, dy) < radius) {
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        x.set((e.clientX - cx) * strength)
        y.set((e.clientY - cy) * strength)
      } else {
        x.set(0)
        y.set(0)
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduce, radius, strength, x, y])

  return { ref, style: { x: sx, y: sy } }
}
