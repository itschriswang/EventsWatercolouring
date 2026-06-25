import { motion, useReducedMotion } from 'framer-motion'
import useMagnetic from '../hooks/useMagnetic.js'
import { SPRING } from '../lib/site.js'

/**
 * Primary CTA with a magnetic pull (via useMagnetic) and a reactive label that
 * skews and opens its tracking on hover. Renders as an anchor.
 */
export default function MagneticButton({
  href = '#',
  children,
  className = '',
  variant = 'ink',
}) {
  const reduce = useReducedMotion()


  const palette =
    variant === 'paper'
      ? 'bg-paper text-ink hover:bg-terracotta hover:text-paper'
      : 'bg-ink text-paper hover:bg-terracotta'

  return (
    <motion.a
      
      href={href}
      
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      className={
        'group relative inline-flex items-center gap-3 rounded-full px-9 py-5 ' +
        'font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-300 ' +
        palette +
        ' ' +
        className
      }
    >
      <span
        className="h-2 w-2 rounded-full bg-current opacity-60 transition-transform duration-300 group-hover:scale-125"
        aria-hidden="true"
      />
      <motion.span
        variants={{ hover: reduce ? {} : { skewX: -6, letterSpacing: '0.32em' } }}
        transition={SPRING}
        className="inline-block"
      >
        {children}
      </motion.span>
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </motion.a>
  )
}
