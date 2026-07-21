/**
 * Desk ephemera — the small physical props of the painter's-desk fiction:
 * washi tape holding prints to the wall, a paperclip on a note. Purely
 * decorative (aria-hidden), positioned by the caller. Tints stay on the
 * pastel arc and shadows stay tinted (no-grey-shadows rule); the gallery is
 * a multi-hue "keepsake" zone, so tape may cycle the whole arc, warms
 * included.
 */

// Tape tints along the arc, translucent enough for the print to read through.
export const TAPE_TINTS = [
  'rgba(240,168,120,0.5)', // apricot
  'rgba(236,222,128,0.5)', // butter (leaning green, never gold)
  'rgba(206,222,124,0.5)', // yellow-green
  'rgba(176,184,225,0.5)', // periwinkle
  'rgba(238,160,190,0.5)', // blush
]

/**
 * A short strip of translucent washi tape: pastel tint under faint weave
 * stripes, torn ends via a ragged clip polygon. Size/rotate/position via
 * className; pair with an `overflow-hidden` parent so the ends crop at the
 * card edge and the strip reads as wrapping over it.
 */
export function WashiTape({ tint = TAPE_TINTS[0], className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={'pointer-events-none absolute h-6 w-24 ' + className}
      style={{
        background:
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 2px, rgba(255,255,255,0) 2px 7px), ' +
          tint,
        boxShadow: '0 1px 5px rgba(126,40,72,0.18)',
        clipPath:
          'polygon(0% 8%, 4% 0%, 96% 2%, 100% 12%, 97% 50%, 100% 88%, 95% 100%, 5% 98%, 0% 90%, 3% 46%)',
      }}
    />
  )
}

/**
 * A wire paperclip in the palette's rose-metal (claret gradient, never
 * silver/grey). Hang it over a card's top edge from an unclipped ancestor —
 * inside an `overflow-hidden` card the poking half would be cut off.
 */
export function PaperClip({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 34" fill="none" className={className}>
      <defs>
        <linearGradient id="ephemera-clip-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D9A0B2" />
          <stop offset="1" stopColor="#96385A" />
        </linearGradient>
      </defs>
      <path
        d="M6 6 v18 a4.5 4.5 0 0 0 9 0 V7.5 a3 3 0 0 0 -6 0 v15 a1.5 1.5 0 0 0 3 0 V9"
        stroke="url(#ephemera-clip-metal)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
