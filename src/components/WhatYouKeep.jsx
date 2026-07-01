import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { WHY } from '../content.js'
import { withUnderline } from './Underline.jsx'

// Notes that get a hand-drawn underline under a key phrase, and which phrase.
// Not every note needs one; that's what keeps it feeling picked out rather
// than applied uniformly.
const NOTE_UNDERLINES = {
  '02': { phrase: 'one of a kind', className: 'text-rust' },
  '03': { phrase: 'archival cotton paper', className: 'text-sage-deep' },
}

// The three keepsakes are laid out like watercolours set down to dry: each
// card sits at a slight, fixed tilt and settles level on hover. The tilts are
// authored (not random) so the scatter reads composed rather than messy.
const CARD_TILT = ['-1.6deg', '1.4deg', '-0.8deg']

/**
 * "What you keep" resolves the evening timeline directly above it. Rather than
 * blending the two with a gradient, the section IS a sheet of the archival
 * cotton paper the work is painted on: it overlaps up onto the dark rust of the
 * timeline with a hand-deckled torn top edge and a soft lift shadow, so the
 * night reads as the surface a fresh sheet has just been laid over. The
 * transition earns its keep from the content (the paper that lasts) instead of
 * a decorative fade. Same content system as before (numbered notes, hand-drawn
 * underlines), reframed from a pitch into a coda.
 */
export default function WhatYouKeep() {
  const reduce = useReducedMotion()

  return (
    <section
      id="keep"
      // Pulled up so the torn edge overhangs onto the rust timeline; no
      // overflow clip, so the sheet's lift shadow can fall on the dark above it.
      className="relative w-full px-[5vw] pb-[clamp(4.5rem,11vw,10rem)]"
      style={{ marginTop: 'calc(-1 * clamp(3.5rem, 7vw, 5.5rem))' }}
    >
      <TornPaperEdge />

      {/* The paper body of the sheet: starts just under the frayed edge and
          runs to the bottom. Sits below the content, above the torn strip. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-[60px] bg-paper" />

      {/* Content rides on the sheet, clear of the torn edge. */}
      <div className="relative z-10 pt-[clamp(6rem,11vw,8rem)]">
        {/* Bridge line: a whispered handoff from the last beat of the evening,
            now set in ink on the fresh sheet. */}
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={SPRING}
          className="font-mono text-[clamp(1rem,1.6vw,1.4rem)] italic leading-tight text-rust/80"
        >
          {WHY.bridge}
        </motion.p>

        {/* Visually the label + lede read as this section's heading; the
            sr-only h2 keeps the document outline correct (an h2 before the note
            h3s). */}
        <h2 className="sr-only">{WHY.label}</h2>
        <div className="mt-3">
          <Label gradient={['#C9A23A', '#C2613C']}>{WHY.label}</Label>
        </div>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={SPRING}
          className="mt-6 max-w-[34ch] font-sentient text-[clamp(1.5rem,3vw,2.6rem)] leading-[1.15] tracking-[-0.01em] text-ink sm:max-w-[40ch]"
        >
          {beforeEmph(WHY.lede, WHY.emphasis)}
          <em className="text-rust">{WHY.emphasis}</em>
        </motion.p>

        <div className="mt-[clamp(2.5rem,6vw,4.5rem)] grid grid-cols-12 gap-x-6 gap-y-10">
          {WHY.notes.map((n, i) => (
            <motion.article
              key={n.no}
              initial={{ opacity: 0, y: reduce ? 0 : 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...SPRING, delay: reduce ? 0 : i * 0.1 }}
              whileHover={reduce ? {} : { y: -6, rotate: 0 }}
              style={{ rotate: reduce ? '0deg' : CARD_TILT[i] }}
              className={[
                'group relative rounded-[1.1rem] border border-line bg-paper-deep/70 p-6 shadow-[0_10px_30px_-18px_rgba(60,30,15,0.5)] backdrop-blur-[1px] sm:p-7',
                'col-span-12 sm:col-span-6',
                // Zig-zag drop so the three read as pieces set down across a
                // surface rather than a tidy row.
                ['lg:col-span-4', 'lg:col-span-4 lg:col-start-5 lg:mt-14', 'lg:col-span-4 lg:col-start-9 lg:mt-6'][i],
              ].join(' ')}
            >
              {/* Deckle edge: a faint inner ring echoing the torn edge of
                  cotton paper, warming on hover. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[1.1rem] ring-1 ring-inset ring-terracotta/0 transition-colors duration-500 group-hover:ring-terracotta/25"
              />
              <span className="num-wide text-sm text-sage-deep">{n.no}</span>
              <h3 className="mt-4 font-sentient text-[clamp(1.4rem,2vw,2rem)] leading-tight tracking-[-0.01em] text-ink">
                {n.title}
              </h3>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {NOTE_UNDERLINES[n.no]
                  ? withUnderline(n.body, NOTE_UNDERLINES[n.no].phrase, { className: NOTE_UNDERLINES[n.no].className })
                  : n.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * The torn top edge of the cotton sheet. Hand-authored contour with prominent
 * undulation suggesting torn fibres. The path uses smooth Bezier curves with
 * meaningful height variation to convey torn paper texture without algorithmic
 * quantization. Soft shadow lifts the sheet off the night behind it.
 */
function TornPaperEdge() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[96px] w-full"
      viewBox="0 0 1440 96"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="keep-tear-shadow" x="0%" y="-100%" width="100%" height="200%">
          <feDropShadow dx="0" dy="-2.5" stdDeviation="5" floodColor="#2A1206" floodOpacity="0.42" />
        </filter>
      </defs>
      {/* Torn paper body with prominent wavy edge suggesting fibrous tear */}
      <path
        d="M -60,96 L -60,58 C 30,35 90,72 150,42 C 210,18 270,75 330,48 C 390,25 450,70 510,40 C 570,15 630,68 690,45 C 750,25 810,72 870,40 C 930,12 990,70 1050,48 C 1110,28 1170,68 1230,42 C 1290,20 1350,72 1500,58 L 1500,96 Z"
        fill="#F4EFE6"
        filter="url(#keep-tear-shadow)"
      />
      {/* Lighter lip along the tear catching light, following the torn contour */}
      <path
        d="M -60,60 L -60,58 C 30,35 90,72 150,42 C 210,18 270,75 330,48 C 390,25 450,70 510,40 C 570,15 630,68 690,45 C 750,25 810,72 870,40 C 930,12 990,70 1050,48 C 1110,28 1170,68 1230,42 C 1290,20 1350,72 1500,58 L 1500,60 Z"
        fill="#FBF8F1"
        fillOpacity="0.7"
      />
    </svg>
  )
}

// Render the lede with the final clause emphasised.
function beforeEmph(full, clause) {
  return full.replace(clause, '').trimEnd() + ' '
}
