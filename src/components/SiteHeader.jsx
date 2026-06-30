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
        color: isActive ? 'rgb(42,39,36)' : 'rgb(107,98,88)',
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
          backgroundColor: '#C2613C',
          width: isActive || hovered ? '100%' : '0%',
          transition: 'width 0.4s cubic-bezier(0.25,1,0.5,1)',
        }}
      />
    </a>
  )
}

export default function SiteHeader({ revealed, className = '' }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(null)

  // Compress the header once the page is scrolled past the fold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav link whose section is currently in the reading zone.
  useEffect(() => {
    const ids = NAV.map((n) => n.href.replace('#', ''))
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive('#' + e.target.id)
        })
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ ...SPRING, delay: 0.25 }}
      // hidden on mobile — MobileNav owns small screens
      className={`hidden md:block sticky top-0 z-50 ${className}`}
      style={{
        background: scrolled ? 'rgba(244,239,230,0.97)' : 'rgba(244,239,230,0.74)',
        backdropFilter: 'blur(18px) saturate(1.7)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.7)',
        borderBottom: `1px solid ${scrolled ? 'rgba(216,207,191,0.72)' : 'rgba(216,207,191,0.46)'}`,
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
        <a href="#top" className="flex items-center gap-2.5">
          <span
            style={{
              display: 'block',
              width: '1.5px',
              height: scrolled ? '13px' : '20px',
              borderRadius: '9999px',
              backgroundColor: '#C2613C',
              transition: 'height 0.55s cubic-bezier(0.25,1,0.5,1)',
            }}
          />
          <span
            className="font-zt-oskon font-bold uppercase tracking-[-0.05em] text-ink"
            style={{
              fontSize: scrolled ? '0.875rem' : '1.1rem',
              transition: 'font-size 0.55s cubic-bezier(0.25,1,0.5,1)',
            }}
          >
            Chris Wang<span style={{ color: '#C2613C' }}>.</span>
          </span>
        </a>

        {/* Section nav */}
        <nav
          aria-label="Primary"
          className="flex items-center gap-8 font-mono text-[0.66rem] uppercase tracking-[0.2em]"
        >
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} isActive={active === n.href} />
          ))}
        </nav>

        {/* Enquire CTA */}
        <motion.a
          href={ENQUIRE_HREF}
          className="rounded-full bg-lime px-5 py-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-ink"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          Enquire
        </motion.a>
      </div>
    </motion.header>
  )
}
