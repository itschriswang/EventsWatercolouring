import { motion } from 'framer-motion'
import { ENQUIRE_HREF } from '../lib/site.js'

// ─── Inline SVG icons — no external dependency ───────────────────────────────

const SKETCH_FILTER = (
  <defs>
    <filter id="sketch-rough">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
    </filter>
  </defs>
)

function AboutIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <circle cx="12" cy="7.6" r="4.1" filter="url(#sketch-rough)" />
      <path d="M3.6 21.4C4.3 16.9 7.7 14.4 12 14.4C16.3 14.4 19.7 16.9 20.4 21.4" filter="url(#sketch-rough)" />
    </svg>
  )
}

function GalleryIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M3.2 4.3H20.8V19.7H3.2Z" filter="url(#sketch-rough)" />
      <path d="M3.2 16.3L8.6 10.6Q9.6 9.5 10.6 10.6L14.3 14.6" filter="url(#sketch-rough)" />
      <path d="M12.9 16.1L16 12.9Q17 11.8 18 12.9L20.8 15.9" filter="url(#sketch-rough)" />
      <circle cx="8.1" cy="8.2" r="1.35" filter="url(#sketch-rough)" />
    </svg>
  )
}

function FaqIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M8.4 9.1C8.4 6.8 10.1 5.2 12.1 5.2C14.1 5.2 15.7 6.6 15.7 8.5C15.7 10.9 12.1 11.2 12.1 14.3" filter="url(#sketch-rough)" />
      <circle cx="12.1" cy="18.2" r="0.9" fill="currentColor" stroke="none" filter="url(#sketch-rough)" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M20.9 8.2V21.2H3.1V8.1" filter="url(#sketch-rough)" />
      <path d="M1.2 3.3H22.8V7.9C22.8 8.3 22.4 8.6 22 8.6H2C1.6 8.6 1.2 8.3 1.2 7.9V3.3Z" filter="url(#sketch-rough)" />
      <line x1="10.2" y1="12" x2="13.8" y2="12" filter="url(#sketch-rough)" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M4.1 4.2H19.9C21 4.2 21.9 5.1 21.9 6.2V17.8C21.9 18.9 21 19.9 19.9 19.9H4.1C3 19.9 2.1 19 2.1 17.8V6.2C2.1 5.1 3 4.2 4.1 4.2Z" filter="url(#sketch-rough)" />
      <path d="M21.8 6.3L12 12.9L2.2 6.2" filter="url(#sketch-rough)" />
    </svg>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Ordered to match the page's narrative flow (gallery now sits above the
// painter), keeping Enquire as the highlighted centrepiece.
const DOCK_ITEMS = [
  { id: 'gallery',   href: '/#work',      label: 'Gallery',  Icon: GalleryIcon },
  { id: 'about',     href: '/#painter',   label: 'About',    Icon: AboutIcon },
  { id: 'enquiry',   href: ENQUIRE_HREF,  label: 'Enquire',  Icon: MailIcon, highlight: true },
  { id: 'offerings', href: '/#offerings', label: 'Packages', Icon: BoxIcon },
  { id: 'faq',       href: '/faq/',       label: 'FAQ',      Icon: FaqIcon },
]

// The premium easing curve used site-wide.
const EASE = [0.25, 1, 0.5, 1]

// ─── Sub-components ───────────────────────────────────────────────────────────

function DockButton({ item }) {
  const { href, label, Icon, highlight } = item
  return (
    <motion.a
      href={href}
      className={[
        'flex flex-col items-center justify-center gap-[3px] rounded-full select-none',
        'px-3 py-2.5',
        highlight
          ? 'bg-terracotta text-paper px-3.5'
          : 'text-ink-soft',
      ].join(' ')}
      whileTap={{ scale: 0.86 }}
      transition={{ duration: 0.16, ease: EASE }}
      aria-label={label}
    >
      <Icon />
      <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] leading-none whitespace-nowrap">
        {label}
      </span>
    </motion.a>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function MobileNav({ revealed }) {
  return (
    <motion.div
      initial={{ y: 96, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: 96, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.45 }}
      // Outer wrapper is full-width but pointer-events-none so it doesn't
      // block the page. Only the inner nav pill is interactive.
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center md:hidden pointer-events-none"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav
        className="flex items-center gap-0.5 px-2 py-1.5 pointer-events-auto"
        style={{
          background: 'rgb(var(--rgb-paper) / 0.72)',
          backdropFilter: 'blur(26px) saturate(1.15)',
          WebkitBackdropFilter: 'blur(26px) saturate(1.15)',
          border: '1px solid rgb(var(--rgb-line) / 0.56)',
          borderRadius: 9999,
          // Ink shadow (approved palette) for the lift, paper-tone inset for
          // the glint — no neutral grey/white per the site's shadow rule.
          boxShadow:
            '0 8px 32px rgba(48,45,41,0.21), 0 0 0 1px rgba(244,239,230,0.55) inset',
        }}
        aria-label="Quick navigation"
      >
        {DOCK_ITEMS.map((item) => (
          <DockButton key={item.id} item={item} />
        ))}
      </nav>
    </motion.div>
  )
}
