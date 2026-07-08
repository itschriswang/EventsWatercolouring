import { motion, useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
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

// Deterministic per-glyph baseline lift, seeded by line + glyph position so
// the scatter is stable across renders (no re-jumbling on hover or route
// change). In em.
const jitter = (li, gi) => {
  const h2 = Math.sin((li + 1) * 269.5 + (gi + 1) * 183.3) * 24634.6345
  const r2 = h2 - Math.floor(h2)
  return { lift: (r2 - 0.5) * 0.07 }
}

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
const buildFlowGradientCss = (colors, positions) => {
  const pos = positions || colors.map((_, i) => i / (colors.length - 1))
  const stops = colors.map((c, i) => `${c} ${(pos[i] * 100).toFixed(2)}%`).join(', ')
  return `linear-gradient(to right, ${stops})`
}

// Clips that gradient across an emphasis group's letters so it blends
// continuously — including right through the tight negative-tracking overlap
// between glyphs — instead of each glyph carrying its own flat, discrete
// colour. Sizes the gradient to the group's own rendered width and offsets
// each glyph's background by its position within the group, so adjacent
// glyphs' slices line up into one unbroken wash. Re-measures on resize since
// the display face's clamp() sizing changes glyph pixel widths.
const applyEmphasisFlow = (root, gradientCss) => {
  if (!root) return undefined
  const groups = root.querySelectorAll('[data-emph-group]')
  if (groups.length === 0) return undefined

  const layout = () => {
    groups.forEach((group) => {
      const groupRect = group.getBoundingClientRect()
      if (groupRect.width === 0) return
      group.querySelectorAll('[data-emph-glyph]').forEach((glyph) => {
        const glyphRect = glyph.getBoundingClientRect()
        const offset = glyphRect.left - groupRect.left
        glyph.style.backgroundImage = gradientCss
        glyph.style.backgroundSize = `${groupRect.width}px 100%`
        glyph.style.backgroundPosition = `${-offset}px 0`
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

export default function SplitText({
  lines = [],
  emphasis = null,
  emphasisItalic = false,
  emphasisColors = null,
  emphasisColorStops = null,
  emphasisShadow = null,
  underline = null,
  knockout = null,
  unit = 'char',
  className = '',
  as: Tag = 'h2',
  delay = 0,
  playOnMount = false,
}) {
  const reduce = useReducedMotion()
  const lite = reduce || !useHeavyFx()
  const MotionTag = motion(Tag)
  const rootRef = useRef(null)

  // Real gradient-clip flow (see `applyEmphasisFlow`) needs post-layout glyph
  // measurements the render pass can't produce, so it runs as a DOM
  // side-effect rather than inline styles. Re-runs whenever the emphasis
  // wash's own inputs change; `applyEmphasisFlow` itself re-measures on
  // resize via ResizeObserver.
  useLayoutEffect(() => {
    if (!emphasisColors) return undefined
    const gradientCss = buildFlowGradientCss(emphasisColors, emphasisColorStops)
    return applyEmphasisFlow(rootRef.current, gradientCss)
  }, [emphasisColors, emphasisColorStops, lines, emphasis])

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

  const animateProps = playOnMount
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } }

  return (
    <MotionTag
      ref={rootRef}
      className={className}
      variants={container}
      {...animateProps}
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

        // The reveal mask clips at its padding edge, so anything that paints
        // past the glyph box — a leading italic overhang, a tilted ascender,
        // the display styles' soft light bloom — needs bleed room or it
        // slices into a visible rectangle. The backlit glow spreads further
        // than the old drop shadow did, so the bleed is generous. Pad the mask
        // out on every side and pull the same distance back with negative
        // margins so the layout (including the original 0.08em line gap)
        // doesn't move.
        return (
          <span
            key={li}
            className="block overflow-hidden pb-[0.28em] -mb-[0.2em] pt-[0.22em] -mt-[0.22em] -ml-[0.22em] pl-[0.22em]"
          >
            {unit === 'char'
              ? groupedWords.flatMap((group, gi) => {
                  if (group.isGroup) {
                    // The light swatch flow reads worse under either of the
                    // title's other two options: the inherited warm backlit
                    // glow washes pastels out (light-on-light), and any drop
                    // shadow strong enough to read as a shadow also crushes
                    // the colour back toward the dark ink it's meant to relieve
                    // — especially once the stamp-distress filter's own grain
                    // multiplies over it. That grain multiply is already doing
                    // the contrast work (it densifies every glyph's ink
                    // regardless of fill), so the flow just needs its
                    // inherited glow switched off, not replaced.
                    const spanStyle = emphasisColors
                      ? { textShadow: emphasisShadow || 'none' }
                      : getGradientStyle(wordIndexInHeading)
                    wordIndexInHeading += group.words.length
                    // Fallback fill for the brief window before the
                    // gradient-clip effect measures and takes over (and for
                    // any environment where it can't run) — the flow's own
                    // midpoint colour, so it degrades to a plausible solid
                    // rather than flashing unstyled text.
                    const fallbackColor = emphasisColors
                      ? emphasisColors[Math.floor((emphasisColors.length - 1) / 2)]
                      : null
                    return [
                      <span
                        key={`g${li}-${gi}`}
                        {...(emphasisColors ? { 'data-emph-group': true } : {})}
                        className={emphasisItalic ? 'inline-block italic' : 'inline-block'}
                        style={spanStyle}
                      >
                        {group.words.flatMap((w, wi) => [
                          ...Array.from(w.word).map((ch, ci) => (
                            <motion.span
                              key={`${gi}-${wi}-${ci}`}
                              variants={item}
                              aria-hidden="true"
                              {...(emphasisColors ? { 'data-emph-glyph': true } : {})}
                              className="inline-block"
                              style={{
                                ...glyphStyle(li, glyphIdx++),
                                ...(fallbackColor ? { color: fallbackColor } : {}),
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
                  const WordTag = isWordUnderlined(group.word) ? Underline : 'span'
                  const wordTagProps = isWordUnderlined(group.word)
                    ? { seed: group.word }
                    : {}
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
                      {Array.from(group.word).map((ch, ci) => (
                        <motion.span
                          key={ci}
                          variants={item}
                          aria-hidden="true"
                          className="inline-block"
                          style={glyphStyle(li, glyphIdx++)}
                        >
                          {ch}
                        </motion.span>
                      ))}
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
