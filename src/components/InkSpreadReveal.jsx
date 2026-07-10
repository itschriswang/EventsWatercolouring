import { useEffect, useState } from 'react'

// Paper ground — must match the site's `paper` token (tailwind.config.js) and
// the preloader background so the hand-off from the intro sheet to this cover
// is seamless (paper on paper, no visible seam).
const PAPER = '#F7F4EF'

/**
 * Ink-spread reveal. A paper-coloured sheet covers the page, then retracts
 * along a spreading-ink edge to unveil it.
 *
 * The trick that keeps it on-brand: the ink sprite (a dark-plum blot that
 * grows to full coverage) is used *only as an alpha mask* over a paper fill —
 * its own dark colour is never painted, so nothing dark ever flashes on the
 * light, luminous ground. And the sprite is played in reverse (frame 24 → 0):
 * it starts fully covering and the ink recedes, so the sheet peels away rather
 * than filling in. That reads as a reveal, not a cover.
 *
 * Rendered only in the motion flow (the caller omits it under reduced motion),
 * it mounts already covering, and peels once `reveal` flips true — timed to the
 * preloader's fade so the two read as one continuous unveiling.
 */
export default function InkSpreadReveal({ reveal }) {
  // idle: covering, waiting. peeling: ink retracting. gone: unmounted.
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (reveal && phase === 'idle') {
      // Defer a frame so the fully-covered first paint lands before the
      // animation starts — otherwise the sheet can pop in mid-retraction.
      const raf = requestAnimationFrame(() => setPhase('peeling'))
      return () => cancelAnimationFrame(raf)
    }
  }, [reveal, phase])

  if (phase === 'gone') return null

  return (
    <div className="ink-reveal" aria-hidden="true">
      <div
        className={`ink-reveal__sheet${phase === 'peeling' ? ' is-peeling' : ''}`}
        onAnimationEnd={() => setPhase('gone')}
      />
      <style>{`
        .ink-reveal {
          position: fixed;
          inset: 0;
          z-index: 40;
          pointer-events: none;
          overflow: hidden;
        }
        .ink-reveal__sheet {
          position: absolute;
          inset: 0;
          background: ${PAPER};
          /* The sprite is 25 frames wide; stretch it to 25× the viewport so
             each frame fills the screen (full coverage, no corner peek), and
             use only its alpha as the mask. */
          -webkit-mask-image: url(/assets/ink-spread.png);
          mask-image: url(/assets/ink-spread.png);
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: 2500% 100%;
          mask-size: 2500% 100%;
          /* 100% == the last frame (full ink) == fully covered. */
          -webkit-mask-position: 100% 50%;
          mask-position: 100% 50%;
        }
        .ink-reveal__sheet.is-peeling {
          /* steps(24) walks the 25 frames one at a time; reverse (100% → 0%)
             recedes the ink so the paper sheet retracts to reveal the page. */
          animation: ink-reveal-peel 0.9s steps(24) forwards;
        }
        @keyframes ink-reveal-peel {
          from {
            -webkit-mask-position: 100% 50%;
            mask-position: 100% 50%;
          }
          to {
            -webkit-mask-position: 0% 50%;
            mask-position: 0% 50%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          /* Belt-and-braces: even if mounted, never trap the page under a
             non-animating sheet. */
          .ink-reveal { display: none; }
        }
      `}</style>
    </div>
  )
}
