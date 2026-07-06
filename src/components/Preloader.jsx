import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

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

// Feature-detected once: a throwaway canvas tells us whether WebGL is worth
// trying at all, so the goo character never fights a browser that can't run it.
const supportsWebGL = () => {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
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
  const [glOK] = useState(() => !reduce && supportsWebGL())

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
            {glOK ? <GooBloom active={bloom} /> : <Bloom active={bloom} reduce={reduce} />}
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

// GLSL: fullscreen triangle, no vertex attributes beyond clip-space position.
const GOO_VERTEX_SRC = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

// A gooey metaball blob wobbling into a small, contented face — pigment
// colours from the palette, blended by proximity so the character reads as
// one soft paint drop rather than five stacked circles. Grows and fades out
// once `active`, mirroring the CSS Bloom's exit so the two are interchangeable.
const GOO_FRAGMENT_SRC = `
precision mediump float;
uniform float uTime;
uniform float uActive;
uniform vec2 uResolution;

float metaball(vec2 p, vec2 center, float radius) {
  return (radius * radius) / dot(p - center, p - center);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  uv *= 2.0;

  float t = uTime;
  float breathe = sin(t * 2.2) * 0.03;
  float scale = 1.0 + breathe + uActive * 2.4;
  vec2 p = uv / scale;

  vec2 c0 = vec2(0.0, 0.02 * sin(t * 1.7));
  vec2 c1 = vec2(-0.32, 0.18) + 0.02 * vec2(sin(t * 1.3), cos(t * 1.1));
  vec2 c2 = vec2(0.30, 0.22) + 0.02 * vec2(cos(t * 1.5), sin(t * 1.9));
  vec2 c3 = vec2(0.20, -0.26) + 0.015 * vec2(sin(t * 2.1), cos(t * 1.6));
  vec2 c4 = vec2(-0.22, -0.22) + 0.015 * vec2(cos(t * 1.8), sin(t * 1.4));

  float w0 = metaball(p, c0, 0.34);
  float w1 = metaball(p, c1, 0.20);
  float w2 = metaball(p, c2, 0.19);
  float w3 = metaball(p, c3, 0.16);
  float w4 = metaball(p, c4, 0.17);
  float field = w0 + w1 + w2 + w3 + w4;
  float mask = smoothstep(0.85, 1.15, field);

  vec3 colCore = vec3(1.0, 0.180, 0.502);
  vec3 col1 = vec3(0.910, 0.447, 0.165);
  vec3 col2 = vec3(0.169, 0.494, 0.549);
  vec3 col3 = vec3(0.722, 0.851, 0.322);
  vec3 col4 = vec3(0.894, 0.533, 0.612);
  float wsum = field + 0.0001;
  vec3 color = (colCore * w0 + col1 * w1 + col2 * w2 + col3 * w3 + col4 * w4) / wsum;

  float cyc = fract(t / 0.9);
  float blink = smoothstep(0.0, 0.04, cyc) * (1.0 - smoothstep(0.04, 0.09, cyc));
  float eyeScaleY = mix(1.0, 0.12, blink);

  vec2 eyeOffset = vec2(0.11, 0.05);
  float eyeL = length((p - vec2(-eyeOffset.x, eyeOffset.y)) * vec2(1.0, 1.0 / eyeScaleY));
  float eyeR = length((p - vec2(eyeOffset.x, eyeOffset.y)) * vec2(1.0, 1.0 / eyeScaleY));
  float eyes = 1.0 - smoothstep(0.028, 0.045, min(eyeL, eyeR));

  vec2 mouthCenter = vec2(0.0, -0.02);
  float mouthBand = step(p.y, mouthCenter.y - 0.03);
  float distToMouthRing = abs(length(p - mouthCenter) - 0.14);
  float smile = (1.0 - smoothstep(0.012, 0.022, distToMouthRing)) * mouthBand;

  vec3 ink = vec3(0.188, 0.176, 0.161);
  float faceMask = clamp(eyes + smile, 0.0, 1.0) * mask;
  vec3 finalColor = mix(color, ink, faceMask);

  float alpha = mask * (1.0 - uActive * uActive);
  gl_FragColor = vec4(finalColor, alpha);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

/**
 * The WebGL replacement for Bloom: a single gooey, blinking paint-drop
 * character built from a metaball field. Lives entirely in one shader —
 * no geometry beyond a fullscreen triangle — so it costs one draw call.
 */
function GooBloom({ active }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false })
    if (!gl) return

    const program = gl.createProgram()
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, GOO_VERTEX_SRC))
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, GOO_FRAGMENT_SRC))
    gl.linkProgram(program)
    gl.useProgram(program)

    const posLoc = gl.getAttribLocation(program, 'aPos')
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    // Oversized triangle covering the viewport — cheaper than a quad, no index buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    const uActive = gl.getUniformLocation(program, 'uActive')
    const uResolution = gl.getUniformLocation(program, 'uResolution')

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = Math.round((canvas.clientWidth || 160) * dpr)
    canvas.width = size
    canvas.height = size
    gl.viewport(0, 0, size, size)

    const start = performance.now()
    let activeStart = null
    let raf

    const frame = (now) => {
      const t = (now - start) / 1000
      if (activeRef.current && activeStart === null) activeStart = now

      let activeProgress = 0
      if (activeStart !== null) {
        const linear = Math.min((now - activeStart) / 550, 1)
        activeProgress = 1 - Math.pow(1 - linear, 3)
      }

      gl.uniform1f(uTime, t)
      gl.uniform1f(uActive, activeProgress)
      gl.uniform2f(uResolution, size, size)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
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
