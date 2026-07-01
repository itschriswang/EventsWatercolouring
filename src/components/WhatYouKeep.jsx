import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { WHY } from '../content.js'
import { withUnderline } from './Underline.jsx'

// Notes that get a hand-drawn underline under a key phrase, and which phrase.
// Not every note needs one — that's what keeps it feeling picked out rather
// than applied uniformly.
const NOTE_UNDERLINES = {
  '02': { phrase: 'one of a kind', className: 'text-rust' },
  '03': { phrase: 'archival cotton paper', className: 'text-sage-deep' },
}

// The three keepsakes are laid out like watercolours set down to dry — each
// card sits at a slight, fixed tilt and settles level on hover. The tilts are
// authored (not random) so the scatter reads composed rather than messy.
const CARD_TILT = ['-1.6deg', '1.4deg', '-0.8deg']

/**
 * "What you keep" — the resolution of the evening timeline directly above it.
 * Where the timeline runs dark rust and ends at a "destination" marker, this
 * section is the arrival: the palette lifts back to warm paper through a
 * top-of-section wash so the seam between the two dissolves, and the three
 * keepsakes are presented as objects that outlast the night rather than as
 * reasons to book. Same content system as before (numbered notes, hand-drawn
 * underlines) — reframed from a pitch into a coda.
 */
export default function WhatYouKeep() {
  const reduce = useReducedMotion()

  return (
    <section
      id="keep"
      className="relative w-full overflow-hidden bg-paper px-[5vw] pt-[clamp(3.5rem,8vw,7rem)] pb-[clamp(4.5rem,11vw,10rem)]"
    >
      {/* Carry the rust of the timeline above down over the top edge, then let
          it dissolve into paper — the two sections read as one continuous
          movement (the night resolving into daylight) rather than a hard cut
          from a dark section to a light one. Pure CSS, reduced-motion safe. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{
          background:
            'linear-gradient(to bottom, ' +
            '#9A4A2B 0%, ' +
            'rgba(154,74,43,0.42) 12%, ' +
            'rgba(228,136,156,0.10) 44%, ' +
            'transparent 100%)',
        }}
      />

      <div className="relative">
        {/* Bridge line — a whispered handoff from the last beat of the evening,
            set over the rust wash so it belongs to the section above as much as
            this one. */}
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={SPRING}
          className="font-mono text-[clamp(1rem,1.6vw,1.4rem)] italic leading-tight text-paper/90"
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
              {/* Deckle edge — a faint inner ring echoing the torn edge of
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

// Render the lede with the final clause emphasised.
function beforeEmph(full, clause) {
  return full.replace(clause, '').trimEnd() + ' '
}
