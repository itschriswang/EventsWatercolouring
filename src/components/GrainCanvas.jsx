import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { webglSupported, getContext, createQuadProgram, resizeCanvas } from '../lib/webgl.js'
import { GLSL_PRECISION, GLSL_NOISE, GLSL_PAPER } from '../lib/watercolour.js'
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
 * The height field is `paperHeight()` from `lib/watercolour.js`, the same one
 * BloomCanvas granulates its wash into (Curtis et al. §4.1/§4.5). That's the
 * point of sharing it: this layer darkens the hollows of the sheet and the
 * wash deposits its pigment in those same hollows, so the page reads as one
 * piece of paper rather than a wash with an unrelated noise laid over it.
 *
 * Falls back to the SVG GrainOverlay when WebGL is unavailable.
 */

const FRAG = `
${GLSL_PRECISION}
  uniform vec2 u_res;
  uniform float u_seed;
  uniform float u_px;   // device pixels per CSS pixel

${GLSL_NOISE}
${GLSL_PAPER}

  void main(){
    // In CSS pixels: paper tooth is a physical size, so it should look the
    // same on a retina screen and merely be rasterised more finely — and it
    // has to match the scale BloomCanvas samples the sheet at, which renders
    // into a half-resolution buffer.
    vec2 p = gl_FragCoord.xy / u_px + u_seed;
    // Keep it a gentle darkening grain for the multiply blend: values sit high,
    // dipping toward mid-grey where the paper's hollows are.
    float g = mix(0.62, 1.0, paperHeight(p));
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
    // DPR capped at 1 off the heavy tier: retina grain on a phone means
    // rasterising ~4x the pixels for a texture that reads identically at
    // this opacity, and the buffer lives for the whole session.
    const maxDpr = heavyFx ? 2 : 1
    const render = () => {
      resizeCanvas(gl, canvas, 1, maxDpr)
      gl.useProgram(prog.program)
      gl.uniform2f(prog.uniforms('u_res'), canvas.width, canvas.height)
      gl.uniform1f(prog.uniforms('u_px'), canvas.width / Math.max(1, canvas.clientWidth))
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
      // zoom-mute: a fixed multiply layer re-composited over the whole page
      // glitches white during pinch-zoom re-raster, and the noise is
      // screen-space — magnified grain is wrong anyway (see index.css).
      className="zoom-mute pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[0.075] mix-blend-multiply"
    />
  )
}
