import { useEffect, useRef, useState } from 'react'
import { whenPageReady, whenInkReady } from '../lib/pageReady.js'

// Paper ground — matches the `paper` token and both pages' background, so the
// wipe is a sheet of the site's own paper, never a foreign colour.
const PAPER = '#F7F4EF'

// Set by the departing page, read by the arriving one, to hand the wipe across
// the full page load that separates the two documents (this is an MPA).
const FLAG = 'ew-page-transition'

// Only these two pages share the wipe. A navigation is intercepted iff *both*
// endpoints are here, so we never set the arrival flag on a page that has no
// PageTransition to clear it (which would strand a cover).
const WIPE_PATHS = new Set(['/', '/corporate'])

// Compare paths without caring about a trailing slash ('/corporate/' === '/corporate').
const norm = (p) => (p && p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p || '/')

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const readFlag = () => {
  try {
    return !!window.sessionStorage.getItem(FLAG)
  } catch {
    return false
  }
}

/**
 * Ink wipe between the homepage and /corporate/. Same sprite and paper-mask
 * trick as the intro reveal (InkSpreadReveal): the dark ink sprite is used only
 * as an alpha mask over a paper fill, so nothing dark ever flashes.
 *
 * It's one gesture split across a real page load:
 *   1. Leaving  — a click on a main↔corporate link is intercepted; ink spreads
 *      to *cover* the screen (frame 0 → 24), then we navigate.
 *   2. Arriving — the next document mounts already covered, waits until its
 *      content is loaded, then the ink *recedes* (frame 24 → 0) to reveal it.
 *
 * Mounted on both pages. Under reduced motion it does nothing (native nav).
 */
export default function PageTransition() {
  const [reduce] = useState(prefersReduced)
  // idle → nothing. enter-cover → arrived, holding the cover until ready.
  // enter-peel → revealing. leave-cover → covering, then navigate.
  const [phase, setPhase] = useState(() =>
    !prefersReduced() && typeof window !== 'undefined' && readFlag() ? 'enter-cover' : 'idle',
  )
  const hrefRef = useRef(null)

  // Clear the hand-off flag once, on mount: the arrival initializer has already
  // read it, and leaving it set would replay the reveal on a manual refresh.
  // Also warm the ink sprite now so the cover (on the next click) and the peel
  // are decoded and ready — no snap on a page reached without a prior wipe.
  useEffect(() => {
    try {
      window.sessionStorage.removeItem(FLAG)
    } catch {
      // Storage blocked — nothing to clear.
    }
    whenInkReady()
  }, [])

  // Arrival: hold the cover until the page is painted *and* the mask is decoded,
  // then peel — so it reveals a finished page and the recede runs smoothly.
  useEffect(() => {
    if (phase !== 'enter-cover') return
    let cancelled = false
    const CAP = 2500
    const capped = new Promise((r) => setTimeout(r, CAP))
    // Race against a hard cap so a slow asset (or the sprite download) can
    // never strand the cover on the arriving page.
    Promise.race([Promise.all([whenPageReady(CAP), whenInkReady()]), capped]).then(() => {
      if (cancelled) return
      // One frame so the fully-covered paint commits before the peel starts.
      requestAnimationFrame(() => !cancelled && setPhase('enter-peel'))
    })
    return () => {
      cancelled = true
    }
  }, [phase])

  // Intercept main↔corporate clicks and play the cover before navigating.
  useEffect(() => {
    if (reduce) return
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return
      const a = e.target.closest && e.target.closest('a')
      if (!a || a.hasAttribute('download')) return
      const t = a.getAttribute('target')
      if (t && t !== '_self') return
      if (!a.getAttribute('href')) return
      let url
      try {
        url = new URL(a.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      const from = norm(window.location.pathname)
      const to = norm(url.pathname)
      if (from === to) return // same document (a hash/scroll link) — leave it native
      if (!WIPE_PATHS.has(from) || !WIPE_PATHS.has(to)) return // only main↔corporate
      e.preventDefault()
      hrefRef.current = url.href
      setPhase('leave-cover')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [reduce])

  // Back/forward from the bfcache can restore this page mid-cover — reset it.
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) {
        hrefRef.current = null
        setPhase('idle')
      }
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const onAnimationEnd = () => {
    if (phase === 'enter-peel') {
      setPhase('idle')
    } else if (phase === 'leave-cover') {
      try {
        window.sessionStorage.setItem(FLAG, '1')
      } catch {
        // No storage — the destination just won't play the reveal half.
      }
      window.location.assign(hrefRef.current)
    }
  }

  if (phase === 'idle') return null

  // Base mask position: covered (100%) for the arrival phases, clear (0%) for
  // the leaving phase so the cover grows in from nothing.
  const covered = phase === 'enter-cover' || phase === 'enter-peel'
  const pos = covered ? '100% 50%' : '0% 50%'
  const animation =
    phase === 'enter-peel'
      ? 'ew-ink-peel 0.9s steps(24) forwards'
      : phase === 'leave-cover'
        ? 'ew-ink-cover 0.6s steps(24) forwards'
        : 'none'

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 70, pointerEvents: 'none', overflow: 'hidden' }}
    >
      <div
        onAnimationEnd={onAnimationEnd}
        style={{
          position: 'absolute',
          inset: 0,
          background: PAPER,
          // Stretch the 25-frame sprite to 25× the viewport so each frame fills
          // the screen; use only its alpha as the mask.
          WebkitMaskImage: 'url(/assets/ink-spread.png)',
          maskImage: 'url(/assets/ink-spread.png)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '2500% 100%',
          maskSize: '2500% 100%',
          WebkitMaskPosition: pos,
          maskPosition: pos,
          animation,
        }}
      />
      <style>{`
        @keyframes ew-ink-cover {
          from { -webkit-mask-position: 0% 50%;   mask-position: 0% 50%; }
          to   { -webkit-mask-position: 100% 50%; mask-position: 100% 50%; }
        }
        @keyframes ew-ink-peel {
          from { -webkit-mask-position: 100% 50%; mask-position: 100% 50%; }
          to   { -webkit-mask-position: 0% 50%;   mask-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
