import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import usePinchZoomed from '../hooks/usePinchZoom.js'
import Underline from './Underline.jsx'
import { SPRING } from '../lib/site.js'

/**
 * Splits a headline into masked lines and reveals each unit (word or character)
 * with a staggered spring, rising from y:50. Each line sits in an
 * overflow-hidden mask. A single word can be flagged for display emphasis via
 * `emphasis`, rendered in a solid terracotta pigment. Pass `emphasisItalic` to
 * set those words in the family's italic cut for an editorial style contrast
 * against the upright headline.
 *
 * Renders on scroll by default (whileInView); pass `playOnMount` to animate
 * immediately (used by the hero once the preloader hands over).
 *
 * In char mode, each word's characters are wrapped in an inline-block container
 * so the browser never breaks a word mid-character across lines.
 *
 * Char mode also hand-places every glyph — a small deterministic baseline
 * shift per letter — so titles land agitated and human, like sticker
 * letters pressed down one at a time, never digitally flush. Letter spacing
 * itself comes only from the display face's own CSS (`.display-xl/-lg/-md`
 * in index.css), same as any plain display heading. Pass `knockout` to flip
 * one small joining word into the wordmark's negative-space accent: shrunk,
 * paper-filled with an ink stroke, tucked between its neighbours (see
 * `.knockout-word` in index.css).
 */

// No jitter — glyphs render at baseline
const jitter = () => ({ lift: 0 })

// Build a CSS linear-gradient string from a list of hex stops, each
// optionally pinned to its own position (0-1) rather than spaced uniformly.
// Used by `emphasisColors` to paint the action-surface's cool → green → warm
// wash as one real, continuously-blended gradient across an emphasis word —
// clipped per glyph in `applyEmphasisFlow` below so it reads as pigment
// flowing through the letters rather than a strip of solid per-letter
// swatches. Pinning positions (`emphasisColorStops`) lets a stop repeat
// back-to-back to hold a flat plateau — e.g. green at both 0.38 and 0.62 —
// so the flow reads as "mostly green" with the other hues only bleeding in
// at the edges.
// `washPx`/`insetPx` size the wash to a group's rendered width plus the
// glyphs' paint-box bleed on either side: the stops are inset so the wash
// still spans exactly the group's own width, while the gradient's natural
// end-clamping extends the first and last colours flat across the bleed —
// where a sheared first descender or last ascender can reach past the
// group's edges.
const buildFlowGradientCss = (colors, positions, washPx = 1, insetPx = 0) => {
  const pos = positions || colors.map((_, i) => i / (colors.length - 1))
  const total = washPx + 2 * insetPx
  const stops = colors
    .map((c, i) => `${c} ${(((insetPx + pos[i] * washPx) / total) * 100).toFixed(2)}%`)
    .join(', ')
  return `linear-gradient(to right, ${stops})`
}

// Clips that gradient across an emphasis group's letters so it blends
// continuously — including right through the tight negative-tracking overlap
// between glyphs — instead of each glyph carrying its own flat, discrete
// colour. Sizes the gradient to the group's own rendered width and offsets
// each glyph's background by its position within the group, so adjacent
// glyphs' slices line up into one unbroken wash. Re-measures on resize since
// the display face's clamp() sizing changes glyph pixel widths.
//
// Each glyph span carries `EMPH_GLYPH_BLEED` (padding cancelled by negative
// margins) because a background only paints inside the element's own box,
// while the ink of these glyphs reaches well outside it: the display line
// heights (down to 0.86) leave the box shorter than the face's ascenders and
// descenders, and the synthetic-oblique italic (the display face has no true
// italic cut) shears every letter's top past its advance width — worsened by
// the display styles' negative tracking. Without the bleed, any ink outside
// the box has no gradient behind it and renders transparent: flat-sliced
// ascenders/descenders and chunks bitten out of every sheared glyph. The
// offsets below stay correct automatically: they're measured from the padded
// rects, and background-position's origin is the padding box.

// Paint-box bleed for gradient-clipped emphasis glyphs (see above). 0.3em
// vertical covers ascender/descender overflow past the tightest display
// line-height plus the per-glyph jitter lift; 0.3em horizontal covers the
// synthetic-oblique shear at ascender height. The negative margins hand the
// space straight back, so layout (glyph positions, line-box height, the
// masks' 0.08em line gap) doesn't move.
const EMPH_GLYPH_BLEED = { padding: '0.3em', margin: '-0.3em' }

const applyEmphasisFlow = (root, colors, positions) => {
  if (!root) return undefined
  const groups = root.querySelectorAll('[data-emph-group]')
  if (groups.length === 0) return undefined

  const layout = () => {
    groups.forEach((group) => {
      const groupRect = group.getBoundingClientRect()
      if (groupRect.width === 0) return
      const glyphs = group.querySelectorAll('[data-emph-glyph]')
      if (glyphs.length === 0) return
      // The bleed in px at the group's rendered font size (EMPH_GLYPH_BLEED
      // is uniform, so any side of any glyph reads the same).
      const bleedPx = parseFloat(getComputedStyle(glyphs[0]).paddingLeft) || 0
      const gradientCss = buildFlowGradientCss(colors, positions, groupRect.width, bleedPx)
      glyphs.forEach((glyph) => {
        const glyphRect = glyph.getBoundingClientRect()
        const offset = glyphRect.left - groupRect.left
        glyph.style.backgroundImage = gradientCss
        glyph.style.backgroundSize = `${groupRect.width + 2 * bleedPx}px 100%`
        glyph.style.backgroundPosition = `${-offset - bleedPx}px 0`
        glyph.style.backgroundRepeat = 'no-repeat'
        // Camel-case `style.webkitBackgroundClip =` silently no-ops in this
        // engine (only the unprefixed property lands) and unprefixed
        // `background-clip: text` alone doesn't clip in every browser this
        // site targets — set both vendor-prefixed properties explicitly via
        // `setProperty` so the text-fill actually clips to the glyph shape.
        glyph.style.setProperty('-webkit-background-clip', 'text')
        glyph.style.setProperty('background-clip', 'text')
        glyph.style.setProperty('-webkit-text-fill-color', 'transparent')
        glyph.style.color = 'transparent'
      })
    })
  }

  layout()
  const observer = new ResizeObserver(layout)
  groups.forEach((group) => observer.observe(group))
  return () => observer.disconnect()
}

// Ink Bleed — a live cursor-follow lens (adapted from the "Inkbleed" study):
// wherever the pointer sits over a plain (non-emphasis, non-underlined) word
// in a title, the glyph underneath it crossfades from crisp ink into a soft
// wet blur, the way pigment goes soft the moment a brush touches it, then
// sharpens back up as the cursor moves on. Colour-agnostic (alpha masks
// only), so it rides on whatever `currentColor` the caller already set — no
// separate colour prop needed. The reference study's SVG goo/threshold pass
// (built for a thick 120px Inter Bold glyph) blows out the thin counters of
// this site's rounder, smaller display face — filling in the bowls of "a",
// "e", "o" into blobs — so that step is dropped here in favour of a plain
// masked crossfade; still reads as "ink going wet," just without the
// neighbour-fusing blob. Desktop (`useHeavyFx`) + motion-safe only;
// `unit="char"` only.
const INK_OUTER_RADIUS_EM = 0.42 // spot radius the crossfade fades out at
const INK_BLUR_EM = 0.1 // CSS blur on the duplicate "wet" layer
const INK_FOLLOW = 0.3 // cursor smoothing
const INK_INTENSITY_FOLLOW = 0.25
const INK_SETTLE_EPSILON = 0.4

// Sharp text shows everywhere the spot is NOT, the wet blur shows only
// inside it — the spot follows the cursor, not the whole word.
const inkSharpMask = `radial-gradient(circle calc(${INK_OUTER_RADIUS_EM}em * var(--ink-on, 0)) at var(--mx, -9999px) var(--my, -9999px), transparent 0%, rgba(0,0,0,1) 100%)`
const inkSpotMask = `radial-gradient(circle calc(${INK_OUTER_RADIUS_EM}em * var(--ink-on, 0)) at var(--mx, -9999px) var(--my, -9999px), rgba(0,0,0,1) 0%, transparent 100%)`

// One glyph's two crossfaded layers: the sharp base and a wet blur
// duplicate. `idx` addresses this glyph's slot in the ink ref/metrics
// arrays so the cursor-tracking loop (in the SplitText body) can drive its
// --mx/--my. The blurred layer strips text-shadow so it blurs only the
// letterform, not inherited effects that would create visual mud.
function InkGlyph({ ch, idx, wrapRefs }) {
  const base = { display: 'inline-block', whiteSpace: 'pre' }
  return (
    <span
      ref={(el) => { wrapRefs.current[idx] = el }}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <span style={{ ...base, WebkitMaskImage: inkSharpMask, maskImage: inkSharpMask }}>
        {ch}
      </span>
      <span
        aria-hidden="true"
        style={{
          ...base,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          textShadow: 'none',
          filter: `blur(${INK_BLUR_EM}em)`,
          WebkitMaskImage: inkSpotMask,
          maskImage: inkSpotMask,
        }}
      >
        {ch}
      </span>
    </span>
  )
}

// A dark, hand-painted watercolour brush stroke laid BEHIND an emphasis word
// (see SplitText's `emphasisStroke`). A rough lozenge whose edges are broken up
// by a turbulence + displacement filter, so it reads as a loaded brush dragged
// once across the page, not a solid highlight box. Filled with a wine/claret
// gradient from the approved deep-anchor palette (never grey, never purple),
// dark enough that the light pastel letters painted on top read with real
// contrast against the bright, blooming ground. Sits at zIndex -1 inside the
// (relative, isolated) emphasis span, so it paints behind the glyphs but never
// escapes to the page. `preserveAspectRatio="none"` lets the one shape stretch
// to any word width; `id` keeps the filter/gradient refs unique per instance.
function EmphasisBrush({ id, colors, inset }) {
  const [c0, c1, c2] =
    Array.isArray(colors) && colors.length >= 3 ? colors : ['#4A1E33', '#2A1520', '#5B2340']
  const gid = `eb-grad-${id}`
  const fid = `eb-rough-${id}`
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none"
      style={{ position: 'absolute', inset, zIndex: -1 }}
    >
      <svg
        viewBox="0 0 340 132"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c0} />
            <stop offset="52%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <filter id={fid} x="-10%" y="-24%" width="120%" height="148%">
            <feTurbulence type="fractalNoise" baseFrequency="0.016 0.032" numOctaves="2" seed="6" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* A loaded-brush swash: a fat rounded bar (so it backs the whole word
            height across its full width) with softly rounded, tapering ends —
            the turbulence filter then breaks the edges into brush texture. */}
        <path
          d="M26,26 C120,17 220,17 314,26 C334,33 334,99 314,106 C220,115 120,115 26,106 C6,99 6,33 26,26 Z"
          fill={`url(#${gid})`}
          filter={`url(#${fid})`}
        />
      </svg>
    </span>
  )
}

export default function SplitText({
  lines = [],
  emphasis = null,
  emphasisItalic = false,
  emphasisColors = null,
  emphasisColorStops = null,
  emphasisShadow = null,
  // A dark, hand-painted watercolour brush stroke laid BEHIND the emphasis
  // group — an array of three hex stops for its wine/claret gradient (see
  // EmphasisBrush above). The light pastel emphasis word then reads against
  // dark pigment instead of the bright, actively-blooming page ground, which
  // carries far more contrast than a drop-shadow can. Only rendered when
  // emphasisColors is set.
  emphasisStroke = null,
  underline = null,
  knockout = null,
  unit = 'char',
  className = '',
  as: Tag = 'h2',
  delay = 0,
  playOnMount = false,
  inkBleed = false,
}) {
  const reduce = useReducedMotion()
  const lite = reduce || !useHeavyFx()
  const zoomed = usePinchZoomed()
  const inkActive = false
  // `motion(Tag)` must stay the same component reference across re-renders —
  // recreating it every render makes React see a new element type each time
  // and remount the whole heading, which replays the `whileInView once`
  // reveal (and any other mid-page re-render, e.g. the gallery lightbox
  // opening, would silently reset it) instead of leaving it played.
  const MotionTag = useMemo(() => motion(Tag), [Tag])
  const rootRef = useRef(null)
  // Stable, unique prefix for each emphasis brush's SVG filter/gradient ids so
  // multiple headings on a page never collide on the same url(#id).
  const brushUid = useId().replace(/:/g, '')

  // Real gradient-clip flow (see `applyEmphasisFlow`) needs post-layout glyph
  // measurements the render pass can't produce, so it runs as a DOM
  // side-effect rather than inline styles. Re-runs whenever the emphasis
  // wash's own inputs change; `applyEmphasisFlow` itself re-measures on
  // resize via ResizeObserver.
  useLayoutEffect(() => {
    // The lite path renders the emphasis word as a single clipped-gradient
    // span (see the group branch below), so there are no per-glyph
    // `[data-emph-glyph]` elements to measure and no ResizeObserver to run.
    if (!emphasisColors || lite) return undefined
    return applyEmphasisFlow(rootRef.current, emphasisColors, emphasisColorStops)
  }, [emphasisColors, emphasisColorStops, lines, emphasis, lite])

  // Ink Bleed cursor tracking — mirrors the entrance/emphasis effects above:
  // a DOM side-effect that measures every plain glyph's rect and drives its
  // --mx/--my custom properties from a smoothed cursor position, only when
  // active (desktop, motion-safe, `inkBleed` requested).
  const inkWrapRefs = useRef([])
  const inkMetrics = useRef([])
  const inkTarget = useRef({ x: -9999, y: -9999, on: 0 })
  const inkSmooth = useRef({ x: -9999, y: -9999, on: 0 })
  const inkRaf = useRef(null)

  const measureInk = () => {
    inkMetrics.current = inkWrapRefs.current.map((el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { left: r.left, top: r.top }
    })
  }

  useLayoutEffect(() => {
    if (!inkActive) return undefined
    measureInk()
    const ro = new ResizeObserver(measureInk)
    if (rootRef.current) ro.observe(rootRef.current)
    window.addEventListener('scroll', measureInk, { passive: true })
    window.addEventListener('resize', measureInk)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', measureInk)
      window.removeEventListener('resize', measureInk)
    }
  }, [inkActive, lines, emphasis])

  const renderInk = () => {
    const { x: cx, y: cy, on } = inkSmooth.current
    rootRef.current?.style.setProperty('--ink-on', on.toFixed(3))
    const ms = inkMetrics.current
    for (let i = 0; i < ms.length; i++) {
      const m = ms[i]
      const wrapEl = inkWrapRefs.current[i]
      if (!m || !wrapEl) continue
      wrapEl.style.setProperty('--mx', `${(cx - m.left).toFixed(1)}px`)
      wrapEl.style.setProperty('--my', `${(cy - m.top).toFixed(1)}px`)
    }
  }

  const stopInkLoop = () => {
    if (inkRaf.current !== null) {
      cancelAnimationFrame(inkRaf.current)
      inkRaf.current = null
    }
  }

  const tickInk = () => {
    const t = inkTarget.current
    const s = inkSmooth.current
    s.x += (t.x - s.x) * INK_FOLLOW
    s.y += (t.y - s.y) * INK_FOLLOW
    s.on += (t.on - s.on) * INK_INTENSITY_FOLLOW
    renderInk()
    const settled =
      Math.abs(t.x - s.x) < INK_SETTLE_EPSILON &&
      Math.abs(t.y - s.y) < INK_SETTLE_EPSILON &&
      Math.abs(t.on - s.on) < 0.005
    if (settled && t.on === 0) {
      s.on = 0
      renderInk()
      inkRaf.current = null
      return
    }
    inkRaf.current = requestAnimationFrame(tickInk)
  }

  const startInkLoop = () => {
    if (inkRaf.current !== null) return
    inkRaf.current = requestAnimationFrame(tickInk)
  }

  const handleInkMove = (e) => {
    if (inkTarget.current.on === 0) {
      inkSmooth.current.x = e.clientX
      inkSmooth.current.y = e.clientY
    }
    inkTarget.current.x = e.clientX
    inkTarget.current.y = e.clientY
    inkTarget.current.on = 1
    startInkLoop()
  }

  const handleInkLeave = () => {
    inkTarget.current.on = 0
    startInkLoop()
  }

  useEffect(() => stopInkLoop, [])

  // Running index into the ink ref/metrics arrays, spanning every plain
  // glyph across the whole heading (not just one line) — reset each render.
  let inkGlyphIdx = 0

  const normalise = s => s.toLowerCase().replace(/[^a-z]/g, '')
  const isWordUnderlined = (word) => underline !== null && normalise(word) === normalise(underline)
  const isWordKnockout = (word) => knockout !== null && normalise(word) === normalise(knockout)

  // The baseline lift rides on position:relative/top so it never fights the
  // variant's animated y spring. Spaces stay unshifted.
  const glyphStyle = (li, gi) => {
    const j = jitter(li, gi)
    return { position: 'relative', top: `${j.lift}em` }
  }

  const emphasisList = emphasis
    ? (Array.isArray(emphasis) ? emphasis : [emphasis])
    : []
  const isPhrase = emphasisList.some(e => e.includes(' '))

  const isWordEmphasisized = (word) => {
    if (emphasisList.length === 0) return false
    return emphasisList.some(e => normalise(word) === normalise(e))
  }

  // Build a map of which words are emphasized.
  const emphasisMap = new Map()
  let globalWordIndex = 0

  lines.forEach((line) => {
    line.split(' ').forEach((word) => {
      if (isWordEmphasisized(word)) emphasisMap.set(globalWordIndex, true)
      globalWordIndex++
    })
  })

  // Emphasis words render as a single warm pigment rather than a multi-stop
  // gradient-text fill — the italic cut already carries the emphasis, and solid
  // colour avoids the gradient-text look while keeping AA contrast at the
  // display sizes SplitText is used at.
  const getGradientStyle = (wordIndex) =>
    emphasisMap.has(wordIndex) ? { color: 'var(--c-terracotta)' } : {}

  // Group consecutive emphasized words on same line
  const groupEmphasisWords = (words) => {
    const groups = []
    let currentGroup = []

    words.forEach((word) => {
      if (isWordEmphasisized(word)) {
        currentGroup.push({ word, isEmph: true })
      } else {
        if (currentGroup.length > 0) {
          groups.push({ words: currentGroup, isGroup: true })
          currentGroup = []
        }
        groups.push({ word, isEmph: false })
      }
    })
    if (currentGroup.length > 0) {
      groups.push({ words: currentGroup, isGroup: true })
    }
    return groups
  }

  const container = lite
    ? {
        hidden: { opacity: 0, y: reduce ? 0 : 16 },
        show: { opacity: 1, y: 0, transition: { ...SPRING, delay } },
      }
    : {
        hidden: {},
        show: {
          transition: {
            staggerChildren: unit === 'char' ? 0.02 : 0.05,
            delayChildren: delay,
          },
        },
      }

  // In lite mode the units are static (the container does the single reveal);
  // otherwise each unit springs up from y:50 on its own stagger.
  const item = lite
    ? undefined
    : {
        hidden: { y: 50, opacity: 0 },
        show: { y: 0, opacity: 1, transition: SPRING },
      }

  // After a pinch-zoom the IO behind `whileInView` can stall (see
  // usePinchZoom), so a latched page plays headings on mount instead.
  // `reduce` joins playOnMount/zoomed on the mount-play path: a reduced-motion
  // heading resolves to its shown state on mount rather than waiting on a
  // scroll reveal, so a title can never strand invisible for that audience.
  const animateProps = playOnMount || zoomed || reduce
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } }

  return (
    <MotionTag
      ref={rootRef}
      className={className}
      variants={container}
      {...animateProps}
      {...(inkActive
        ? { onMouseMove: handleInkMove, onMouseLeave: handleInkLeave }
        : {})}
      aria-label={lines.join(' ')}
    >
      {lines.map((line, li) => {
        const lineHasPhrase = isPhrase && emphasisList.some(e => line.toLowerCase().includes(e.toLowerCase()))
        const lineWords = line.split(' ')
        const groupedWords = groupEmphasisWords(lineWords)

        // Track word index for gradient positioning
        let wordIndexInHeading = 0
        for (let prevLi = 0; prevLi < li; prevLi++) {
          wordIndexInHeading += lines[prevLi].split(' ').length
        }

        // Running glyph counter for the line, so each successive letter draws
        // a fresh jitter sample — neighbours never share an angle.
        let glyphIdx = 0

        return (
          <span
            key={li}
            className="block"
          >
            {unit === 'char'
              ? groupedWords.flatMap((group, gi) => {
                  if (group.isGroup) {
                    // The light swatch flow reads worse under either of the
                    // title's other two options: the inherited warm backlit
                    // glow washes pastels out (light-on-light), and any drop
                    // shadow strong enough to read as a shadow also crushes
                    // the colour back toward the dark ink it's meant to relieve.
                    // So the flow just needs its inherited glow switched off,
                    // not replaced.
                    const spanStyle = emphasisColors
                      ? {
                          textShadow: emphasisShadow || 'none',
                          // A relative, isolated box so the brush stroke can sit
                          // at zIndex -1 behind the glyphs without escaping to
                          // the page behind the whole heading.
                          ...(emphasisStroke ? { position: 'relative', zIndex: 0 } : {}),
                        }
                      : getGradientStyle(wordIndexInHeading)
                    wordIndexInHeading += group.words.length
                    // Lite path (touch / reduced-motion): paint the whole
                    // emphasis word as ONE clipped-gradient span instead of the
                    // per-glyph measured flow below. The per-glyph flow gives
                    // each letter its own `background-clip: text` layer, seamed
                    // together by a pixel-measured background-position. On iOS
                    // Safari a pinch-zoom re-composites each of those clipped
                    // layers at a scale the positions weren't measured at, so
                    // the seams drift and the wash visibly swims across the word
                    // (the reported zoom glitch). A single span has no
                    // inter-glyph seams to slide, and the lite path doesn't
                    // stagger glyphs anyway (the container does one reveal), so
                    // nothing is lost by not splitting. `background-size` spans
                    // the word's own box (100%) rather than a measured pixel
                    // width, so there is nothing to re-measure on resize/zoom.
                    if (lite && emphasisColors) {
                      const text = group.words.map((w) => w.word).join(' ')
                      return [
                        <span
                          key={`g${li}-${gi}`}
                          aria-hidden="true"
                          className="inline-block"
                          style={{
                            backgroundImage: buildFlowGradientCss(emphasisColors, emphasisColorStops),
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                            textShadow: emphasisShadow || 'none',
                            // A relative, isolated box so the brush can sit
                            // behind the clipped text (zIndex -1). A background
                            // on the child does not affect this element's own
                            // background-clip: text of `{text}`.
                            ...(emphasisStroke ? { position: 'relative', zIndex: 0 } : {}),
                            // Vertical/horizontal bleed so ascenders and
                            // descenders that overflow the tight display
                            // line-box still have gradient painted behind them
                            // (the background paints over the padding box);
                            // the negative margin hands the space back so
                            // layout doesn't move. Same trick as EMPH_GLYPH_BLEED.
                            ...EMPH_GLYPH_BLEED,
                          }}
                        >
                          {emphasisStroke ? (
                            <EmphasisBrush
                              id={`${brushUid}-${li}-${gi}`}
                              colors={emphasisStroke}
                              inset="0.12em 0.1em 0.04em 0.12em"
                            />
                          ) : null}
                          {text}
                        </span>,
                        gi < groupedWords.length - 1 ? (
                          <span
                            key={`sp${li}-${gi}`}
                            aria-hidden="true"
                            className="inline-block whitespace-pre"
                          >
                            {' '}
                          </span>
                        ) : null,
                      ]
                    }
                    // Fallback fill for the brief window before the
                    // gradient-clip effect measures and takes over (and for
                    // any environment where it can't run) — the flow's own
                    // midpoint colour, so it degrades to a plausible solid
                    // rather than flashing unstyled text.
                    const fallbackColor = emphasisColors
                      ? emphasisColors[Math.floor((emphasisColors.length - 1) / 2)]
                      : null
                    // When the glyphs carry the gradient clip, keep
                    // `font-style: italic` on the clipped glyph elements
                    // themselves (with their EMPH_GLYPH_BLEED sized for the
                    // sheared ink) rather than inheriting it from the group
                    // wrapper.
                    const glyphItalic = emphasisItalic && !emphasisColors
                    const groupItalic = emphasisItalic && emphasisColors
                    return [
                      <span
                        key={`g${li}-${gi}`}
                        {...(emphasisColors ? { 'data-emph-group': true } : {})}
                        className={glyphItalic ? 'inline-block italic' : 'inline-block'}
                        style={spanStyle}
                      >
                        {emphasisStroke && emphasisColors ? (
                          <EmphasisBrush
                            key="eb"
                            id={`${brushUid}-${li}-${gi}`}
                            colors={emphasisStroke}
                            inset="-0.15em -0.17em -0.27em -0.15em"
                          />
                        ) : null}
                        {group.words.flatMap((w, wi) => [
                          ...Array.from(w.word).map((ch, ci) => (
                            <motion.span
                              key={`${gi}-${wi}-${ci}`}
                              variants={item}
                              aria-hidden="true"
                              {...(emphasisColors ? { 'data-emph-glyph': true } : {})}
                              className={groupItalic ? 'inline-block italic' : 'inline-block'}
                              style={{
                                ...glyphStyle(li, glyphIdx++),
                                ...(fallbackColor ? { color: fallbackColor } : {}),
                                ...(emphasisColors ? EMPH_GLYPH_BLEED : {}),
                              }}
                            >
                              {ch}
                            </motion.span>
                          )),
                          wi < group.words.length - 1 ? (
                            <motion.span
                              key={`space-${gi}-${wi}`}
                              variants={item}
                              aria-hidden="true"
                              className="inline-block whitespace-pre"
                            >
                              {' '}
                            </motion.span>
                          ) : null,
                        ])}
                      </span>,
                      gi < groupedWords.length - 1 ? (
                        <motion.span
                          key={`sp${li}-${gi}`}
                          variants={item}
                          aria-hidden="true"
                          className="inline-block whitespace-pre"
                        >
                          {' '}
                        </motion.span>
                      ) : null,
                    ]
                  }
                  wordIndexInHeading++
                  const underlined = isWordUnderlined(group.word)
                  const WordTag = underlined ? Underline : 'span'
                  const wordTagProps = underlined ? { seed: group.word } : {}
                  // Ink Bleed only wraps plain words — underlined/knockout
                  // words already carry their own decorative treatment.
                  const wordInkActive = inkActive && !underlined && !isWordKnockout(group.word)
                  return [
                    <WordTag
                      key={`w${li}-${gi}`}
                      className={
                        isWordKnockout(group.word)
                          ? 'inline-block knockout-word'
                          : 'inline-block'
                      }
                      {...wordTagProps}
                    >
                      {Array.from(group.word).map((ch, ci) => {
                        const glyph = wordInkActive ? (
                          <InkGlyph ch={ch} idx={inkGlyphIdx++} wrapRefs={inkWrapRefs} />
                        ) : (
                          ch
                        )
                        return (
                          <motion.span
                            key={ci}
                            variants={item}
                            aria-hidden="true"
                            className="inline-block"
                            style={glyphStyle(li, glyphIdx++)}
                          >
                            {glyph}
                          </motion.span>
                        )
                      })}
                    </WordTag>,
                    gi < groupedWords.length - 1 ? (
                      <motion.span
                        key={`sp${li}-${gi}`}
                        variants={item}
                        aria-hidden="true"
                        className="inline-block whitespace-pre"
                      >
                        {' '}
                      </motion.span>
                    ) : null,
                  ]
                })
              : groupedWords.flatMap((group, gi) => {
                  if (group.isGroup) {
                    const spanStyle = getGradientStyle(wordIndexInHeading)
                    wordIndexInHeading += group.words.length
                    return [
                      <motion.span
                        key={`g${li}-${gi}`}
                        variants={item}
                        aria-hidden="true"
                        className={emphasisItalic ? 'inline-block italic' : 'inline-block'}
                        style={spanStyle}
                      >
                        {group.words.map((w, wi) => (
                          <span key={wi}>
                            {w.word}
                            {wi < group.words.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </motion.span>,
                      gi < groupedWords.length - 1 ? (
                        <motion.span
                          key={`sp${li}-${gi}`}
                          variants={item}
                          aria-hidden="true"
                          className="inline-block whitespace-pre"
                        >
                          {' '}
                        </motion.span>
                      ) : null,
                    ]
                  }
                  wordIndexInHeading++
                  return [
                    <motion.span
                      key={`w${li}-${gi}`}
                      variants={item}
                      aria-hidden="true"
                      className="inline-block"
                    >
                      {group.word}
                      {gi < groupedWords.length - 1 ? ' ' : ''}
                    </motion.span>,
                  ]
                })}
          </span>
        )
      })}
    </MotionTag>
  )
}
