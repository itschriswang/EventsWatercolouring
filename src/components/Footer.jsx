import { motion, useReducedMotion } from 'framer-motion'
import SplitText from './SplitText.jsx'
import MagneticButton from './MagneticButton.jsx'
import { ENQUIRE_HREF, EMAIL } from '../lib/site.js'
import { FOOTER } from '../content.js'

/** Closing CTA band — dark, full-bleed, with nav and signature. */
export default function Footer() {
  const reduce = useReducedMotion()

  return (
    <footer className="relative w-full overflow-hidden bg-ink px-[5vw] py-[clamp(4rem,10vw,8rem)] text-paper">
      <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        <SplitText
          as="p"
          unit="char"
          lines={FOOTER.cta}
          emphasis={FOOTER.emphasis}
          className="display-lg max-w-[18ch]"
        />
        <MagneticButton href={ENQUIRE_HREF} variant="paper">
          Enquire
        </MagneticButton>
      </div>

      <div className="mt-[clamp(3rem,7vw,6rem)] flex flex-col gap-8 border-t border-paper/15 pt-10 lg:flex-row lg:justify-between">
        <span className="font-display text-2xl uppercase tracking-tight">
          {FOOTER.name}
        </span>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-paper/60"
        >
          {FOOTER.nav.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-paper">
              {n.label}
            </a>
          ))}
          <a
            href={FOOTER.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-paper"
          >
            Instagram
          </a>
          <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-paper">
            Email
          </a>
        </nav>
      </div>
    </footer>
  )
}
