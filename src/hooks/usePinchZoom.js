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
 * SECOND job, live and two-way: while the page is actually zoomed the module
 * keeps `data-pinch-zoom` on <html>. Mobile GPUs re-rasterise composited
 * layers at the pinched scale, and the site's decorative texture stack can't
 * survive that: the fine dot-screens (body dither, DitherField, paper-grain)
 * alias into moiré "white lines", and the blend/blur layers (the fixed
 * multiply grain canvas, CornerBloom's blurred multiply overlays, the nav
 * chrome's backdrop blur) flash white or blank out the content beneath them —
 * zoomed-in gallery tiles visibly "losing" their painting. index.css hides /
 * flattens those layers under this attribute for the duration of the zoom;
 * they all return untouched once scale settles back to 1. All of them are
 * screen-space paper texture, so their absence while inspecting a painting
 * up close is imperceptible (magnifying fake grain was never right anyway).
 *
 * Desktop browser zoom (Ctrl/Cmd +) changes layout width, not
 * `visualViewport.scale`, so it never trips this; IO handles it fine.
 */

let latched = false
const listeners = new Set()
let bound = false

function onScaleChange() {
  const vv = window.visualViewport
  if (!vv) return
  // 0.03 of slack so sub-pixel scale jitter (some devices idle at 0.999…)
  // never counts as a pinch.
  const zoomed = Math.abs(vv.scale - 1) > 0.03
  // Live, two-way: drives the CSS that mutes moiré/blend layers (see above).
  document.documentElement.toggleAttribute('data-pinch-zoom', zoomed)
  // One-way: the reveal latch never un-flips (see above).
  if (zoomed && !latched) {
    latched = true
    listeners.forEach((l) => l())
  }
}

function bind() {
  if (bound || typeof window === 'undefined') return
  const vv = window.visualViewport
  if (!vv) return
  bound = true
  // Catch a page that *loads* already zoomed (MPA navigation while pinched).
  onScaleChange()
  // Stays bound for the life of the page: unlike the latch, the
  // `data-pinch-zoom` attribute must clear when the visitor zooms back out.
  vv.addEventListener('resize', onScaleChange)
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
