import { motion, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'

/**
 * Splits a headline into masked lines and reveals each unit (word or character)
 * with a staggered spring, rising from y:50. Each line sits in an
 * overflow-hidden mask. A single word can be flagged for display emphasis via
 * `emphasis` (rendered with `emphasisClassName`, defaulting to terracotta).
 *
 * Renders on scroll by default (whileInView); pass `playOnMount` to animate
 * immediately (used by the hero once the preloader hands over).
 *
 * In char mode, each word's characters are wrapped in an inline-block container
 * so the browser never breaks a word mid-character across lines.
 */
export default function SplitText({
  lines = [],
  emphasis = null,
  emphasisClassName = 'text-terracotta',
  unit = 'char',
  className = '',
  as: Tag = 'h2',
  delay = 0,
  playOnMount = false,
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion(Tag)
  const normalise = s => s.toLowerCase().replace(/[^a-z]/g, '')
  const isPhrase = emphasis ? emphasis.includes(' ') : false

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
        const lineHasPhrase = isPhrase && line.toLowerCase().includes(emphasis.toLowerCase())
        return (
          <span key={li} className="block overflow-hidden pb-[0.08em]">
            {unit === 'char'
              ? line.split(' ').flatMap((word, wi, words) => {
                  const isWordEmph = emphasis && (
                    isPhrase
                      ? lineHasPhrase
                      : normalise(word) === normalise(emphasis)
                  )
                  const wordEl = (
                    <span
                      key={`w${li}-${wi}`}
                      className={`inline-block${isWordEmph ? ` ${emphasisClassName}` : ''}`}
                    >
                      {Array.from(word).map((ch, ci) => (
                        <motion.span
                          key={ci}
                          variants={item}
                          aria-hidden="true"
                          className="inline-block"
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </span>
                  )
                  if (wi < words.length - 1) {
                    return [
                      wordEl,
                      <motion.span
                        key={`sp${li}-${wi}`}
                        variants={item}
                        aria-hidden="true"
                        className="inline-block whitespace-pre"
                      >
                        {' '}
                      </motion.span>,
                    ]
                  }
                  return [wordEl]
                })
              : line.split(' ').map((word, wi, arr) => {
                  const isWordEmph = emphasis && (
                    isPhrase
                      ? lineHasPhrase
                      : normalise(word) === normalise(emphasis)
                  )
                  return (
                    <motion.span
                      key={wi}
                      variants={item}
                      aria-hidden="true"
                      className={`inline-block${isWordEmph ? ` ${emphasisClassName}` : ''}`}
                    >
                      {word}
                      {wi < arr.length - 1 ? ' ' : ''}
                    </motion.span>
                  )
                })}
          </span>
        )
      })}
    </MotionTag>
  )
}
