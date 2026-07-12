import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'
import GrainOverlay from './GrainOverlay.jsx'

/**
 * GrainCanvas — the fuzzy paper texture, rendered on the GPU.
 *
 * The SVG version (GrainOverlay) runs an feTurbulence filter graph and was
 * restricted to fine-pointer desktops because of its cost. This draws the
 * same grain as a single procedural-noise fragment pass: cheap enough to also
 * carry the texture onto touch devices, where it was previously dropped
 * entirely. The grain is static — painted once and on resize — so there's no
 * per-frame work; on desktop it settles subtly as you scroll.
 *
 * Falls back to the SVG GrainOverlay when WebGL is unavailable.
 */

const FRAG = `
  precision mediump float;
  uniform vec2 u_res;
  uniform float u_seed;

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

  void main(){
    vec2 p = gl_FragCoord.xy + u_seed;
    // Fine speckle plus a coarser mottle, matching feTurbulence's fractal feel.
    float fine = hash(p);
    float mott = vnoise(p * 0.18);
    float g = mix(fine, mott, 0.35);
    // Keep it a gentle darkening grain for the multiply blend: values sit high,
    // dipping toward mid-grey in the speckles.
    g = mix(0.62, 1.0, g);
    gl_FragColor = vec4(vec3(g), 1.0);
  }
`

export default function GrainCanvas() {
  const reduce = useReducedMotion()
  const heavyFx = useHeavyFx()
  const canvasRef = useRef(null)
  const supported = webglSupported()

  useEffect(() => {
    if (!supported) return
    const canvas = canvasRef.current
    const gl = getContext(canvas)
    if (!gl) return
    const prog = createQuadProgram(gl, FRAG)
    if (!prog) return

    let seed = 0
    const render = () => {
      resizeCanvas(gl, canvas, 1, 2)
      gl.useProgram(prog.program)
      gl.uniform2f(prog.uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(prog.uniforms('u_seed'), seed)
      prog.draw()
    }
    render()

    const onResize = () => render()
    window.addEventListener('resize', onResize)

    // Desktop-only: let the grain "settle" as the page scrolls — re-seed on a
    // throttled rAF while scrolling, then leave it be. Skipped under
    // reduced-motion and on touch devices, where the grain stays perfectly
    // static (no per-frame or per-scroll work).
    let scrollRaf = 0
    const animate = heavyFx && !reduce
    const onScroll = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        seed = (seed + 17.0) % 512.0
        render()
      })
    }
    if (animate) window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      if (animate) window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(scrollRaf)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [supported, heavyFx, reduce])

  if (!supported) return <GrainOverlay />

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[0.075] mix-blend-multiply"
    />
  )
}
