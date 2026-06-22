import { motion } from 'framer-motion'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'

/** Slim sticky header revealed after the preloader hands over. */
export default function SiteHeader({ revealed }) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ ...SPRING, delay: 0.3 }}
      className="sticky top-0 z-40 border-b border-line/60 bg-paper/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-wrap items-center justify-between px-[clamp(1.25rem,4vw,4rem)] py-4">
        <a
          href="#top"
          className="font-display text-lg uppercase tracking-[-0.02em] text-ink"
        >
          Watercolour<span className="text-terracotta">.</span>
        </a>
        <nav className="hidden items-center gap-8 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink-soft sm:flex">
          <a href="#process" className="transition-colors hover:text-ink">
            Process
          </a>
          <a href="#offerings" className="transition-colors hover:text-ink">
            Offerings
          </a>
        </nav>
        <a
          href={ENQUIRE_HREF}
          className="rounded-full bg-lime px-5 py-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink transition-transform duration-300 ease-organic hover:scale-105"
        >
          Enquire
        </a>
      </div>
    </motion.header>
  )
}
