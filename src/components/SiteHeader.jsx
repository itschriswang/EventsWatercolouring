import { motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'
import { NAV, SECTIONS } from '../content.js'
import { Drop } from './Label.jsx'

const EASE = [0.25, 1, 0.5, 1]

// Individual nav link with scroll-tracked active underline + hover state.
function NavLink({ href, label, isActive }) {
  // `lit` covers both pointer hover and keyboard focus so the ink-spread
  // underline is the same affordance in both modes (the global :focus-visible
  // outline still shows too — this just brings the underline along for parity).
  const [lit, setLit] = useState(false)

  return (
    <a
      href={href}
      // Expose the active state to assistive tech, not just via colour + the
      // animated underline: 'page' for the pathname-matched page links
      // (/faq/, /corporate/), 'true' for the in-view section links.
      aria-current={isActive ? (href.includes('#') ? 'true' : 'page') : undefined}
      className="relative py-0.5"
      style={{
        color: isActive ? 'rgb(var(--rgb-ink))' : 'rgb(var(--rgb-ink-soft))',
        transition: 'color 0.3s cubic-bezier(0.25,1,0.5,1)',
      }}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      onFocus={() => setLit(true)}
      onBlur={() => setLit(false)}
    >
      {label}
      {/* Ink-spread underline. Active and hover both draw it, but NOT
          identically: at one shared weight a hovered link was pixel-for-pixel
          the active one, so the pointer erased the only "you are here" mark
          the nav had. Active sits at 2px and full accent, hover at 1px and
          half — the same gesture, one clearly the state and the other clearly
          the invitation. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: isActive ? '2px' : '1px',
          backgroundColor: 'var(--c-terracotta)',
          opacity: isActive ? 1 : 0.55,
          width: isActive || lit ? '100%' : '0%',
          transition:
            'width 0.4s cubic-bezier(0.25,1,0.5,1), height 0.3s cubic-bezier(0.25,1,0.5,1), opacity 0.3s cubic-bezier(0.25,1,0.5,1)',
        }}
      />
    </a>
  )
}

// `enquireHref` lets pages with their own reply card (e.g. /corporate/)
// keep the CTA on-page instead of bouncing back to the homepage form.
export default function SiteHeader({ revealed, className = '', enquireHref = ENQUIRE_HREF }) {
  const reduce = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(null)

  // Compress the header once the page is scrolled past the fold. The two
  // thresholds are deliberate hysteresis: compressing changes the header's
  // height, which shifts the page under the sticky bar — a single trip point
  // would let scroll positions near it flap the header back and forth.
  useEffect(() => {
    const onScroll = () =>
      setScrolled((prev) => {
        if (window.scrollY > 72) return true
        if (window.scrollY < 48) return false
        return prev
      })
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

  // "You are here": the section currently under the reading zone, named with
  // the words that section prints at its own top (see SECTIONS in content.js).
  //
  // This is the fix for the page not saying which section you are in. A
  // section announces itself once, in a display title that scrolls away within
  // a screen or two, and the nav could only ever light one of five edited
  // destinations — nothing at all while you read the evening timeline or filled
  // in the enquiry form. The header now carries the name for as long as you are
  // in it, in the section's own words and its own accent.
  //
  // Unlike the nav observer above, this one keeps a live map of what is
  // intersecting rather than latching the last entry it saw: scrolling back up
  // to the hero leaves NOTHING intersecting, and a latched value would sit
  // there naming a section that is no longer on screen. Where the reading zone
  // spans a boundary, the later section in document order wins — that is the
  // one being scrolled into.
  const [current, setCurrent] = useState(null)
  const seen = useRef(new Map())

  useEffect(() => {
    const found = SECTIONS
      .map((s) => ({ ...s, el: document.getElementById(s.id) }))
      .filter((s) => s.el)
    if (!found.length) return

    const map = seen.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => map.set(e.target.id, e.isIntersecting))
        const active = [...found].reverse().find((s) => map.get(s.id))
        setCurrent(active || null)
      },
      { rootMargin: '-18% 0px -72% 0px', threshold: 0 }
    )
    found.forEach((s) => observer.observe(s.el))
    return () => {
      observer.disconnect()
      map.clear()
    }
  }, [])

  // Page-link nav items (no '#', e.g. '/faq/') are active by pathname match
  // rather than scroll position, since there's nothing to observe for them.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const isNavActive = (href) =>
    active === href || (!href.includes('#') && pathname === href)

  return (
    <motion.header
      initial={{ y: reduce ? 0 : -80, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: reduce ? 0 : -80, opacity: 0 }}
      transition={{ ...SPRING, delay: 0.25 }}
      // hidden on mobile — MobileNav owns small screens
      // zoom-flat: backdrop blur on fixed/sticky chrome flickers white while
      // pinch-zoomed (tablets hit this breakpoint); the translucent paper
      // ground stays, only the blur drops (see index.css).
      className={`zoom-flat hidden md:block sticky top-0 z-50 ${className}`}
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
        {/* Wordmark + running head share one flex child, so the header keeps
            its three-part balance (mark left, nav centred, CTA right) that
            `justify-between` is doing the work for. As a fourth sibling the
            marker would have redistributed the whole bar. */}
        <div className="flex min-w-0 items-center">
          {/* Logo — a thin terracotta accent stroke mirrors a painter's mark */}
          <a href="/#top" className="flex shrink-0 items-center gap-2.5">
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

          {/* The section you are reading, seated beside the wordmark like a
              running head on a printed spread. Only once the page is scrolled:
              at the top the hero is the whole answer, and a marker there would
              just be naming the thing already filling the screen.

              The orchid drop comes along, tinted with that section's own
              accent, because it is the same glyph the section wears on the
              page — the mark, the words and the colour all repeat, so the
              header reads as an echo of where you are rather than as a second,
              competing label.

              It shrinks and clips rather than shoving the nav around at narrow
              desktop widths, and only appears from `lg` up, where there is real
              room between the wordmark and the nav to put it. */}
          <div
            aria-hidden="true"
            className="ml-4 hidden min-w-0 items-center gap-2.5 lg:flex"
            style={{
              opacity: scrolled && current ? 1 : 0,
              transform: `translateX(${scrolled && current ? '0' : '-6px'})`,
              transition:
                'opacity 0.45s cubic-bezier(0.25,1,0.5,1), transform 0.45s cubic-bezier(0.25,1,0.5,1)',
            }}
          >
            <span className="h-3.5 w-px shrink-0 bg-line" />
            {current && (
              // Keyed on the section, so crossing a boundary remounts the label
              // and it rises into place. No AnimatePresence: the two names are
              // different widths, so holding both in the same slot would have to
              // either reserve the wider one or jostle the wordmark mid-swap.
              <motion.span
                key={current.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="flex min-w-0 items-center gap-1.5"
              >
                <Drop className="h-4 w-auto shrink-0" gradient={current.gradient} />
                <span className="truncate font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink">
                  {current.label}
                </span>
              </motion.span>
            )}
          </div>
        </div>

        {/* Section nav */}
        <nav
          aria-label="Primary"
          className="flex shrink-0 items-center gap-6 font-mono text-[0.66rem] uppercase tracking-[0.2em]"
        >
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} isActive={isNavActive(n.href)} />
          ))}
        </nav>

        {/* Enquire CTA — the hero title's emphasis wash filling the pill with
            an ink label and a soft glass rim (a watercolour bubble). */}
        <motion.a
          href={enquireHref}
          className="rounded-full btn-hero-flow text-ink px-5 py-2 font-mono text-[0.64rem] uppercase tracking-[0.18em]"
          whileHover={reduce ? undefined : { scale: 1.05, y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <span className="relative z-10">Enquire</span>
        </motion.a>
      </div>
    </motion.header>
  )
}
