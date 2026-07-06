import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'

/**
 * HeroBrush — a "loaded brush" that trails the cursor across the hero, leaving
 * a short-lived ribbon of watercolour pigment that blooms and dries out.
 *
 * Deliberately *perceivable*, not ambient: the hero previously carried a
 * subtle always-on WebGL aurora that was removed for costing continuous GPU
 * time to read as "a whisper nobody could name the colour of". This is the
 * inverse — it says nothing at rest (the render loop stops entirely once the
 * last stroke has dried) and only speaks when the visitor moves, so its whole
 * cost is paid exactly when it's being noticed.
 *
 * A CPU ring buffer of recent pointer samples is handed to the shader each
 * frame; every sample is a soft pigment bloom that fades with age, with a
 * little domain-warp on its edge for the wet bleed. Gated to fine-pointer,
 * motion-friendly, WebGL-capable devices — it renders nothing anywhere else.
 */

const N = 16 // max simultaneous pigment samples (uniform array length)
const LIFE = 1300 // ms a stroke takes to dry out
const MIN_STEP = 0.012 // min normalised travel before dropping a new sample

const FRAG = `
  precision mediump float;
  uniform vec2 u_res;
  uniform float u_time;
  uniform int u_count;
  uniform vec4 u_pts[${N}];   // (x, y, age01, seed) — x/y normalised, y top-down

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

  // Warm hero pigments only — terracotta, rose, ochre, orange, blush.
  vec3 pigment(float s){
    vec3 terracotta = vec3(0.180, 0.361, 0.549);
    vec3 rose       = vec3(0.549, 0.290, 0.431);
    vec3 ochre      = vec3(0.839, 0.651, 0.235);
    vec3 orange     = vec3(0.788, 0.478, 0.180);
    vec3 blush      = vec3(0.788, 0.478, 0.580);
    s = fract(s) * 4.0;
    if (s < 1.0) return mix(terracotta, rose, s);
    if (s < 2.0) return mix(rose, ochre, s - 1.0);
    if (s < 3.0) return mix(ochre, orange, s - 2.0);
    return mix(orange, blush, s - 3.0);
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    vec2 p = vec2(uv.x, 1.0 - uv.y);          // top-down to match pointer coords
    float aspect = u_res.x / u_res.y;

    vec3 acc = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < ${N}; i++){
      if (i >= u_count) break;
      vec4 pt = u_pts[i];
      vec2 d = vec2((p.x - pt.x) * aspect, p.y - pt.y);
      // Wet edge: nudge the sampling point with slow noise so the bloom rim
      // feathers rather than staying a clean circle.
      float w = vnoise(p * 9.0 + pt.w * 20.0 + u_time * 0.3) - 0.5;
      float dist = length(d) + w * 0.02;
      float age = pt.z;
      // Pigment spreads a little as it dries, and fades as it does.
      float radius = mix(0.075, 0.15, age);
      float body = smoothstep(radius, 0.0, dist) * (1.0 - age);
      vec3 col = pigment(pt.w + age * 0.15);
      // Layer this bloom over what's built up so far (oldest to newest, so
      // fresh pigment sits on top) using premultiplied "over" compositing —
      // not summing colour (which blew overlapping strokes past white, a
      // neon "screen" glow) and not mixing straight colour toward black at
      // low coverage (which greyed out the feathered, low-opacity rim).
      // Premultiplied over-compositing keeps a faint edge at full hue, just
      // more transparent, the way a dilute wash of pigment actually looks.
      acc = col * body + acc * (1.0 - body);
      cover = body + cover * (1.0 - body);
    }
    float alpha = cover * 0.5;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(acc * 0.5, alpha);  // premultiplied, same 0.5 dampening
  }
`

export default function HeroBrush() {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const canvasRef = useRef(null)
  const active = heavyFx && !reduce

  useEffect(() => {
    if (!active || !webglSupported()) return
    const canvas = canvasRef.current
    const gl = getContext(canvas)
    if (!gl) return
    const prog = createQuadProgram(gl, FRAG)
    if (!prog) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    // Ring buffer of live pigment samples.
    const pts = [] // { x, y, born, seed }
    let lastX = -1
    let lastY = -1
    let seed = Math.random()
    const data = new Float32Array(N * 4)

    let raf = 0
    let running = false

    const draw = (now) => {
      // Expire dried strokes.
      for (let i = pts.length - 1; i >= 0; i--) {
        if (now - pts[i].born >= LIFE) pts.splice(i, 1)
      }
      if (pts.length === 0) {
        running = false // sleep — nothing to paint until the next move
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        return
      }
      raf = requestAnimationFrame(draw)

      resizeCanvas(gl, canvas, 0.6, 1)
      const count = Math.min(pts.length, N)
      // Newest samples last so the freshest pigment layers on top.
      const start = pts.length - count
      for (let i = 0; i < count; i++) {
        const s = pts[start + i]
        data[i * 4] = s.x
        data[i * 4 + 1] = s.y
        data[i * 4 + 2] = Math.min(1, (now - s.born) / LIFE)
        data[i * 4 + 3] = s.seed
      }

      gl.useProgram(prog.program)
      gl.uniform2f(prog.uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(prog.uniforms('u_time'), now / 1000)
      gl.uniform1i(prog.uniforms('u_count'), count)
      gl.uniform4fv(prog.uniforms('u_pts'), data)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      prog.draw()
    }

    const wake = () => {
      if (running || document.hidden) return
      running = true
      raf = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      if (x < 0 || x > 1 || y < 0 || y > 1) return // only within the hero
      if (lastX >= 0) {
        const dx = x - lastX
        const dy = y - lastY
        if (dx * dx + dy * dy < MIN_STEP * MIN_STEP) return
      }
      lastX = x
      lastY = y
      seed = (seed + 0.13) % 1
      pts.push({ x, y, born: performance.now(), seed })
      if (pts.length > N) pts.shift()
      wake()
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
    />
  )
}
