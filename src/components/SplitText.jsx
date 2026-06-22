import { motion, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'

/**
 * Splits a headline into masked lines and reveals each unit (word or character)
 * with a staggered spring, rising from y:50. Each line sits in an
 * overflow-hidden mask. A single word can be flagged for the display italic via
 * `emphasis`.
 *
 * Renders on scroll by default (whileInView); pass `playOnMount` to animate
 * immediately (used by the hero once the preloader hands over).
 */
export default function SplitText({
  lines = [],
  emphasis = null,
  unit = 'char',
  className = '',
  as: Tag = 'h2',
  delay = 0,
  playOnMount = false,
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion(Tag)

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : unit === 'char' ? 0.02 : 0.05,
        delayChildren: delay,
      },
    },
  }

  const item = {
    hidden: reduce ? { opacity: 0 } : { y: 50, opacity: 0 },
    show: { y: 0, opacity: 1, transition: SPRING },
  }

  const animateProps = playOnMount
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } }

  return (
    <MotionTag
      className={className}
      variants={container}
      {...animateProps}
      aria-label={lines.join(' ')}
    >
      {lines.map((line, li) => {
        const isEmph = emphasis && line.includes(emphasis)
        return (
          <span key={li} className="block overflow-hidden pb-[0.08em]">
            {unit === 'char'
              ? Array.from(line).map((ch, ci) => (
                  <motion.span
                    key={ci}
                    variants={item}
                    aria-hidden="true"
                    className={
                      'inline-block whitespace-pre ' + (isEmph ? 'italic' : '')
                    }
                  >
                    {ch}
                  </motion.span>
                ))
              : line.split(' ').map((word, wi, arr) => (
                  <motion.span
                    key={wi}
                    variants={item}
                    aria-hidden="true"
                    className="inline-block"
                  >
                    {word}
                    {wi < arr.length - 1 ? ' ' : ''}
                  </motion.span>
                ))}
          </span>
        )
      })}
    </MotionTag>
  )
}
