import { useId } from 'react'
import { motion } from 'framer-motion'
import { SPRING, SPRING_SOFT, asset } from '../lib/site.js'
import { ENQUIRY } from '../content.js'

/**
 * The enquiry confirmation as a mailed postcard (see EnquireForm.jsx). The
 * metaphor runs seal → postcard → delivered: the wax seal is pressed on
 * submit, the reply card floods with pigment, and this postcard settles onto
 * the sheet as the proof the message is on its way — thank-you note on the
 * left, a keepsake-printed stamp and a smudged burgundy postmark carrying
 * today's date on the right.
 *
 * Entrance is staged like real mail: the card lays down first (a soft
 * perspective unfold), the stamp is pressed on, then the postmark thumps
 * over it on a quick ease-out — deliberately not a spring, a rubber stamp
 * doesn't bounce. Under reduced motion every stage becomes a plain fade.
 */
export default function Postcard({ firstName = '', reduce = false }) {
  const C = ENQUIRY.confirm
  const P = C.postcard
  // Postmarks print the date the office cancelled the stamp — today. Built
  // by hand rather than toLocaleDateString: some locales abbreviate
  // September as "Sept", which would break the two-line split below.
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const now = new Date()
  const dateStamp = `${String(now.getDate()).padStart(2, '0')} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  const fadeOnly = (delay) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: delay * 0.5 } }
      : null

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        {...(fadeOnly(0.15) || {
          initial: { opacity: 0, rotateX: -14, y: 22, scale: 0.97 },
          animate: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
          transition: { ...SPRING_SOFT, delay: 0.15 },
        })}
        className="relative max-w-2xl -rotate-1"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card stock: cream face over a hair of visible edge below, so the
            card reads as thick paper laid on the sheet, not a printed box. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-1 -bottom-[3px] top-2 rounded-[5px] bg-[#EFE6DA]"
        />
        <div className="paper-grain relative overflow-hidden rounded-[4px] border border-line/70 bg-[#FFFDF7] shadow-[0_24px_50px_-20px_rgba(126,40,72,0.32)]">
          {/* the faintest wash so the card isn't flat white */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 12% 0%, rgba(242,194,207,0.10) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 100% 100%, rgba(214,205,236,0.10) 0%, transparent 55%)',
            }}
          />

          <div className="relative grid grid-cols-1 sm:grid-cols-[1.15fr_1fr]">
            {/* Message side */}
            <div className="p-6 sm:p-7">
              <h3 className="font-sentient text-2xl tracking-[-0.03em] text-ink sm:text-3xl">
                {C.title}
                {firstName && <span className="text-terracotta">, {firstName}</span>}.
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft sm:text-base">
                {C.body}
              </p>
              {C.sign && (
                <motion.p
                  {...(fadeOnly(0.5) || {
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                    transition: { ...SPRING, delay: 0.55 },
                  })}
                  className="mt-5 font-mono text-3xl italic text-terracotta"
                >
                  {C.sign}
                </motion.p>
              )}
            </div>

            {/* Address side — dashed divider like a real postcard's centre
                rule, stamp and postmark up top, address lines below. */}
            <div className="relative min-h-[15rem] border-t border-dashed border-ink/20 p-6 sm:border-l sm:border-t-0 sm:p-7">
              <motion.div
                {...(fadeOnly(0.4) || {
                  initial: { opacity: 0, scale: 1.12, rotate: -5 },
                  animate: { opacity: 1, scale: 1, rotate: -2 },
                  transition: { ...SPRING, delay: 0.5 },
                })}
                className="absolute right-5 top-5 w-[4.5rem] sm:right-6 sm:top-6 sm:w-20"
              >
                <Stamp img={P.stamp} alt={P.stampAlt} country={P.country} />
              </motion.div>

              <motion.div
                {...(fadeOnly(0.7) || {
                  initial: { opacity: 0, scale: 1.45 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { delay: 0.85, duration: 0.22, ease: [0.2, 0.9, 0.3, 1] },
                })}
                aria-hidden="true"
                className="absolute right-14 top-10 w-44 sm:right-16 sm:w-48"
              >
                <Postmark date={dateStamp} top={P.ringTop} bottom={P.ringBottom} />
              </motion.div>

              <div className="mt-28 sm:mt-32">
                <p className="font-body text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-soft">
                  {P.toLabel}
                </p>
                <p className="mt-1 border-b border-ink/25 pb-1 font-mono text-lg text-ink">
                  {firstName || 'You'}
                </p>
                <span aria-hidden="true" className="mt-6 block border-b border-ink/20" />
                <span aria-hidden="true" className="mt-6 block border-b border-ink/20" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        {...(fadeOnly(1) || {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 1.15, duration: 0.5 },
        })}
        role="status"
        className="mt-5 font-mono text-sm text-ink-soft"
      >
        {P.delivered}
      </motion.p>
    </div>
  )
}

/**
 * A postage stamp printed with one of the keepsakes. The perforated edge is
 * an SVG mask — a run of punched circles around the perimeter — so the frame
 * scallops like real gummed paper instead of faking it with a dashed border.
 */
function Stamp({ img, alt, country }) {
  const uid = useId().replace(/:/g, '')
  const maskId = `stamp-perf-${uid}`
  const W = 84
  const H = 100
  const R = 3
  const xs = Array.from({ length: 11 }, (_, i) => (i * W) / 10)
  const ys = Array.from({ length: 13 }, (_, i) => (i * H) / 12)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={alt}>
      <defs>
        <mask id={maskId}>
          <rect width={W} height={H} fill="white" />
          {xs.map((x) => (
            <g key={`x${x}`}>
              <circle cx={x} cy={0} r={R} fill="black" />
              <circle cx={x} cy={H} r={R} fill="black" />
            </g>
          ))}
          {ys.map((y) => (
            <g key={`y${y}`}>
              <circle cx={0} cy={y} r={R} fill="black" />
              <circle cx={W} cy={y} r={R} fill="black" />
            </g>
          ))}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <rect width={W} height={H} fill="#FFFCF2" />
        <image
          href={asset(`assets/${img}.webp`)}
          x="7"
          y="7"
          width={W - 14}
          height={H - 26}
          preserveAspectRatio="xMidYMid slice"
        />
        <rect x="7" y="7" width={W - 14} height={H - 26} fill="none" stroke="#E1D6E0" strokeWidth="1" />
        <text
          x={W / 2}
          y={H - 8}
          textAnchor="middle"
          fontFamily="'Manrope', sans-serif"
          fontWeight="700"
          fontSize="7.5"
          letterSpacing="2"
          fill="#423A3D"
          opacity="0.65"
        >
          {country}
        </text>
      </g>
    </svg>
  )
}

/**
 * The cancellation mark: a double ring carrying the studio name, today's
 * date through the middle, and the wavy killer bars running off across the
 * stamp. Inked in burgundy (the palette's deep decorative anchor), roughened
 * with a touch of turbulence and doubled with an offset ghost pass so it
 * reads as hand-pressed rubber stamp, not vector-crisp print.
 */
function Postmark({ date, top, bottom }) {
  const uid = useId().replace(/:/g, '')
  const roughId = `postmark-rough-${uid}`
  const topArc = `postmark-top-${uid}`
  const botArc = `postmark-bot-${uid}`
  const INKED = '#7E2848'
  const ring = (opacity, dx = 0, dy = 0) => (
    <g
      transform={`translate(${dx} ${dy})`}
      opacity={opacity}
      filter={`url(#${roughId})`}
      fill="none"
      stroke={INKED}
    >
      <circle cx="52" cy="45" r="36" strokeWidth="2" />
      <circle cx="52" cy="45" r="27" strokeWidth="1" />
      {/* killer bars, wavering off to the right */}
      <path d="M92,34 C110,31 128,37 146,34 M92,45 C110,42 128,48 148,45 M92,56 C110,53 128,59 144,56" strokeWidth="2.2" strokeLinecap="round" />
      <g fill={INKED} stroke="none" fontFamily="'Manrope', sans-serif" fontWeight="700">
        <text fontSize="7" letterSpacing="1.6">
          <textPath href={`#${topArc}`} startOffset="50%" textAnchor="middle">
            {top}
          </textPath>
        </text>
        <text fontSize="7" letterSpacing="2.2">
          <textPath href={`#${botArc}`} startOffset="50%" textAnchor="middle">
            {bottom}
          </textPath>
        </text>
        {/* the date splits across two lines so it sits inside the inner ring */}
        <text x="52" y="43" textAnchor="middle" fontSize="8.5" letterSpacing="1">
          {date.slice(0, 6)}
        </text>
        <text x="52" y="54" textAnchor="middle" fontSize="8.5" letterSpacing="2">
          {date.slice(7)}
        </text>
      </g>
    </g>
  )
  return (
    <svg
      viewBox="0 0 160 90"
      className="block w-full"
      style={{ mixBlendMode: 'multiply', transform: 'rotate(-8deg)' }}
      aria-hidden="true"
    >
      <defs>
        <filter id={roughId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" />
        </filter>
        {/* text arcs sit between the two rings */}
        <path id={topArc} d="M 21 45 A 31 31 0 0 1 83 45" />
        <path id={botArc} d="M 23 45 A 29 29 0 0 0 81 45" />
      </defs>
      {/* ghost pass first (under), then the main strike — the slight offset
          double is what makes it read as smudged ink */}
      {ring(0.22, 1.4, 1)}
      {ring(0.8)}
    </svg>
  )
}
