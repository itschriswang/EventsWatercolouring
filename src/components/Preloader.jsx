import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'

// Session flag so the intro plays once per visit, not once per page load —
// coming back from /faq/ (or any internal navigation) skips straight to the
// page instead of replaying the curtain.
const SEEN_KEY = 'ew-intro-seen'

// Whether to skip the intro entirely. Two cases, both "navigating, not
// arriving": the visitor has already seen the intro this session, or they are
// landing on an anchor (e.g. /#offerings from the FAQ nav) and a curtain
// would only stand between them and the section they asked for.
const shouldSkip = () => {
  if (typeof window === 'undefined') return false
  try {
    if (window.sessionStorage.getItem(SEEN_KEY)) return true
  } catch {
    // Storage blocked (private mode etc.) — fall through to the hash check.
  }
  return window.location.hash.length > 1
}

/**
 * Full-viewport intro. A brief, honest one: a watercolour bloom breathes in,
 * then dissolves through a fluid clip-path mask to reveal the hero — around a
 * second, start to finish. It is an entrance, not a loading screen: it tracks
 * no progress and gates nothing, so it never pretends to a number, and it
 * plays only on the first arrival of a session (see shouldSkip above).
 */
export default function Preloader({ onDone }) {
  const done = onDone
  const reduce = useReducedMotion()
  const [skip] = useState(shouldSkip)
  const [bloom, setBloom] = useState(false)
  const [gone, setGone] = useState(false)
  const [glOK] = useState(() => !reduce && webglSupported())

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Best effort — without storage the intro simply replays next visit.
    }
    if (skip) {
      done?.()
      return
    }
    const timers = [
      window.setTimeout(() => setBloom(true), reduce ? 60 : 420),
      window.setTimeout(() => setGone(true), reduce ? 140 : 820),
      window.setTimeout(() => done?.(), reduce ? 220 : 1100),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [skip, reduce, done])

  if (skip) return null

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper paper-grain"
          initial={false}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.25 } }
              : {
                  clipPath: 'circle(0% at 50% 45%)',
                  transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
                }
          }
          style={{ clipPath: 'circle(150% at 50% 45%)' }}
        >
          <div className="relative grid h-40 w-40 place-items-center sm:h-48 sm:w-48">
            {glOK ? <PigmentCreature active={bloom} /> : <Bloom active={bloom} reduce={reduce} />}
          </div>

          <p className="mt-8 font-sentient text-xl tracking-[-0.01em] text-ink">
            chris wang<span className="text-terracotta">.</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Layered pigment bloom — overlapping multiply circles that breathe in once,
 * then flare open as the mask dissolves. No infinite loops: the whole thing
 * lives for about a second.
 */
function Bloom({ active, reduce }) {
  const blobs = [
    { c: '#FF2E80', x: 0,   y: 0,   s: 1 },
    { c: '#E8722A', x: -22, y: 14,  s: 0.78 },
    { c: '#2B7E8C', x: 20,  y: 18,  s: 0.7 },
    { c: '#B8D952', x: 14,  y: -20, s: 0.6 },
    { c: '#E4889C', x: -16, y: -16, s: 0.66 },
  ]
  return (
    <div className="relative h-full w-full">
      {blobs.map((b, i) => {
        const rest = { x: `${b.x}%`, y: `${b.y}%`, scale: b.s, opacity: 1 }
        let initial
        let animate
        if (reduce) {
          initial = rest
          animate = active ? { ...rest, opacity: 0 } : rest
        } else if (active) {
          initial = false
          animate = { ...rest, scale: b.s * 3, opacity: 0 }
        } else {
          initial = { ...rest, scale: b.s * 0.6, opacity: 0 }
          animate = rest
        }
        return (
          <motion.span
            key={i}
            className="absolute inset-0 m-auto rounded-full mix-blend-multiply"
            style={{
              width: '62%',
              height: '62%',
              backgroundColor: b.c,
              filter: 'blur(2px)',
            }}
            initial={initial}
            animate={animate}
            transition={
              active
                ? { duration: reduce ? 0.2 : 0.55, ease: 'easeOut' }
                : { duration: 0.5, ease: [0.22, 0.61, 0.36, 1], delay: i * 0.05 }
            }
          />
        )
      })}
    </div>
  )
}

// Same domain-warped fbm bleed as BloomCanvas (src/lib/webgl.js's caller),
// so the intro reads as the same pigment as the rest of the site rather than
// a separate, flatter effect — just aimed at a single small silhouette
// instead of full-viewport wash bands.
const CREATURE_FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_appear;
uniform float u_active;

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
  for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y) * 2.0;

  float t = u_time;
  float breathe = sin(t * 1.5) * 0.02;
  float grow = 1.0 + breathe + u_active * 2.1;
  vec2 p = uv / grow;

  // Wet-on-wet: warp the sampling domain so the silhouette's edge bleeds and
  // breathes rather than tracing a clean geometric curve.
  vec2 warp = vec2(fbm(p * 1.7 + t * 0.18), fbm(p.yx * 1.7 - t * 0.15));
  vec2 q = p + warp * 0.24;

  float body = length(q * vec2(1.0, 1.1));
  float edgeWobble = fbm(q * 2.6 + t * 0.12) * 0.16;
  float radius = 0.44 + edgeWobble;
  float mask = 1.0 - smoothstep(radius - 0.14, radius + 0.09, body);

  // Granulation — pigment settles unevenly rather than filling as a flat tint.
  float grain = fbm(q * 4.2 + 3.1);
  float density = mix(0.6, 1.0, grain);

  vec3 terracotta = vec3(0.788, 0.463, 0.318);
  vec3 rust = vec3(0.549, 0.235, 0.129);
  vec3 ochre = vec3(0.792, 0.596, 0.263);
  float pool = smoothstep(0.15, -0.35, q.y);
  float glow = smoothstep(0.35, -0.15, q.y) * 0.25;
  vec3 color = mix(terracotta, rust, pool * 0.55);
  color = mix(color, ochre, glow);
  color *= density;

  // Two soft ink marks — the only concession to a face, deliberately quiet.
  vec2 eyeOff = vec2(0.115, 0.05) + 0.008 * fbm(vec2(t * 0.25, 1.0));
  float eyeL = length(q - vec2(-eyeOff.x, eyeOff.y));
  float eyeR = length(q - vec2(eyeOff.x, eyeOff.y));
  float eyes = 1.0 - smoothstep(0.018, 0.05, min(eyeL, eyeR));
  vec3 ink = vec3(0.29, 0.22, 0.17);

  vec3 finalColor = mix(color, ink, eyes * 0.8 * mask);
  float alpha = mask * density * u_appear * (1.0 - u_active * u_active * 0.92);

  gl_FragColor = vec4(finalColor * alpha, alpha);
}
`

/**
 * The WebGL stand-in for Bloom: one small watercolour wash, painted with the
 * same domain-warped fbm bleed as the site's live background bloom, carrying
 * just two soft ink marks for a face. Breathes in, then grows and fades on
 * the same schedule as Bloom's exit so the two are interchangeable.
 */
function PigmentCreature({ active }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = getContext(canvas)
    if (!gl) return
    const prog = createQuadProgram(gl, CREATURE_FRAG)
    if (!prog) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const start = performance.now()
    let activeStart = null
    let raf

    const frame = (now) => {
      resizeCanvas(gl, canvas, 1, 2)
      if (activeRef.current && activeStart === null) activeStart = now

      const appear = Math.min((now - start) / 450, 1)
      let activeProgress = 0
      if (activeStart !== null) {
        const linear = Math.min((now - activeStart) / 550, 1)
        activeProgress = 1 - Math.pow(1 - linear, 3)
      }

      gl.useProgram(prog.program)
      gl.uniform2f(prog.uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(prog.uniforms('u_time'), (now - start) / 1000)
      gl.uniform1f(prog.uniforms('u_appear'), 1 - Math.pow(1 - appear, 3))
      gl.uniform1f(prog.uniforms('u_active'), activeProgress)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      prog.draw()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={canvasRef} className="h-full w-full" />
}
