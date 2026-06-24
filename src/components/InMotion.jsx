import { motion, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { SPRING, asset } from '../lib/site.js'
import { MOTION } from '../content.js'

/** "In motion" — two local films of the paint going down, plus Instagram. */
export default function InMotion() {
  const reduce = useReducedMotion()

  return (
    <section id="studio" className="relative w-full px-[5vw] py-[clamp(4rem,8vw,7rem)]">
      <Label>{MOTION.label}</Label>
      <div className="mt-5 grid grid-cols-12 items-end gap-x-8 gap-y-6">
        <SplitText
          as="h2"
          unit="char"
          lines={MOTION.title}
          emphasis={MOTION.emphasis}
          className="display-lg col-span-12 text-ink lg:col-span-7"
        />
        <p className="col-span-12 max-w-md leading-relaxed text-ink-soft lg:col-span-5">
          {MOTION.body}
        </p>
      </div>

      <div className="mt-[clamp(2.5rem,6vw,5rem)] grid grid-cols-12 gap-6">
        {MOTION.films.map((film, i) => (
          <motion.figure
            key={film.caption}
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ ...SPRING, delay: reduce ? 0 : i * 0.1 }}
            className={'col-span-12 sm:col-span-6 ' + (i === 1 ? 'sm:mt-12' : '')}
          >
            <div className="overflow-hidden rounded-[1.2rem] border border-line bg-ink/5">
              <video
                src={asset(film.src)}
                poster={asset(film.poster)}
                muted
                loop
                playsInline
                preload="none"
                controls
                className="aspect-[4/5] h-full w-full object-cover"
                aria-label={film.caption}
              />
            </div>
            <figcaption className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft">
              {film.caption}
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-soft">
          More reels on Instagram
        </span>
        {MOTION.instagram.map((url, i) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink underline-offset-4 transition-colors hover:text-terracotta hover:underline"
          >
            Reel {i + 1} ↗
          </a>
        ))}
      </div>
    </section>
  )
}
