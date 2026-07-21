import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * Pigment trail — the cursor drags a faint wash of colour across the paper,
 * as if the visitor were moving a wet brush over the page. A fixed 2D canvas
 * in multiply blend between the bloom layers (z 2) and the content (z 10),
 * so the pigment only ever tints the paper's negative space — it can never
 * wash over type or the opaque cards.
 *
 * Heavy-fx fine-pointer devices only (there is no cursor to trail on touch),
 * skipped under reduced motion; everyone else simply never mounts it — the
 * page is complete without it. The rAF loop runs only while there is wet
 * paint on the canvas: it parks itself once the trail has fully faded and a
 * pointer move wakes it again.
 */

// The pastel arc in blending order. The trail's hue walks this loop with
// distance travelled, so the smear behind a moving cursor always blends
// hue neighbours, never complements (anti-mud rules).
const ARC = [
  [247, 195, 148], // apricot
  [242, 233, 130], // butter
  [212, 226, 130], // yellow-green
  [196, 202, 235], // periwinkle
  [210, 196, 232], // lilac
  [244, 196, 210], // blush
]
const STEP_PX = 14 // spacing of daubs along the pointer's path
const HUE_WALK_PX = 900 // distance for one step along the arc
const FADE_ALPHA = 0.05 // per-frame fade → a trail lives ~1.5s
const RADIUS = 26

export default function PigmentTrail() {
  const heavy = useHeavyFx()
  const reduce = useReducedMotion()
  const canvasRef = useRef(null)
  const active = heavy && !reduce

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    // DPR capped: pigment is soft-edged, so extra resolution buys nothing.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let running = false
    let wetFrames = 0 // frames left until the canvas is fully faded
    let last = null // previous pointer sample, in CSS px
    let travelled = 0 // cumulative distance, drives the hue walk
    const pending = [] // daub positions queued for the next frame

    const colourAt = (d) => {
      const t = (d / HUE_WALK_PX) % ARC.length
      const i = Math.floor(t)
      const f = t - i
      const a = ARC[i]
      const b = ARC[(i + 1) % ARC.length]
      return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
      ]
    }

    const frame = () => {
      // Fade what's there, then lay the queued daubs on top.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = `rgba(0,0,0,${FADE_ALPHA})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      while (pending.length) {
        const p = pending.shift()
        const [r, g, b] = p.colour
        const grad = ctx.createRadialGradient(
          p.x * dpr, p.y * dpr, 0,
          p.x * dpr, p.y * dpr, RADIUS * dpr,
        )
        grad.addColorStop(0, `rgba(${r},${g},${b},0.09)`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x * dpr, p.y * dpr, RADIUS * dpr, 0, Math.PI * 2)
        ctx.fill()
        wetFrames = Math.ceil(1 / FADE_ALPHA) * 3
      }
      if (wetFrames > 0) {
        wetFrames -= 1
        raf = requestAnimationFrame(frame)
      } else {
        // Fully faded — clear any residue and park until the next move.
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        running = false
      }
    }

    const wake = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }

    const onMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      if (!last) {
        last = { x, y }
        return
      }
      const dx = x - last.x
      const dy = y - last.y
      const dist = Math.hypot(dx, dy)
      if (dist < STEP_PX) return
      // Daub along the path so fast sweeps leave a stroke, not dots.
      const steps = Math.min(Math.floor(dist / STEP_PX), 8)
      for (let s = 1; s <= steps; s++) {
        const f = s / steps
        travelled += dist / steps
        pending.push({
          x: last.x + dx * f,
          y: last.y + dy * f,
          colour: colourAt(travelled),
        })
      }
      last = { x, y }
      wake()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full mix-blend-multiply"
      style={{ zIndex: 2 }}
    />
  )
}
