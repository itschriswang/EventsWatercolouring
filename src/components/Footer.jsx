import { motion, useReducedMotion } from 'framer-motion'
import SplitText from './SplitText.jsx'
import { EMAIL, ENQUIRE_HREF } from '../lib/site.js'
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

/**
 * Closing CTA band — dark, full-bleed, with nav and signature.
 *
 * `enquireHref` mirrors SiteHeader and MobileNav: pages with their own reply
 * card (e.g. /corporate/, /faq/) pass a local anchor so the closing line
 * scrolls up to the on-page form instead of bouncing through the homepage.
 */
export default function Footer({ enquireHref = ENQUIRE_HREF }) {
  const reduce = useReducedMotion()

  return (
    <footer className="relative w-full overflow-hidden px-[5vw] pt-[clamp(4rem,8vw,7rem)] pb-36 md:pb-[clamp(4rem,8vw,7rem)] text-paper">
      {/* Fireflies night background. A real <picture> rather than a CSS
          background so the browser can pick the much lighter webp and lazy-load
          it — the heaviest image on the page never blocks anything above the
          footer. The wine ground beneath keeps the light type readable while
          (or if) the photo is still arriving. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-wine">
        <picture>
          <source srcSet="/assets/fireflies-night.webp" type="image/webp" />
          <img
            src="/assets/fireflies-night.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
      </div>
      {/* Overlay for text readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 88% 2%, rgba(255,165,95,0.15) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 44% 38% at 70% 18%, rgba(236,232,108,0.12) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 48% 42% at 58% 42%, rgba(205,215,80,0.15) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 52% 44% at 4% 96%, rgba(245,120,175,0.08) 0%, transparent 52%), ' +
            'radial-gradient(ellipse 40% 36% at 22% 70%, rgba(250,170,200,0.07) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 46% 40% at 42% 88%, rgba(120,180,150,0.10) 0%, transparent 55%), ' +
            'radial-gradient(ellipse 36% 32% at 96% 78%, rgba(150,190,170,0.10) 0%, transparent 58%), ' +
            'linear-gradient(160deg, rgba(45,24,36,0.65) 0%, rgba(54,30,43,0.60) 55%, rgba(66,36,50,0.65) 100%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        {/* The closing line IS the link — a visitor who scrolled this far is
            the warmest one on the page, so the biggest words at the moment of
            highest intent go straight to the reply card. */}
        <a
          href={enquireHref}
          className="group block"
          // Leave --underline-stroke unset so "keep" picks up <Underline>'s
          // own default — the two-colour pastel flow wash (pickFlowPair),
          // same as EveningTimeline's dark-ground underline. Those raw
          // swatches read fine against the dusk footer; only the deepened
          // text tokens (terracotta/rust) need the ivory-paper contrast
          // treatment. This word sits in the display-lg heading
          // (line-height 0.95, tighter than the body copy the default
          // offset is tuned for), so the stroke still needs to sit further
          // below the baseline or it crosses straight through the "p"
          // descender — push it down via --underline-offset.
          style={{ '--underline-offset': '-0.26em' }}
        >
          <SplitText
            as="p"
            unit="char"
            lines={FOOTER.cta}
            emphasis={FOOTER.emphasis}
            underline="keep"
            emphasisItalic
            inkBleed
            className="display-lg max-w-[18ch] [text-shadow:none]"
          />
          <span className="mt-5 inline-flex items-center gap-2.5 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-paper/60 transition-colors duration-300 group-hover:text-paper">
            Start an enquiry
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </a>
      </div>

      {/* Instagram — sits in the footer's middle band, right-aligned once
          there's room for it (lg+); left-aligned and stacked on mobile,
          matching how the CTA row above it reflows. */}
      <div className="relative z-10 mt-[clamp(2.5rem,6vw,4rem)] flex flex-col items-start gap-5 lg:items-end">
        <a
          href={FOOTER.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-paper/25 text-paper/70 transition-colors duration-300 group-hover:border-blush group-hover:text-blush">
            <InstagramIcon />
          </span>
          <span className="flex flex-col">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50">
              Follow along
            </span>
            <span className="font-sentient text-xl tracking-[-0.01em] text-paper transition-colors duration-300 group-hover:text-blush sm:text-2xl">
              {FOOTER.instagramHandle}
            </span>
          </span>
        </a>
      </div>

      <div className="relative z-10 mt-[clamp(3rem,7vw,6rem)] flex flex-col gap-8 border-t border-paper/15 pt-10 lg:flex-row lg:justify-between">
        <span className="flex flex-col gap-1.5">
          <span className="font-sentient text-2xl tracking-[-0.01em]">{FOOTER.name}</span>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-paper/55">
            © {new Date().getFullYear()} · Melbourne & Sydney
          </span>
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
