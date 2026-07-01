import { motion, useReducedMotion } from 'framer-motion'
import SplitText from './SplitText.jsx'
import { EMAIL } from '../lib/site.js'
import { FOOTER } from '../content.js'

/** Closing CTA band — dark, full-bleed, with nav and signature. */
export default function Footer() {
  const reduce = useReducedMotion()

  return (
    <footer className="relative w-full overflow-hidden bg-ink px-[5vw] pt-[clamp(4rem,8vw,7rem)] pb-36 md:pb-[clamp(4rem,8vw,7rem)] text-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 90% 5%, rgba(194,97,60,0.10) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 50% 40% at 5% 95%, rgba(110,140,168,0.08) 0%, transparent 50%), ' +
            'radial-gradient(ellipse 45% 40% at 48% 55%, rgba(174,191,86,0.07) 0%, transparent 55%)',
        }}
      />
      <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        <SplitText
          as="p"
          unit="char"
          lines={FOOTER.cta}
          emphasis={FOOTER.emphasis}
          emphasisItalic
          className="display-lg max-w-[18ch]"
        />
      </div>

      <div className="mt-[clamp(3rem,7vw,6rem)] flex flex-col gap-8 border-t border-paper/15 pt-10 lg:flex-row lg:justify-between">
        <span className="font-sentient font-bold text-2xl tracking-[-0.01em]">
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
