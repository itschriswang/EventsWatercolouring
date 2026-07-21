import { motion, useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import { Drop } from './Label.jsx'
import { SPRING } from '../lib/site.js'

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
 *   tabWidth  — override `--fc-tab-w` for a wider/narrower cut. Omit (the
 *               default) to auto-hug the label: the tab is measured to sit an
 *               equal gap either side of the eyebrow (left inset == right
 *               gutter), so the cut tracks the text rather than the cell.
 *   bloom     — decorative bloom layer(s) to sit under the content
 *   reveal    — framer entrance props spread onto the wrapper
 *   hover     — lift on hover (default false)
 *   peek      — file paper sheets inside the folder (default false). They sit
 *               just proud of the body's top edge at rest on every device, and
 *               rise further on hover/focus (pointer devices, motion allowed).
 *               Sheets render BEHIND the clipped cell, in the wrapper's
 *               transparent band beside the tab, so the clip never cuts them.
 *   peekTints — override the two sheet colours (defaults per tone)
 *   contentClassName — padding/layout for the content region (sides + bottom;
 *                      the top inset for the tab is applied here automatically)
 */
const SHADOW = {
  paper:
    'drop-shadow(0 20px 22px rgba(126,40,72,0.20)) drop-shadow(0 4px 7px rgba(126,40,72,0.10))',
  dusk: 'drop-shadow(0 26px 30px rgba(78,38,57,0.5))',
}

// Filed-paper tints for the peek sheets, per tone. Paper cards sit on the warm
// pastel wash, so their sheets are a shade deeper than the cream card ground
// (butter and periwinkle, hue neighbours on the arc); the dusk folder's sheets
// are the cream + pale-chartreuse pair its own tab label already wears, so
// they read as bright paper filed inside a dark folder.
const PEEK_TINTS = {
  paper: ['#F4E9C6', '#E2E5F3'],
  dusk: ['#F7F4EF', '#EDEDBC'],
}

// Two sheets, hand-placed: slightly different heights of poke and a small
// counter-rotation each, so they read as papers dropped in a folder rather
// than a UI element. `rest` keeps them just visible all the time (the static
// charm every device gets); `lift` is how far they rise when the folder is
// hovered or focused. Widths clamp so the sheets stay clear of the auto-hugged
// tab on narrow cells.
const PEEK_SHEETS = [
  {
    rest: -7,
    lift: -17,
    rotate: -1.1,
    style: { right: '6%', width: 'clamp(5rem, 24%, 10rem)' },
    className: '',
  },
  {
    rest: -4,
    lift: -12,
    rotate: 1.4,
    style: { right: 'calc(6% + clamp(5rem, 24%, 10rem) + 0.75rem)', width: 'clamp(3.5rem, 16%, 7rem)' },
    // The second sheet is the first casualty on tiny screens, where it would
    // crowd the tab.
    className: 'hidden sm:block',
  },
]

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
  peek = false,
  peekTints,
  wrapperClassName = '',
  cellClassName = '',
  contentClassName = '',
  labelClassName = '',
  topGap = '0.35rem',
  children,
  ...rest
}) {
  const Wrapper = motion[as] || motion.div
  const reduce = useReducedMotion()
  const auto = !tabWidth
  const cellVars = { background: bg }
  if (tabWidth) cellVars['--fc-tab-w'] = tabWidth

  // Peek sheets rise on hover OR keyboard focus (the FAQ pointer is a link),
  // and stay at rest under reduced motion — still visible, just still.
  const [lifted, setLifted] = useState(false)
  const sheetTints = peekTints || PEEK_TINTS[tone] || PEEK_TINTS.paper
  const peekHandlers =
    peek && !reduce
      ? {
          onHoverStart: () => setLifted(true),
          onHoverEnd: () => setLifted(false),
          onFocus: () => setLifted(true),
          onBlur: () => setLifted(false),
        }
      : {}

  const cellRef = useRef(null)
  const labelRef = useRef(null)

  // Auto-hug: size the tab so the gap to the right of the eyebrow equals the
  // inset on its left. We measure the drop's left edge (the left inset) and the
  // text's right edge, both relative to the cell, and set `--fc-tab-w` to
  // `textRight + leftInset` — symmetric by construction, so it survives any
  // change to the label's own padding. Horizontal deltas are transform-safe, so
  // an ancestor hover-lift can't skew it. Runs in a layout effect (no flash off
  // the CSS default), re-runs on resize and once webfonts settle (the mono's
  // width shifts on load).
  useLayoutEffect(() => {
    if (!auto) return
    const cell = cellRef.current
    const labelEl = labelRef.current
    if (!cell || !labelEl) return
    const drop = labelEl.firstElementChild
    const text = labelEl.lastElementChild
    if (!drop || !text) return
    const measure = () => {
      const cellLeft = cell.getBoundingClientRect().left
      const leftInset = drop.getBoundingClientRect().left - cellLeft
      const textRight = text.getBoundingClientRect().right - cellLeft
      cell.style.setProperty('--fc-tab-w', `${Math.round(textRight + leftInset)}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(labelEl)
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    return () => ro.disconnect()
  }, [auto, label])

  return (
    <Wrapper
      {...reveal}
      {...rest}
      {...peekHandlers}
      whileHover={hover ? { y: -3 } : undefined}
      style={{ filter: SHADOW[tone] || SHADOW.paper }}
      className={'relative block ' + wrapperClassName}
    >
      {/* Peek sheets — before the cell in the DOM so the opaque cell paints
          over their lower half; the visible sliver is whatever pokes above
          the body's top edge (which sits at --fc-tab-h, hardcoded here since
          the var lives on the cell, not this wrapper). They share the
          wrapper's drop-shadow filter, so the shadow silhouette includes the
          poking paper — the folder casts one shadow, contents and all. */}
      {peek &&
        PEEK_SHEETS.map((s, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            initial={false}
            animate={{ y: lifted ? s.lift : s.rest, rotate: s.rotate }}
            transition={SPRING}
            className={'pointer-events-none absolute h-10 origin-bottom rounded-t-[0.45rem] ' + s.className}
            style={{ top: '2.25rem', background: sheetTints[i % sheetTints.length], ...s.style }}
          />
        ))}
      <div ref={cellRef} className={'folder-cell relative h-full ' + cellClassName} style={cellVars}>
        {bloom}
        {/* Tab label, seated in the top-left tab region. */}
        <span
          ref={labelRef}
          className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-1.5 pl-[1.4rem] pr-4"
          style={{ height: 'var(--fc-tab-h)' }}
        >
          <Drop className="h-3.5 w-auto shrink-0" gradient={gradient} />
          <LabelAs className={'eyebrow leading-none ' + labelClassName}>{label}</LabelAs>
        </span>
        <div
          className={'relative z-10 ' + contentClassName}
          // Content clears the tab band, plus `topGap` of breathing room below it.
          style={{ paddingTop: `calc(var(--fc-tab-h) + ${topGap})` }}
        >
          {children}
        </div>
      </div>
    </Wrapper>
  )
}
