import { motion, useReducedMotion } from 'framer-motion'
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
 * Char mode also hand-places every glyph — a small deterministic rotation and
 * baseline shift per letter — so titles land agitated and human, like sticker
 * letters pressed down one at a time, never digitally flush. Pass `knockout`
 * to flip one small joining word into the wordmark's negative-space accent:
 * shrunk, paper-filled with an ink stroke, tucked between its neighbours
 * (see `.knockout-word` in index.css).
 */

// Deterministic per-glyph agitation, seeded by line + glyph position so the
// scatter is stable across renders (no re-jumbling on hover or route change).
// Rotation in degrees, lift in em.
//
// The lean alternates direction letter-to-letter (offset by line so lines don't
// all open the same way): hand-painted signage zig-zags rather than drifting
// one way, and a plain hash tends to clump several same-sign tilts in a row —
// especially visible under the italic emphasis cut, where a run of right-leaning
// glyphs reads as the whole word tipping over. The hash still sets each letter's
// magnitude and baseline lift, so the alternation stays organic rather than a
// perfect metronome.
//
// Angle magnitude is kept gentle (2°–7°). Rotating a glyph about its centre
// doesn't change its average advance — it swings the top one way and the foot
// the other, so counter-leaning neighbours meet in a wedge (a gap that opens at
// the cap and pinches at the baseline). Wide angles turn that wedge severe and
// the line reads as scattered debris; a gentle tilt keeps the hand-lettered
// life while the letters still nest cleanly, the way the reference wordmark
// does.
const jitter = (li, gi) => {
  const h1 = Math.sin((li + 1) * 127.1 + (gi + 1) * 311.7) * 43758.5453
  const h2 = Math.sin((li + 1) * 269.5 + (gi + 1) * 183.3) * 24634.6345
  const r1 = h1 - Math.floor(h1)
  const r2 = h2 - Math.floor(h2)
  const dir = (gi + li) % 2 === 0 ? 1 : -1
  return { rotate: dir * (2 + r1 * 5), lift: (r2 - 0.5) * 0.07 }
}

// Overlap. The reference wordmark isn't a row of spaced letters — successive
// characters tuck into one another so the title reads as one drawn mark. The
// display face already carries heavy negative tracking (.display-xl: -0.11em),
// but the round marker glyphs still want more to genuinely overlap, so every
// split glyph gets a small extra negative margin on each side. It rides on top
// of letter-spacing (not instead of it) and is symmetric so it never shoves a
// glyph off its own centre — it only closes the seams. word-spacing on the face
// buys the inter-word gaps back, so tightening here nestles letters without
// running the words together.
const OVERLAP = 0.038 // em pulled off each side of every glyph

// Sample a colour flowing across a list of hex stops at fraction f in [0,1].
// Used by `emphasisColors` to run the action-surface's cool → green → warm
// wash across an emphasis word letter-by-letter — solid per-glyph pigment (so
// it survives the per-glyph rotations and keeps AA contrast at display sizes)
// rather than a background-clip:text fill.
const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mixByte = (a, b, t) => Math.round(a + (b - a) * t)
const flowColour = (stops, f) => {
  if (stops.length === 1) return stops[0]
  const x = Math.max(0, Math.min(1, f)) * (stops.length - 1)
  const i = Math.min(Math.floor(x), stops.length - 2)
  const [r1, g1, b1] = hexToRgb(stops[i])
  const [r2, g2, b2] = hexToRgb(stops[i + 1])
  const t = x - i
  return `rgb(${mixByte(r1, r2, t)}, ${mixByte(g1, g2, t)}, ${mixByte(b1, b2, t)})`
}

export default function SplitText({
  lines = [],
  emphasis = null,
  emphasisItalic = false,
  emphasisColors = null,
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
  const normalise = s => s.toLowerCase().replace(/[^a-z]/g, '')
  const isWordUnderlined = (word) => underline !== null && normalise(word) === normalise(underline)
  const isWordKnockout = (word) => knockout !== null && normalise(word) === normalise(knockout)

  // The agitation is styling, not motion — `rotate` merges with the variant's
  // animated y in framer's transform, and the baseline lift rides on
  // position:relative/top so it never fights the y spring. Spaces stay unshifted.
  const glyphStyle = (li, gi) => {
    const j = jitter(li, gi)
    return {
      rotate: j.rotate,
      position: 'relative',
      top: `${j.lift}em`,
      marginLeft: `-${OVERLAP}em`,
      marginRight: `-${OVERLAP}em`,
    }
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
                    // When the emphasis carries the light swatch flow, its
                    // letters are too pale for the display face's warm backlit
                    // glow — so `emphasisShadow` swaps that glow for a dark
                    // tinted drop (approved shadow palette), the reference's
                    // light-letters-over-a-dark-drop treatment.
                    const spanStyle = emphasisColors
                      ? (emphasisShadow ? { textShadow: emphasisShadow } : {})
                      : getGradientStyle(wordIndexInHeading)
                    wordIndexInHeading += group.words.length
                    // Flow the emphasis wash across the group's letters (spaces
                    // excluded), so a multi-word emphasis reads as one continuous
                    // sweep rather than each word restarting the ramp.
                    const groupGlyphTotal = group.words.reduce(
                      (n, w) => n + Array.from(w.word).length,
                      0,
                    )
                    let groupGlyphIdx = 0
                    return [
                      <span
                        key={`g${li}-${gi}`}
                        className={emphasisItalic ? 'inline-block italic' : 'inline-block'}
                        style={spanStyle}
                      >
                        {group.words.flatMap((w, wi) => [
                          ...Array.from(w.word).map((ch, ci) => {
                            const flow = emphasisColors
                              ? {
                                  color: flowColour(
                                    emphasisColors,
                                    groupGlyphTotal > 1
                                      ? groupGlyphIdx / (groupGlyphTotal - 1)
                                      : 0,
                                  ),
                                }
                              : null
                            groupGlyphIdx++
                            return (
                              <motion.span
                                key={`${gi}-${wi}-${ci}`}
                                variants={item}
                                aria-hidden="true"
                                className="inline-block"
                                style={{ ...glyphStyle(li, glyphIdx++), ...(flow || {}) }}
                              >
                                {ch}
                              </motion.span>
                            )
                          }),
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
