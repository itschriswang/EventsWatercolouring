import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'

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
 * Cost control: half-resolution buffer, DPR capped at 1, ~30fps throttle,
 * paused when the tab is hidden or the page hasn't been revealed. It only
 * mounts on capable, motion-friendly devices (`useHeavyFx`); everywhere else
 * — mobile, reduced-motion, no WebGL — the static CSS washes remain.
 */

const FRAG = `
  precision mediump float;
  uniform vec2 u_res;
  uniform float u_time;
  uniform float u_scroll;
  uniform float u_alpha;
  uniform int u_bandCount;
  uniform vec4 u_bands[4];   // (top, bottom, warm, reveal), normalised screen space (0 = top)

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

  // Ordered pigment ramp following the reference image's hue arc — apricot,
  // butter yellow, the yellow-green glow, periwinkle, lilac, blush, candy
  // rose — so every interpolation segment blends neighbouring hues and never
  // crosses a complement into grey. Warm (1.0) swaps the two coolest slots
  // (periwinkle, lilac) for butter and blush, matching WatercolourBloom's
  // .wcb-warm sunlit recipe.
  vec3 pigment(float t, float warm){
    vec3 apricot    = vec3(0.969, 0.765, 0.580);
    vec3 butter     = vec3(0.906, 0.910, 0.565);
    vec3 yellowgrn  = vec3(0.843, 0.886, 0.533);
    vec3 peri       = mix(vec3(0.847, 0.855, 0.925), butter, warm);
    vec3 lilac      = mix(vec3(0.824, 0.769, 0.910), vec3(0.957, 0.769, 0.824), warm);
    vec3 blush      = vec3(0.957, 0.769, 0.824);
    vec3 rose       = vec3(0.933, 0.620, 0.745);
    t = fract(t) * 6.0;
    if (t < 1.0) return mix(apricot, butter, t);
    if (t < 2.0) return mix(butter, yellowgrn, t - 1.0);
    if (t < 3.0) return mix(yellowgrn, peri, t - 2.0);
    if (t < 4.0) return mix(peri, lilac, t - 3.0);
    if (t < 5.0) return mix(lilac, blush, t - 4.0);
    return mix(blush, rose, t - 5.0);
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    float sv = 1.0 - uv.y;                 // 0 at top of viewport, to match band coords
    float aspect = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * aspect, sv);

    float t = u_time * 0.03;
    float drift = u_scroll / u_res.y * 0.15;   // gentle parallax as the page scrolls

    // Wet-on-wet: warp the sampling domain with slowly evolving noise so the
    // pigment bleeds and breathes at its edges rather than sitting still.
    vec2 fp = p * 2.4 + vec2(0.0, drift);
    vec2 warp = vec2(fbm(fp + t), fbm(fp.yx + 5.2 - t));
    vec2 q = fp + 0.85 * warp;

    float density = fbm(q * 1.15 + 1.7);
    float bloom = smoothstep(0.42, 0.86, density);

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

    vec3 col = pigment(density * 0.9 + warp.x * 0.35, warm);
    float alpha = bloom * mask * 0.24 * u_alpha;

    // Sprayed grain-dither: break the smooth wash into a printed, airbrushed
    // stipple so the bloom reads as pigment sprayed onto paper rather than a
    // clean CSS gradient (matching the reference's grainy gradient field). The
    // grain is a steady screen-space hash (no u_time term, so it never
    // shimmers) sampled at the half-res buffer, which the CSS upscale turns
    // into a coarse ~2px speckle. Two moves make it read as *spray* rather than
    // flat noise: the modulation is deepened toward the bloom's soft edges
    // (1-bloom), the way an airbrush thins to grain at the fringe, while the
    // dense core stays smooth so colour still reads.
    float grain = hash(floor(gl_FragCoord.xy));
    float spray = mix(0.5, 0.9, bloom);           // grainier at the fringes, a little even in the core
    alpha *= mix(spray, 1.0, grain);

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
