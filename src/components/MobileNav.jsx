import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
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
          ? 'btn-aurora text-paper/70 px-3.5'
          : 'text-ink-soft',
      ].join(' ')}
      whileTap={{ scale: 0.86 }}
      transition={{ duration: 0.16, ease: EASE }}
      aria-label={label}
    >
      <Icon />
      <span
        className={
          (highlight ? 'btn-aurora-label ' : '') +
          'font-mono text-[0.56rem] uppercase tracking-[0.12em] leading-none whitespace-nowrap'
        }
      >
        {label}
      </span>
    </motion.a>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

// `enquireHref` mirrors SiteHeader: pages with their own reply card pass a
// local anchor so the dock's Enquire stays on-page.
export default function MobileNav({ revealed, enquireHref = ENQUIRE_HREF }) {
  // Keep the dock riding the *visible* bottom edge while the page is
  // pinch-zoomed. iOS Safari anchors `position: fixed` to the layout viewport,
  // not the visual one, so under a pinch-zoom this bar is left stranded over
  // mid-page content until the zoom resets. The VisualViewport API reports the
  // zoomed/panned window, so we translate the pill (in layout coordinates,
  // which iOS then scales along with the page) to sit at the bottom-centre of
  // what the visitor can actually see, countering the pinch scale so it stays
  // its normal size. Nothing runs at scale 1 — the transform is cleared, so
  // the un-zoomed dock is byte-for-byte the plain `bottom-0` bar. Applied to an
  // inner wrapper so it never fights the outer entrance spring's own transform.
  const trackRef = useRef(null)
  useEffect(() => {
    const vv = window.visualViewport
    const el = trackRef.current
    if (!vv || !el) return

    let raf = 0
    const apply = () => {
      raf = 0
      // Only intervene once genuinely zoomed; below this the native fixed
      // position is already correct and we leave the element untouched.
      if (vv.scale <= 1.01) {
        el.style.transform = ''
        return
      }
      const layoutW = window.innerWidth
      const layoutH = window.innerHeight
      // Centre of the visible area, and its bottom edge, in layout px.
      const dx = vv.offsetLeft + vv.width / 2 - layoutW / 2
      const dy = vv.offsetTop + vv.height - layoutH
      el.style.transform =
        `translate(${dx}px, ${dy}px) scale(${(1 / vv.scale).toFixed(4)})`
      el.style.transformOrigin = 'center bottom'
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    apply()
    vv.addEventListener('resize', schedule)
    vv.addEventListener('scroll', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      vv.removeEventListener('resize', schedule)
      vv.removeEventListener('scroll', schedule)
    }
  }, [])

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
     <div ref={trackRef} className="flex justify-center will-change-transform">
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
            '0 8px 32px rgba(78,38,57,0.21), 0 0 0 1px rgba(247,244,239,0.55) inset',
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
     </div>
    </motion.div>
  )
}
