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
 * True on roomy, fine-pointer devices — the gate for heavy scroll-linked
 * effects. Touch phones and tablets fall back to lighter, static rendering.
 */
export function useHeavyFx() {
  return useMediaQuery('(min-width: 768px) and (pointer: fine)')
}
