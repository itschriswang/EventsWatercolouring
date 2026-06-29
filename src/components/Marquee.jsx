import { motion, useReducedMotion } from 'framer-motion'
import { MARQUEE } from '../content.js'

export default function Marquee() {
  const reduce = useReducedMotion()
  const phrase = MARQUEE

  const Track = () => (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {phrase.map((p, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 font-display text-[clamp(2rem,6vw,5rem)] font-bold uppercase tracking-tight text-paper">
            {p}
          </span>
          <span className="text-terracotta text-[clamp(1.5rem,4vw,3rem)]">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <section
      aria-label="Live wedding watercolour"
      className="relative"
      style={{ height: '200px' }}
    >
      {/*
        Asymmetric ink ribbon:
        Top edge  — sharp crest early (~24% width), lazy trough late (~69% width),
                    ribbon sits lower on the left than the right.
        Bottom edge — phase-shifted right so ribbon thickness swells at the trough
                    (drippy underside) and narrows at the crest.
      */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 0,42
             C 200,8 400,6 540,42
             C 720,75 1250,72 1440,35
             L 1440,158
             C 1200,200 750,200 560,160
             C 360,126 160,122 0,160 Z"
          fill="#2A2724"
        />
      </svg>

      {/* Scrolling text sits at the vertical centre of the section */}
      <div className="absolute inset-0 flex items-center overflow-hidden">
        <motion.div
          className="flex w-max flex-nowrap"
          animate={reduce ? {} : { x: ['0%', '-50%'] }}
          transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
        >
          <Track />
          <Track />
        </motion.div>
      </div>
    </section>
  )
}
