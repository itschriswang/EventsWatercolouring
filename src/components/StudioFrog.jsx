import { motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { asset } from '../lib/site.js'

/** A tiny watercolour tree frog that peeks from the bottom-right corner.
 *  Hover — or wait — to see it hop. */
export default function StudioFrog() {
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [autoHop, setAutoHop] = useState(false)
  const turbRef = useRef(null)
  const rafRef = useRef(null)

  // Slowly breathe the SVG displacement baseFrequency so the paint ripples
  useEffect(() => {
    if (reduce) return
    let t = 0
    const tick = () => {
      t += 0.003
      if (turbRef.current) {
        const fx = (0.012 + Math.sin(t) * 0.005).toFixed(4)
        const fy = (0.016 + Math.cos(t * 0.7) * 0.004).toFixed(4)
        turbRef.current.setAttribute('baseFrequency', `${fx} ${fy}`)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reduce])

  // Spontaneous hops every 8–18 s when the user isn't already hovering
  useEffect(() => {
    if (reduce) return
    let outer, inner
    const schedule = () => {
      outer = setTimeout(() => {
        setAutoHop(true)
        inner = setTimeout(() => setAutoHop(false), 1400)
        schedule()
      }, 8000 + Math.random() * 10000)
    }
    schedule()
    return () => { clearTimeout(outer); clearTimeout(inner) }
  }, [reduce])

  const isUp = hovered || autoHop

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-6 z-50 hidden lg:block"
      aria-hidden="true"
    >
      {/* Displacement filter: slow-breathing turbulence gives the painting a living, wet feel */}
      <svg width="0" height="0" aria-hidden="true" className="absolute overflow-hidden">
        <defs>
          <filter id="frog-shimmer" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.012 0.016"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: isUp ? 1 : 0, y: isUp ? 0 : 4 }}
        transition={{ duration: 0.18 }}
        className="mb-1 text-center font-mono text-[0.5rem] uppercase tracking-[0.25em] text-ink-soft"
      >
        studio visitor
      </motion.p>

      {/* Paper shelf: light surface for mix-blend-multiply + spring + entrance wiggle */}
      <motion.div
        className="pointer-events-auto cursor-pointer rounded-t-2xl bg-paper px-3 pt-2 shadow-[0_-4px_20px_rgba(42,39,36,0.12)]"
        initial={{ y: '60%' }}
        animate={{
          y: isUp ? '0%' : '60%',
          rotate: isUp ? [0, -5, 4, -2, 0] : 0,
        }}
        transition={{
          y: reduce ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 14 },
          rotate: reduce ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' },
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        {/* Idle bob — gentle float independent of the hop translation above */}
        <motion.img
          src={asset('assets/20260312_231343000_iOS.png')}
          alt=""
          className="w-20 mix-blend-multiply"
          style={{ filter: reduce ? undefined : 'url(#frog-shimmer)' }}
          animate={reduce ? {} : { y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}
