import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'
import { bloomFields } from './BloomField.jsx'
import {
  GLSL_PRECISION,
  GLSL_NOISE,
  GLSL_PAPER,
  GLSL_KM,
  GLSL_WASH,
  pigment,
} from '../lib/watercolour.js'

/**
 * BloomCanvas — every bloom field on the page, painted as actual paint.
 *
 * One fixed, full-viewport WebGL canvas that reads the registered BloomFields
 * each frame, masks each to its element's rect, and renders its blooms with the
 * Curtis et al. model (see lib/watercolour.js).
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
 * striations (§4.3). The blooms carry their own edge darkening in their
 * thickness profiles (§4.3.3).
 *
 * Cost control: half-resolution buffer, DPR capped at 1, ~30fps throttle,
 * paused when the tab is hidden or the page hasn't been revealed. It only
 * mounts on capable, motion-friendly devices (`useHeavyFx`); everywhere else —
 * touch, reduced-motion, no WebGL — BloomField's CSS rendering stays up. The
 * canvas signals the handover with `data-live-blooms` on the root, which fades
 * the CSS layers out (index.css), and clearing it on teardown fades them back.
 */

const MAX_FIELDS = 4
const MAX_BLOOMS = 24

// Coverage headroom for the colour/alpha split, matching lib/watercolour.js.
const ALPHA_GAIN = '1.6'
const FLOW_SLOPE = '0.22' //  how hard the paper's slope streaks the flow (§4.3)
const GRAN_AMOUNT = '1.1' //  granulation at full wetness; γ scales it per pigment (§4.5)

const FRAG = `
${GLSL_PRECISION}
  uniform vec2 u_res;
  uniform float u_time;
  uniform float u_scroll;
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
  uniform vec4 u_bloomS[${MAX_BLOOMS}];      // S.rgb

${GLSL_NOISE}
${GLSL_PAPER}
${GLSL_KM}
${GLSL_WASH}

  // Thickness across a bloom at radial distance d (1 = the gradient's radius),
  // matching BLOOM_PROFILES in lib/watercolour.js so the canvas and the CSS
  // fallback describe the same paint. Wet-on-dry carries the dried rim; wet-in-
  // wet feathers out with none (§2.2).
  float profileDry(float p){
    if (p >= 0.80) return 0.0;
    if (p < 0.34) return mix(0.75, 0.50, p / 0.34);
    if (p < 0.54) return mix(0.50, 0.30, (p - 0.34) / 0.20);
    if (p < 0.65) return mix(0.30, 0.34, (p - 0.54) / 0.11);   // the dried rim
    if (p < 0.72) return mix(0.34, 0.12, (p - 0.65) / 0.07);
    return mix(0.12, 0.0, (p - 0.72) / 0.08);
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

    // The sheet (§4.1), in CSS pixels so the tooth holds a fixed size.
    vec2 sheet = gl_FragCoord.xy / u_px;
    float mottle = paperMottle(sheet);
    float fibre = paperFieldAt(sheet, mottle, 0.35);
    float hollow = paperFieldAt(sheet, mottle, 0.78);

    // Wet-on-wet: the pigment bleeds and breathes at its edges rather than
    // sitting still, and the paper's slope streaks that flow (§4.3, cond. 4).
    float t = u_time * 0.03;
    float drift = u_scroll / u_res.y * 0.15;
    vec2 fp = vec2(sv.x * (u_res.x / u_res.y), sv.y) * 2.4 + vec2(0.0, drift);
    vec2 warp = vec2(fbm(fp + t), fbm(fp.yx + 5.2 - t));
    vec2 bleed = (0.85 * warp - 0.42
               + flowStreak(paperSlope(sheet, mottle), warp - 0.5) * ${FLOW_SLOPE}) * 0.06;

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

    // Nested so both array indices are loop counters: GLSL ES 1.00 only allows
    // uniform arrays to be indexed by a constant expression, which a value
    // pulled out of another uniform is not.
    for (int fi = 0; fi < ${MAX_FIELDS}; fi++){
      if (fi >= u_fieldCount) break;
      vec4 rect = u_fieldRect[fi];
      // Blooms are clipped to their field's box, the way a background-image is.
      vec2 f = (sv - rect.xy) / max(rect.zw, vec2(1e-4));
      if (f.x < 0.0 || f.x > 1.0 || f.y < 0.0 || f.y > 1.0) continue;
      vec4 over = u_fieldOver[fi];
      // The vertical fade a masked field would have had in CSS.
      float fade = u_fieldFade[fi] > 0.0 ? smoothstep(0.0, u_fieldFade[fi], f.y) : 1.0;

      for (int i = 0; i < ${MAX_BLOOMS}; i++){
        if (i >= u_bloomCount) break;
        vec4 args = u_bloomArgs[i];
        if (abs(args.w - float(fi)) > 0.5) continue;   // belongs to another field

        vec4 geom = u_bloomGeom[i];
        float d = length((f + bleed - geom.xy) / max(geom.zw, vec2(1e-4)));
        float p = bloomProfile(d / max(args.y, 1e-3), args.z) * over.a * fade;
        if (p <= 0.0) continue;
        // Negative thickness is a LIFT, not paint: the near-white cores that
        // hold the overlap zones open are unpainted paper showing through, and
        // §4.5's desorption is the model's name for pigment coming back off the
        // sheet. Tracked apart so it never pollutes the K/S mix.
        if (args.x < 0.0) { lift += -args.x * p; painted = 1.0; continue; }
        float x = args.x * p;

        Kacc += u_bloomK[i].rgb * x;
        Sacc += u_bloomS[i].rgb * x;
        gran += u_bloomK[i].w * x;
        X += x;
        painted = 1.0;
      }
      if (painted > 0.5) backdrop = over.rgb;
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
    if (vectors < MAX_FIELDS * 2 + MAX_BLOOMS * 4 + 8) return

    const prog = createQuadProgram(gl, FRAG)
    if (!prog) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    root.dataset.liveBlooms = ''

    const start = performance.now()
    let raf = 0
    let lastDraw = 0
    let running = true
    const FRAME_MS = 1000 / 30

    // Reused scratch buffers — these are rewritten every frame, and allocating
    // ~30 typed arrays a second would hand the GC work for no reason.
    const fieldRect = new Float32Array(MAX_FIELDS * 4)
    const fieldOver = new Float32Array(MAX_FIELDS * 4)
    const fieldFade = new Float32Array(MAX_FIELDS)
    const bloomGeom = new Float32Array(MAX_BLOOMS * 4)
    const bloomArgs = new Float32Array(MAX_BLOOMS * 4)
    const bloomK = new Float32Array(MAX_BLOOMS * 4)
    const bloomS = new Float32Array(MAX_BLOOMS * 4)

    // K/S never change for a pigment, so resolve them once instead of inverting
    // the KM equations for every bloom on every frame.
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

        for (const b of field.blooms) {
          if (nb >= MAX_BLOOMS) break
          // vw-sized circles are resolved against the viewport here, then
          // expressed in the field's own fractions for the shader.
          const rx = b.sizeVw ? (b.sizeVw * vw) / 100 / r.width : b.size[0]
          const ry = b.sizeVw ? (b.sizeVw * vw) / 100 / r.height : b.size[1]
          bloomGeom.set([b.at[0], b.at[1], rx, ry], nb * 4)
          // Lifts ride the same array with a negative thickness — they occupy a
          // bloom slot but carry no paint, so K/S stay zero.
          const { K, S, gran } = b.lift ? BLANK : paint(b.pigment)
          bloomArgs.set(
            [b.lift ? -b.lift : b.x, b.extent ?? 0.72, b.wetness === 'wet' ? 1 : 0, nf],
            nb * 4,
          )
          bloomK.set([K[0], K[1], K[2], gran], nb * 4)
          bloomS.set([S[0], S[1], S[2], 0], nb * 4)
          nb++
        }
        nf++
      }
      return { blooms: nb, fields: nf }
    }

    const frame = (now) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (now - lastDraw < FRAME_MS) return
      lastDraw = now

      resizeCanvas(gl, canvas, 0.5, 1)
      const { blooms, fields } = readFields()

      gl.useProgram(prog.program)
      gl.uniform2f(prog.uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(prog.uniforms('u_px'), canvas.width / Math.max(1, canvas.clientWidth))
      gl.uniform1f(prog.uniforms('u_time'), (now - start) / 1000)
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

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        lastDraw = 0
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
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
