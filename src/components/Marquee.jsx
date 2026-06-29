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
      style={{ height: '180px' }}
    >
      {/*
        Wavy ink ribbon — an SVG path that arcs across the page.
        preserveAspectRatio="none" stretches it to fill any viewport width
        so the wave always spans the full screen.
      */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 0,35 C 240,0 480,0 720,35 C 960,70 1200,70 1440,35
             L 1440,145 C 1200,180 960,180 720,145 C 480,110 240,110 0,145 Z"
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
