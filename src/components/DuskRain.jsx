import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * DuskRain — condensation running down the evening timeline's "window".
 * Droplets bead up on the dark dusk ground, slide downward in the stuttering
 * run-pause-run way water actually moves on glass, and leave soft trails that
 * evaporate behind them.
 *
 * A 2D canvas, not WebGL: this is a couple dozen radial-gradient beads and a
 * per-frame fade, well under the budget where a shader earns its keep. It
 * follows the site's effect ladder:
 *  - heavyFx + motion allowed → the live rAF loop, paused whenever the
 *    section is off-screen or the tab is hidden;
 *  - otherwise → a static dew field painted once (settled droplets with the
 *    streaks of finished runs), so lite devices get stillness, not absence.
 * Colours stay on the palette (cream catchlight → periwinkle body → deep-ink
 * rim) so the water reads as dusk light on glass, never grey.
 */

const MAX_DROPS = 16
// Render at half resolution when animating — the resulting softness reads as
// glass blur, and it quarters the pixels the per-frame trail fade touches
// (this canvas spans the whole tall section).
const LIVE_RES = 0.5
// Water on glass is slow; ~30fps halves the work with no visible cost.
const FRAME_MS = 33

const rand = (a, b) => a + Math.random() * (b - a)

// One bead, drawn in CSS-px space. Slightly taller than wide (surface
// tension), a pinpoint catchlight up and to the left where the dusk light
// would sit.
function drawBead(ctx, x, y, r, a) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.5, r * 0.12, x, y, r)
  g.addColorStop(0, `rgba(255,252,242,${0.9 * a})`)
  g.addColorStop(0.45, `rgba(216,218,236,${0.55 * a})`)
  g.addColorStop(0.82, `rgba(175,140,230,${0.3 * a})`)
  g.addColorStop(1, `rgba(63,53,82,${0.22 * a})`)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(x, y, r * 0.84, r, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(255,252,242,${0.85 * a})`
  ctx.beginPath()
  ctx.arc(x - r * 0.3, y - r * 0.45, Math.max(0.5, r * 0.16), 0, Math.PI * 2)
  ctx.fill()
}

// The thinning streak a finished run leaves above a settled bead — static
// tier only; the live loop grows real trails via the per-frame fade instead.
function drawRun(ctx, x, y, r, a, len) {
  const steps = Math.max(2, Math.round(len / (r * 1.6)))
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    drawBead(ctx, x + Math.sin(i * 1.7) * r * 0.4, y - i * r * 1.6, r * (1 - t * 0.55), a * (1 - t) * 0.5)
  }
}

export default function DuskRain({ className = '' }) {
  const ref = useRef(null)
  const heavy = useHeavyFx()
  const reduce = useReducedMotion()
  const animated = heavy && !reduce

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const scale = animated ? LIVE_RES * dpr : Math.min(dpr, 1)

    let raf = 0
    let running = false
    let inView = false
    let last = 0
    let spawnIn = 0.8
    const drops = []

    const makeDrop = (y) => ({
      x: rand(0.02, 0.98) * canvas.clientWidth,
      y,
      r: rand(2.2, 4.6),
      phase: rand(0, Math.PI * 2),
      wobble: rand(1.2, 2.6),
      a: rand(0.45, 0.85),
      run: true,
      // run/rest timer — the stutter is what sells "water", not the speed
      hold: rand(0.5, 2),
      ttl: rand(14, 30),
    })

    const paintStill = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      const n = Math.min(48, Math.max(14, Math.round((w * h) / 60000)))
      for (let i = 0; i < n; i++) {
        const r = rand(1.6, 4.2)
        const x = rand(0.02, 0.98) * w
        const y = rand(0.03, 0.97) * h
        // every few beads sit at the foot of an old run
        if (i % 4 === 0) drawRun(ctx, x, y, r, 0.5, rand(30, 90))
        drawBead(ctx, x, y, r, rand(0.35, 0.7))
      }
    }

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale))
      const h = Math.max(1, Math.round(canvas.clientHeight * scale))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      if (!animated) paintStill()
    }

    const step = (t) => {
      raf = requestAnimationFrame(step)
      if (t - last < FRAME_MS) return
      const dt = Math.min(0.1, (t - last) / 1000)
      last = t
      const h = canvas.clientHeight

      // Fade everything a touch toward transparent — this is what turns the
      // beads' previous positions into evaporating trails.
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()

      spawnIn -= dt
      if (spawnIn <= 0 && drops.length < MAX_DROPS) {
        // condensation forms anywhere on the pane, not just the top edge
        drops.push(makeDrop(rand(-0.02, 0.5) * h))
        spawnIn = rand(0.7, 1.8)
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]
        d.hold -= dt
        if (d.hold <= 0) {
          d.run = !d.run
          d.hold = d.run ? rand(0.5, 2.4) : rand(0.3, 1.6)
        }
        // bigger drops are heavier and run faster; resting drops still creep
        const v = (d.run ? 1 : 0.05) * d.r * 14
        d.phase += dt * d.wobble
        d.y += v * dt
        d.x += Math.sin(d.phase) * d.r * 0.5 * dt * (d.run ? 1 : 0.1)
        d.ttl -= dt
        if (d.y > h + 8 || d.ttl <= 0) {
          // no explicit erase needed — the trail fade evaporates its pixels
          drops.splice(i, 1)
          continue
        }
        drawBead(ctx, d.x, d.y, d.r, d.a)
      }
    }

    // Only burn frames while the section is actually on screen in a visible tab.
    const sync = () => {
      const should = animated && inView && !document.hidden
      if (should && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(step)
      } else if (!should && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let io
    if (animated) {
      for (let i = 0; i < 6; i++) drops.push(makeDrop(Math.random() * canvas.clientHeight * 0.8))
      io = new IntersectionObserver(
        ([e]) => {
          inView = e.isIntersecting
          sync()
        },
        { rootMargin: '10%' }
      )
      io.observe(canvas)
      document.addEventListener('visibilitychange', sync)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io?.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [animated])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={'pointer-events-none absolute inset-0 h-full w-full ' + className}
    />
  )
}
