import { Drop } from './Label.jsx'
import { CARD_BG } from '../lib/site.js'

/**
 * A little folder tab that rises off the top edge of a paper card — the manila
 * "index tab" cut you'd find on a filed keepsake. Turns the offerings' card
 * family (base package, add-ons, planner, FAQ pointer) into a set of labelled
 * folders, which is quietly on-theme for a service built around paintings you
 * file away and keep.
 *
 * Structural notes:
 *  - The card it labels is `overflow-hidden`, so the tab can't be a child of
 *    it (it would be clipped). Instead this is dropped as the first child of a
 *    plain `relative` wrapper that also holds the card, and it positions itself
 *    just above the card's top edge (`bottom-full`) with a hair of downward
 *    nudge so its border merges into the card's top border with no seam.
 *  - Same `CARD_BG` ground and `border-line` as the card, and no bottom border,
 *    so tab and folder read as one continuous sheet of paper.
 *  - Position with `className` (e.g. `left-6`, `left-8`) so tabs can be
 *    staggered across stacked cards like files in a drawer.
 *
 * Props:
 *   children — the tab label (kept short: it reads as a folder index cut)
 *   as       — element for the label span (default 'span'; pass 'h3' when the
 *              tab is standing in as the card's heading, for correct semantics)
 *   gradient — orchid Drop tint pair, matching the card's section accent
 *   className — positioning utilities for the absolute wrapper
 */
export default function FolderTab({ children, as: As = 'span', gradient = ['#D8DB7A', '#9BA03E'], className = '' }) {
  return (
    <div className={'pointer-events-none absolute bottom-full z-20 ' + className}>
      <span
        // translateY seats the tab 1.5px into the card so the shared border
        // lines up as one edge rather than doubling into a hairline seam.
        style={{ background: CARD_BG, transform: 'translateY(1.5px)' }}
        className="pointer-events-auto relative inline-flex items-center gap-1.5 rounded-t-[13px] border border-b-0 border-line pb-[9px] pl-3 pr-4 pt-[7px] shadow-[0_-3px_10px_-6px_rgba(126,40,72,0.28)]"
      >
        <Drop className="h-3.5 w-auto shrink-0" gradient={gradient} />
        <As className="eyebrow leading-none">{children}</As>
      </span>
    </div>
  )
}
