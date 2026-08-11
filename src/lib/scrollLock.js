// iOS-proof scroll lock. `body { overflow: hidden }` on its own does nothing
// on iOS Safari, where the real page scroller is the documentElement (the
// same quirk index.css documents for overflow-x) — the page kept scrolling
// behind the lightbox and the preloader. Pinning the body with
// `position: fixed` at the current scroll offset locks every engine; the
// unlock restores the exact scroll position. Re-entrant via a counter so
// overlapping owners (preloader, lightbox) can't fight over the styles.
let locks = 0
let savedY = 0

export function lockScroll() {
  if (typeof document === 'undefined') return
  if (++locks > 1) return
  savedY = window.scrollY
  const b = document.body.style
  b.position = 'fixed'
  b.top = `-${savedY}px`
  b.left = '0'
  b.right = '0'
  b.width = '100%'
  b.overflow = 'hidden'
}

export function unlockScroll() {
  if (typeof document === 'undefined') return
  if (locks === 0 || --locks > 0) return
  const b = document.body.style
  b.position = ''
  b.top = ''
  b.left = ''
  b.right = ''
  b.width = ''
  b.overflow = ''
  // Restore instantly: the html `scroll-behavior: smooth` would otherwise
  // animate this correction like a navigation, which reads as the page
  // lurching after every lightbox close.
  const root = document.documentElement
  const prev = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, savedY)
  root.style.scrollBehavior = prev
}
