import { motion, useReducedMotion } from 'framer-motion'
import { MARQUEE } from '../content.js'

export default function Marquee() {
  const reduce = useReducedMotion()
  const phrase = MARQUEE

  const Track = () => (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {phrase.map((p, pi) => (
        <span key={pi} className="flex items-center">
          <span className="flex px-8 font-display text-[clamp(2rem,6vw,5rem)] font-bold uppercase tracking-tight text-paper">
            {[...p].map((char, ci) => (
              <motion.span
                key={ci}
                style={{ display: 'inline-block' }}
                animate={reduce ? {} : { y: [0, -9, 0] }}
                transition={{
                  duration: 1.6,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: (pi * 0.4 + ci * 0.07),
                }}
              >
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
          </span>
          <motion.span
            className="text-terracotta text-[clamp(1.5rem,4vw,3rem)]"
            animate={reduce ? {} : { rotate: [0, 360] }}
            transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
            aria-hidden="true"
          >
            ✦
          </motion.span>
        </span>
      ))}
    </div>
  )

  return (
    <section aria-label="Live wedding watercolour" className="relative bg-ink">
      {/* Top wavy edge — paper-coloured mask creates the illusion of a wavy band border */}
      <svg
        viewBox="0 0 1440 44"
        className="block w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 L1440,0 L1440,28 C1260,12 1080,44 900,28 C720,12 540,44 360,28 C180,12 0,40 0,28 Z"
          fill="#F4EFE6"
        />
      </svg>

      {/* Scrolling band */}
      <div className="overflow-hidden py-5">
        <motion.div
          className="flex w-max flex-nowrap"
          animate={reduce ? {} : { x: ['0%', '-50%'] }}
          transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
        >
          <Track />
          <Track />
        </motion.div>
      </div>

      {/* Bottom wavy edge */}
      <svg
        viewBox="0 0 1440 44"
        className="block w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,44 L1440,44 L1440,16 C1260,32 1080,0 900,16 C720,32 540,0 360,16 C180,32 0,4 0,16 Z"
          fill="#F4EFE6"
        />
      </svg>
    </section>
  )
}
