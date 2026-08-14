// The watercolour model, after Curtis, Anderson, Seims, Fleischer and Salesin,
// "Computer-Generated Watercolor" (SIGGRAPH '97). Section numbers in the
// comments below refer to that paper.
//
// The site already *looked* like watercolour; this is the physics underneath
// it. Three things came out of the paper that a smooth gradient can't fake:
//
//   1. Edge darkening (§4.3.3). The paper calls this "the key effect" that
//      artists rely on, and — crucially for us — argues that the luminous,
//      "glowing from within" quality of watercolour comes from it. A wash that
//      feathers smoothly to nothing is an airbrush; a wash with a darker rim
//      where the water stopped is paint.
//   2. Granulation (§4.5). Pigment settles into the paper's valleys, so grain
//      is a property of the *sheet*, not a noise layer floating on top. That
//      makes the wash and the grain overlay literally the same paper.
//   3. Kubelka-Munk optical compositing (§5). Overlapping glazes multiply
//      light rather than average colour, which is exactly the failure mode
//      CLAUDE.md's anti-mud rules exist to work around: alpha-averaging two
//      washes tends to grey, KM keeps them luminous and moves hue along a
//      physical curve as pigment thickens (the paper's Figure 6).
//
// The GLSL here is exported as source chunks rather than duplicated in each
// canvas, so BloomCanvas and GrainCanvas share one paper and one pigment set.

/* ------------------------------------------------------------------ *
 * §5.1 — specifying pigments by appearance
 * ------------------------------------------------------------------ */

/** Inverse hyperbolic cotangent; the KM inversion in §5.1 is written with it. */
const acoth = (z) => 0.5 * Math.log((z + 1) / (z - 1))

/**
 * Derive Kubelka-Munk absorption (K) and scattering (S) coefficients from the
 * two colours an artist can actually judge by eye (§5.1): how a unit-thickness
 * glaze of the pigment looks over white paper (Rw) and over black (Rb).
 *
 * That parameterisation is why the palette survives the switch to KM intact.
 * The site's existing pastels are already "a thin wash on white paper", so
 * they go in as Rw unchanged, and Rb encodes body: near-black Rb is a
 * transparent staining pigment, a lighter Rb an opaque one.
 *
 * Inputs are 0..1 RGB triples and must satisfy 0 < Rb < Rw < 1 per channel,
 * which the paper requires to avoid dividing by zero; we clamp into that range
 * rather than trusting hand-typed swatches.
 */
export function kmCoefficients(Rw, Rb) {
  const K = [0, 0, 0]
  const S = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const w = Math.min(0.9995, Math.max(0.002, Rw[i]))
    const k = Math.min(w - 0.001, Math.max(0.001, Rb[i]))
    const a = 0.5 * (w + (k - w + 1) / k)
    const b = Math.sqrt(Math.max(a * a - 1, 1e-9))
    const z = (b * b - (a - w) * (a - 1)) / (b * (1 - w))
    const s = acoth(Math.max(z, 1 + 1e-9)) / b
    S[i] = s
    K[i] = s * (a - 1)
  }
  return { K, S }
}

const hex = (h) => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
]

/** `paper` (#F7F4EF) as a reflectance — the backing every glaze composites over. */
export const PAPER_REFLECTANCE = hex('#F7F4EF')
/** `paper-deep` (#F4ECEF) — the warmer ground under the packages/enquiry run. */
export const PAPER_DEEP = hex('#F4ECEF')
/** `wine` (#311B26) — the nightfall ground the interference glows sit on. */
export const WINE = hex('#311B26')

/* ------------------------------------------------------------------ *
 * The palette as pigments
 * ------------------------------------------------------------------ */

/**
 * The Pastel Bloom arc (CLAUDE.md), respecified as watercolour paints.
 *
 *   rw   the existing palette colour — a unit glaze over white paper, so the
 *        art direction is preserved exactly at that anchor thickness
 *   body how far Rb sits off black, as a fraction of rw. Low = transparent and
 *        staining (the paper's Quinacridone Rose), higher = a little more body.
 *   rb   Rb outright, for the paints `body` can't describe. §5.1 sorts paints
 *        into three kinds by how they read over black: opaque ones look much
 *        the same as on white, transparent ones go nearly black, and
 *        *interference* paints inverse both — near-invisible on white paper and
 *        vividly coloured on black. Only an explicit rb can say that, since it
 *        has to sit brighter than rw in the pigment's own wavelengths.
 *   gran the granulation exponent γ of §4.5, taken from the nearest pigment in
 *        the paper's Figure 5 table. This is the authentic part: French
 *        Ultramarine (0.91) and the quinacridones (0.81) granulate heavily,
 *        while Hansa Yellow (0.08) and Phthalo Green (0.12) stay glassy. So
 *        our periwinkle and rose passages break up into paper tooth while the
 *        yellow-green glow stays smooth and luminous — which is also how
 *        CLAUDE.md wants that protected chartreuse voice to read.
 */
export const PIGMENTS = {
  apricot: { rw: [0.969, 0.765, 0.58], body: 0.1, gran: 0.14 }, // ≈ Brilliant Orange
  butter: { rw: [0.906, 0.91, 0.565], body: 0.09, gran: 0.08 }, // ≈ Hansa Yellow
  yellowgreen: { rw: [0.843, 0.886, 0.533], body: 0.08, gran: 0.12 }, // ≈ Phthalo Green
  periwinkle: { rw: [0.847, 0.855, 0.925], body: 0.12, gran: 0.91 }, // ≈ French Ultramarine
  lilac: { rw: [0.824, 0.769, 0.91], body: 0.12, gran: 0.31 }, // ≈ Cerulean Blue
  blush: { rw: [0.957, 0.769, 0.824], body: 0.09, gran: 0.81 }, // ≈ Quinacridone Rose
  rose: { rw: [0.933, 0.62, 0.745], body: 0.07, gran: 0.81 }, // ≈ Quinacridone Rose

  // Darks. A watercolourist doesn't own a black; a convincing dark is mixed
  // from transparent pigments, and INK_WASH below is that mix. Two isn't
  // enough — burgundy and ultramarine alone leave blue unabsorbed and land on
  // #341a39, a violet the design system explicitly rules out. The third
  // pigment is what absorbs the blue and pulls the mix back to neutral, which
  // is why a real palette reaches for a warm earth or an olive at this point.
  //
  // Mixed they also *separate*, which is the point of mixing rather than
  // buying a black: §2.2's "splitting of colors that occurs when denser
  // pigments settle earlier than lighter ones". Ultramarine is the heavy one
  // (γ 0.91), so a mixed dark goes cool and granular where it pooled and keeps
  // the quinacridone's warmth where it ran thin.
  burgundy: { rw: hex('#7E2848'), body: 0.07, gran: 0.81 }, // ≈ Quinacridone Rose — warm, staining
  ultramarine: { rw: hex('#2E3A6B'), body: 0.06, gran: 0.91 }, // ≈ French Ultramarine — cool, heavy
  olive: { rw: hex('#5F662B'), body: 0.08, gran: 0.41 }, // ≈ Hookers Green — the site's own sage-deep

  // The nightfall glows, as INTERFERENCE paints (§5.1's third kind).
  //
  // The dark sections light their wine ground with warm and cool halos, and
  // those can't be transparent pigment: a transparent glaze over a dark backing
  // only darkens it further, which is why §5.1 says such paints go "nearly
  // black on black". Interference paints invert that — high scattering in their
  // own wavelengths, almost no absorption — so they read near-nothing on paper
  // and bloom into colour over the dark ground, which is exactly the job. Hence
  // rw near-paper and rb carrying the colour: over wine these land around
  // #a06a47 while over paper they stay within a couple of levels of the sheet.
  //
  // (The paper still needs rb < rw per channel, and that holds: an interference
  // paint over black is a mid-tone, not brighter than its appearance on white.)
  nightAmber: { rw: hex('#F8F5F0'), rb: hex('#9E6A3C'), gran: 0.14 },
  nightLime: { rw: hex('#F7F6EC'), rb: hex('#8E9440'), gran: 0.12 },
  nightBlossom: { rw: hex('#FAF2F4'), rb: hex('#9B4A6B'), gran: 0.81 },
  nightLavender: { rw: hex('#F5F1F8'), rb: hex('#6E5691'), gran: 0.55 },
  nightSage: { rw: hex('#F2F5F1'), rb: hex('#4C7060'), gran: 0.41 },

  // The client's reference swatch sheet (see index.css) as paints in their own
  // right. These are the aurora accents — off the pastel arc on purpose — and
  // the palette above can't mix them: separating the hero orb against the arc
  // alone left seafoam and lavender 12-19/255 adrift. As pigments they land
  // exactly, and gain the thinning curve every other wash now has.
  seafoam: { rw: hex('#BFDCD1'), body: 0.11, gran: 0.31 }, // ≈ Cerulean Blue
  lavender: { rw: hex('#D4B6E6'), body: 0.12, gran: 0.55 }, // ultramarine + quinacridone, so between their γ
  lemonlime: { rw: hex('#CCD06A'), body: 0.08, gran: 0.1 }, // ≈ Hansa Yellow — the protected glow, kept smooth
  blossom: { rw: hex('#F2A6C1'), body: 0.08, gran: 0.81 }, // ≈ Quinacridone Rose
  aurora_rose: { rw: hex('#E88FA4'), body: 0.07, gran: 0.81 }, // ≈ Quinacridone Rose
}

/**
 * The ordered hue arc the live wash interpolates along (CLAUDE.md's anti-mud
 * rule 4). Only these reach the shader; the accents above are for the CSS
 * blooms, which place each pigment deliberately rather than sweeping a ramp.
 */
export const ARC = ['apricot', 'butter', 'yellowgreen', 'periwinkle', 'lilac', 'blush', 'rose']

/**
 * The mixed dark, as an ordered glaze stack. Solved by `separate()` against
 * `ink` (#352E30): at full thickness it lands within 1/255 of that colour, and
 * as it thins it drifts from ink's faint burgundy lean (r > b > g) toward the
 * warmth of the quinacridone (r > g > b) — the separation happening on its own
 * rather than being drawn in. Used to paint the hero's brush stroke.
 */
export const INK_WASH = [
  ['burgundy', 0.231],
  ['olive', 0.462],
  ['ultramarine', 0.577],
]

/** `ink` (#352E30) — the tone the mixed dark is solved against. */
export const INK_TONE = hex('#352E30')



/** K/S plus γ for one named pigment. */
export function pigment(name) {
  const p = PIGMENTS[name]
  const { K, S } = kmCoefficients(p.rw, p.rb || p.rw.map((c) => c * p.body))
  return { K, S, gran: p.gran }
}

/* ------------------------------------------------------------------ *
 * §5.2 on the CPU — so a gradient can be authored as paint
 * ------------------------------------------------------------------ */

// CSS can't run Kubelka-Munk; it alpha-blends. But it doesn't have to — we can
// run the model here and hand CSS the colours the model produces. A bloom then
// stops being "one colour fading out in alpha" and becomes a real pigment
// thinning to nothing, tracing the hue-and-saturation curve of Figure 6 on the
// way. Same cost at runtime as any other gradient: it's a string.

/** Reflectance and transmittance of a glaze of thickness x. Mirrors GLSL_KM. */
export function kmLayer(K, S, x) {
  const R = [0, 0, 0]
  const T = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const s = Math.max(S[i], 1e-4)
    const a = (s + K[i]) / s
    const b = Math.sqrt(Math.max(a * a - 1, 1e-6))
    const bSx = Math.min(b * s * x, 12)
    const sh = Math.sinh(bSx)
    const ch = Math.cosh(bSx)
    const c = a * sh + b * ch
    R[i] = sh / c
    T[i] = b / c
  }
  return { R, T }
}

/** Kubelka's compositing equation: a layer (R1,T1) over a backing R2. */
export function kmOver(R1, T1, R2) {
  return R1.map((r1, i) => r1 + (T1[i] * T1[i] * R2[i]) / Math.max(1 - r1 * R2[i], 1e-3))
}

/**
 * Composite an ordered stack of glazes over a backing, nearest-paper first —
 * the repeated application §5.2 describes. Each entry is `[pigmentName, x]`.
 */
export function glaze(stack, over = PAPER_REFLECTANCE) {
  let R = over
  for (let i = stack.length - 1; i >= 0; i--) {
    const [name, x] = stack[i]
    if (x <= 0) continue
    const { K, S } = pigment(name)
    const l = kmLayer(K, S, x)
    R = kmOver(l.R, l.T, R)
  }
  return R
}

/**
 * §6.2 colour separation — the answer to "what paint makes *that* colour?".
 *
 * The paper builds a watercolourisation by searching a discrete set of
 * thicknesses for an ordered pigment list and keeping the combination whose
 * KM composite lands closest to the target. Same idea here, at a much smaller
 * scale: we only ever separate a handful of hand-picked bloom colours, so a
 * direct search beats the paper's 3d-tree and stays exact.
 *
 * `depth` is how many glazes may be stacked. One is usually enough — the
 * palette's own hexes were specified as unit glazes on paper, so a single
 * pigment reproduces them almost exactly — but the site's accent colours
 * (seafoam, lemon lime) sit off the pigment arc and want two.
 */
export function separate(target, { palette = Object.keys(PIGMENTS), depth = 1, steps = 24, max = 1.6, over = PAPER_REFLECTANCE } = {}) {
  const thicknesses = Array.from({ length: steps + 1 }, (_, i) => (i * max) / steps)
  let best = { stack: [], error: Infinity, rgb: over }

  const search = (stack, remaining) => {
    if (stack.length) {
      const rgb = glaze(stack, over)
      // Plain RGB distance. The paper stores separations in a 3d-tree keyed the
      // same way; our targets are all pale tints where sRGB is near enough
      // perceptually uniform for the differences that survive an 8-bit stop.
      const error = Math.hypot(...rgb.map((c, i) => c - target[i]))
      if (error < best.error) best = { stack: stack.slice(), error, rgb }
    }
    if (!remaining) return
    for (const name of palette) {
      for (const x of thicknesses) {
        if (x === 0) continue
        search([...stack, [name, x]], remaining - 1)
      }
    }
  }
  search([], depth)
  return best
}

/* ------------------------------------------------------------------ *
 * Authoring a bloom as paint
 * ------------------------------------------------------------------ */

/**
 * Thickness across a bloom, as (radius fraction, thickness multiple).
 *
 * These are *thickness* profiles, not alpha ramps — which is the whole point.
 * KM turns each thickness into a colour, so a bloom shifts hue and saturation
 * as it thins, the way real paint does, instead of fading one fixed colour.
 *
 * §2.2 gives us two, and which one a bloom wants is a real decision:
 *
 *   dry  wet-on-dry. Sizing and surface tension pin the stroke, so pigment
 *        migrates outward as it dries and piles up at ~0.66R (§4.3.3). This is
 *        a wash laid on paper — the section fields, card corners.
 *
 *        The rim has to be worth seeing. An earlier version lifted thickness
 *        from 0.30 to 0.34 there, which emitted alphas of 0.068 and 0.077 —
 *        two levels out of 255, i.e. the paper's headline effect rendered as
 *        nothing, and every wash on the site reading as a plain alpha fade.
 *        The rim now sits well ABOVE the interior, which is what edge
 *        darkening looks like on real paper.
 *
 *        These numbers are normalised so the profile's area-weighted mean is
 *        unchanged: edge darkening REDISTRIBUTES pigment, it never adds any,
 *        so every thickness already tuned across the site keeps its weight
 *        (measured drift under 0.2% across the palette). Preserve that if you
 *        retune the shape.
 *   wet  wet-in-wet. The paper is already saturated, so the brushstroke
 *        spreads freely into "soft, feathery shapes" with no pinned contact
 *        line and therefore no rim. This is the hero's aurora orb, which its
 *        own comment describes as pigment bleeding — and it is blurred and
 *        masked afterwards, so a rim would be destroyed anyway.
 *
 * Reaching for `dry` on a wet-in-wet passage doesn't just look wrong, it moves
 * pigment out of the centre, which visibly shifts an art-directed accent.
 */
const BLOOM_PROFILES = {
  dry: [
    [0.0, 0.4544],
    [0.3, 0.3225],
    [0.52, 0.2492],
    [0.66, 0.6303],
    [0.74, 0.1466],
    [0.8, 0.0],
  ],
  wet: [
    [0.0, 1.0],
    [0.3, 0.72],
    [0.55, 0.4],
    [0.75, 0.15],
    [0.9, 0.04],
    [1.0, 0.0],
  ],
}

// Coverage headroom for the colour/alpha split, as in BloomCanvas: alpha tracks
// how much the glaze darkens the paper, and the colour is back-solved so the
// pair reproduces the KM result once the compositor has blended it. Anything
// above ~1.1 keeps the result in gamut.
const COVER_GAIN = 1.6

const rgba255 = (rgb, a) =>
  `rgba(${rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255)).join(',')}, ${a.toFixed(3)})`

/**
 * The colour stops a pigment produces as a wash of peak thickness `x` thins out.
 *
 * `extent` is where the wash reaches, as a fraction of the gradient's radius —
 * the `transparent NN%` of a hand-written bloom. Profile positions are
 * normalised and rescaled onto it, so converting a bloom keeps its geometry
 * exactly and only the colours change.
 */
export function bloomStops(name, x, { over = PAPER_REFLECTANCE, wetness = 'dry', extent = 0.75 } = {}) {
  const { K, S } = pigment(name)
  const profile = BLOOM_PROFILES[wetness]
  const span = profile[profile.length - 1][0]
  return profile
    .map(([pos, rel]) => {
      const at = ((pos / span) * extent * 100).toFixed(0)
      if (rel === 0) return `transparent ${at}%`
      const l = kmLayer(K, S, x * rel)
      const lit = kmOver(l.R, l.T, over)
      const drop = over.map((c, i) => c - lit[i])
      // Magnitude, not the signed maximum: an interference glaze LIGHTENS its
      // ground (§5.1), so its drop is negative throughout and taking the max
      // would hand back a negative alpha and paint nothing at all.
      const a = Math.min(1, Math.max(...drop.map(Math.abs)) * COVER_GAIN)
      if (a <= 0.0005) return `transparent ${at}%`
      return `${rgba255(
        over.map((c, i) => c - drop[i] / a),
        a,
      )} ${at}%`
    })
    .join(', ')
}

/**
 * The same, for a wash of MIXED paint rather than one pigment.
 *
 * The mixed dark can't go through `bloomStops`: that takes a single pigment,
 * and laying its three constituents down as three overlapping CSS blooms would
 * alpha-blend them, which is precisely the averaging the model exists to avoid
 * — burgundy and ultramarine average to the violet §5.1 warned us off. Here the
 * stack is composited with Kubelka-Munk at every step of the profile, so the
 * ramp is the mix thinning rather than three washes fighting.
 *
 * `stack` is [pigment, thickness] pairs; the profile scales all of them
 * together, so the mix holds its proportions as the wash thins.
 */
export function stackStops(stack, { over = PAPER_REFLECTANCE, wetness = 'dry', extent = 0.75 } = {}) {
  const profile = BLOOM_PROFILES[wetness]
  const span = profile[profile.length - 1][0]
  return profile
    .map(([pos, rel]) => {
      const at = ((pos / span) * extent * 100).toFixed(0)
      if (rel === 0) return `transparent ${at}%`
      const lit = glaze(
        stack.map(([name, t]) => [name, t * rel]),
        over,
      )
      const drop = over.map((c, i) => c - lit[i])
      const a = Math.min(1, Math.max(...drop.map(Math.abs)) * COVER_GAIN)
      if (a <= 0.0005) return `transparent ${at}%`
      return `${rgba255(
        over.map((c, i) => c - drop[i] / a),
        a,
      )} ${at}%`
    })
    .join(', ')
}

/**
 * A field of mixed-paint blooms as one `background-image`. Same spec shape as
 * `fieldCss`, but every bloom is the given glaze stack at its own thickness.
 */
export function stackFieldCss(stack, blooms, over = PAPER_REFLECTANCE) {
  return blooms
    .map(
      (b) =>
        `radial-gradient(${(b.size[0] * 100).toFixed(2)}% ${(b.size[1] * 100).toFixed(2)}% at ` +
        `${(b.at[0] * 100).toFixed(2)}% ${(b.at[1] * 100).toFixed(2)}%, ` +
        `${stackStops(
          stack.map(([name, t]) => [name, t * b.x]),
          { over, wetness: b.wetness ?? 'dry', extent: b.extent ?? 0.72 },
        )})`,
    )
    .join(', ')
}

/**
 * A watercolour bloom as a CSS radial-gradient.
 *
 * Say which paint and how thickly it is laid on, not which rgba to fade out;
 * the model supplies the rest. `size`/`at` are passed through to CSS verbatim,
 * so converting a hand-written bloom means keeping its geometry and replacing
 * only the colour stops.
 */
export function bloom(name, { x = 0.4, size = 'circle 30vw', at = '50% 50%', ...rest } = {}) {
  return `radial-gradient(${size} at ${at}, ${bloomStops(name, x, rest)})`
}

/**
 * A field of blooms, as one `background-image`.
 *
 * Blooms are specified numerically — `at`/`size` as fractions of the element,
 * matching what CSS resolves percentages against — so the same spec can drive
 * both this CSS and BloomCanvas's shader. That matters: the canvas is the real
 * rendering (it composites the blooms optically, §5.2) and this is the fallback
 * beneath it, so they have to agree about where the paint is.
 */
export function fieldCss(blooms, over = PAPER_REFLECTANCE) {
  return blooms
    .map((b) =>
      // A lift is unpainted paper held open, not paint — the near-white cores
      // that keep the busiest overlaps luminous. On the canvas it subtracts
      // thickness (§4.5's desorption); in CSS the nearest thing is the cream
      // radial it always was.
      b.lift
        ? `radial-gradient(${b.sizeVw ? `circle ${b.sizeVw}vw` : `${(b.size[0] * 100).toFixed(2)}% ${(b.size[1] * 100).toFixed(2)}%`} at ` +
          `${(b.at[0] * 100).toFixed(2)}% ${(b.at[1] * 100).toFixed(2)}%, ` +
          `rgba(255,252,242,${b.lift.toFixed(3)}), transparent ${((b.extent ?? 0.72) * 100).toFixed(0)}%)`
        : bloom(b.pigment, {
        x: b.x,
        // A circle sized in vw, not a percentage ellipse: the sections these
        // sit behind can run many viewport-heights tall, and a two-axis
        // percentage resolves against width and height independently, which
        // stretches every wash into a sliver. One radius keyed to viewport
        // width keeps a bloom round however tall its section is.
        size: b.sizeVw
          ? `circle ${b.sizeVw}vw`
          : `${(b.size[0] * 100).toFixed(2)}% ${(b.size[1] * 100).toFixed(2)}%`,
        at: `${(b.at[0] * 100).toFixed(2)}% ${(b.at[1] * 100).toFixed(2)}%`,
        extent: b.extent ?? 0.72,
        wetness: b.wetness ?? 'dry',
        over,
      }),
    )
    .join(', ')
}

/* ------------------------------------------------------------------ *
 * GLSL chunks
 * ------------------------------------------------------------------ */

/** GLSL float literal that always carries a decimal point. */
const f = (n) => Number(n).toFixed(6)
const v3 = (a) => `vec3(${f(a[0])}, ${f(a[1])}, ${f(a[2])})`

/**
 * highp where the driver has it. The KM equations run exp() on products of
 * coefficients that reach ~10 in saturated channels, which is more dynamic
 * range than fp16 mediump wants to carry. The guard macro is mandatory in
 * WebGL1 — highp is optional in fragment shaders.
 */
export const GLSL_PRECISION = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
`

/** Value noise + fBm. Shared so every layer's texture derives from one basis. */
export const GLSL_NOISE = `
  float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`

/**
 * §4.1 — the paper as a height field h in 0..1.
 *
 * One sheet for the whole site: GrainCanvas darkens the valleys of this field
 * and the wash granulates into those same valleys, so the tooth agrees instead
 * of reading as two unrelated noises stacked up. `p` is in CSS pixels, which
 * is what keeps the tooth the same physical size across the two canvases even
 * though they rasterise at different resolutions.
 *
 * The fine term is a per-pixel hash (cotton fibre) and the mottle a smooth
 * octave (the cockle of a pressed sheet) — the mix the grain layer has always
 * used, now named for what it is.
 */
export const GLSL_PAPER = `
  float paperMottle(vec2 p){ return vnoise(p * 0.18); }

  // Two readings of one sheet, differing only in how much of the fibre-scale
  // detail they carry. The ...At form is for callers that already hold the
  // mottle, so a shader needing both readings samples the noise once.
  //
  // hash() is floored to a cell. Sampled on the raw coordinate it is chaotic
  // rather than periodic, so it hands back fresh white noise at whatever
  // resolution the buffer happens to be — and a texture that gets finer on a
  // retina screen is sensor noise, not paper. Flooring pins one fibre per unit
  // of p; since callers pass CSS pixels, the tooth then holds a fixed physical
  // size and matches between layers.
  float paperFieldAt(vec2 p, float m, float coarse){ return mix(hash(floor(p)), m, coarse); }
  float paperField(vec2 p, float coarse){ return paperFieldAt(p, paperMottle(p), coarse); }

  // What a grain overlay resolves: individual fibres, one value per pixel.
  float paperHeight(vec2 p){ return paperField(p, 0.35); }

  // Where pigment can actually pool. Watercolour grains are sub-micron and
  // settle into the hollows *between* fibres, which are the sheet's cockle —
  // several pixels across — so granulation reads at that scale. Sampling the
  // per-pixel fibre instead gives digital speckle, not paper.
  float paperHollows(vec2 p){ return paperField(p, 0.78); }

  // Slope of the sheet, from the smooth component only — a per-pixel fibre
  // hash has no meaningful gradient. Forward differences; the wash only needs
  // the direction.
  vec2 paperSlope(vec2 p, float m0){
    float e = 2.0;
    return vec2(paperMottle(p + vec2(e, 0.0)) - m0,
                paperMottle(p + vec2(0.0, e)) - m0);
  }

  // §4.3, condition 4: "the flow must be perturbed by the texture of the paper
  // to cause streaks parallel to flow direction". UpdateVelocities() opens with
  // (u,v) <- (u,v) - grad h, and pigment is then advected along that velocity
  // for many steps; what survives is streaking *along* the flow. A single pass
  // can't advect, but resolving the slope onto the flow direction and
  // displacing along it reproduces the result — the wash bands parallel to the
  // water's path. Adding the raw slope vector instead only jitters it
  // isotropically, which reads as noise rather than striation.
  vec2 flowStreak(vec2 slope, vec2 flow){
    vec2 dir = normalize(flow + 1e-5);
    return dir * dot(slope, dir);
  }
`

/**
 * §5.2 — Kubelka-Munk rendering of the pigmented layers.
 *
 * kmLayer() gives a layer's own reflectance and transmittance at thickness x;
 * kmOver() is Kubelka's compositing equation for that layer over a backing.
 * Together they replace alpha-blending the wash onto the paper, which is what
 * keeps overlaps luminous: doubling thickness walks the colour along the
 * pigment's characteristic curve (Figure 6) instead of averaging toward grey.
 */
export const GLSL_KM = `
  void kmLayer(vec3 K, vec3 S, float x, out vec3 R, out vec3 T){
    vec3 Sc = max(S, 1e-4);
    vec3 a = (Sc + K) / Sc;                    // K = S(a - 1)
    vec3 b = sqrt(max(a * a - 1.0, 1e-6));
    // GLSL ES 1.00 has no sinh/cosh. Clamped because the ratios below saturate
    // long before exp() would overflow a half-float.
    vec3 bSx = min(b * Sc * x, 6.0);
    vec3 e = exp(bSx), ei = 1.0 / e;
    vec3 sh = 0.5 * (e - ei);
    vec3 ch = 0.5 * (e + ei);
    vec3 c = a * sh + b * ch;
    R = sh / c;
    T = b / c;
  }

  vec3 kmOver(vec3 R1, vec3 T1, vec3 R2){
    return R1 + (T1 * T1 * R2) / max(1.0 - R1 * R2, 1e-3);
  }
`

/**
 * §4.3.3 edge darkening, §4.5 granulation and §4.7 drybrush, as the shaping
 * functions a single-pass shader can use. We render the converged state of the
 * simulation rather than stepping it, so each of these collapses to a closed
 * form over the wet-area mask instead of an accumulation over time.
 */
export const GLSL_WASH = `
  // §4.3.3. FlowOutward() removes water in proportion to (1 - M')M, where M is
  // the wet-area mask and M' a Gaussian blur of it; the resulting outward flow
  // carries pigment to the rim as the wash dries. Our mask comes from an
  // analytic density field, so the blur is just a wider smoothstep over the
  // same field — no kernel needed — and the product peaks in a band hugging
  // the inside of the wet edge, which is the deposit we want.
  float edgeDeposit(float density, float lo, float hi, float blur){
    float M  = smoothstep(lo, hi, density);
    float Mb = smoothstep(lo - blur, hi + blur, density);
    return (1.0 - Mb) * M;
  }

  // §4.5. TransferPigment() adsorbs pigment at a rate scaled by (1 - h^gamma),
  // so deposition favours the hollows of the sheet, with gamma the pigment's
  // granularity. Normalised by the same expression at mean height so changing
  // gamma changes the *texture* without changing how heavy the wash reads.
  // The amount parameter is how far to take it: §2.2 has granulation "strongest when the
  // paper is very wet", so callers pass wetness, scaled down to taste — at
  // full strength a coarse pigment like ultramarine swings deposition nearly
  // tenfold between peak and hollow, which is true of a puddle of real paint
  // and far too much for a wash this pale.
  float granulation(float h, float gamma, float amount){
    float g = (1.0 - pow(h, gamma)) / max(1.0 - pow(0.5, gamma), 1e-3);
    // gamma has to scale the texture's CONTRAST, not just its shape. Dividing
    // (1 - h^gamma) by its value at mean height normalises the average away,
    // but the ratio's spread then grows as gamma shrinks — which would make
    // Hansa Yellow (0.08) the grainiest paint on the palette and French
    // Ultramarine (0.91) the smoothest, exactly backwards. Folding gamma into
    // the blend restores the ordering the paper's Figure 5 describes.
    return mix(1.0, g, clamp(amount * gamma, 0.0, 1.0));
  }

  // §4.7. Drybrush excludes from the wet-area mask any pixel whose height is
  // below a threshold, so paint catches only the peaks. Applied as a soft gate
  // rather than a hard step: at full strength it would shred a soft wash, but
  // eased in where the wash is thinnest it gives the fringe the broken, ragged
  // edge of paint on rough paper instead of a clean airbrush fade.
  float drybrush(float h, float threshold, float amount){
    return mix(1.0, smoothstep(threshold - 0.28, threshold + 0.28, h), amount);
  }
`

/**
 * Build the pigment ramp as GLSL. Returns K, S and the granulation exponent
 * for a position `t` on the palette's hue arc, so every interpolation blends
 * neighbouring hues (CLAUDE.md's anti-mud rule 4) — but now interpolating the
 * pigments' K/S coefficients, which is how §5.2 mixes paints within a layer,
 * rather than interpolating the colours they happen to produce.
 *
 * `warm` swaps the two coolest slots for butter and blush, matching
 * WatercolourBloom's `.wcb-warm` sunlit recipe.
 */
export function glslPigmentRamp() {
  const p = Object.fromEntries(ARC.map((k) => [k, pigment(k)]))
  const decl = (name) =>
    `    vec3 K_${name} = ${v3(p[name].K)}; vec3 S_${name} = ${v3(p[name].S)}; float g_${name} = ${f(p[name].gran)};`
  return `
  void pigmentKS(float t, float warm, out vec3 K, out vec3 S, out float gran){
${ARC.map(decl).join('\n')}

    // Warm recipe: periwinkle -> butter, lilac -> blush.
    vec3 K_peri = mix(K_periwinkle, K_butter, warm);
    vec3 S_peri = mix(S_periwinkle, S_butter, warm);
    float g_peri = mix(g_periwinkle, g_butter, warm);
    vec3 K_lil = mix(K_lilac, K_blush, warm);
    vec3 S_lil = mix(S_lilac, S_blush, warm);
    float g_lil = mix(g_lilac, g_blush, warm);

    t = fract(t) * 6.0;
    if (t < 1.0)      { float u = t;       K = mix(K_apricot, K_butter, u);     S = mix(S_apricot, S_butter, u);     gran = mix(g_apricot, g_butter, u); }
    else if (t < 2.0) { float u = t - 1.0; K = mix(K_butter, K_yellowgreen, u); S = mix(S_butter, S_yellowgreen, u); gran = mix(g_butter, g_yellowgreen, u); }
    else if (t < 3.0) { float u = t - 2.0; K = mix(K_yellowgreen, K_peri, u);   S = mix(S_yellowgreen, S_peri, u);   gran = mix(g_yellowgreen, g_peri, u); }
    else if (t < 4.0) { float u = t - 3.0; K = mix(K_peri, K_lil, u);           S = mix(S_peri, S_lil, u);           gran = mix(g_peri, g_lil, u); }
    else if (t < 5.0) { float u = t - 4.0; K = mix(K_lil, K_blush, u);          S = mix(S_lil, S_blush, u);          gran = mix(g_lil, g_blush, u); }
    else              { float u = t - 5.0; K = mix(K_blush, K_rose, u);         S = mix(S_blush, S_rose, u);         gran = mix(g_blush, g_rose, u); }
  }
`
}

/** `vec3` literal for the paper backing, for shaders that composite onto it. */
export const GLSL_PAPER_REFLECTANCE = v3(PAPER_REFLECTANCE)
