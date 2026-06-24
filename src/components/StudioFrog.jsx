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

      {/* Paper shelf: keeps the blend context light regardless of what scrolls behind */}
      <motion.div
        className="pointer-events-auto cursor-pointer rounded-t-2xl bg-paper px-3 pt-2 shadow-[0_-4px_20px_rgba(42,39,36,0.12)]"
        initial={{ y: '60%' }}
        animate={{ y: hovered ? '0%' : '60%' }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: 'spring', stiffness: 180, damping: 14 }
        }
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <img
          src={asset('assets/20260312_231343000_iOS.png')}
          alt=""
          className="w-20 mix-blend-multiply"
        />
      </motion.div>
    </div>
  )
}
