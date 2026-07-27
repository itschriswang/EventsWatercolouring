import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EMAIL } from '../lib/site.js'
import { Drop } from './Label.jsx'

// The mark/label swap runs on a quick ease-out tween, NOT the shared SPRING —
// the same call the add-on accordion and the reply card's steps make: a spring
// tuned for entrances reads as sluggish on a tap-to-confirm.
//
// The AnimatePresence pairs below also deliberately DON'T use `mode="wait"`.
// That mode holds the incoming node until the outgoing one has fully settled,
// which leaves the pill visibly empty for the whole exit — an eighth of a
// second of blank button right at the moment it is meant to be confirming
// something. Both states are stacked in the same grid cell (and the same icon
// box), so they can simply cross-fade over each other with no gap at all.
const SWAP = { duration: 0.16, ease: [0.25, 1, 0.5, 1] }

/**
 * The studio address, with a way to take it away with you.
 *
 * A bare `mailto:` is the only affordance the site had for the address, and on
 * desktop that is a coin flip: it either opens an email client nobody uses or
 * it does nothing at all, and the visitor is left selecting text by hand at the
 * exact moment they had decided to write. So the address stays a real link
 * (people who want their mail client should still get it) and copy sits
 * BESIDE it as a second, quieter action rather than hijacking the first.
 *
 * The confirmation is the site's own gesture, not a tech-product toast: the
 * orchid drop that marks every list item and eyebrow on the page swaps for a
 * tick, and the word underneath crossfades with it. Nothing turns green — the
 * accent stays the palette's chartreuse on paper, blush on the night ground.
 *
 * `tone="dark"` restyles it for the wine-ground footer, where the paper-side
 * ink tokens would disappear.
 */
export default function CopyEmail({ tone = 'light', className = '' }) {
  const reduce = useReducedMotion()
  const [copied, setCopied] = useState(false)
  // Some browsers (and any non-secure context) have no async clipboard at all.
  // Rather than offer a button that silently does nothing, we hide the copy
  // affordance entirely and leave the mailto link doing its job. Resolved in an
  // effect so the server-rendered/no-JS markup never depends on it.
  const [canCopy, setCanCopy] = useState(false)
  const timer = useRef(0)

  useEffect(() => {
    setCanCopy(typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText)
    return () => window.clearTimeout(timer.current)
  }, [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      // Permission denied or a clipboard that lied about itself — say nothing
      // and leave the address on screen, which is still perfectly copyable.
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  const dark = tone === 'dark'

  return (
    <div className={'flex flex-wrap items-center gap-x-3 gap-y-1.5 ' + className}>
      <a
        href={`mailto:${EMAIL}`}
        className={
          'rounded underline underline-offset-4 outline-none transition-colors duration-300 [overflow-wrap:anywhere] ' +
          (dark
            ? 'text-paper/85 decoration-paper/30 hover:text-blush focus-visible:text-blush'
            : 'text-ink decoration-ink/30 hover:text-terracotta focus-visible:text-terracotta')
        }
      >
        {EMAIL}
      </a>

      {canCopy && (
        <button
          type="button"
          onClick={onCopy}
          className={
            'group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] outline-none transition-colors duration-300 ' +
            (dark
              ? 'border-paper/25 text-paper/60 hover:border-blush hover:text-blush focus-visible:border-blush focus-visible:text-blush'
              : 'border-line text-ink-soft hover:border-terracotta hover:text-terracotta focus-visible:border-terracotta focus-visible:text-terracotta')
          }
        >
          {/* The mark swaps in place: the orchid drop the site uses everywhere,
              becoming a tick once the address is on the clipboard. */}
          <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center" aria-hidden="true">
            <AnimatePresence initial={false}>
              {copied ? (
                <motion.svg
                  key="tick"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                  transition={SWAP}
                  className="absolute h-3.5 w-3.5"
                >
                  <path d="M20 6 9 17l-5-5" />
                </motion.svg>
              ) : (
                <motion.span
                  key="drop"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                  transition={SWAP}
                  className="absolute flex items-center justify-center"
                >
                  <Drop
                    className="h-3.5 w-auto"
                    gradient={dark ? ['#F2C2CF', '#DB6E97'] : ['#D8DB7A', '#9BA03E']}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </span>

          {/* Fixed-width word slot so the pill doesn't jump between the two
              labels mid-animation. `Copied` is the longer of the pair. */}
          <span className="relative inline-grid">
            <span className="invisible col-start-1 row-start-1" aria-hidden="true">
              Copied
            </span>
            <AnimatePresence initial={false}>
              <motion.span
                key={copied ? 'copied' : 'copy'}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={SWAP}
                className="col-start-1 row-start-1"
              >
                {copied ? 'Copied' : 'Copy'}
              </motion.span>
            </AnimatePresence>
          </span>

          {/* The button's own label never changes for assistive tech (the
              action is always "copy"), so the outcome is announced separately
              rather than by mutating the name mid-press. */}
          <span className="sr-only">email address</span>
        </button>
      )}

      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </div>
  )
}
