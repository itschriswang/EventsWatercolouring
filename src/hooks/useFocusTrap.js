import { useEffect, useRef } from 'react'

/**
 * Modal focus management for a dialog container. While `active`:
 *  - moves focus into the dialog (first focusable element, or the container)
 *  - traps Tab / Shift+Tab inside it
 *  - calls `onClose` on Escape
 *  - restores focus to whatever was focused before, on close/unmount
 *
 * Attach the returned ref to the dialog container and give that container
 * `tabIndex={-1}` so the focus-in fallback works.
 */
export default function useFocusTrap(active, onClose) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const previouslyFocused = document.activeElement

    const getFocusable = () =>
      Array.from(
        node.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)

    // Move focus into the dialog.
    const initial = getFocusable()
    ;(initial[0] || node).focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (!items.length) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [active, onClose])

  return ref
}
