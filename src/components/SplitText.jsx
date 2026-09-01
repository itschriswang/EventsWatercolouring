import { motion, useReducedMotion } from 'framer-motion'
import { useId, useLayoutEffect, useMemo, useRef } from 'react'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import usePinchZoomed from '../hooks/usePinchZoom.js'
import Underline from './Underline.jsx'
import { SPRING, asset, REVEAL_VIEWPORT } from '../lib/site.js'
import { INK_WASH, bloom, reflectance, stackFieldCss } from '../lib/watercolour.js'

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
// group's edges. The same inset is what lets the ramp SWAY (see EMPH_SWAY):
// a background layer paints nothing outside its own image, so sliding a wash
// that stopped exactly at the word's edge would open a transparent gutter
// inside the last letter. Clamped ends have no edge to run out of.
const buildFlowGradientCss = (colors, positions, washPx = 1, insetPx = 0) => {
  const pos = positions || colors.map((_, i) => i / (colors.length - 1))
  const total = washPx + 2 * insetPx
  const stops = colors
    .map((c, i) => `${c} ${(((insetPx + pos[i] * washPx) / total) * 100).toFixed(2)}%`)
    .join(', ')
  return `linear-gradient(to right, ${stops})`
}

/* ── The pigment inside the word, still moving ───────────────────────────────
 *
 * The ramp above is the art direction and it stays where it is: the Lemon Lime
 * plateau holds the middle, rose stays pinned against the last letter (the
 * wash below is thickest there precisely because it is). What moves is what
 * moves in a real wash — pigment already laid down, sliding and settling in
 * water that has not dried yet.
 *
 * So every pool is the SAME paint as the ramp beneath it, glazed over that
 * local colour rather than over paper. Two things follow. It cannot mud:
 * CLAUDE.md's anti-mud rules police NEIGHBOURING pigments meeting, and a wash
 * stacking with itself only deepens along its own Figure 6 curve — the
 * argument `fieldLobes` already makes for its satellites. And it cannot drift
 * the art direction: at rest the word is the ramp, a shade deeper in four
 * places, and the emphasis colours in Hero.jsx stay the single source of the
 * hues.
 *
 * All wet-in-wet. §4.3.3's dried rim would draw a ring inside the letters —
 * the "pieces of hot glue" EMPHASIS_WASH below learned about the hard way.
 *
 * The two Lemon Lime pools are a pair on purpose. Translation alone reads as a
 * pattern sliding under the letters; what says "pigment" is a passage getting
 * DENSER and then dispersing, and CSS cannot animate a layer's size without
 * also rescaling every glyph's measured offset for it. Two pools of one paint
 * drifting on opposite paths do it for free: where they cross the green
 * deepens, where they part it opens. They beat against each other across the
 * plateau, which is where the eye already is.
 *
 * The two layers that are not paint are the lifts — unpainted paper held open,
 * the pale heart a bloom pushes outward. They stay cream radials and never
 * enter the K/S mix (CLAUDE.md), written in explicit rgba rather than
 * `transparent`, which is rgba(0,0,0,0) and leaks black wherever a renderer
 * interpolates unpremultiplied.
 *
 * They also carry most of what you actually SEE moving, and that is a
 * legibility decision as much as a visual one. This word is pastel ink on a
 * dark wash, so every drop of extra pigment spends contrast and every lift
 * gives some back. Sampled off the built page — solid stem pixels against the
 * wash they stand on, over the whole cycle — the tightest point in the glyph
 * band is 1.85:1 at the far LEFT edge, where the wash behind runs thinnest
 * under the palest letters. Hence the shape of the list below: the lavender
 * pool sits inboard at 26% and its whole travel is rightward, so the corner
 * that is already tightest never has paint added to it, while the lifts are
 * free to wander anywhere. The cycle now bottoms out at exactly that 1.85:1,
 * and only at rest — every other phase measures better, up to 2.13:1.
 *
 * Geometry is in fractions of each layer's OWN box, so one list serves both
 * tiers: the heavy tier sizes that box in measured pixels across the whole
 * word, the lite tier sizes it as 100% of its single span.
 */
const lift = (size, at, peak) =>
  `radial-gradient(${size} at ${at}, rgba(255,252,242,${peak}) 0%, ` +
  `rgba(255,252,242,${(peak * 0.46).toFixed(3)}) 40%, ` +
  `rgba(255,252,242,${(peak * 0.13).toFixed(3)}) 66%, rgba(255,252,242,0) 86%)`

// `over` is the ramp colour the pool sits on — the nearest stop of Hero.jsx's
// emphasis flow — so §5.2 composites the glaze against what is actually
// underneath it rather than against paper it never touches.
// Sizes are RADII, as `radial-gradient` reads them — a 16% pool spans a third
// of the word, not a sixth. Getting that backwards puts every pool's rim on
// top of its neighbours' centres, which is how the lavender first reached the
// left edge it is placed to stay off.
const EMPHASIS_POOLS = [
  { css: lift('18% 64%', '30% 50%', 0.56) },
  { css: lift('16% 60%', '70% 50%', 0.46) },
  { pigment: 'blossom', x: 0.4, over: '#F2A6C1', size: '16% 62%', at: '86% 50%' },
  { pigment: 'lemonlime', x: 0.36, over: '#D8DB7A', size: '17% 62%', at: '66% 50%' },
  { pigment: 'lemonlime', x: 0.42, over: '#D8DB7A', size: '18% 64%', at: '42% 50%' },
  { pigment: 'lavender', x: 0.36, over: '#D4B6E6', size: '15% 62%', at: '26% 50%' },
]

// Pools are laid taller than the letters so a vertical drift slides a
// different chord of each ellipse through the glyph band — the wash swelling
// and receding rather than a disc panning past.
const EMPH_POOL_HEIGHT = '150%'

// How far the ramp may slide, as a fraction of the word's width. Sets the
// inset margin `buildFlowGradientCss` clamps its ends across, so it has to
// stay AHEAD of the largest ramp offset the `emph-gloop` keyframes ask for:
// 0.036 of the image width, which is itself about 1.4x the word, so ~0.05 of
// the word against the 0.06 of margin here.
const EMPH_SWAY = 0.06

const EMPHASIS_POOL_CSS = EMPHASIS_POOLS.map(
  (p) =>
    p.css ??
    bloom(p.pigment, {
      x: p.x,
      size: p.size,
      at: p.at,
      over: reflectance(p.over),
      wetness: 'wet',
      extent: 0.95,
    }),
).join(', ')

/**
 * The whole fill for an emphasis group: the drifting pools over the flow ramp,
 * as one `background-image`.
 *
 * ORDER IS A CONTRACT. `background-position` takes one value per layer, and
 * the `emph-gloop` keyframes in index.css spell out all seven in this order —
 * pools first (topmost paints first, as CSS background layers always do) and
 * the ramp last. Adding a pool here means adding its line there.
 */
const emphasisFillCss = (colors, positions, washPx, insetPx) =>
  `${EMPHASIS_POOL_CSS}, ${buildFlowGradientCss(colors, positions, washPx, insetPx)}`

// Sizes and rest positions for that stack, written against the custom
// properties `applyEmphasisFlow` measures onto each glyph. Keeping the numbers
// in the properties rather than in these strings is what lets the keyframes
// move every glyph by one shared delta and keep the seams in register — and
// lets the lite tier reuse the identical strings by resolving the same four
// properties against its single span.
//
// TWO coordinate systems, and they are not interchangeable. The ramp lives in
// `--eg-w`/`--eg-x`, the word plus its sway margin, because the margin is
// exactly what its clamped ends need. The pools live in `--eg-pw`/`--eg-px`,
// the word itself, because their positions are art direction: the lavender
// pool authored at 26% has to sit a quarter of the way into the word on both
// tiers, and reading that percentage off the wider box instead would slide
// every pool toward an edge — by different amounts in each tier, since only
// the measured tier has a margin at all.
const EMPH_LAYER_SIZES = [
  ...EMPHASIS_POOLS.map(() => `var(--eg-pw) ${EMPH_POOL_HEIGHT}`),
  'var(--eg-w) 100%',
].join(', ')

// The ramp's y is pinned at 0: it is a `to right` gradient exactly as tall as
// the box, so any vertical offset at all opens a transparent band across the
// letters.
const EMPH_LAYER_REST = [
  ...EMPHASIS_POOLS.map(() => 'var(--eg-px) 50%'),
  'var(--eg-x) 0',
].join(', ')

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
      // is uniform, so any side of any glyph reads the same), plus the sway
      // margin the drifting ramp needs to slide inside.
      const bleedPx = parseFloat(getComputedStyle(glyphs[0]).paddingLeft) || 0
      const insetPx = bleedPx + EMPH_SWAY * groupRect.width
      const fillCss = emphasisFillCss(colors, positions, groupRect.width, insetPx)
      const imageWidth = groupRect.width + 2 * insetPx
      glyphs.forEach((glyph) => {
        const glyphRect = glyph.getBoundingClientRect()
        const offset = glyphRect.left - groupRect.left
        // Every layer reads its geometry from these two, so one shared delta
        // in the keyframes moves the whole word's pigment without any glyph
        // losing register with its neighbours.
        glyph.style.setProperty('--eg-w', `${imageWidth}px`)
        glyph.style.setProperty('--eg-x', `${-offset - insetPx}px`)
        glyph.style.setProperty('--eg-pw', `${groupRect.width}px`)
        glyph.style.setProperty('--eg-px', `${-offset}px`)
        glyph.style.backgroundImage = fillCss
        glyph.style.backgroundSize = EMPH_LAYER_SIZES
        glyph.style.backgroundPosition = EMPH_LAYER_REST
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

// The watercolour wash laid BEHIND an emphasis word (see SplitText's
// `emphasisStroke`). Not a brush stroke: a wash of the mixed dark from
// lib/watercolour.js — burgundy, olive and ultramarine, composited with
// Kubelka-Munk at every step so the ramp is the mix thinning rather than three
// pigments alpha-blending into violet.
//
// Three overlapping blooms rather than one, so the patch has an uneven waist
// and a lighter tail instead of reading as a symmetrical ellipse. All three
// are wet-in-wet (§2.2) — rimless, spreading freely — and that is a decision
// with a history, not a default. The §4.3.3 dried rim was tried here twice:
// on all three blooms it drew three nested rings, and even confined to the
// two end blooms each ring closed around a lighter interior, which reads as
// a bead of gel, not paint — the client's words were "pieces of hot glue".
// The rim's job is to state a wash's outer edge, and at this element's size
// the blooms are so overlapped that most of each bloom's boundary is interior
// to the patch, so the rims could only ever draw the blob structure the
// overlap exists to hide. A dark laid wet-in-wet has no pinned contact line
// and no rim — the hero orb's own mode — and what keeps it from reading
// airbrushed is the pooling and the ragged displaced edge below, §2.2's
// "soft, feathery shapes" rather than §4.3.3's hard dried line.
//
// The filter supplies the two things a synthetic wash otherwise can't have. A
// radial-gradient draws a perfect ellipse; a wet edge wanders, so turbulence
// displaces it into something with a contact line — the same idiom WetBloom
// uses for the artwork wick.
//
// The second is POOLING, not granulation, and the difference matters. Fine
// per-pixel noise on the alpha reads as digital speckle rather than paper, and
// this element doesn't need paper tooth anyway: GrainCanvas already lays the
// shared sheet over the whole page, and one sheet is the point (see CLAUDE.md).
// What a flat gradient is actually missing is the coarse tonal variation of
// pigment settling unevenly as the wash dries, so the turbulence here runs at
// one octave and a low frequency — mean-preserving, so it redistributes the
// wash rather than quietly darkening it.
//
// `opacity` softens the whole thing so the pastel emphasis word still reads on
// top. Sits at zIndex -1 inside the (relative, isolated) emphasis span, so it
// paints behind the glyphs but never escapes to the page. `scaleY` squashes it
// about its centre without touching its length.
//
// Thickness is a trade between legibility and reading as watercolour at all,
// and both ends of it have been measured, not judged by eye. Too thin and the
// wash renders a mid grey the palette does not own (rgb(112,104,107) under the
// glyphs put the word at 3.4:1, under AA's display floor). Too thick and the
// KM curve saturates: an earlier tuning at x ≈ 4 landed the whole interior on
// `ink` — every stop within rgb(14..49) — which is CLAUDE.md's silent failure
// the other way round: the model ran, and the wash rendered as one flat
// near-black slab with a wobbly edge. Dead paint, and the pooling modulation
// below was invisible because alpha sat clipped at 1.0 across the body.
//
// These thicknesses hold a dense core under the word's middle and thin toward
// the ends, drifting warm as the mix thins (the separation INK_WASH exists
// for). Legibility was solved for, not eyeballed: a grid search over the
// three x values, compositing all three gradients as CSS does and checking
// WCAG contrast against the glyph gradient's own local colour across the
// glyph band (x 2..98%, y 0.30..0.70), gives a worst-case point of 4.57:1 —
// better than the saturated slab's 4.35:1 on the same probe, because past
// saturation extra pigment buys no contrast.
//
// The tail bloom is by far the thickest, and that is load-bearing twice over:
// the glyph gradient pins rose (#E88FA4), its darkest stop, against the
// word's right edge, so the last letters need the densest ground (the tail
// once ran so light the final letter overhung bare paper at 2.1:1); and being
// rimless it has no dried edge to state, so only its density carries that end
// of the word. Its geometry is equally solved: every attempt to pull it
// further inside the box strands the last letter's corners on bare paper at
// 2-3:1. The mid-alpha fringe it pushes past the box's right border — where
// a radial-gradient background stops — is dispersed into the edge's raggedness
// by the displacement filter, which is part of why the displacement runs as
// hot as it does.
const EMPHASIS_WASH = [
  { x: 2.0, at: [0.3, 0.5], size: [0.62, 0.6], extent: 0.95, wetness: 'wet' },
  { x: 1.7, at: [0.62, 0.52], size: [0.52, 0.55], extent: 0.95, wetness: 'wet' },
  { x: 3.3, at: [0.86, 0.48], size: [0.32, 0.52], extent: 0.92, wetness: 'wet' },
]

function EmphasisBrush({ inset, opacity = 1, scaleY = 1 }) {
  const id = useId().replace(/:/g, '')
  const background = useMemo(() => stackFieldCss(INK_WASH, EMPHASIS_WASH), [])
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none"
      style={{
        position: 'absolute',
        inset,
        zIndex: -1,
        opacity,
        ...(scaleY !== 1 ? { transform: `scaleY(${scaleY})`, transformOrigin: 'center' } : {}),
      }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        {/* Room for the displaced edge to wander outside the box. */}
        <filter id={id} x="-25%" y="-40%" width="150%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.013 0.019"
            numOctaves="3"
            seed="9"
            result="bleed"
          />
          {/* Runs hotter than the artwork wick's displacement on purpose: with
              the blooms wet-in-wet the wash has no dried rim, so the ragged
              displaced boundary is the only thing standing between the smear
              and an airbrush fade — and it also disperses the sliver of the
              tail's fringe that the box's right border clips. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="bleed"
            scale="46"
            xChannelSelector="R"
            yChannelSelector="G"
            result="wet"
          />
          {/* Where the pigment pooled. RGB carries the same value as alpha so
              the modulation below stays consistent under premultiplied
              compositing — scaling alpha without scaling colour to match would
              brighten the wash as it thins. The frequency sets the blotch
              size: ~30px at this setting, the scale of pigment settling as a
              wash dries. It only reads at all because the wash's body alpha
              now sits below 1 — at the old saturated thicknesses the
              modulation could only clip against alpha 1.0 and the pooling was
              effectively invisible. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="1" seed="3" result="pooling" />
          <feColorMatrix
            in="pooling"
            type="matrix"
            values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  1 0 0 0 0"
            result="uneven"
          />
          <feComposite in="wet" in2="uneven" operator="arithmetic" k1="-0.55" k2="1.275" k3="0" k4="0" />
        </filter>
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          background,
          filter: `url(#${id})`,
        }}
      />
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
  // Lay a watercolour wash BEHIND the emphasis group (see EmphasisBrush
  // above), plus the opacity to render it at. Only shown when emphasisColors
  // is set.
  emphasisStroke = null,
  emphasisStrokeOpacity = 1,
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
  const zoomed = usePinchZoomed()
  // `motion(Tag)` must stay the same component reference across re-renders —
  // recreating it every render makes React see a new element type each time
  // and remount the whole heading, which replays the `whileInView once`
  // reveal (and any other mid-page re-render, e.g. the gallery lightbox
  // opening, would silently reset it) instead of leaving it played.
  const MotionTag = useMemo(() => motion(Tag), [Tag])
  const rootRef = useRef(null)

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
  // Which word slots of each line the emphasis covers. Matching runs per line
  // over word RUNS, not single words: a multi-word `emphasis` ("cotton paper.")
  // is never equal to any one word, so comparing word by word matched nothing
  // and the accent silently rendered as plain type on every heading that used
  // one. `normalise` drops spaces along with the punctuation, so a run joins
  // back to the same key as the phrase.
  const emphasisSlots = lines.map((line) => {
    const words = line.split(' ')
    const slots = new Set()
    emphasisList.forEach((e) => {
      const key = normalise(e)
      if (!key) return
      const span = e.trim().split(/\s+/).length
      for (let i = 0; i + span <= words.length; i++) {
        if (normalise(words.slice(i, i + span).join(' ')) !== key) continue
        for (let k = i; k < i + span; k++) slots.add(k)
      }
    })
    return slots
  })

  // Build a map of which words are emphasized.
  const emphasisMap = new Map()
  let globalWordIndex = 0

  lines.forEach((line, li) => {
    line.split(' ').forEach((_word, wi) => {
      if (emphasisSlots[li].has(wi)) emphasisMap.set(globalWordIndex, true)
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
  const groupEmphasisWords = (words, li) => {
    const groups = []
    let currentGroup = []

    words.forEach((word, wi) => {
      if (emphasisSlots[li].has(wi)) {
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
    : { initial: 'hidden', whileInView: 'show', viewport: REVEAL_VIEWPORT }

  return (
    <MotionTag
      ref={rootRef}
      className={className}
      variants={container}
      {...animateProps}
      aria-label={lines.join(' ')}
    >
      {lines.map((line, li) => {
        const lineWords = line.split(' ')
        const groupedWords = groupEmphasisWords(lineWords, li)

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
                      // -webkit-background-clip can't be set through React's
                      // camelCase style prop — same silent no-op documented
                      // above `applyEmphasisFlow` — so it's applied via
                      // setProperty on mount instead, exactly like the
                      // per-glyph flow does. Without it the word stays truly
                      // `color: transparent` with no clip to reveal it, so
                      // only the opaque brush stroke shows, blotting it out.
                      const clip = (el) => {
                        if (!el) return
                        el.style.setProperty('-webkit-background-clip', 'text')
                        el.style.setProperty('background-clip', 'text')
                        el.style.setProperty('-webkit-text-fill-color', 'transparent')
                      }
                      const textStyle = {
                        backgroundImage: emphasisFillCss(emphasisColors, emphasisColorStops),
                        backgroundSize: EMPH_LAYER_SIZES,
                        backgroundPosition: EMPH_LAYER_REST,
                        backgroundRepeat: 'no-repeat',
                        // One span, so a layer's box IS the word and the
                        // measured tier's strings resolve against these two
                        // without a second set. Held still: the pools are the
                        // same paint either way, but a repaint per frame under
                        // a text clip is exactly the work this tier exists to
                        // not do (and half of what reaches it is reduced
                        // motion anyway).
                        '--eg-w': '100%',
                        '--eg-x': '0px',
                        '--eg-pw': '100%',
                        '--eg-px': '0px',
                        color: 'transparent',
                        textShadow: emphasisShadow || 'none',
                        // Vertical/horizontal bleed so ascenders and
                        // descenders that overflow the tight display line-box
                        // still have gradient painted behind them (the
                        // background paints over the padding box); the
                        // negative margin hands the space back so layout
                        // doesn't move. Same trick as EMPH_GLYPH_BLEED.
                        ...EMPH_GLYPH_BLEED,
                      }
                      return [
                        emphasisStroke ? (
                          // With a brush behind, the clipped-gradient text MUST
                          // live on its own in-flow child, not on this wrapper.
                          // `background-clip: text` paints the visible letters
                          // into an element's OWN background layer, which the
                          // browser draws BEFORE that element's negative-z-index
                          // children — so a brush at zIndex -1 on the same span
                          // paints on top of the letters (the mobile bug where
                          // the stroke sat above "painted"). Here the wrapper only
                          // positions the brush; the inner span paints the text in
                          // the in-flow content layer, after the brush, so the
                          // stroke stays behind. The wrapper keeps the same
                          // padding/margin bleed as the old single span, so the
                          // brush's em-based inset geometry is unchanged.
                          <span
                            key={`g${li}-${gi}`}
                            aria-hidden="true"
                            className="inline-block"
                            style={{ position: 'relative', zIndex: 0, ...EMPH_GLYPH_BLEED }}
                          >
                            <EmphasisBrush
                              opacity={emphasisStrokeOpacity}
                              inset="0.13em 0em -0.09em 0.02em"
                              scaleY={0.85}
                            />
                            <span aria-hidden="true" className="inline-block" ref={clip} style={textStyle}>
                              {text}
                            </span>
                          </span>
                        ) : (
                          <span
                            key={`g${li}-${gi}`}
                            aria-hidden="true"
                            className="inline-block"
                            ref={clip}
                            style={textStyle}
                          >
                            {text}
                          </span>
                        ),
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
                            opacity={emphasisStrokeOpacity}
                            inset="-0.05em -0.22em -0.39em -0.2em"
                            scaleY={0.85}
                          />
                        ) : null}
                        {group.words.flatMap((w, wi) => [
                          ...Array.from(w.word).map((ch, ci) => (
                            <motion.span
                              key={`${gi}-${wi}-${ci}`}
                              variants={item}
                              aria-hidden="true"
                              {...(emphasisColors ? { 'data-emph-glyph': true } : {})}
                              // `emph-gloop` (index.css) drifts the pool
                              // layers. Only where there is a flow to drift,
                              // and only on this branch — reaching it already
                              // means heavy FX and motion allowed, since
                              // either one failing routes the word to the
                              // single-span tier above.
                              className={
                                (groupItalic ? 'inline-block italic' : 'inline-block') +
                                (emphasisColors ? ' emph-gloop' : '')
                              }
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
