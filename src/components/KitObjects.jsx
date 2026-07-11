import { useId } from 'react'
import { asset } from '../lib/site.js'

/**
 * Painted cut-outs for the "What's in my kit" fan (see MyKit.jsx). Each is a
 * self-contained SVG object drawn in the site's freehand voice: soft pastel
 * gradient bodies, a thin slate outline, a small paper-white highlight, and a
 * blurred burgundy contact shadow so the object reads as photographed on the
 * page rather than floating (the no-grey-shadows rule applies to these too).
 *
 * These are the stand-ins for real cut-out photographs: MyKit tries
 * assets/kit/<id>.webp/.png first and only falls back here, so replacing an
 * illustration is a file drop, not a code change.
 */

const INK = '#3F3552'

// Shared blurred contact shadow. Sits inside each object's own viewBox so a
// photo swap (which brings its own natural shadow) replaces both at once.
function ContactShadow({ cx, cy, rx, ry, blurId, opacity = 0.16 }) {
  return (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`rgba(126,40,72,${opacity})`} filter={`url(#${blurId})`} />
  )
}

function Blur({ id, dev = 3 }) {
  return (
    <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation={dev} />
    </filter>
  )
}

/** The desktop drawing board the kit fans out from — a beech A-frame table
 *  easel (kept cream/honey, never terracotta): a big tilted board resting in a
 *  front rail, propped by a ratchet-notched back support. It holds the
 *  portrait itself — that's me, taped to the board. */
export function EaselArt({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const wood = `easel-wood-${uid}`
  const woodDark = `easel-wood-dark-${uid}`
  const blur = `easel-blur-${uid}`
  const photo = `easel-photo-${uid}`
  return (
    <svg viewBox="0 0 300 300" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={wood} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E9D7" />
          <stop offset="100%" stopColor="#DEC9A6" />
        </linearGradient>
        <linearGradient id={woodDark} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0CDA9" />
          <stop offset="100%" stopColor="#C7B085" />
        </linearGradient>
        <Blur id={blur} dev={4} />
        {/* the portrait sits inside the board, a hair inset from the mount */}
        <clipPath id={photo}>
          <polygon points="97,61 229,61 212,197 79,197" />
        </clipPath>
      </defs>

      {/* board + base contact shadow */}
      <ContactShadow cx={150} cy={260} rx={120} ry={13} blurId={blur} />
      <ContactShadow cx={150} cy={256} rx={92} ry={9} blurId={blur} opacity={0.12} />

      {/* back support — pivot, angled strut, and the ratchet notches it drops
          into (the adjustable rail on this style of drawing board) */}
      <circle cx="244" cy="120" r="7" fill="#E8D6B6" stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      <polygon points="240,122 249,120 279,214 268,216" fill={`url(#${woodDark})`} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path
        d="M250,214 L250,204 L258,204 L258,196 L266,196 L266,188 L274,188 L274,214 Z"
        fill={`url(#${woodDark})`}
        stroke={INK}
        strokeOpacity="0.3"
        strokeWidth="1"
      />

      {/* board thickness — the face's offset shadow slab reads as a solid panel */}
      <polygon points="64,222 238,222 256,48 82,48" fill={`url(#${woodDark})`} stroke={INK} strokeOpacity="0.25" strokeWidth="1" />

      {/* the board face, tilted back a touch */}
      <polygon points="58,214 232,214 250,40 76,40" fill={`url(#${wood})`} stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      {/* faint wood grain following the board's lean */}
      <path d="M118,42 C114,90 110,150 101,213" stroke={INK} strokeOpacity="0.1" strokeWidth="1.2" fill="none" />
      <path d="M166,42 C162,90 158,150 149,213" stroke={INK} strokeOpacity="0.1" strokeWidth="1.2" fill="none" />

      {/* the portrait, mounted and taped to the board — that's me */}
      <polygon points="92,56 234,56 216,202 74,202" fill="#FFFDF7" stroke="#E1D6E0" strokeWidth="1" />
      <image
        href={asset('assets/portrait-christopher.jpg')}
        x="74"
        y="54"
        width="160"
        height="148"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${photo})`}
      />
      {/* washi tape at the top corners, holding the print down */}
      <rect x="80" y="52" width="36" height="12" rx="1" fill="rgba(242,194,207,0.62)" transform="rotate(-40 96 60)" />
      <rect x="212" y="50" width="36" height="12" rx="1" fill="rgba(214,205,236,0.6)" transform="rotate(40 228 58)" />

      {/* front base rail the board rests in — top face + front face, with a few
          finger-joint lines nodding to the board's dovetailed corners */}
      <polygon points="48,210 250,210 264,224 32,224" fill={`url(#${wood})`} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <polygon points="32,224 264,224 258,242 38,242" fill={`url(#${woodDark})`} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path d="M36,229 h12 M36,233.5 h12 M36,238 h12" stroke={INK} strokeOpacity="0.22" strokeWidth="0.9" fill="none" />
      <path d="M250,229 h12 M250,233.5 h12 M250,238 h12" stroke={INK} strokeOpacity="0.22" strokeWidth="0.9" fill="none" />
      {/* little feet */}
      <rect x="44" y="242" width="16" height="6" rx="2" fill={`url(#${woodDark})`} stroke={INK} strokeOpacity="0.28" strokeWidth="1" />
      <rect x="240" y="242" width="16" height="6" rx="2" fill={`url(#${woodDark})`} stroke={INK} strokeOpacity="0.28" strokeWidth="1" />
    </svg>
  )
}

/** Two well-loved rounds, one still loaded with rose, one with the site's
 *  chartreuse — crossed the way they land on the desk between guests. */
export function BrushesArt({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const handle = `brush-handle-${uid}`
  const metal = `brush-metal-${uid}`
  const blur = `brush-blur-${uid}`
  return (
    <svg viewBox="0 0 220 150" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={handle} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6EDDD" />
          <stop offset="100%" stopColor="#E0CFAE" />
        </linearGradient>
        <linearGradient id={metal} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAE5F1" />
          <stop offset="100%" stopColor="#C4BCD4" />
        </linearGradient>
        <Blur id={blur} />
      </defs>

      <ContactShadow cx={110} cy={132} rx={88} ry={9} blurId={blur} />

      {/* brush one — rose on the tip */}
      <g transform="rotate(-9 110 62)">
        <path
          d="M12,56 C40,51 104,50 126,55 L126,67 C104,71 40,70 12,65 Z"
          fill={`url(#${handle})`}
          stroke={INK}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <path d="M126,53.5 L150,55.5 L150,66.5 L126,68.5 Z" fill={`url(#${metal})`} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M131,54.2 L131,67.8 M136,54.6 L136,67.4" stroke={INK} strokeOpacity="0.2" strokeWidth="1" fill="none" />
        <path
          d="M150,55.5 C162,52.5 174,55 184,61 C174,67 162,69.5 150,66.5 Z"
          fill="#EAD9C0"
          stroke={INK}
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <path d="M168,55.8 C175,57 181,58.8 184,61 C181,63.2 175,65 168,66.2 C171.5,62.8 171.5,59.2 168,55.8 Z" fill="#C1608C" />
      </g>

      {/* brush two — chartreuse, lying the other way */}
      <g transform="rotate(7 110 98)">
        <path
          d="M208,92 C180,87 116,86 94,91 L94,103 C116,107 180,106 208,101 Z"
          fill={`url(#${handle})`}
          stroke={INK}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <path d="M94,89.5 L70,91.5 L70,102.5 L94,104.5 Z" fill={`url(#${metal})`} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M89,90.2 L89,103.8 M84,90.6 L84,103.4" stroke={INK} strokeOpacity="0.2" strokeWidth="1" fill="none" />
        <path
          d="M70,91.5 C58,88.5 46,91 36,97 C46,103 58,105.5 70,102.5 Z"
          fill="#EAD9C0"
          stroke={INK}
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <path d="M52,91.8 C45,93 39,94.8 36,97 C39,99.2 45,101 52,102.2 C48.5,98.8 48.5,95.2 52,91.8 Z" fill="#B0AC42" />
      </g>
    </svg>
  )
}

/** The sketch pencil — chartreuse-bodied (the yellows lean green here, never
 *  gold), sharpened long the way a five-line sketch wants it. */
export function PencilArt({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const body = `pencil-body-${uid}`
  const blur = `pencil-blur-${uid}`
  return (
    <svg viewBox="0 0 200 70" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFEFA0" />
          <stop offset="100%" stopColor="#C9CD7C" />
        </linearGradient>
        <Blur id={blur} dev={2.5} />
      </defs>

      <ContactShadow cx={100} cy={57} rx={82} ry={6} blurId={blur} />

      {/* blush eraser nub + lilac band */}
      <path d="M8,30 C4,31.5 4,40.5 8,42 L16,43 L16,29 Z" fill="#F2C2CF" stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path d="M16,29 L28,28.5 L28,43.5 L16,43 Z" fill="#C9C2D6" stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path d="M20,28.7 L20,43.3 M24,28.6 L24,43.4" stroke={INK} strokeOpacity="0.2" strokeWidth="0.8" fill="none" />

      {/* hex body with two facet lines */}
      <path d="M28,28.5 L150,25 L150,47 L28,43.5 Z" fill={`url(#${body})`} stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      <path d="M28,33.5 L150,32.2 M28,38.5 L150,39.8" stroke={INK} strokeOpacity="0.14" strokeWidth="1" fill="none" />

      {/* sharpened wood + graphite */}
      <path d="M150,25 L184,36 L150,47 Z" fill="#F3E9D7" stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      <path d="M172,32.1 L184,36 L172,39.9 Z" fill={INK} />
    </svg>
  )
}

/** Soft white eraser in its periwinkle sleeve — barely worn. */
export function EraserArt({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const bodyG = `eraser-body-${uid}`
  const blur = `eraser-blur-${uid}`
  return (
    <svg viewBox="0 0 130 92" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={bodyG} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDFBF5" />
          <stop offset="100%" stopColor="#ECE6F0" />
        </linearGradient>
        <Blur id={blur} dev={2.5} />
      </defs>

      <ContactShadow cx={62} cy={76} rx={46} ry={7} blurId={blur} />

      {/* body — a soft block with one worn, rounded corner */}
      <path
        d="M16,40 L78,27 C88,25 96,29 98,38 L102,54 C104,62 98,69 89,69 L28,69 C19,69 13,63 13,54 Z"
        fill={`url(#${bodyG})`}
        stroke={INK}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* periwinkle sleeve over the back half */}
      <path
        d="M16,40 L58,31.5 L64,69 L28,69 C19,69 13,63 13,54 Z"
        fill="#9BA3CC"
        stroke={INK}
        strokeOpacity="0.3"
        strokeWidth="1"
      />
      <text
        x="36"
        y="56"
        fontFamily="'Mynerve', cursive"
        fontSize="11"
        fill="#FFFDF7"
        transform="rotate(-7 36 56)"
      >
        soft
      </text>
    </svg>
  )
}

/** The water spritzer — periwinkle glass with a lilac trigger head. */
export function SpritzerArt({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const glass = `spritz-glass-${uid}`
  const head = `spritz-head-${uid}`
  const blur = `spritz-blur-${uid}`
  return (
    <svg viewBox="0 0 110 190" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={glass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCE1F2" />
          <stop offset="100%" stopColor="#B4BEE0" />
        </linearGradient>
        <linearGradient id={head} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9CCE8" />
          <stop offset="100%" stopColor="#AC9CC6" />
        </linearGradient>
        <Blur id={blur} />
      </defs>

      <ContactShadow cx={55} cy={180} rx={36} ry={7} blurId={blur} />

      {/* bottle */}
      <path
        d="M32,70 C26,70 22,75 22,81 L22,158 C22,170 30,177 42,177 L68,177 C80,177 88,170 88,158 L88,81 C88,75 84,70 78,70 Z"
        fill={`url(#${glass})`}
        stroke={INK}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* water line */}
      <path d="M23,104 C42,100 68,108 87,103 L87,158 C87,169 80,176 68,176 L42,176 C31,176 23,169 23,158 Z" fill="#A9B5DC" opacity="0.55" />
      {/* highlight */}
      <rect x="30" y="82" width="6" height="80" rx="3" fill="#FFFDF7" opacity="0.5" />

      {/* neck + pump head + nozzle + trigger */}
      <rect x="44" y="52" width="22" height="18" fill="#C9BCD9" stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path
        d="M40,30 C40,22 48,17 58,17 L74,17 C80,17 84,21 84,27 L84,42 C84,48 80,52 74,52 L46,52 C42,52 40,49 40,45 Z"
        fill={`url(#${head})`}
        stroke={INK}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <path d="M40,24 L24,26 L24,34 L40,36 Z" fill="#C9BCD9" stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path
        d="M29,36 C25,47 27,58 34,65 L42,60 C36,54 35,45 38,37 Z"
        fill="#A28FBE"
        stroke={INK}
        strokeOpacity="0.3"
        strokeWidth="1"
      />
    </svg>
  )
}

/** Two crimped tubes of professional pigment — rose and chartreuse labels,
 *  burgundy caps (the palette's deep decorative anchor). */
export function TubesArt({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const metalG = `tube-metal-${uid}`
  const blur = `tube-blur-${uid}`
  const tube = (swatch, cap) => (
    <>
      <rect x="10" y="40" width="16" height="20" rx="2.5" fill={cap} stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      <path d="M26,42 L34,39 L34,61 L26,58 Z" fill={`url(#${metalG})`} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path
        d="M34,38 C64,34 102,33.5 128,36.5 L131,60.5 C102,66 64,66 36,62 Z"
        fill={`url(#${metalG})`}
        stroke={INK}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <path d="M128,36.5 L138,35.5 L138,62 L131,60.5 Z" fill="#C9C2D6" stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <path d="M131.5,36.3 L131.5,61 M134.5,36 L134.5,61.4" stroke={INK} strokeOpacity="0.25" strokeWidth="0.8" fill="none" />
      {/* label */}
      <rect x="46" y="40" width="72" height="19" rx="3" fill="#FFFDF7" stroke="#E1D6E0" strokeWidth="1" />
      <circle cx="58" cy="49.5" r="5.5" fill={swatch} />
      <rect x="68" y="44.5" width="40" height="3" rx="1.5" fill={INK} opacity="0.35" />
      <rect x="68" y="51.5" width="28" height="3" rx="1.5" fill={INK} opacity="0.2" />
    </>
  )
  return (
    <svg viewBox="0 0 190 130" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={metalG} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2EFE8" />
          <stop offset="100%" stopColor="#D5CFDF" />
        </linearGradient>
        <Blur id={blur} />
      </defs>
      <ContactShadow cx={95} cy={116} rx={72} ry={8} blurId={blur} />
      <g transform="rotate(-5 80 50)">{tube('#C1608C', '#7E2848')}</g>
      <g transform="translate(24 40) rotate(4 80 50)">{tube('#B0AC42', '#96385A')}</g>
    </svg>
  )
}

/** The travel tin, open — mixing lid up top, and pans cycling the whole
 *  pastel arc below (the keepsake swatches keep their full lowkey rainbow,
 *  warms included). */
export function PaletteArt({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const tin = `palette-tin-${uid}`
  const blur = `palette-blur-${uid}`
  const smear = `palette-smear-${uid}`
  // The full arc in blending order: apricot → butter → chartreuse → sage →
  // periwinkle → lilac → blush → candy rose → warm orange → apricot cream.
  const pans = [
    '#F7C394', '#F2E28E', '#D8DC8F', '#B7C69A', '#9BA3CC', '#C9B5E4',
    '#F2C2CF', '#E58FB1', '#C1608C', '#E89B63', '#EFD9A8', '#EFEFA0',
  ]
  return (
    <svg viewBox="0 0 260 156" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={tin} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4F1F7" />
          <stop offset="100%" stopColor="#D8D1E2" />
        </linearGradient>
        <Blur id={blur} dev={3.5} />
        <filter id={smear} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      <ContactShadow cx={130} cy={142} rx={100} ry={8} blurId={blur} />

      {/* lid — the mixing surface, already carrying a bit of the night */}
      <rect x="22" y="12" width="216" height="54" rx="9" fill={`url(#${tin})`} stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      <rect x="30" y="19" width="200" height="40" rx="6" fill="#FFFDF7" stroke="#E1D6E0" strokeWidth="1" />
      <ellipse cx="86" cy="38" rx="26" ry="9" fill="#E58FB1" opacity="0.3" filter={`url(#${smear})`} />
      <ellipse cx="150" cy="42" rx="22" ry="8" fill="#D8DC8F" opacity="0.35" filter={`url(#${smear})`} />
      <ellipse cx="196" cy="35" rx="18" ry="7" fill="#9BA3CC" opacity="0.25" filter={`url(#${smear})`} />

      {/* hinge */}
      <rect x="78" y="64" width="22" height="7" rx="2" fill="#C9C2D6" />
      <rect x="160" y="64" width="22" height="7" rx="2" fill="#C9C2D6" />

      {/* base with the pans */}
      <rect x="22" y="70" width="216" height="64" rx="9" fill={`url(#${tin})`} stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      {pans.map((c, i) => {
        const col = i % 6
        const row = Math.floor(i / 6)
        const x = 32 + col * 33
        const y = 77 + row * 26
        return (
          <g key={c + i}>
            <rect x={x} y={y} width="29" height="22" rx="4" fill="#FFFDF7" stroke="#E1D6E0" strokeWidth="1" />
            <rect x={x + 3} y={y + 3} width="23" height="16" rx="3" fill={c} />
          </g>
        )
      })}
    </svg>
  )
}
