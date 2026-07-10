// Readiness gates shared by the ink reveals (the intro Preloader / InkSpreadReveal
// and the home↔corporate PageTransition). The point of both: never peel the ink
// back until there's actually a finished page underneath to reveal.

const timeout = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Decode a single image, resolving when its bitmap is ready to paint without
 * jank (or on error, so a missing asset never blocks a reveal). Shared/cached
 * per URL, so asking twice — and merely importing this for a warm-up — is free.
 */
const decodeCache = new Map()
export function decodeImage(url) {
  if (typeof window === 'undefined') return Promise.resolve()
  if (!decodeCache.has(url)) {
    decodeCache.set(
      url,
      new Promise((resolve) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = resolve
        img.src = url
        if (img.decode) img.decode().then(resolve, resolve)
      }),
    )
  }
  return decodeCache.get(url)
}

/** Web fonts ready (so text is painted, not swapped in after the reveal). */
export function whenFontsReady(cap = 2500) {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve()
  return Promise.race([document.fonts.ready.catch(() => {}), timeout(cap)])
}

/** All of `urls` decoded, or `cap` — whichever comes first. */
export function whenImagesReady(urls, cap = 2500) {
  if (typeof window === 'undefined') return Promise.resolve()
  return Promise.race([Promise.all(urls.map(decodeImage)), timeout(cap)])
}

/**
 * Resolve once the document has fully loaded — window `load` (every image) plus
 * fonts. Used for the cross-page wipe arrival, where waiting for the whole
 * destination is the honest "it's ready" signal. Capped so one slow asset can
 * never strand a full-screen cover.
 */
export function whenPageReady(cap = 2500) {
  if (typeof window === 'undefined') return Promise.resolve()
  const waits = []
  if (document.readyState !== 'complete') {
    waits.push(new Promise((r) => window.addEventListener('load', r, { once: true })))
  }
  if (document.fonts && document.fonts.status !== 'loaded') {
    waits.push(document.fonts.ready.catch(() => {}))
  }
  const ready = waits.length ? Promise.all(waits) : Promise.resolve()
  return Promise.race([ready, timeout(cap)])
}

// The ink sprite drives every reveal's CSS mask. If the peel starts before the
// 380 KB PNG is decoded, the mask snaps from "no mask" (fully covered) to a
// mid-animation frame — the glitch. Decode it up front and share the promise so
// callers can wait for it (and so merely importing this warms it).
export function whenInkReady() {
  return decodeImage('/assets/ink-spread.png')
}
