import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '../content.js'

/**
 * Which top-level section is currently under the reading zone.
 *
 * Returns the matching entry from SECTIONS (id, label, gradient), or null when
 * the reader is above the first one — the hero, where the page is answering
 * the question by itself.
 *
 * Both chromes need this and they run on different halves of the breakpoint:
 * SiteHeader (`md` and up) prints the section's name beside the wordmark, and
 * MobileNav (below `md`) lights the matching tab in the dock. Sharing one hook
 * is not just DRY — two observers with independently tuned rootMargins would
 * hand a visitor crossing a boundary on a tablet two different answers.
 *
 * It keeps a live map of what is intersecting rather than latching the last
 * entry the callback saw. Scrolling back up to the hero leaves NOTHING
 * intersecting, and a latched value would sit there naming a section that is
 * no longer on screen. Where the reading zone spans a boundary the later
 * section in document order wins — that is the one being scrolled into.
 *
 * Sections are looked up by id, so pages that carry only some of them (the FAQ
 * and corporate pages have `#enquiry` and nothing else) simply observe what
 * they have.
 */
export default function useCurrentSection() {
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

  return current
}
