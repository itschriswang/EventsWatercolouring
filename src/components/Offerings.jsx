import { motion, useReducedMotion } from 'framer-motion'
import { SPRING, asset } from '../lib/site.js'

const TIERS = [
  {
    name: 'The Portrait',
    note: 'Painted in the studio from your photographs.',
    points: [
      'One watercolour portrait of the two of you',
      'Up to two figures · A3 cotton-rag',
      'High-resolution digital scan',
      'Delivered within 4–6 weeks',
    ],
    art: 'assets/art-character-boy.webp',
    accent: '#C2613C',
  },
  {
    name: 'Painted Live',
    note: 'I attend your day and paint as it unfolds.',
    points: [
      'Up to 4 hours of live painting',
      'One finished couple portrait',
      'Up to three figures · A3 cotton-rag',
      'Travel within Greater Sydney included',
    ],
    art: 'assets/art-bouquet.webp',
    accent: '#B5395B',
    featured: true,
  },
  {
    name: 'The Series',
    note: 'Live painting, plus a collection to remember it by.',
    points: [
      'Up to 6 hours of live painting',
      'Large A2 portrait, framed',
      'A set of three guest vignettes',
      'Digital file licensed for your stationery',
    ],
    art: 'assets/portrait-christopher.webp',
    accent: '#3A7F9D',
  },
]

/** A complementary editorial offerings row built from the real pricing copy. */
export default function Offerings() {
  const reduce = useReducedMotion()

  return (
    <section
      id="offerings"
      className="relative mx-auto max-w-wrap px-[clamp(1.25rem,4vw,4rem)] py-[clamp(4rem,10vw,9rem)]"
    >
      <div className="mb-[clamp(2.5rem,6vw,5rem)] flex flex-col gap-4">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-ink-soft">
          Offerings
        </span>
        <h2 className="max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] font-light uppercase leading-[0.95] tracking-[-0.03em] text-ink">
          Three ways to work together
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.article
            key={tier.name}
            initial={{ opacity: 0, y: reduce ? 0 : 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ ...SPRING, delay: reduce ? 0 : i * 0.1 }}
            whileHover={reduce ? {} : { y: -10 }}
            className={
              'group flex flex-col overflow-hidden rounded-[1.5rem] border bg-paper ' +
              (tier.featured
                ? 'border-transparent shadow-[0_36px_70px_-34px_rgba(42,39,36,0.5)] md:-translate-y-6'
                : 'border-line')
            }
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={asset(tier.art)}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 ease-organic group-hover:scale-105"
                loading="lazy"
              />
              <span
                className="absolute inset-0 mix-blend-multiply opacity-30 transition-opacity duration-500 group-hover:opacity-10"
                style={{ backgroundColor: tier.accent }}
              />
            </div>

            <div className="flex flex-1 flex-col p-7">
              <h3
                className="font-display text-[clamp(1.5rem,2vw,2rem)] font-light uppercase tracking-[-0.02em]"
                style={{ color: tier.accent }}
              >
                {tier.name}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{tier.note}</p>

              <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm text-ink/80">
                {tier.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: tier.accent }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
