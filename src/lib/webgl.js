// Minimal WebGL helpers shared by the live watercolour layers (BloomCanvas,
// GrainCanvas). Raw WebGL on purpose: the whole site ships only React +
// Framer Motion, and these are 2D full-screen-quad fragment shaders — a
// Three.js/OGL dependency would dwarf the code it runs. Everything here is
// defensive: any failure returns null so callers fall back to the static CSS
// blooms / SVG grain rather than throwing.

/** Cheap feature probe. Cached because creating a throwaway context isn't free. */
let _supported
export function webglSupported() {
  if (_supported !== undefined) return _supported
  try {
    const c = document.createElement('canvas')
    _supported = !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    )
  } catch {
    _supported = false
  }
  return _supported
}

export function getContext(canvas) {
  const opts = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }
  return canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts) || null
}

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // Surface the reason in dev; production simply falls back.
    if (import.meta.env.DEV) console.warn('[webgl] shader compile failed:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

/**
 * Build a program from a fragment shader that draws a full-screen quad. Returns
 * { program, draw, uniforms } or null on any failure. `draw()` binds the quad
 * and issues the two-triangle draw call; look up uniform locations lazily via
 * `uniforms(name)`.
 */
export function createQuadProgram(gl, fragSrc) {
  const vertSrc = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `
  const vs = compile(gl, gl.VERTEX_SHADER, vertSrc)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) console.warn('[webgl] link failed:', gl.getProgramInfoLog(program))
    return null
  }

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  // Two triangles covering clip space.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const loc = gl.getAttribLocation(program, 'a_pos')
  const cache = new Map()
  const uniforms = (name) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name))
    return cache.get(name)
  }

  const draw = () => {
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  return { program, draw, uniforms }
}

/**
 * Size a canvas's drawing buffer to its CSS box at a chosen pixel ratio, only
 * touching the DOM when the size actually changed. `scale` (<1) renders fewer
 * pixels — invisible for soft blooms, a real win for fill-rate. Returns true
 * when a resize happened so callers can re-set the viewport.
 */
export function resizeCanvas(gl, canvas, scale = 1, maxDpr = 1) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr * scale))
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr * scale))
  if (canvas.width === w && canvas.height === h) return false
  canvas.width = w
  canvas.height = h
  gl.viewport(0, 0, w, h)
  return true
}
