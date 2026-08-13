import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'
import {
  GLSL_PRECISION,
  GLSL_NOISE,
  GLSL_PAPER,
  GLSL_KM,
  GLSL_WASH,
  GLSL_PAPER_REFLECTANCE,
  glslPigmentRamp,
} from '../lib/watercolour.js'

/**
 * BloomCanvas — the live watercolour wash behind the page.
 *
 * The static CSS washes (WatercolourBloom) paint the full height of each
 * section, even the parts scrolled off-screen, which is why they were kept
 * static: animating that much area would thrash the frame budget. This is the
 * efficient inverse — ONE fixed, full-viewport WebGL canvas that only ever
 * shades the visible pixels. The pigment genuinely diffuses (domain-warped
 * fBm = wet-on-wet bleed) and each wash floods in along an organic noise
 * front as its section scrolls into view.
 *
 * It reproduces the existing design rather than replacing it: every frame it
 * reads the on-screen rect of each `[data-wash]` section and masks the blooms
 * to exactly those bands, carrying each section's warm/cool recipe through a
 * per-band `warm` flag. When it's live it hides the CSS washes (via the
 * `data-live-blooms` root flag) so the two never double-paint.
 *
 * The pigment model is Curtis et al.'s (see `lib/watercolour.js`): the wash is
 * a glaze of real K/S pigments composited onto the paper with Kubelka-Munk
 * rather than alpha-blended, it deposits a darker rim where the water stopped
 * (§4.3.3 — the effect that paper credits for watercolour's luminosity), it
 * granulates into the hollows of the sheet at a rate set by each pigment's
 * granularity (§4.5), and its flow is deflected by the paper's slope into
 * striations (§4.3). What used to be one smooth noise field is now a wash with
 * edges, tooth and grain that vary by hue.
 *
 * Cost control: half-resolution buffer, DPR capped at 1, ~30fps throttle,
 * paused when the tab is hidden or the page hasn't been revealed. It only
 * mounts on capable, motion-friendly devices (`useHeavyFx`); everywhere else
 * — mobile, reduced-motion, no WebGL — the static CSS washes remain.
 */

// Wash constants. Thickness is in the KM sense: x = 1 is the unit glaze that
// reproduces a palette colour exactly over white paper, so these thin values
// are what keep the wash a pale, luminous glaze rather than flat paint.
const X_BASE = '0.055' // interior thickness of the wash at full coverage
const X_EDGE = '0.22' //  extra pigment carried to the dried rim (§4.3.3)
const EDGE_BLUR = '0.13' //  width of the blurred wet-area mask M', as density
const FLOW_SLOPE = '0.22' //  how hard the paper's slope streaks the flow (§4.3)
const GRAN_AMOUNT = '0.55' //  how far to take granulation at full wetness (§4.5)
const DRY_AMOUNT = '0.55' //  drybrush gating at the dry fringe (§4.7)
const ALPHA_GAIN = '1.65' //  gamut headroom for the colour/coverage split below

const FRAG = `
${GLSL_PRECISION}
  uniform vec2 u_res;
  uniform float u_time;
  uniform float u_scroll;
  uniform float u_alpha;
  uniform float u_px;        // device pixels per CSS pixel, so the paper tooth
                             // is the same physical size as GrainCanvas's
  uniform int u_bandCount;
  uniform vec4 u_bands[4];   // (top, bottom, warm, reveal), normalised screen space (0 = top)

${GLSL_NOISE}
${GLSL_PAPER}
${GLSL_KM}
${GLSL_WASH}
${glslPigmentRamp()}

  void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    float sv = 1.0 - uv.y;                 // 0 at top of viewport, to match band coords
    float aspect = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * aspect, sv);

    float t = u_time * 0.03;
    float drift = u_scroll / u_res.y * 0.15;   // gentle parallax as the page scrolls

    // The sheet (§4.1). Sampled in CSS pixels so the tooth stays put and stays
    // the same size whatever the buffer is scaled to.
    vec2 sheet = gl_FragCoord.xy / u_px;
    float mottle = paperMottle(sheet);
    float fibre = paperFieldAt(sheet, mottle, 0.35);   // what a brush skims
    float hollow = paperFieldAt(sheet, mottle, 0.78);  // where pigment pools

    // Wet-on-wet: warp the sampling domain with slowly evolving noise so the
    // pigment bleeds and breathes at its edges rather than sitting still. The
    // paper's slope then streaks that flow (§4.3, condition 4) — the term that
    // pulls a wash into delicate striations running with the water instead of
    // leaving it perfectly isotropic.
    vec2 fp = p * 2.4 + vec2(0.0, drift);
    vec2 warp = vec2(fbm(fp + t), fbm(fp.yx + 5.2 - t));
    vec2 q = fp + 0.85 * warp
           + flowStreak(paperSlope(sheet, mottle), warp - 0.5) * ${FLOW_SLOPE};

    float density = fbm(q * 1.15 + 1.7);

    // Wet-area mask, and the pigment the drying wash drags out to its rim.
    float wet = smoothstep(0.42, 0.86, density);
    float rim = edgeDeposit(density, 0.42, 0.86, ${EDGE_BLUR});

    // Accumulate the on-screen wash bands, feathering their edges and letting
    // each flood in along a noise front (the scroll reveal).
    float mask = 0.0;
    float warm = 0.0;
    for (int i = 0; i < 4; i++){
      if (i >= u_bandCount) break;
      vec4 b = u_bands[i];
      float edge = smoothstep(b.x - 0.06, b.x + 0.10, sv)
                 * (1.0 - smoothstep(b.y - 0.10, b.y + 0.06, sv));
      float front = 0.55 * fbm(vec2(q.x * 1.3, b.x * 3.0) + 2.0);
      float reveal = smoothstep(0.0, 0.5, b.w - 0.45 + front * 0.9);
      float w = edge * reveal;
      mask += w;
      warm += w * b.z;
    }
    mask = clamp(mask, 0.0, 1.0);
    warm = mask > 0.001 ? warm / mask : 0.0;
    wet *= mask;
    rim *= mask;

    vec3 K, S;
    float gamma;
    pigmentKS(density * 0.9 + warp.x * 0.35, warm, K, S, gamma);

    // Deposited pigment: the pale interior plus the dark ring at the edge.
    float x = wet * ${X_BASE} + rim * ${X_EDGE};
    // Granulation settles it into the hollows of the sheet, hardest where the
    // paper is wettest and hardest for the coarse pigments (periwinkle, rose)
    // — the yellow-green glow stays glassy. This replaces the old uniform
    // spray-dither: the tooth is now the paper's, and differs by hue.
    x *= granulation(hollow, gamma, wet * ${GRAN_AMOUNT});
    // ...and the dry fringe breaks up on the sheet's peaks instead of fading
    // out cleanly, which is what stops the edge reading as an airbrush.
    x *= drybrush(fibre, 0.42, ${DRY_AMOUNT} * (1.0 - wet));

    // §5.2 — render the glaze optically over the paper rather than blending a
    // colour onto it. Coverage then follows from how much the glaze actually
    // darkens the sheet, which keeps thickness, hue and opacity in step: thin
    // pigment is automatically both paler and more transparent.
    vec3 R, T;
    kmLayer(K, S, x, R, T);
    vec3 paper = ${GLSL_PAPER_REFLECTANCE};
    vec3 drop = paper - kmOver(R, T, paper);

    float alpha = clamp(max(drop.r, max(drop.g, drop.b)) * ${ALPHA_GAIN}, 0.0, 1.0) * u_alpha;
    // Recover the source colour that lands on that reflectance once the
    // compositor has blended it over the page at this alpha. ALPHA_GAIN > 1
    // keeps the result inside gamut, so the clamp never actually bites.
    vec3 col = clamp(paper - drop / max(alpha, 1e-3), 0.0, 1.0);

    // Premultiplied output (context is premultipliedAlpha, blend ONE / 1-SRC_A).
    gl_FragColor = vec4(col * alpha, alpha);
  }
`

const MAX_BANDS = 4

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

    const prog = createQuadProgram(gl, FRAG)
    if (!prog) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    // Take over from the static CSS washes while we're live.
    root.dataset.liveBlooms = ''

    const start = performance.now()
    let raf = 0
    let lastDraw = 0
    let running = true
    const FRAME_MS = 1000 / 30

    // Reused scratch buffer for the band uniform array.
    const bandData = new Float32Array(MAX_BANDS * 4)

    // The [data-wash] sections are rendered once by SectionWash and never
    // added or removed for the page's lifetime, so match them a single time
    // rather than re-running querySelectorAll every frame (~30/s) — only their
    // positions change, which we still read per-frame via getBoundingClientRect.
    const washEls = document.querySelectorAll('[data-wash]')

    const readBands = () => {
      const vh = window.innerHeight || 1
      const els = washEls
      let n = 0
      for (let i = 0; i < els.length && n < MAX_BANDS; i++) {
        const r = els[i].getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) continue // fully off-screen — skip
        const warm = els[i].dataset.warm != null ? 1 : 0
        // Flood-in progress: 0 as the band's top crosses the bottom edge, 1
        // once it has risen through the lower ~60% of the viewport.
        const reveal = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.6)))
        bandData[n * 4] = r.top / vh
        bandData[n * 4 + 1] = r.bottom / vh
        bandData[n * 4 + 2] = warm
        bandData[n * 4 + 3] = reveal
        n++
      }
      return n
    }

    const frame = (now) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (now - lastDraw < FRAME_MS) return
      lastDraw = now

      resizeCanvas(gl, canvas, 0.5, 1)
      const count = readBands()

      gl.useProgram(prog.program)
      gl.uniform2f(prog.uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(prog.uniforms('u_px'), canvas.width / Math.max(1, canvas.clientWidth))
      gl.uniform1f(prog.uniforms('u_time'), (now - start) / 1000)
      gl.uniform1f(prog.uniforms('u_scroll'), window.scrollY || 0)
      // Ease the whole layer in so it doesn't pop on first paint.
      gl.uniform1f(prog.uniforms('u_alpha'), Math.min(1, (now - start) / 900))
      gl.uniform1i(prog.uniforms('u_bandCount'), count)
      gl.uniform4fv(prog.uniforms('u_bands'), bandData)

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
