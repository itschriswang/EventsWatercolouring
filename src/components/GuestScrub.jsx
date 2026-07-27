import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'

/**
 * A drag-to-set guest count, cut as a painter's measuring strip.
 *
 * The planner's numbers only mean something once you put your own room into
 * them, and a guest count is the one figure every couple already knows by
 * heart. It is also genuinely continuous — unlike the booked hours, which are
 * three fixed options and rightly stay three buttons — so it earns a control
 * you sweep through rather than a set of chips.
 *
 * The interaction is a native `<input type="range">` laid transparently over
 * the artwork. That is deliberate: it hands us keyboard support, touch
 * behaviour, screen-reader semantics and the platform's own value announcement
 * for free, none of which a div-with-pointer-handlers gets right. Everything
 * below the input is decoration and is hidden from assistive tech.
 *
 * The strip itself is drawn as paper rather than as UI chrome: ruled pigment
 * ticks on a cream ground, with the position marked by a wet blot bleeding
 * into the paper instead of a plastic thumb.
 */
export default function GuestScrub({ value, onChange, min = 20, max = 300, step = 10, label }) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const pct = ((value - min) / (max - min)) * 100

  // One tick per step, with a taller rule at each round hundred-ish interval so
  // the strip can be read at a glance instead of counting hairlines.
  const ticks = []
  for (let v = min; v <= max; v += step) {
    ticks.push({ v, major: v % 50 === 0 })
  }

  return (
    <div className="mt-7">
      <label
        htmlFor={`guests-${uid}`}
        className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft"
      >
        {label}
      </label>

      <div className="mt-3 flex items-baseline gap-2.5">
        {/* Deliberately not animated. The pieces counter above springs because
            it changes once per hour-button press; this one changes on every
            step of a live drag, where a per-value spring reads as flicker and
            re-mounts a node dozens of times a second. The blot and the reading
            line carry the motion instead. */}
        <span className="num-wide text-[clamp(1.75rem,2.6vw,2.25rem)] leading-none text-ink">
          {value}
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
          {value >= max ? 'guests or more' : 'guests'}
        </span>
      </div>

      <div className="relative mt-3 h-14 w-full max-w-md select-none">
        <div
          aria-hidden="true"
          className="paper-grain absolute inset-0 overflow-hidden rounded-lg border border-line shadow-[0_2px_10px_-4px_rgba(126,40,72,0.30)]"
          style={{
            background:
              'linear-gradient(160deg, #FFFDF9 0%, #FCFAF6 60%, #F8F4EC 100%)',
          }}
        >
          {/* Ruled ticks. Sage/chartreuse pigment rather than grey rules, so
              the strip stays inside the palette. */}
          {ticks.map(({ v, major }) => (
            <span
              key={v}
              className="absolute w-px -translate-x-1/2 rounded-full"
              style={{
                left: `${((v - min) / (max - min)) * 100}%`,
                top: major ? '32%' : '46%',
                bottom: '22%',
                background: major ? 'rgba(95,102,43,0.55)' : 'rgba(95,102,43,0.28)',
              }}
            />
          ))}

          {/* The wet blot: pigment pooled where the strip has been set,
              bleeding a little to either side the way a loaded brush would. */}
          <motion.span
            className="absolute top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply"
            animate={{ left: `${pct}%` }}
            transition={reduce ? { duration: 0 } : SPRING}
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(176,74,118,0.30), rgba(216,218,236,0.16) 52%, transparent 72%)',
              filter: 'blur(7px)',
            }}
          />

          {/* The reading line itself — a single confident stroke. */}
          <motion.span
            className="absolute top-[18%] bottom-[18%] w-[2.5px] -translate-x-1/2 rounded-full"
            animate={{ left: `${pct}%` }}
            transition={reduce ? { duration: 0 } : SPRING}
            style={{ background: 'linear-gradient(to bottom, #B04A76, #8C3656)' }}
          />
        </div>

        <input
          id={`guests-${uid}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={`${value}${value >= max ? ' or more' : ''} guests`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          // `pan-y` and not `none`: the page must still scroll when a vertical
          // swipe happens to start on the strip (it spans the column, so on a
          // phone that is easy to do), while a horizontal drag is left to the
          // slider instead of being read as a scroll gesture.
          style={{ touchAction: 'pan-y' }}
        />
      </div>
    </div>
  )
}
