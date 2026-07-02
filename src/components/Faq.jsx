import { motion, useReducedMotion } from 'framer-motion'
import { Drop } from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'

/**
 * The same terracotta → ochre → rust → blush → dusty-pink wash used to sit
 * on the shared <ul> background — sampled per-card instead, so each cell
 * carries its own slice of the wash rather than the whole list sharing one
 * background that shows through (and blurs into) the gaps between cards.
 */
const WASH_STOPS = [
  { at: 0, rgb: [194, 97, 60], a: 0.22 },
  { at: 0.26, rgb: [201, 162, 58], a: 0.19 },
  { at: 0.52, rgb: [164, 80, 47], a: 0.2 },
  { at: 0.76, rgb: [228, 136, 156], a: 0.18 },
  { at: 1, rgb: [201, 139, 140], a: 0.17 },
]

function sampleWash(t) {
  for (let i = 0; i < WASH_STOPS.length - 1; i++) {
    const a = WASH_STOPS[i]
    const b = WASH_STOPS[i + 1]
    if (t >= a.at && t <= b.at) {
      const lt = (t - a.at) / (b.at - a.at)
      const lerp = (x, y) => x + (y - x) * lt
      const [r1, g1, b1] = a.rgb
      const [r2, g2, b2] = b.rgb
      const rgb = [lerp(r1, r2), lerp(g1, g2), lerp(b1, b2)].map(Math.round)
      return `rgba(${rgb.join(', ')}, ${lerp(a.a, b.a).toFixed(3)})`
    }
  }
  const last = WASH_STOPS[WASH_STOPS.length - 1]
  return `rgba(${last.rgb.join(', ')}, ${last.a})`
}

function cardWash(i, count) {
  const top = sampleWash(i / count)
  const bottom = sampleWash((i + 1) / count)
  return `linear-gradient(172deg, ${top} 0%, ${bottom} 100%)`
}

/**
 * The practical bits — every question answered plainly on the page, no
 * accordion to click through. Lives on its own /faq/ subpage (see
 * FaqPage.jsx, which supplies the label/title above this), so there's no
 * scroll budget to protect and no sidebar to share with other sections;
 * showing every answer up front in one reading column reads better here
 * than a wall of collapsed toggles would.
 */
export default function Faq() {
  const reduce = useReducedMotion()

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      <div className="mx-auto max-w-3xl">
        {/*
          The terracotta → ochre → rust → blush → dusty-pink wash runs top
          to bottom, each card sampling its own slice via cardWash() and
          painting it on its own <li> (clipped by that card's own rounded
          corners) instead of one gradient shared across the whole <ul> —
          that let colour show through, and blur past the card edges, into
          the gaps between cards.
        */}
        <ul className="space-y-3">
          {FAQ.items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...SPRING, delay: reduce ? 0 : Math.min(i, 5) * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-line/45 bg-paper"
              style={{ backgroundImage: cardWash(i, FAQ.items.length) }}
            >
              <div className="relative z-10 flex items-start gap-4 px-6 py-5 sm:gap-5">
                <span
                  className="mt-0.5 shrink-0 rounded-full bg-[rgba(251,248,242,0.6)] p-2.5"
                  aria-hidden="true"
                >
                  <Drop className="h-4 w-auto" gradient={['#C9A23A', '#C2613C']} />
                </span>
                <div>
                  <h3 className="font-body text-[clamp(0.95rem,1.3vw,1.15rem)] tracking-[-0.01em] leading-snug text-ink">
                    {item.q}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-soft/85">
                    {item.a}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
