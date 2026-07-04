import { useEffect, useState } from 'react'

/**
 * SSR-safe subscription to a CSS media query. Returns whether `query` matches
 * and re-renders when that changes (viewport resize, device rotation, a mouse
 * being plugged in, etc.).
 *
 * Used to gate expensive, scroll-linked motion (parallax, the live grain
 * filter, sticky backdrop-blur) so it only runs where the hardware can afford
 * it — keeping small touch devices smooth.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * True when the device has asked us — explicitly or by its specs — to spare
 * it heavy work: Data Saver on, or a low reported memory ceiling. Evaluated
 * once (these don't meaningfully change within a session) and defensively, so
 * a missing Network Information API just means "no objection".
 */
function prefersLightweight() {
  if (typeof navigator === 'undefined') return false
  if (navigator.connection?.saveData) return true
  // deviceMemory is coarse (0.25–8, in GiB). 4 keeps modern laptops/phones on
  // the rich path while dropping genuinely low-end hardware to the static tier.
  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) return true
  return false
}

/**
 * True on roomy, fine-pointer devices — the gate for heavy scroll-linked
 * effects (parallax, the live WebGL washes, the GPU grain's scroll settle).
 * Touch phones and tablets fall back to lighter, static rendering, and so now
 * do devices on Data Saver or with little memory, regardless of pointer type —
 * so the rich path never punishes a metered or low-end visitor.
 */
export function useHeavyFx() {
  const roomyFinePointer = useMediaQuery('(min-width: 768px) and (pointer: fine)')
  return roomyFinePointer && !prefersLightweight()
}
