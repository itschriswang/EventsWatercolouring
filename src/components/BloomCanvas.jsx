import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'
import { bloomFields, onBloomFieldsChange } from './BloomField.jsx'
import {
  GLSL_PRECISION,
  GLSL_NOISE,
  GLSL_PAPER,
  GLSL_KM,
  GLSL_WASH,
  pigment,
  vwAxis,
} from '../lib/watercolour.js'

/**
 * BloomCanvas — every bloom field on the page, painted as actual paint.
 *
 * One fixed, full-viewport WebGL canvas that reads the registered BloomFields,
 * masks each to its element's rect, and renders its blooms with the Curtis et
 * al. model (see lib/watercolour.js).
 *
 * The thing CSS cannot do, and the reason this exists: where blooms overlap,
 * the browser alpha-blends them, which averages colour and slides toward grey —
 * the mud CLAUDE.md's anti-mud rules exist to route around by hand. Here the
 * overlap is a single layer holding several pigments, with K and S weighted by
 * each pigment's relative thickness and the thicknesses summed, exactly as §5.2
 * prescribes. Two washes crossing then deepen along their own characteristic
 * curves instead of averaging, so they stay luminous on their own.
 *
 * On top of that the wash granulates into the sheet's hollows at a rate set by
 * each pigment's γ (§4.5), and its flow is deflected by the paper's slope into
 * striations (§4.3). The dried rim (§4.3.3) runs around the edge of each wet
 * patch rather than each bloom, heavier on the downhill side, and some washes
 * carry a backrun (§4.6).
 *
 * Cost control: half-resolution buffer, DPR capped at 1, and no loop once the
 * wash has dried — it moves for its first few seconds, then only redraws when
 * the page scrolls, resizes or gains a field. It only mounts on capable,
 * motion-friendly devices (`useHeavyFx`); everywhere else — touch,
 * reduced-motion, no WebGL — BloomField's CSS rendering stays up. The canvas
 * signals the handover with `data-live-blooms` on the root, which fades the CSS
 * layers out (index.css), and clearing it on teardown fades them back.
 */

const MAX_FIELDS = 4
// A slot budget, not a page budget: blooms that cannot reach the viewport are
// culled before slots are handed out (see readFields). Without that, two tall
// fields on screen at once — 16 blooms each, most of them thousands of pixels
// away — overflowed 24 and the tail of the second field was dropped, and since
// its CSS twin is faded out under the canvas those washes simply vanished.
const MAX_BLOOMS = 24

// Coverage headroom for the colour/alpha split, matching lib/watercolour.js.
const ALPHA_GAIN = '1.6'
const FLOW_SLOPE = '0.22' //  how hard the paper's slope streaks the flow (§4.3)
const GRAN_AMOUNT = '1.1' //  granulation at full wetness; γ scales it per pigment (§4.5)
// How far the wet front wanders off a perfect ellipse (§4.3), in CSS pixels on
// the sheet — a distance, not a fraction of the bloom.
//
// CONTOUR_WAVE is the coarsest lobe; fbm's octaves add bays at half that and a
// fringe at a quarter. It has to be page-scale, not bloom-scale: these fields
// are viewport-wide washes, and lobes much smaller than the wash only ruffle a
// rim that still reads as a circle underneath.
//
// What separates a loose wash from a lumpy one is whether the outline goes
// CONCAVE — a wash that only undulates is a pebble however far it strays. Bays
// come from wavelength, not amplitude: at a 1400px wave the boundary measured
// 5% concave, and shortening it to 760 takes that to 25% on *less* travel. So
// retune the wave before reaching for the gain.
//
// The wave has a floor as well as a ceiling. Much longer than the viewport and
// the field holds barely one cell across it, so the warp degenerates into a
// near-uniform shear and every wash leans the same way.
//
// The ceiling is fold-over — where the warp's gradient reaches 1 the lookup
// doubles back and the wash pinches. This trio measures 0.97 at the worst point
// by Frobenius norm, which overstates the operator norm by up to √2, so it
// stays injective; treat it as at the limit and re-measure if you raise it.
//
// FBM_MEAN is measured from fbm() in lib/watercolour.js — it is not centred on
// 0.5 — so the gain below is a real displacement rather than an arbitrary
// number. Re-measure it if that noise changes; centring on the wrong value
// slides every wash sideways instead of deforming it.
const CONTOUR_WAVE = 900 //     CSS px, the coarsest lobe
const CONTOUR_MAX = 200 //      CSS px, the furthest the front strays
const CONTOUR_GAIN = '700.0' // CSS px per unit fbm, so ~70px typical
const FBM_MEAN = '0.2179'
const CONTOUR_FREQ = (1 / CONTOUR_WAVE).toFixed(6)

// The dried rim, laid once around each wet patch (GLSL_WASH's wetFront). BEAD
// is how much of the rim's pigment runs downhill: the sheet is tilted, which is why the contour warp shears (see below), and on a
// tilted sheet a wash drains into a bead along its lower edge and dries darker
// there. At 0.55 the low edge carries ~1.5x the even rim and the top ~0.5x; a
// cosine around the edge averages to zero, so the wash's load is unchanged.
const BEAD = '0.55'

// §4.6 backruns. Only some washes get one — a backrun is an accident of uneven
// drying, and one on every bloom would read as a pattern — and only washes big
// enough on screen to hold a frilled edge rather than a smudge.
//
// The source sits off-centre (OFFSET, a fraction of the bloom's reach), where
// a wash dries last and water pooled; RADIUS is how far the creep got; DEPLETE
// how much pigment it pushed out of its interior, all of which lands on its
// front (backrun() solves that). FRILL roughens the front on a ~46px sheet
// noise so it scallops like cauliflower rather than drawing a ring. Keep it
// modest: the roughening scales the distance, so pushed much past this it
// starts opening pale specks outside the front, which read as holes in the
// wash rather than water that crept.
const BACKRUN_SHARE = 0.4
const BACKRUN_MIN_PX = 140
const BACKRUN_OFFSET = '0.28'
const BACKRUN_RADIUS = '0.42'
const BACKRUN_DEPLETE = '0.30'
const BACKRUN_FRILL = '1.3'

// "Let it dry." The wash breathes while it is wet and then stops, which is
// what paint does and what lets the canvas stop drawing. Its clock runs at the
// old pace at first and eases to a halt, DRY_S * (1 - e^(-t/DRY_S)), so there
// is no moment the motion visibly cuts out; after DRY_SETTLE of those the
// remaining drift is under 2% and the clock is frozen.
const DRY_S = 6
const DRY_SETTLE = 4

const FRAG = `
${GLSL_PRECISION}
  uniform vec2 u_res;
  uniform float u_time;
  uniform float u_scroll;      // page scrollY in CSS px — the sheet is on the page
  uniform float u_alpha;
  uniform float u_px;          // device px per CSS px, so paper tooth holds its size
  uniform int u_bloomCount;
  uniform int u_fieldCount;

  // Per field: rect in normalised screen space (x, y, w, h), and the backdrop
  // its glazes composite onto plus the scroll-reveal progress.
  uniform vec4 u_fieldRect[${MAX_FIELDS}];   // x, y, w, h (normalised screen)
  uniform float u_fieldFade[${MAX_FIELDS}]; // vertical fade-in, fraction of height
  uniform vec4 u_fieldOver[${MAX_FIELDS}];   // rgb = backdrop, a = reveal 0..1

  // Per bloom: placement within its field, then the paint.
  uniform vec4 u_bloomGeom[${MAX_BLOOMS}];   // at.xy, size.xy (fractions of field)
  uniform vec4 u_bloomArgs[${MAX_BLOOMS}];   // peak thickness, extent, wetness, field index
  uniform vec4 u_bloomK[${MAX_BLOOMS}];      // K.rgb, granulation exponent
  uniform vec4 u_bloomS[${MAX_BLOOMS}];      // S.rgb, backrun seed (0 = none)

${GLSL_NOISE}
${GLSL_PAPER}
${GLSL_KM}
${GLSL_WASH}

  // Thickness across a bloom at profile position p, matching BLOOM_PROFILES in
  // lib/watercolour.js so the canvas and the CSS fallback describe the same
  // paint. Wet-on-dry carries the dried rim; wet-in-wet feathers out with none
  // (§2.2).
  float profileDry(float p){
    if (p >= 0.80) return 0.0;
    if (p < 0.30) return mix(0.4544, 0.3225, p / 0.30);
    if (p < 0.52) return mix(0.3225, 0.2492, (p - 0.30) / 0.22);
    if (p < 0.66) return mix(0.2492, 0.6303, (p - 0.52) / 0.14);  // the dried rim
    if (p < 0.74) return mix(0.6303, 0.1466, (p - 0.66) / 0.08);
    return mix(0.1466, 0.0, (p - 0.74) / 0.06);
  }
  // The same wash with the rim taken out: its interior knots, then a straight
  // run from the last of them to where the paint ends. The canvas paints this
  // per bloom and adds the rim once per wet patch — profileDry minus bodyDry,
  // laid on the patch's own front — so an isolated bloom comes out exactly as
  // profileDry, and an overlap loses only the rims that would sit inside it.
  float bodyDry(float p){
    if (p >= 0.80) return 0.0;
    if (p < 0.30) return mix(0.4544, 0.3225, p / 0.30);
    if (p < 0.52) return mix(0.3225, 0.2492, (p - 0.30) / 0.22);
    return mix(0.2492, 0.0, (p - 0.52) / 0.28);
  }
  float profileWet(float p){
    if (p >= 1.0) return 0.0;
    if (p < 0.30) return mix(1.00, 0.72, p / 0.30);
    if (p < 0.55) return mix(0.72, 0.40, (p - 0.30) / 0.25);
    if (p < 0.75) return mix(0.40, 0.15, (p - 0.55) / 0.20);
    if (p < 0.90) return mix(0.15, 0.04, (p - 0.75) / 0.15);
    return mix(0.04, 0.0, (p - 0.90) / 0.10);
  }
  // d is 0..1 across the wash's extent; each profile is walked over its own
  // span so the canvas lands on the same stops fieldCss() writes.
  float bloomProfile(float d, float wet){
    return mix(profileDry(d * 0.80), profileWet(d), wet);
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    vec2 sv = vec2(uv.x, 1.0 - uv.y);          // 0 at top, to match DOM rects

    // The sheet (§4.1), in page CSS pixels so the tooth holds a fixed size and
    // travels with the page rather than staying on the glass.
    vec2 sheet = pageSheet(gl_FragCoord.xy, u_res, u_px, u_scroll);
    float mottle = paperMottle(sheet);
    float fibre = paperFieldAt(sheet, mottle, 0.35);
    float hollow = paperFieldAt(sheet, mottle, 0.78);

    // Wet-on-wet: the pigment bleeds and breathes at its edges while the wash
    // is wet, and the paper's slope streaks that flow (§4.3, cond. 4). On the
    // sheet, not the screen, so it holds still under the paint as you scroll;
    // 375px per unit is the scale it had at a 900px viewport.
    float t = u_time * 0.03;
    vec2 fp = sheet / 375.0;
    vec2 warp = vec2(fbm(fp + t), fbm(fp.yx + 5.2 - t));
    vec2 bleed = (0.85 * warp - 0.42
               + flowStreak(paperSlope(sheet, mottle), warp - 0.5) * ${FLOW_SLOPE}) * 0.06;

    // §4.3 — a wash's outline is its wet-area mask: wherever the water actually
    // got to. A radial-gradient's perfect ellipse is the one shape that never
    // is, so displace the lookup itself and let every isoline meander with it,
    // the dried rim included — the rim then runs along the edge it belongs to
    // instead of cutting across it.
    //
    // Sampled on the sheet in CSS pixels, for the same reason the tooth is. The
    // front wanders by a distance the paper sets, so a corner glow and a
    // viewport-wide field come out equally rough, where perturbing each bloom in
    // its own frame would instead give both the same *number* of wobbles and
    // leave the big one looking like a smooth arc. One sheet, so it deflects
    // every wash coherently — which is also why this sits outside the loops
    // rather than being resampled per bloom.
    //
    // A domain warp preserves the wash's load on its own — E[det J] = 1 for a
    // homogeneous field — so unlike the profile's rim it needs no compensating
    // factor. Measured at -0.45% across a spread of bloom placements, which is
    // the sampling noise of that measurement rather than a bias.
    // The transposed sample is deliberate, and it is what makes this work.
    // Drawing the two components from far-apart offsets gives an isotropic
    // warp, and an isotropic warp mostly just rounds a disc off into a slightly
    // wobbly disc: it was tried, and at the same gain the washes came back
    // visibly rounder. Sampling the second component on the swapped coordinate
    // correlates the pair, which makes the field locally a SHEAR — and a shear
    // is what stretches a disc into something loose. That is also the honest
    // physics: §4.3's velocity field has a direction (the sheet is tilted, the
    // water runs), so a coherent lean across the page is the behaviour, not an
    // artefact of the noise.
    // (No backticks in this comment: it lives inside a template literal, and
    // ending it here is a build error that reads as a syntax error 40 lines up.)
    vec2 cp = sheet * ${CONTOUR_FREQ};
    vec2 contour = clamp((vec2(fbm(cp), fbm(cp.yx + 19.3)) - ${FBM_MEAN}) * ${CONTOUR_GAIN},
                         -${CONTOUR_MAX.toFixed(1)}, ${CONTOUR_MAX.toFixed(1)}) * u_px / u_res;

    // The backrun front's roughness, one sample of the sheet shared by every
    // backrun: they never overlap, so they cannot be seen to share it.
    float frill = (fbm(sheet / 46.0 + 41.7) - ${FBM_MEAN}) * ${BACKRUN_FRILL};

    // §5.2 — one layer, several pigments. Accumulate K and S weighted by each
    // pigment's thickness and sum the thicknesses; the division below is the
    // "in proportion to that pigment's relative thickness" the paper asks for.
    vec3 Kacc = vec3(0.0);
    vec3 Sacc = vec3(0.0);
    float X = 0.0;
    float lift = 0.0;
    float gran = 0.0;
    vec3 backdrop = vec3(1.0);
    float painted = 0.0;

    // The water standing on the sheet (wetFront) and the paint that dries at
    // its edge. Each dry bloom contributes by how wet it leaves this pixel, so
    // the rim takes the pigment of the wash whose water reaches it and blends
    // smoothly where two washes' water meets.
    float water = 0.0;
    vec3 rK = vec3(0.0);
    vec3 rS = vec3(0.0);
    float rG = 0.0;
    float rX = 0.0;
    float rW = 0.0;
    float rDown = 0.0;

    // Nested so both array indices are loop counters: GLSL ES 1.00 only allows
    // uniform arrays to be indexed by a constant expression, which a value
    // pulled out of another uniform is not.
    for (int fi = 0; fi < ${MAX_FIELDS}; fi++){
      if (fi >= u_fieldCount) break;
      vec4 rect = u_fieldRect[fi];
      // Blooms are clipped to their field's box, the way a background-image is.
      vec2 f = (sv - rect.xy) / max(rect.zw, vec2(1e-4));
      if (f.x < 0.0 || f.x > 1.0 || f.y < 0.0 || f.y > 1.0) continue;
      // The contour is a screen distance; in this field's own units it is one.
      // Applied to the blooms below, never to the clip test above, so a wash
      // still can't wander outside the element it belongs to.
      vec2 cf = contour / max(rect.zw, vec2(1e-4));
      vec4 over = u_fieldOver[fi];
      // The vertical fade a masked field would have had in CSS.
      float fade = u_fieldFade[fi] > 0.0 ? smoothstep(0.0, u_fieldFade[fi], f.y) : 1.0;
      float ff = over.a * fade;

      for (int i = 0; i < ${MAX_BLOOMS}; i++){
        if (i >= u_bloomCount) break;
        vec4 args = u_bloomArgs[i];
        if (abs(args.w - float(fi)) > 0.5) continue;   // belongs to another field

        vec4 geom = u_bloomGeom[i];
        vec2 rel = (f + bleed + cf - geom.xy) / max(geom.zw, vec2(1e-4));
        float ext = max(args.y, 1e-3);
        float d = length(rel) / ext;               // 0 at the centre, 1 where paint ends
        if (d >= 1.0) continue;
        // Negative thickness is a LIFT, not paint: the near-white cores that
        // hold the overlap zones open are unpainted paper showing through, and
        // §4.5's desorption is the model's name for pigment coming back off the
        // sheet. Tracked apart so it never pollutes the K/S mix.
        if (args.x < 0.0) {
          float pl = bloomProfile(d, args.z) * ff;
          if (pl > 0.0) { lift += -args.x * pl; painted = 1.0; }
          continue;
        }

        vec3 K = u_bloomK[i].rgb;
        vec3 S = u_bloomS[i].rgb;
        float g = u_bloomK[i].w;
        float wet = args.z;
        float body = mix(bodyDry(d * 0.80), profileWet(d), wet) * ff;

        // §4.6: the creep pushes pigment out of its interior onto its front.
        float seed = u_bloomS[i].w;
        if (seed > 0.0 && body > 0.0) {
          float a = seed * 6.2832;
          vec2 src = vec2(cos(a), sin(a)) * ${BACKRUN_OFFSET} * ext;
          float q = length(rel - src) / (${BACKRUN_RADIUS} * ext) * (1.0 + frill);
          body *= backrun(q, ${BACKRUN_DEPLETE});
        }

        if (body > 0.0) {
          float x = args.x * body;
          Kacc += K * x;
          Sacc += S * x;
          gran += g * x;
          X += x;
          painted = 1.0;
        }

        if (wet < 0.5) {
          float w = 1.0 - d;
          water += w;
          float xw = args.x * ff * w;
          rK += K * xw;
          rS += S * xw;
          rG += g * xw;
          rX += xw;
          rW += w;
          // Which side of its wash this edge is on; positive is downhill.
          rDown += w * rel.y / max(length(rel), 1e-4);
        }
      }
      if (painted > 0.5) backdrop = over.rgb;
    }

    // The dried rim, once, on the wet patch's own front (§4.3.3), carrying
    // more of its pigment on the downhill side. For a lone bloom front is just
    // its own d, and body plus rim is exactly profileDry.
    if (rX > 0.0 && rW > 0.0) {
      float front = wetFront(water);
      float bump = profileDry(front * 0.80) - bodyDry(front * 0.80);
      float rim = (rX / rW) * bump * (1.0 + ${BEAD} * (rDown / rW));
      if (rim > 0.0) {
        Kacc += rK / rX * rim;
        Sacc += rS / rX * rim;
        gran += rG / rX * rim;
        X += rim;
      }
    }

    // Weight the mix by the pigment actually laid down, then let the lift take
    // thickness off the result — a lift changes how much paint is there, not
    // which paints they are.
    float laid = X;
    X *= clamp(1.0 - lift, 0.0, 1.0);
    if (painted < 0.5 || X <= 0.0 || laid <= 0.0) { gl_FragColor = vec4(0.0); return; }

    vec3 K = Kacc / laid;
    vec3 S = Sacc / laid;
    gran /= laid;

    // Granulation settles the wash into the hollows of the sheet, hardest for
    // the coarse pigments; the dry fringe breaks up on its peaks (§4.5, §4.7).
    float wet = clamp(X * 6.0, 0.0, 1.0);
    X *= granulation(hollow, gran, wet * ${GRAN_AMOUNT});
    X *= drybrush(fibre, 0.42, 0.5 * (1.0 - wet));

    vec3 R, T;
    kmLayer(K, S, X, R, T);
    vec3 drop = backdrop - kmOver(R, T, backdrop);

    // Coverage follows how far the glaze moved the ground — in either
    // direction, since the nightfall fields use interference pigments that
    // lighten a dark backdrop rather than darkening a light one.
    float mag = max(max(abs(drop.r), abs(drop.g)), abs(drop.b));
    float alpha = clamp(mag * ${ALPHA_GAIN}, 0.0, 1.0) * u_alpha;
    vec3 col = clamp(backdrop - drop / max(alpha, 1e-3), 0.0, 1.0);

    // Premultiplied output (context is premultipliedAlpha, blend ONE / 1-SRC_A).
    gl_FragColor = vec4(col * alpha, alpha);
  }
`

/** A stable 0..1 per bloom, from where it sits and what it is. */
function bloomHash(b, salt) {
  const s = Math.sin((b.at[0] + 1.7) * 91.345 + (b.at[1] + 2.3) * 47.853 + salt * 13.17 + (b.x || 0) * 7.1) * 43758.5453
  return s - Math.floor(s)
}

export default function BloomCanvas({ revealed }) {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const canvasRef = useRef(null)
  const active = revealed && heavyFx && !reduce

  useEffect(() => {
    const root = document.documentElement
    if (!active || !webglSupported()) return

    const canvas = canvasRef.current
    const gl = getContext(canvas)
    if (!gl) return

    // The uniform arrays are the one hard limit here; bail to the CSS fields
    // rather than shipping a shader the driver will refuse to link.
    const vectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
    if (vectors < MAX_FIELDS * 3 + MAX_BLOOMS * 4 + 8) return

    const prog = createQuadProgram(gl, FRAG)
    if (!prog) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    root.dataset.liveBlooms = ''

    const start = performance.now()
    const DRY_MS = DRY_S * DRY_SETTLE * 1000
    const FRAME_MS = 1000 / 30
    let raf = 0
    let lastDraw = 0
    let urgent = false
    let running = !document.hidden
    let warned = false

    // Reused scratch buffers — these are rewritten every draw, and allocating
    // ~30 typed arrays a second while scrolling would hand the GC work for no
    // reason.
    const fieldRect = new Float32Array(MAX_FIELDS * 4)
    const fieldOver = new Float32Array(MAX_FIELDS * 4)
    const fieldFade = new Float32Array(MAX_FIELDS)
    const bloomGeom = new Float32Array(MAX_BLOOMS * 4)
    const bloomArgs = new Float32Array(MAX_BLOOMS * 4)
    const bloomK = new Float32Array(MAX_BLOOMS * 4)
    const bloomS = new Float32Array(MAX_BLOOMS * 4)

    // K/S never change for a pigment, so resolve them once instead of inverting
    // the KM equations for every bloom on every draw.
    const BLANK = { K: [0, 0, 0], S: [0, 0, 0], gran: 0 }
    const paints = new Map()
    const paint = (name) => {
      if (!paints.has(name)) paints.set(name, pigment(name))
      return paints.get(name)
    }

    const readFields = () => {
      const vw = window.innerWidth || 1
      const vh = window.innerHeight || 1
      let nf = 0
      let nb = 0
      let wanted = 0
      for (const field of bloomFields()) {
        if (nf >= MAX_FIELDS || !field.el?.isConnected) continue
        const r = field.el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh || r.width <= 0 || r.height <= 0) continue

        // Flood-in: 0 as the field's top crosses the bottom edge, 1 once it has
        // risen through the lower ~60% of the viewport.
        const reveal = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.6)))
        fieldRect.set([r.left / vw, r.top / vh, r.width / vw, r.height / vh], nf * 4)
        fieldOver.set([field.over[0], field.over[1], field.over[2], reveal], nf * 4)
        fieldFade[nf] = field.fadeTop || 0

        // How far a bloom's paint can land from where it was specified: the
        // contour warp in CSS px, plus the bleed, which is in field fractions.
        const padX = CONTOUR_MAX + 0.03 * r.width
        const padY = CONTOUR_MAX + 0.03 * r.height

        for (const b of field.blooms) {
          // vw-sized circles are resolved against the viewport here, then
          // expressed in the field's own fractions for the shader.
          const rx = b.sizeVw ? (vwAxis(b.sizeVw, 0) * vw) / 100 / r.width : b.size[0]
          const ry = b.sizeVw ? (vwAxis(b.sizeVw, 1) * vw) / 100 / r.height : b.size[1]
          const ext = b.extent ?? 0.72

          // Cull what cannot reach the viewport. Most of a tall field's blooms
          // are thousands of pixels away at any moment, and every one of them
          // used to take a slot.
          const cx = r.left + b.at[0] * r.width
          const cy = r.top + b.at[1] * r.height
          const reachX = rx * r.width * ext * 1.15 + padX
          const reachY = ry * r.height * ext * 1.15 + padY
          if (cx + reachX < 0 || cx - reachX > vw || cy + reachY < 0 || cy - reachY > vh) continue

          wanted++
          if (nb >= MAX_BLOOMS) continue
          bloomGeom.set([b.at[0], b.at[1], rx, ry], nb * 4)
          // Lifts ride the same array with a negative thickness — they occupy a
          // bloom slot but carry no paint, so K/S stay zero.
          const { K, S, gran } = b.lift ? BLANK : paint(b.pigment)
          const wet = b.wetness === 'wet'
          bloomArgs.set([b.lift ? -b.lift : b.x, ext, wet ? 1 : 0, nf], nb * 4)

          // A backrun needs a wet-on-dry wash big enough to frill.
          const onScreen = Math.min(rx * r.width, ry * r.height) * ext
          const backrun =
            !b.lift && !wet && onScreen >= BACKRUN_MIN_PX && bloomHash(b, 1) < BACKRUN_SHARE
              ? 0.02 + 0.98 * bloomHash(b, 2)
              : 0
          bloomK.set([K[0], K[1], K[2], gran], nb * 4)
          bloomS.set([S[0], S[1], S[2], backrun], nb * 4)
          nb++
        }
        nf++
      }
      if (import.meta.env.DEV && wanted > MAX_BLOOMS && !warned) {
        warned = true
        console.warn(`[BloomCanvas] ${wanted} blooms reach the viewport; ${wanted - MAX_BLOOMS} dropped.`)
      }
      return { blooms: nb, fields: nf }
    }

    const draw = (now) => {
      resizeCanvas(gl, canvas, 0.5, 1)
      const { blooms, fields } = readFields()

      // The drying clock: the old pace at first, easing to a stop.
      const wetFor = Math.min(now - start, DRY_MS) / 1000
      const clock = DRY_S * (1 - Math.exp(-wetFor / DRY_S))

      gl.useProgram(prog.program)
      gl.uniform2f(prog.uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(prog.uniforms('u_px'), canvas.width / Math.max(1, canvas.clientWidth))
      gl.uniform1f(prog.uniforms('u_time'), clock)
      gl.uniform1f(prog.uniforms('u_scroll'), window.scrollY || 0)
      // Ease the whole layer in so it doesn't pop on first paint.
      gl.uniform1f(prog.uniforms('u_alpha'), Math.min(1, (now - start) / 900))
      gl.uniform1i(prog.uniforms('u_bloomCount'), blooms)
      gl.uniform1i(prog.uniforms('u_fieldCount'), fields)
      gl.uniform4fv(prog.uniforms('u_fieldRect'), fieldRect)
      gl.uniform4fv(prog.uniforms('u_fieldOver'), fieldOver)
      gl.uniform1fv(prog.uniforms('u_fieldFade'), fieldFade)
      gl.uniform4fv(prog.uniforms('u_bloomGeom'), bloomGeom)
      gl.uniform4fv(prog.uniforms('u_bloomArgs'), bloomArgs)
      gl.uniform4fv(prog.uniforms('u_bloomK'), bloomK)
      gl.uniform4fv(prog.uniforms('u_bloomS'), bloomS)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      prog.draw()
    }

    // While wet, the wash animates at ~30fps. Once dry nothing moves on its
    // own, so the canvas only draws when the page does: a scroll, a resize, a
    // field arriving. Those draws are not throttled — the canvas is fixed and
    // the page is not, so a scroll frame skipped is a frame the paint visibly
    // slides against the section it belongs to.
    const frame = (now) => {
      raf = 0
      if (!running) return
      const wet = now - start < DRY_MS
      if (urgent || now - lastDraw >= FRAME_MS) {
        urgent = false
        lastDraw = now
        draw(now)
      }
      if (wet) raf = requestAnimationFrame(frame)
    }
    const request = () => {
      urgent = true
      if (!raf && running) raf = requestAnimationFrame(frame)
    }

    // Layout can move a field without a scroll (fonts, lazy images, a section
    // opening), so watch the document and every field's own box as well.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(request) : null
    const observe = () => {
      if (!ro) return
      ro.disconnect()
      ro.observe(root)
      for (const field of bloomFields()) if (field.el) ro.observe(field.el)
    }
    observe()
    const offFields = onBloomFieldsChange(() => {
      observe()
      request()
    })

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!running) {
        running = true
        lastDraw = 0
        request()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    request()

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro?.disconnect()
      offFields()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      delete root.dataset.liveBlooms
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  )
}
