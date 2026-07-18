import { motion } from 'framer-motion'
import { Drop } from './Label.jsx'

/**
 * FolderCell — clips a card into a manila-folder silhouette: a flush-left index
 * tab whose right shoulder eases into the body with a cute concave fillet (see
 * the `.folder-cell` clip in index.css). The tab is part of the same clipped
 * surface as the body, so it keeps the cell's own ground and bloom — a fold in
 * one sheet of paper, never a pill stuck on top. Used to file the offerings'
 * card family and to shape the whole "how the evening runs" timeline.
 *
 * Layering is deliberate:
 *  - The outer motion wrapper is NOT clipped, so it can carry the drop-shadow
 *    (a `filter`, which follows the clipped alpha instead of the box the way a
 *    `box-shadow` would — a box-shadow would just get sliced off by the clip)
 *    and any hover lift, moving shape and shadow together.
 *  - The inner `.folder-cell` carries the clip, the ground (`bg`), the bloom and
 *    the content. Content is pushed below the tab by `--fc-tab-h`.
 *
 * Props:
 *   as        — wrapper element ('div' | 'article' | 'a' …), rendered via motion
 *   label     — the tab label (short: it reads as a folder index cut)
 *   labelAs   — element for the label ('span' default; 'h3' when it's the card's heading)
 *   gradient  — orchid Drop tint, matching the section accent
 *   tone      — 'paper' (cream cards) or 'dusk' (the dark timeline) — sets label + shadow
 *   bg        — CSS background for the cell ground (the cell's current colour)
 *   tabWidth  — override `--fc-tab-w` for a wider/narrower cut
 *   bloom     — decorative bloom layer(s) to sit under the content
 *   reveal    — framer entrance props spread onto the wrapper
 *   hover     — lift on hover (default false)
 *   contentClassName — padding/layout for the content region (sides + bottom;
 *                      the top inset for the tab is applied here automatically)
 */
const SHADOW = {
  paper:
    'drop-shadow(0 20px 22px rgba(126,40,72,0.20)) drop-shadow(0 4px 7px rgba(126,40,72,0.10))',
  dusk: 'drop-shadow(0 26px 30px rgba(78,38,57,0.5))',
}

export default function FolderCell({
  as = 'div',
  label,
  labelAs: LabelAs = 'span',
  gradient = ['#D8DB7A', '#9BA03E'],
  tone = 'paper',
  bg,
  tabWidth,
  bloom = null,
  reveal = {},
  hover = false,
  wrapperClassName = '',
  cellClassName = '',
  contentClassName = '',
  labelClassName = '',
  children,
  ...rest
}) {
  const Wrapper = motion[as] || motion.div
  const cellVars = { background: bg }
  if (tabWidth) cellVars['--fc-tab-w'] = tabWidth

  return (
    <Wrapper
      {...reveal}
      {...rest}
      whileHover={hover ? { y: -3 } : undefined}
      style={{ filter: SHADOW[tone] || SHADOW.paper }}
      className={'relative block ' + wrapperClassName}
    >
      <div className={'folder-cell relative h-full ' + cellClassName} style={cellVars}>
        {bloom}
        {/* Tab label, seated in the top-left tab region. */}
        <span
          className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-1.5 pl-[1.4rem] pr-4"
          style={{ height: 'var(--fc-tab-h)' }}
        >
          <Drop className="h-3.5 w-auto shrink-0" gradient={gradient} />
          <LabelAs className={'eyebrow leading-none ' + labelClassName}>{label}</LabelAs>
        </span>
        <div
          className={'relative z-10 ' + contentClassName}
          // Content clears the tab band, plus a hair of breathing room.
          style={{ paddingTop: 'calc(var(--fc-tab-h) + 0.35rem)' }}
        >
          {children}
        </div>
      </div>
    </Wrapper>
  )
}
