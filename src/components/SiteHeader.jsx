import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState, useEffect, useRef, useId } from 'react'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'
import { NAV } from '../content.js'
import { Drop } from './Label.jsx'
import useCurrentSection from '../hooks/useCurrentSection.js'

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
      className="relative inline-flex min-h-[40px] items-center py-1"
      style={{
        // Full ink at rest, not the soft slate. The nav's job is to be found;
        // at 15px on a washed paper ground `ink-soft` reads as disabled, and
        // the active state has the accent underline to distinguish it without
        // needing every other link held back to do it.
        color: isActive ? 'rgb(var(--rgb-ink))' : 'rgb(var(--rgb-ink) / 0.78)',
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
          bottom: '0.15rem',
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

/**
 * "Book an event" — the nav item that replaced the flat "Corporate" link.
 *
 * The old link asked a visitor to recognise their own event in a word written
 * for one third of them: a couple and someone booking a 40th both read straight
 * past "Corporate", and neither the wedding journey nor a private party had a
 * nav entry of its own at all. This names all three, and each one lands on the
 * enquiry with that event type already chosen (`?event=` — see EnquireForm),
 * so self-selecting and starting the enquiry are one click rather than two
 * pages apart.
 *
 * Behaviour is the standard disclosure pattern rather than a hover-only menu:
 * a real <button> with aria-expanded owning a labelled list, opened by click,
 * Enter/Space or ArrowDown, closed by Escape (which returns focus to the
 * button), by a click outside, or by focus leaving the group. Pointer hover
 * opens it too as a convenience on a fine pointer, but nothing depends on
 * hover — a touch device gets the same menu from a tap, which a hover-only
 * menu never gives it.
 */
function BookMenu({ item, isActive }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const btnRef = useRef(null)
  // Whether the menu currently on screen was opened by the pointer arriving
  // rather than by a press. Without this the two openers cancel each other: a
  // visitor hovers (open), then presses the thing they hovered, and the press
  // toggles it straight back shut — the menu appears to do nothing at all,
  // which is exactly what it did on the first pass. A press on a
  // hover-opened menu therefore latches it open instead, and the press after
  // that closes it.
  const hoverOpened = useRef(false)
  const menuId = `book-menu-${useId().replace(/:/g, '')}`

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btnRef.current?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        hoverOpened.current = true
        setOpen(true)
      }}
      onMouseLeave={() => {
        hoverOpened.current = false
        setOpen(false)
      }}
      // Focus leaving the whole group closes it, so tabbing off the last item
      // doesn't leave a menu hanging open over the page.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => {
          if (open && hoverOpened.current) {
            hoverOpened.current = false
            return
          }
          setOpen((v) => !v)
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return
          e.preventDefault()
          setOpen(true)
        }}
        className="relative inline-flex min-h-[40px] items-center gap-1.5 py-1"
        style={{
          color: isActive || open ? 'rgb(var(--rgb-ink))' : 'rgb(var(--rgb-ink) / 0.78)',
          transition: 'color 0.3s cubic-bezier(0.25,1,0.5,1)',
        }}
      >
        {item.label}
        <span
          aria-hidden="true"
          className="text-[0.7em] leading-none"
          style={{
            display: 'inline-block',
            transform: `translateY(1px) rotate(${open ? 180 : 0}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.25,1,0.5,1)',
          }}
        >
          ▾
        </span>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '0.15rem',
            left: 0,
            right: '1.1em',
            height: isActive ? '2px' : '1px',
            backgroundColor: 'var(--c-terracotta)',
            opacity: isActive ? 1 : 0.55,
            transform: `scaleX(${isActive || open ? 1 : 0})`,
            transformOrigin: 'left',
            transition:
              'transform 0.4s cubic-bezier(0.25,1,0.5,1), height 0.3s cubic-bezier(0.25,1,0.5,1), opacity 0.3s cubic-bezier(0.25,1,0.5,1)',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={menuId}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
            // Sits flush under the header's own bottom edge, so the pointer
            // never crosses a gap on its way down (which would close it).
            className="absolute left-1/2 top-full z-50 w-[17rem] -translate-x-1/2 overflow-hidden rounded-2xl p-1.5"
            style={{
              background: 'rgb(var(--rgb-paper) / 0.98)',
              border: '1px solid rgb(var(--rgb-line) / 0.8)',
              // Approved burgundy lift, never a neutral grey drop.
              boxShadow:
                '0 18px 40px -16px rgba(126,40,72,0.30), 0 4px 12px -6px rgba(126,40,72,0.18)',
            }}
          >
            {item.items.map((sub) => (
              <li key={sub.href}>
                <a
                  href={sub.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-ink/85 transition-colors duration-200 hover:bg-ink/[0.06] hover:text-ink focus-visible:bg-ink/[0.06] focus-visible:text-ink"
                >
                  {sub.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
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
  // the words that section prints at its own top (see useCurrentSection, and
  // SECTIONS in content.js).
  //
  // This is the fix for the page not saying which section you are in. A
  // section announces itself once, in a display title that scrolls away within
  // a screen or two, and the nav could only ever light one of five edited
  // destinations — nothing at all while you read the evening timeline or filled
  // in the enquiry form. The header now carries the name for as long as you are
  // in it, in the section's own words and its own accent.
  //
  // MobileNav lights its dock from the same hook, because this header is
  // `hidden md:block` and a phone would otherwise get no answer at all.
  const current = useCurrentSection()

  // Page-link nav items (no '#', e.g. '/faq/') are active by pathname match
  // rather than scroll position, since there's nothing to observe for them.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const isNavActive = (href) =>
    !!href && (active === href || (!href.includes('#') && pathname === href))
  // A menu lights when the page you are on is one of its destinations.
  const isGroupActive = (item) =>
    (item.items || []).some((sub) => !sub.href.includes('#') && pathname === sub.href)

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
        {/* Section nav. Set in the BODY face at 15px, not the handwritten
            mono at 0.66rem uppercase with 0.2em tracking — that costume put
            the page's primary navigation at roughly 10px of a cursive face,
            which is smaller and less legible than any body copy beneath it,
            and it was the first thing the readability review named. The mono
            eyebrow voice stays everywhere it labels something; it stops being
            what you navigate with. */}
        <nav
          aria-label="Primary"
          className="flex shrink-0 items-center gap-7 font-body text-[0.9375rem] font-semibold tracking-[0.005em] lg:gap-8"
        >
          {NAV.map((n) =>
            n.items ? (
              <BookMenu key={n.label} item={n} isActive={isGroupActive(n)} />
            ) : (
              <NavLink key={n.href} href={n.href} label={n.label} isActive={isNavActive(n.href)} />
            ),
          )}
        </nav>

        {/* Enquire CTA — the hero title's emphasis wash filling the pill with
            an ink label and a soft glass rim (a watercolour bubble). Sized as
            the conversion point it is: 15px bold body copy in a 44px pill,
            where it used to be a 0.64rem cursive label in a 32px one — smaller
            than the nav links beside it, and the single thing on the bar the
            page most wants pressed. */}
        <motion.a
          href={enquireHref}
          className="btn-hero-flow inline-flex min-h-[44px] items-center rounded-full px-7 py-2.5 font-body text-[0.9375rem] font-bold tracking-[0.005em] text-ink"
          whileHover={reduce ? undefined : { scale: 1.04, y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <span className="relative z-10">Enquire</span>
        </motion.a>
      </div>
    </motion.header>
  )
}
