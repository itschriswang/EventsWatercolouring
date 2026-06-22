import { motion } from 'framer-motion'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'
import { NAV } from '../content.js'

/** Slim full-bleed sticky header, revealed after the preloader hands over. */
export default function SiteHeader({ revealed }) {
  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: -90, opacity: 0 }}
      transition={{ ...SPRING, delay: 0.25 }}
      className="sticky top-0 z-40 border-b border-line/50 bg-paper/70 backdrop-blur-md"
    >
      <div className="bleed flex items-center justify-between py-4">
        <a href="#top" className="font-display text-xl uppercase tracking-[-0.03em] text-ink">
          Christopher Wang<span className="text-terracotta">.</span>
        </a>
        <nav className="hidden items-center gap-8 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-soft md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href={ENQUIRE_HREF}
          className="rounded-full bg-lime px-5 py-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-ink transition-transform duration-300 hover:scale-105"
        >
          Enquire
        </a>
      </div>
    </motion.header>
  )
}
