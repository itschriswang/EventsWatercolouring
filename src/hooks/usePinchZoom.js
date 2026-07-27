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
 * BOTH jobs hang on catching the pinch EARLY. `visualViewport` reports the
 * scale change too late to be the only trigger — see `bind()` — so the pinch
 * is picked up from the second finger landing (`touchstart` / Safari's
 * `gesturestart`) and only handed back to `visualViewport` once the scale has
 * settled again.
 *
 * Desktop browser zoom (Ctrl/Cmd +) changes layout width, not
 * `visualViewport.scale`, so it never trips this; IO handles it fine.
 */

let latched = false
const listeners = new Set()
let bound = false
// True from the moment a second finger lands until the scale has settled
// again — see `bind()` for why `visualViewport` alone is too late.
let gesturing = false
let settleTimer = 0

// 0.03 of slack so sub-pixel scale jitter (some devices idle at 0.999…)
// never counts as a pinch.
function scaleZoomed() {
  const vv = window.visualViewport
  return vv ? Math.abs(vv.scale - 1) > 0.03 : false
}

function apply() {
  const zoomed = gesturing || scaleZoomed()
  // Live, two-way: drives the CSS that mutes moiré/blend layers (see above).
  document.documentElement.toggleAttribute('data-pinch-zoom', zoomed)
  // One-way: the reveal latch never un-flips (see above).
  if (zoomed && !latched) {
    latched = true
    listeners.forEach((l) => l())
  }
}

function startGesture() {
  gesturing = true
  clearTimeout(settleTimer)
  apply()
}

function endGesture() {
  clearTimeout(settleTimer)
  // Don't hand control straight back to `visualViewport`: its `scale` lags the
  // final touch by a frame or two on iOS, so clearing now would un-mute every
  // texture layer for an instant and then re-mute them — a visible flash at
  // the end of every pinch. Poll briefly; the moment the scale reads zoomed we
  // can stop guessing, and if it never does the visitor pinched back to 1:1.
  let tries = 0
  const settle = () => {
    if (!scaleZoomed() && ++tries < 5) {
      settleTimer = setTimeout(settle, 90)
      return
    }
    gesturing = false
    apply()
  }
  settle()
}

function bind() {
  if (bound || typeof window === 'undefined') return
  bound = true

  const vv = window.visualViewport
  if (vv) {
    // Catch a page that *loads* already zoomed (MPA navigation while pinched).
    apply()
    // Stays bound for the life of the page: unlike the latch, the
    // `data-pinch-zoom` attribute must clear when the visitor zooms back out.
    // `scroll` as well as `resize`: panning a zoomed page fires only the
    // former, and it's the signal that survives when a pinch's `resize` was
    // coalesced away.
    vv.addEventListener('resize', apply)
    vv.addEventListener('scroll', apply)
  }

  // `visualViewport` on its own is TOO LATE to be the only trigger. iOS Safari
  // coalesces its `resize` to the *end* of a pinch, so for the whole duration
  // of the gesture — exactly when the compositor is re-rasterising and the
  // texture stack is tearing — nothing above has fired yet, and any reveal
  // still waiting on its (stalled) IntersectionObserver is still at opacity 0,
  // so paintings read as missing while the visitor pinches around them.
  //
  // Both engines announce the pinch well before the scale changes: Safari
  // fires `gesturestart`, and every touch engine reports the second finger on
  // `touchstart`. Latching there is what gets the layers out of the way
  // *during* the gesture instead of after it. A two-finger touch that turns
  // out not to be a pinch costs only a moment of muted paper texture and an
  // early end to the entrance choreography — both far cheaper than a blank
  // gallery, and the latch was always one-way by design.
  const onTouch = (e) => {
    if (e.touches && e.touches.length >= 2) startGesture()
  }
  const onTouchEnd = (e) => {
    if (!e.touches || e.touches.length < 2) endGesture()
  }
  document.addEventListener('touchstart', onTouch, { passive: true })
  document.addEventListener('touchmove', onTouch, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })
  document.addEventListener('touchcancel', onTouchEnd, { passive: true })
  // Safari-only (iOS pinch and macOS trackpad pinch, both of which zoom the
  // visual viewport); a no-op everywhere else.
  document.addEventListener('gesturestart', startGesture)
  document.addEventListener('gestureend', endGesture)
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
