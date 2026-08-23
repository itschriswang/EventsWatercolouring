import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EMAIL } from '../lib/site.js'
import { bloom } from '../lib/watercolour.js'
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
 * The two share one bordered surface, which is what makes them read as the
 * other way to reach Chris rather than as small print under the form. Loose on
 * the page they were an underlined address and a barely-there outlined chip,
 * and the whole block sank into the enquiry section's pale ground.
 *
 * The confirmation is the site's own gesture, not a tech-product toast: pigment
 * floods the card, the orchid drop that marks every list item and eyebrow on
 * the page swaps for a tick, and the word underneath crossfades with it.
 * Nothing turns green — the accent stays the palette's chartreuse on paper,
 * blush on the night ground.
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
    // One object, not two loose scraps of text.
    //
    // Before this, the address and its copy action were a bare underlined link
    // beside a pill outlined in `line` (#E1D6E0) with `ink-soft` text — on the
    // enquiry section's pale pink ground that pill was a rumour, and the pair
    // read as a footnote under the form rather than as the other way to reach
    // Chris. Both problems are containment: give the two a shared bordered
    // surface and they become one affordance, and the copy button can then
    // carry real ink instead of having to whisper so as not to outshout an
    // address that was itself set in fine print.
    //
    // It wraps rather than fixing to a single row: the address is 26
    // characters, and at a phone's width the button has nowhere to go but
    // underneath. Hence a large radius rather than a true pill — a `rounded-
    // full` surface with two rows in it reads as a mistake.
    <div
      className={
        'relative isolate inline-flex max-w-full flex-wrap items-center gap-x-1 gap-y-2 overflow-hidden rounded-[1.35rem] border px-1.5 py-1.5 pl-4 transition-colors duration-300 ' +
        (dark
          ? 'border-paper/25 bg-paper/[0.07] hover:border-paper/40'
          : 'border-ink/15 bg-paper/70 hover:border-terracotta/45') +
        ' ' +
        className
      }
    >
      {/* The confirmation the visitor actually feels: pigment runs across the
          card. The tick and the word tell you it worked; this is the bit that
          makes a copied address feel like something happened on paper rather
          than a toast firing.

          Light tone only, and that is a physical limit rather than an
          oversight — `bloom()` solves its stops against PAPER_REFLECTANCE, so
          the wash it hands back is the one that pigment makes over ivory. Over
          the footer's wine ground the same glaze can only darken (a
          transparent paint cannot lighten what it sits on), so the dark tone
          keeps the drop-to-tick swap and skips the flood rather than smearing
          a mud-coloured rectangle across itself. */}
      {!dark && (
        <AnimatePresence>
          {copied && (
            <motion.span
              key="flood"
              aria-hidden="true"
              initial={reduce ? { opacity: 0.3 } : { opacity: 0, scale: 0.55 }}
              animate={reduce ? { opacity: 0.3 } : { opacity: [0, 0.85, 0.6], scale: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 -z-10 mix-blend-multiply"
              style={{
                // lemonlime is the protected chartreuse glow, and the same
                // pigment the resting orchid in the button is drawn in — so
                // the flood reads as that mark spreading, not a new colour
                // arriving. Wet-in-wet: no pinned contact line to dry against
                // inside a 40px-tall chip, so no edge-darkened rim (§2.2).
                background: bloom('lemonlime', {
                  x: 0.5,
                  size: 'ellipse 62% 150%',
                  at: '22% 50%',
                  wetness: 'wet',
                }),
              }}
            />
          )}
        </AnimatePresence>
      )}

      <a
        href={`mailto:${EMAIL}`}
        className={
          'min-w-0 rounded py-1 pr-2 text-[0.95rem] underline decoration-1 underline-offset-4 outline-none transition-colors duration-300 [overflow-wrap:anywhere] ' +
          (dark
            ? 'text-paper decoration-paper/30 hover:decoration-blush focus-visible:text-blush'
            : 'text-ink decoration-ink/25 hover:decoration-terracotta focus-visible:text-terracotta')
        }
      >
        {EMAIL}
      </a>

      {canCopy && (
        <button
          type="button"
          onClick={onCopy}
          // Takes a ground on hover, not just a tinted outline: the old
          // outline-only hover left the button reading as secondary chrome at
          // the exact moment it was being pointed at. A *tinted* ground rather
          // than a solid accent fill, for two reasons — `terracotta` is the
          // deep olive #66681C, which would swallow the chartreuse orchid
          // sitting inside the chip, and a solid fill would put this level
          // with Continue, the sheet's actual primary action. Accent border,
          // accent text, a wash behind: unmistakably a button, still second.
          className={
            'group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] outline-none transition-colors duration-300 ' +
            (dark
              ? 'border-paper/30 text-paper/85 hover:border-blush hover:bg-blush/15 hover:text-blush focus-visible:border-blush focus-visible:bg-blush/15 focus-visible:text-blush'
              : 'border-ink/25 text-ink hover:border-terracotta hover:bg-terracotta/10 hover:text-terracotta focus-visible:border-terracotta focus-visible:bg-terracotta/10 focus-visible:text-terracotta')
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
