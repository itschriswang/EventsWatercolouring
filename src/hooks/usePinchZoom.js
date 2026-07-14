import { useSyncExternalStore } from 'react'

/**
 * One-way latch: has the visitor EVER pinch-zoomed this page?
 *
 * Why this exists: iOS Safari stops servicing IntersectionObserver correctly
 * while the page is pinch-zoomed (`visualViewport.scale !== 1`) — callbacks
 * stall or fire against the unscaled layout viewport. Every scroll-reveal on
 * the site (`whileInView` / `useInView`) rides IO, so after a pinch the
 * visitor scrolls through *blank* sections whose entrances never fire, and
 * rows pop in late and out of order once the zoom settles. Scale rarely
 * returns to exactly 1 after a pinch, so the breakage outlives the gesture.
 *
 * The fix at the call sites: once this latch flips, every reveal also sets
 * its shown state via `animate` (which doesn't consult IO), so nothing can
 * stay stranded invisible. It's deliberately one-way — after a first pinch
 * the entrance choreography is over anyway, and re-trusting IO when scale
 * *reads* 1 again is exactly the bug this guards against.
 *
 * Desktop browser zoom (Ctrl/Cmd +) changes layout width, not
 * `visualViewport.scale`, so it never trips this; IO handles it fine.
 */

let latched = false
const listeners = new Set()
let bound = false

function onScaleChange() {
  const vv = window.visualViewport
  // 0.03 of slack so sub-pixel scale jitter (some devices idle at 0.999…)
  // never counts as a pinch.
  if (vv && Math.abs(vv.scale - 1) > 0.03) {
    latched = true
    listeners.forEach((l) => l())
    vv.removeEventListener('resize', onScaleChange)
  }
}

function bind() {
  if (bound || typeof window === 'undefined') return
  const vv = window.visualViewport
  if (!vv) return
  bound = true
  // Catch a page that *loads* already zoomed (MPA navigation while pinched).
  onScaleChange()
  if (!latched) vv.addEventListener('resize', onScaleChange)
}

function subscribe(cb) {
  bind()
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getSnapshot = () => latched
const getServerSnapshot = () => false

export default function usePinchZoomed() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
