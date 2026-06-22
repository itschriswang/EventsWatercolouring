import { motion, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'

/**
 * Splits a headline into masked lines (and optionally characters) and reveals
 * them with a staggered spring. Each line sits in an overflow-hidden mask so
 * the glyphs rise up from beneath their own baseline.
 *
 * @param {string[]} lines      Each string is one visual line of the headline.
 * @param {'word'|'char'} unit  Granularity of the stagger.
 */
export default function SplitText({
  lines = [],
  unit = 'word',
  className = '',
  delay = 0,
  as: Tag = 'h1',
}) {
  const reduce = useReducedMotion()

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: delay },
    },
  }

  const item = {
    hidden: reduce ? { opacity: 0 } : { y: '110%', opacity: 0 },
    show: {
      y: '0%',
      opacity: 1,
      transition: SPRING,
    },
  }

  const MotionTag = motion(Tag)

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
      aria-label={lines.join(' ')}
    >
      {lines.map((line, li) => (
        <span key={li} className="block overflow-hidden pb-[0.12em]">
          {unit === 'char'
            ? splitToChars(line).map((ch, ci) => (
                <motion.span
                  key={ci}
                  variants={item}
                  className="inline-block whitespace-pre will-change-transform"
                  aria-hidden="true"
                >
                  {ch}
                </motion.span>
              ))
            : line.split(' ').map((word, wi) => (
                <motion.span
                  key={wi}
                  variants={item}
                  className="inline-block will-change-transform"
                  aria-hidden="true"
                >
                  {word}
                  {wi < line.split(' ').length - 1 ? ' ' : ''}
                </motion.span>
              ))}
        </span>
      ))}
    </MotionTag>
  )
}

function splitToChars(line) {
  return Array.from(line).map((c) => (c === ' ' ? ' ' : c))
}
