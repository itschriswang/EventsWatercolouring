import { motion, useReducedMotion } from 'framer-motion'
import SplitText from './SplitText.jsx'
import { EMAIL } from '../lib/site.js'
import { FOOTER } from '../content.js'

// Hand-sketched, matching the mobile dock's icon set (MobileNav.jsx): a
// rounded lens body, an aperture ring, and the shutter dot — roughed up with
// the same turbulence-displacement filter so it reads as drawn, not iconography.
function InstagramIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <filter id="footer-sketch-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
        </filter>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5.5" filter="url(#footer-sketch-rough)" />
      <circle cx="12" cy="12" r="4.3" filter="url(#footer-sketch-rough)" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

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
          underline="keep"
          emphasisItalic
          className="display-lg max-w-[18ch]"
        />
      </div>

      {/* Instagram — sits in the footer's middle band, right-aligned once
          there's room for it (lg+); left-aligned and stacked on mobile,
          matching how the CTA row above it reflows. */}
      <div className="mt-[clamp(2.5rem,6vw,4rem)] flex flex-col items-start gap-5 lg:items-end">
        <a
          href={FOOTER.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-paper/25 text-paper/70 transition-colors duration-300 group-hover:border-terracotta group-hover:text-terracotta">
            <InstagramIcon />
          </span>
          <span className="flex flex-col">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-paper/50">
              Follow along
            </span>
            <span className="font-sentient text-xl tracking-[-0.01em] text-paper transition-colors duration-300 group-hover:text-terracotta sm:text-2xl">
              {FOOTER.instagramHandle}
            </span>
          </span>
        </a>
      </div>

      <div className="mt-[clamp(3rem,7vw,6rem)] flex flex-col gap-8 border-t border-paper/15 pt-10 lg:flex-row lg:justify-between">
        <span className="font-sentient text-2xl tracking-[-0.01em]">
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
          <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-paper">
            Email
          </a>
        </nav>
      </div>
    </footer>
  )
}
