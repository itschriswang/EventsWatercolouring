import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'

/**
 * A floating "magnet" button. On a fine pointer it leans toward the cursor and
 * the label skews + opens its tracking; on touch / reduced-motion it stays a
 * plain, accessible link with a simple hover.
 */
export default function MagneticButton({
  href = '#',
  children,
  className = '',
  strength = 0.4,
}) {
  const reduce = useReducedMotion()
  const ref = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)

  const handleMove = (e) => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    // Only magnetise when the pointer is a mouse (fine pointer).
    if (!window.matchMedia('(pointer: fine)').matches) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      className={
        'group relative inline-flex items-center gap-3 rounded-full ' +
        'bg-ink px-9 py-5 font-mono text-xs uppercase tracking-[0.18em] text-paper ' +
        'transition-colors duration-300 ease-organic hover:bg-terracotta ' +
        className
      }
    >
      <motion.span
        variants={{
          hover: reduce ? {} : { skewX: -6, letterSpacing: '0.32em' },
        }}
        transition={SPRING}
        className="relative z-10 inline-block"
      >
        {children}
      </motion.span>
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-300 ease-organic group-hover:translate-x-1"
      >
        →
      </span>
    </motion.a>
  )
}
