import { useReducedMotion } from 'framer-motion'
import { Drop } from './Label.jsx'
import { MARQUEE } from '../content.js'

/**
 * Keepsake ribbon — a slow, full-bleed editorial marquee that carries the
 * hero's promise down into the story. One phrase set per track, separated by
 * orchid glyphs, duplicated once so the CSS loop (translateX 0 → -50%) never
 * shows a seam. Reduced-motion gets the same ribbon standing still, and the
 * duplicate track is aria-hidden either way so the copy only reads out once.
 */
export default function Marquee() {
  const reduce = useReducedMotion()

  const track = (hidden) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {MARQUEE.map((phrase, i) => (
        <li key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap font-sentient text-[clamp(1.15rem,2.2vw,1.75rem)] italic tracking-[-0.01em] text-rust">
            {phrase}
          </span>
          <Drop
            className="mx-[clamp(1.25rem,3vw,2.5rem)] h-6 w-auto opacity-70"
            gradient={['#C2613C', '#C9A23A']}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className="relative z-10 overflow-hidden border-y border-line/70 bg-paper-deep/40 py-[clamp(0.8rem,1.6vw,1.3rem)]"
      // Feather both ends so phrases surface out of the paper rather than
      // getting guillotined at the viewport edge.
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }}
    >
      <div
        className="flex w-max items-center"
        style={reduce ? undefined : { animation: 'marquee-scroll 36s linear infinite' }}
      >
        {track(false)}
        {track(true)}
      </div>
    </div>
  )
}
