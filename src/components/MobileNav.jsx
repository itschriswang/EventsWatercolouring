import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useState } from 'react'
import { ENQUIRE_HREF } from '../lib/site.js'
import useFocusTrap from '../hooks/useFocusTrap.js'
import { FOOTER } from '../content.js'

// ─── Inline SVG icons — no external dependency ───────────────────────────────

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.2L11.8 2.5L21 9.1V19.5C21 20.8 20.1 21.8 18.9 21.8H5.1C3.9 21.8 3 20.9 3 19.7V9.2" />
      <path d="M9 21.8V12H15V21.8" />
    </svg>
  )
}

function BrushIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12L17 4Q19.8 1 22 3.3Q24.2 5.7 21.8 8.8L14 16.5" />
      <path d="M7 15.2C5.8 16.4 5 17.7 5 19.2C5 20.5 5.9 21.3 7.2 21.3C8.9 21 10.3 19.8 11.8 18.2" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8.2V21.2H3V8" />
      <path d="M1 3.2H23V8C23 8.4 22.6 8.7 22.2 8.7H1.8C1.4 8.7 1 8.4 1 8V3.2Z" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4.2H20C21.1 4.2 22 5.1 22 6.2V17.8C22 18.9 21.1 19.8 20 19.8H4C2.9 19.8 2 18.9 2 17.8V6.2C2 5.1 2.9 4.2 4 4.2Z" />
      <path d="M22 6.3L12 13L2 6.2" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCK_ITEMS = [
  { id: 'home',      href: '#top',        label: 'Home',     Icon: HomeIcon },
  { id: 'keep',      href: '#keep',       label: 'Keepsakes', Icon: BrushIcon },
  { id: 'offerings', href: '#offerings',  label: 'Packages', Icon: BoxIcon },
  { id: 'enquiry',   href: ENQUIRE_HREF,  label: 'Enquire',  Icon: MailIcon, highlight: true },
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
        'px-3.5 py-2.5',
        highlight
          ? 'bg-lime text-ink px-4'
          : 'text-ink-soft',
      ].join(' ')}
      whileTap={{ scale: 0.86 }}
      transition={{ duration: 0.16, ease: EASE }}
      aria-label={label}
    >
      <Icon />
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] leading-none whitespace-nowrap">
        {label}
      </span>
    </motion.a>
  )
}

// Cross-fades Menu ↔ Close icons with a subtle rotation so the swap feels
// weighted rather than instantaneous.
function MenuToggle({ open, onToggle }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={open ? 'Close navigation' : 'Open navigation'}
      aria-expanded={open}
      className="flex flex-col items-center justify-center gap-[3px] rounded-full px-3.5 py-2.5 text-ink-soft select-none"
      whileTap={{ scale: 0.86 }}
      transition={{ duration: 0.16, ease: EASE }}
    >
      {/* Icon cross-fade */}
      <div className="relative" style={{ width: 19, height: 19 }}>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: open ? 0 : 1, rotate: open ? -45 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <MenuIcon />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: open ? 1 : 0, rotate: open ? 0 : 45 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <CloseIcon />
        </motion.div>
      </div>
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] leading-none">
        {open ? 'Close' : 'More'}
      </span>
    </motion.button>
  )
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

function NavSheet({ onClose }) {
  // dragControls restricts drag initiation to the handle only — the nav list
  // can then scroll freely without accidentally triggering the dismiss gesture.
  const dragControls = useDragControls()
  // Trap focus while the sheet is open, close on Escape, restore focus on close.
  const trapRef = useFocusTrap(true, onClose)

  return (
    <motion.div
      ref={trapRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.65 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 90 || info.velocity.y > 450) onClose()
      }}
      className="fixed inset-x-0 bottom-0 z-50 md:hidden overflow-hidden"
      style={{
        borderRadius: '24px 24px 0 0',
        background: 'rgb(var(--rgb-paper) / 0.97)',
        backdropFilter: 'blur(28px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.1)',
        border: '1px solid rgb(var(--rgb-line) / 0.6)',
        borderBottom: 'none',
        boxShadow: '0 -14px 52px rgba(42,39,36,0.13), 0 -1px 0 rgba(255,255,255,0.65) inset',
      }}
    >
      {/* Drag handle — the only zone that initiates the dismiss gesture */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex justify-center pt-4 pb-1 cursor-grab active:cursor-grabbing touch-none"
        aria-hidden="true"
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 9999,
            background: 'rgb(var(--rgb-line) / 0.9)',
          }}
        />
      </div>

      {/* Sheet header */}
      <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-line/40">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ink-soft">
          Explore
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-11 h-11 rounded-full text-ink-soft hover:text-ink hover:bg-line/40 transition-colors duration-200"
          aria-label="Close navigation"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Nav list — scrollable if the viewport is very short */}
      <nav aria-label="Full navigation" className="px-5 py-2 overflow-y-auto" style={{ maxHeight: '55vh' }}>
        <ul>
          {FOOTER.nav.map((item, i) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.038 + 0.06, duration: 0.3, ease: EASE }}
            >
              <a
                href={item.href}
                onClick={onClose}
                className="group flex items-center justify-between py-3.5"
                style={{
                  borderBottom: i < FOOTER.nav.length - 1 ? '1px solid rgba(216,207,191,0.42)' : 'none',
                }}
              >
                <span
                  className="font-sentient text-[1.15rem] tracking-[-0.01em] text-ink group-hover:text-terracotta"
                  style={{ transition: 'color 0.26s cubic-bezier(0.25,1,0.5,1)' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-ink-soft group-hover:text-terracotta"
                  style={{
                    transition:
                      'color 0.26s cubic-bezier(0.25,1,0.5,1), transform 0.26s cubic-bezier(0.25,1,0.5,1)',
                    transform: 'translateX(0)',
                  }}
                  // CSS-only arrow nudge on group hover via inline transition — JS avoids DOM overhead
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                >
                  <ArrowRightIcon />
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Enquire CTA */}
      <div
        className="px-5 pt-3 pb-8"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <motion.a
          href={ENQUIRE_HREF}
          onClick={onClose}
          className="flex items-center justify-center w-full py-4 rounded-full bg-lime font-mono text-[0.68rem] uppercase tracking-[0.22em] text-ink"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.26, ease: EASE }}
        >
          Enquire about your day
        </motion.a>
      </div>
    </motion.div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function MobileNav({ revealed }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      {/* Semi-transparent backdrop, tapping it collapses the sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: 'rgb(var(--rgb-ink) / 0.26)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={close}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && <NavSheet key="nav-sheet" onClose={close} />}
      </AnimatePresence>

      {/* ── Floating bottom dock ── */}
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
            boxShadow:
              '0 8px 32px rgba(42,39,36,0.14), 0 0 0 1px rgba(255,255,255,0.42) inset',
          }}
          aria-label="Quick navigation"
        >
          {DOCK_ITEMS.map((item) => (
            <DockButton key={item.id} item={item} />
          ))}
          <MenuToggle open={open} onToggle={() => setOpen((v) => !v)} />
        </nav>
      </motion.div>
    </>
  )
}
