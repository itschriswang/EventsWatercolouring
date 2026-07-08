import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'
import { NAV } from '../content.js'

const EASE = [0.25, 1, 0.5, 1]

// Individual nav link with scroll-tracked active underline + hover state.
function NavLink({ href, label, isActive }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      className="relative py-0.5"
      style={{
        color: isActive ? 'rgb(var(--rgb-ink))' : 'rgb(var(--rgb-ink-soft))',
        transition: 'color 0.3s cubic-bezier(0.25,1,0.5,1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      {/* Ink-spread underline: active overrides hover */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '1px',
          backgroundColor: 'var(--c-terracotta)',
          width: isActive || hovered ? '100%' : '0%',
          transition: 'width 0.4s cubic-bezier(0.25,1,0.5,1)',
        }}
      />
    </a>
  )
}

// `enquireHref` lets pages with their own reply card (e.g. /corporate/)
// keep the CTA on-page instead of bouncing back to the homepage form.
export default function SiteHeader({ revealed, className = '', enquireHref = ENQUIRE_HREF }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(null)

  // Compress the header once the page is scrolled past the fold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav link whose section is currently in the reading zone.
  // Hrefs are root-relative (e.g. `/#offerings`) so the same nav also works
  // from other static pages like /faq/ — match by element, not by stripping
  // a leading '#' (which would mangle the '/' prefix).
  useEffect(() => {
    const sections = NAV
      .filter((n) => n.href.includes('#'))
      .map((n) => ({ href: n.href, el: document.getElementById(n.href.split('#')[1]) }))
      .filter((s) => s.el)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const match = sections.find((s) => s.el === e.target)
          if (match) setActive(match.href)
        })
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    )
    sections.forEach((s) => observer.observe(s.el))
    return () => observer.disconnect()
  }, [])

  // Page-link nav items (no '#', e.g. '/faq/') are active by pathname match
  // rather than scroll position, since there's nothing to observe for them.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const isNavActive = (href) =>
    active === href || (!href.includes('#') && pathname === href)

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ ...SPRING, delay: 0.25 }}
      // hidden on mobile — MobileNav owns small screens
      className={`hidden md:block sticky top-0 z-50 ${className}`}
      style={{
        background: scrolled ? 'rgb(var(--rgb-paper) / 0.97)' : 'rgb(var(--rgb-paper) / 0.74)',
        backdropFilter: 'blur(18px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
        borderBottom: `1px solid ${scrolled ? 'rgb(var(--rgb-line) / 0.72)' : 'rgb(var(--rgb-line) / 0.46)'}`,
        transition:
          'background 0.55s cubic-bezier(0.25,1,0.5,1), border-color 0.55s cubic-bezier(0.25,1,0.5,1)',
      }}
    >
      <div
        className="bleed flex items-center justify-between"
        style={{
          paddingTop: scrolled ? '0.55rem' : '1rem',
          paddingBottom: scrolled ? '0.55rem' : '1rem',
          transition: 'padding 0.55s cubic-bezier(0.25,1,0.5,1)',
        }}
      >
        {/* Logo — a thin terracotta accent stroke mirrors a painter's mark */}
        <a href="/#top" className="flex items-center gap-2.5">
          <span
            style={{
              display: 'block',
              width: '1.5px',
              height: scrolled ? '13px' : '20px',
              borderRadius: '9999px',
              backgroundColor: 'var(--c-terracotta)',
              transition: 'height 0.55s cubic-bezier(0.25,1,0.5,1)',
            }}
          />
          <span
            className="font-sentient tracking-[-0.01em] text-ink"
            style={{
              fontSize: scrolled ? '0.875rem' : '1.1rem',
              transition: 'font-size 0.55s cubic-bezier(0.25,1,0.5,1)',
            }}
          >
            chris wang<span style={{ color: 'var(--c-terracotta)' }}>.</span>
          </span>
        </a>

        {/* Section nav */}
        <nav
          aria-label="Primary"
          className="flex items-center gap-6 font-mono text-[0.66rem] uppercase tracking-[0.2em]"
        >
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} isActive={isNavActive(n.href)} />
          ))}
        </nav>

        {/* Enquire CTA */}
        <motion.a
          href={enquireHref}
          className="rounded-full btn-aurora px-5 py-2 font-mono text-[0.64rem] uppercase tracking-[0.18em]"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <span className="btn-aurora-label">Enquire</span>
        </motion.a>
      </div>
    </motion.header>
  )
}
