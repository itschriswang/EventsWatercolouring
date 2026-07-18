import { Drop } from './Label.jsx'
import { CARD_BG } from '../lib/site.js'

/**
 * A little folder tab that rises off the top edge of a paper card — the manila
 * "index tab" cut you'd find on a filed keepsake. Turns the offerings' card
 * family (base package, add-ons, planner, FAQ pointer) into a set of labelled
 * folders, and — in its `large` / dusk-tinted form — frames the whole "how the
 * evening runs" timeline as one big folder. Quietly on-theme for a service
 * built around paintings you file away and keep.
 *
 * Structural notes:
 *  - The card it labels is `overflow-hidden` (or, for the timeline, we simply
 *    keep the tab out of the panel), so the tab can't be a child of it. Instead
 *    this is dropped as the first child of a plain `relative` wrapper that also
 *    holds the card, and it positions itself just above the card's top edge
 *    (`bottom-full`) with a hair of downward nudge so its border merges into
 *    the card's top border with no seam.
 *  - Tab and folder must share the same ground and border colour to read as one
 *    continuous sheet — pass the panel's own `bg` / `borderClassName` for any
 *    ground that isn't the default cream card (e.g. the dusk timeline).
 *  - Position with `className` (e.g. `left-6`, `left-8`) so tabs can be
 *    staggered across stacked cards like files in a drawer.
 *
 * Props:
 *   children — the tab label (kept short: it reads as a folder index cut)
 *   as       — element for the label span (default 'span'; pass 'h3' when the
 *              tab is standing in as the card's heading, for correct semantics)
 *   gradient — orchid Drop tint pair, matching the card's section accent
 *   large    — a bigger cut for large folders (roomier padding, wider tracking)
 *   bg       — CSS background for the tab; match the folder ground it sits on
 *   borderClassName — border colour class; match the folder's own border
 *   labelClassName  — extra classes on the label (e.g. `!text-paper/90` on dusk)
 *   className — positioning utilities for the absolute wrapper
 */
export default function FolderTab({
  children,
  as: As = 'span',
  gradient = ['#D8DB7A', '#9BA03E'],
  large = false,
  bg = CARD_BG,
  borderClassName = 'border-line',
  labelClassName = '',
  className = '',
}) {
  return (
    <div className={'pointer-events-none absolute bottom-full z-20 ' + className}>
      <span
        // translateY seats the tab 1.5px into the card so the shared border
        // lines up as one edge rather than doubling into a hairline seam.
        style={{ background: bg, transform: 'translateY(1.5px)' }}
        className={
          'pointer-events-auto relative inline-flex items-center border border-b-0 shadow-[0_-3px_10px_-6px_rgba(126,40,72,0.28)] ' +
          borderClassName + ' ' +
          (large
            ? 'gap-2 rounded-t-[16px] pb-[11px] pl-4 pr-6 pt-[9px]'
            : 'gap-1.5 rounded-t-[13px] pb-[9px] pl-3 pr-4 pt-[7px]')
        }
      >
        <Drop className={(large ? 'h-4' : 'h-3.5') + ' w-auto shrink-0'} gradient={gradient} />
        <As
          className={
            'eyebrow leading-none ' +
            (large ? 'text-[0.72rem] tracking-[0.22em] ' : '') +
            labelClassName
          }
        >
          {children}
        </As>
      </span>
    </div>
  )
}
