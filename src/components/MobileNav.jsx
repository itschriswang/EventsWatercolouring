import { motion } from 'framer-motion'
import { ENQUIRE_HREF } from '../lib/site.js'
import {
  ColorBrush2Icon,
  DesignProcessDrawingBoardIcon,
  EnvelopePigeonIcon,
  HelpHeadphonesIcon,
  ShoppingBagIcon,
} from './icons/FreehandIcons.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────

// Ordered to match the page's narrative flow (gallery now sits above the
// painter), keeping Enquire as the highlighted centrepiece.
const DOCK_ITEMS = [
  { id: 'gallery',   href: '/#work',      label: 'Gallery',  Icon: DesignProcessDrawingBoardIcon },
  { id: 'about',     href: '/#painter',   label: 'About',    Icon: ColorBrush2Icon },
  { id: 'enquiry',   href: ENQUIRE_HREF,  label: 'Enquire',  Icon: EnvelopePigeonIcon, highlight: true },
  { id: 'offerings', href: '/#offerings', label: 'Packages', Icon: ShoppingBagIcon },
  { id: 'faq',       href: '/faq/',       label: 'FAQ',      Icon: HelpHeadphonesIcon },
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
          ? 'btn-aurora btn-aurora-compact text-paper px-3.5'
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

// `enquireHref` mirrors SiteHeader: pages with their own reply card pass a
// local anchor so the dock's Enquire stays on-page.
export default function MobileNav({ revealed, enquireHref = ENQUIRE_HREF }) {
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
            '0 8px 32px rgba(63,53,82,0.21), 0 0 0 1px rgba(247,244,239,0.55) inset',
        }}
        aria-label="Quick navigation"
      >
        {DOCK_ITEMS.map((item) => (
          <DockButton
            key={item.id}
            item={item.id === 'enquiry' ? { ...item, href: enquireHref } : item}
          />
        ))}
      </nav>
    </motion.div>
  )
}
