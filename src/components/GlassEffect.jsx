import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'

/**
 * GlassEffect — frosted glass with chromatic aberration overlay.
 * Heavy FX path: WebGL shader with light refraction and RGB shift.
 * Lite path: CSS backdrop-filter blur + semi-transparent overlay.
 * Applies as a fixed overlay positioned over content.
 */

const FRAG = `
  precision mediump float;
  uniform vec2 u_res;
  uniform float u_time;
  uniform sampler2D u_tex;
  uniform float u_aberration;

  float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / u_res;

    // Frosted glass texture from noise
    float n1 = noise(uv * 8.0 + u_time * 0.1);
    float n2 = noise(uv * 16.0 + u_time * 0.15);
    float frost = mix(n1, n2, 0.5) * 0.4 + 0.6;

    // Chromatic aberration (rainbow refraction)
    vec2 offset = vec2(sin(uv.y * 10.0 + u_time) * u_aberration,
                       cos(uv.x * 10.0 + u_time) * u_aberration);

    float r = texture2D(u_tex, uv + offset * 0.02).r;
    float g = texture2D(u_tex, uv).g;
    float b = texture2D(u_tex, uv - offset * 0.02).b;

    // Combine with frost and apply glass effect
    vec3 col = vec3(r, g, b) * frost;

    // Brightened glass with iridescence
    col += vec3(0.95, 0.92, 1.0) * (0.4 + frost * 0.3);
    col *= 1.1;

    gl_FragColor = vec4(col, 0.7);
  }
`

export default function GlassEffect({ id = 'glass-effect', targetRect = null }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const shouldRender = heavyFx && !reduce

  useEffect(() => {
    if (!shouldRender || !canvasRef.current) return
    if (!webglSupported()) return

    const canvas = canvasRef.current
    const gl = getContext(canvas)
    if (!gl) return

    const quad = createQuadProgram(gl, FRAG)
    if (!quad) return

    const { program, draw, uniforms } = quad
    let frameCount = 0
    let fps30Throttle = 0

    const tick = () => {
      frameCount++
      fps30Throttle++

      // ~30fps throttle for performance
      if (fps30Throttle < 2) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      fps30Throttle = 0

      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio, 1)

      resizeCanvas(gl, canvas, 1, 1)

      gl.useProgram(program)

      gl.uniform2f(uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(uniforms('u_time'), frameCount * 0.016)
      gl.uniform1f(uniforms('u_aberration'), 0.8 + Math.sin(frameCount * 0.02) * 0.3)

      draw()
      rafRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [shouldRender])

  if (!shouldRender) {
    // CSS fallback for lite mode
    return (
      <div
        id={id}
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          backdropFilter: 'blur(12px) brightness(110%)',
          backgroundColor: 'rgba(255, 252, 242, 0.3)',
          mixBlendMode: 'screen',
        }}
      />
    )
  }

  return (
    <canvas
      id={id}
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-50"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  )
}
