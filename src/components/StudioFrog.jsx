import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { asset } from '../lib/site.js'

/** A tiny watercolour tree frog that peeks from the bottom-right corner. Hover to let it hop. */
export default function StudioFrog() {
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-6 z-50 hidden lg:block"
      aria-hidden="true"
    >
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
        transition={{ duration: 0.18 }}
        className="mb-1 text-center font-mono text-[0.5rem] uppercase tracking-[0.25em] text-ink-soft"
      >
        studio visitor
      </motion.p>

      <motion.img
        src={asset('assets/20260312_231343000_iOS.png')}
        alt=""
        className="pointer-events-auto w-20 mix-blend-multiply"
        initial={{ y: '72%' }}
        animate={{ y: hovered ? '0%' : '72%' }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: 'spring', stiffness: 180, damping: 14 }
        }
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      />
    </div>
  )
}
