import { motion, useReducedMotion } from 'framer-motion'
import useMagnetic from '../hooks/useMagnetic.js'
import { SPRING } from '../lib/site.js'
import GlassCardRim from './GlassCardRim.jsx'

/**
 * Primary CTA with a magnetic pull (via useMagnetic) and a reactive label that
 * skews and opens its tracking on hover. Renders as an anchor.
 */
export default function MagneticButton({
  href = '#',
  children,
  className = '',
  variant = 'ink',
  flow = false,
}) {
  const reduce = useReducedMotion()
  // Magnetic pull toward the cursor (no-op on touch / reduced-motion). This is
  // the behaviour the component is named for; without it the CTA is just a
  // plain link.
  const { ref, style } = useMagnetic()

  // The aurora gradient is the site's action surface — the ink ground carries
  // the colour on its label (`.btn-aurora-label`), so the dot/arrow stay a
  // flat light tone. `flow` (the Enquire CTAs) instead paints the hero title's
  // emphasis sweep straight onto the pill and drops the label to ink, so the
  // button reads as one of the site's watercolour bubbles — see `.btn-hero-flow`.
  const palette =
    variant === 'paper'
      ? 'bg-paper text-ink hover:bg-terracotta hover:text-paper'
      : flow
        ? 'btn-hero-flow text-ink overflow-hidden isolate'
        : 'btn-aurora text-paper/70'

  // On the flow surface the pastel fill already carries the colour, so the
  // label is plain ink; the aurora surface keeps its clipped-gradient label.
  const labelClass =
    variant === 'paper' || flow ? '' : 'btn-aurora-label '

  return (
    <motion.a
      ref={ref}
      href={href}
      style={style}
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
      {/* The wet-glass rim — the same wobbling water edge the packages' stat
          pills wear, sized to this pill (radius 999, a higher turbulence
          frequency for more swells across a shorter edge, gentler
          displacement so the thin rim never pinches apart). Flow surface only;
          the aurora/paper variants keep their flat edge. */}
      {flow && (
        <GlassCardRim
          radius={999}
          baseFrequency="0.05 0.09"
          baseFrequencyLull="0.035 0.06"
          scale={4}
          strokeWidth={1.75}
        />
      )}
      <span
        className="relative z-10 h-2 w-2 rounded-full bg-current opacity-60 transition-transform duration-300 group-hover:scale-125"
        aria-hidden="true"
      />
      <motion.span
        variants={{ hover: reduce ? {} : { skewX: -6} }}
        transition={SPRING}
        className={labelClass + 'relative z-10 inline-block'}
      >
        {children}
      </motion.span>
      <span
        aria-hidden="true"
        className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </motion.a>
  )
}
