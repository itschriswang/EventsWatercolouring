import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useState } from 'react'
import { ENQUIRE_HREF } from '../lib/site.js'
import useFocusTrap from '../hooks/useFocusTrap.js'
import { FOOTER } from '../content.js'

// ─── Inline SVG icons — no external dependency ───────────────────────────────

const SKETCH_FILTER = (
  <defs>
    <filter id="sketch-rough">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
    </filter>
  </defs>
)

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M2.6 9.3L12 2L21.4 9.2V19.6C21.4 20.9 20.3 21.9 19 21.9H5C3.7 21.9 2.6 20.8 2.6 19.5V9.3Z" filter="url(#sketch-rough)" />
      <path d="M9 21.9V12H15V21.9" filter="url(#sketch-rough)" />
    </svg>
  )
}

function BrushIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M9.2 11.8L17.1 3.9Q19.8 1.2 22.2 3.6Q24.5 6.0 21.9 8.6L14 16.5" filter="url(#sketch-rough)" />
      <path d="M7.1 15C5.8 16.3 5.2 17.6 5.2 19.1C5.2 20.3 6 21.2 7.2 21.2C8.9 20.9 10.4 19.8 11.8 18.3" filter="url(#sketch-rough)" />
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

function MenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M3.2 7.1Q12 6.8 20.8 7.2" filter="url(#sketch-rough)" />
      <path d="M3 12.1H20.8" filter="url(#sketch-rough)" />
      <path d="M3.1 17.2Q12.1 17.8 21 17" filter="url(#sketch-rough)" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M18.1 5.9L6.1 17.9" filter="url(#sketch-rough)" />
      <path d="M6.1 5.9L18.1 17.9" filter="url(#sketch-rough)" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SKETCH_FILTER}
      <path d="M5.1 12.2H18.9" filter="url(#sketch-rough)" />
      <path d="M12.2 5.1L19 12.2L12.1 19.1" filter="url(#sketch-rough)" />
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
