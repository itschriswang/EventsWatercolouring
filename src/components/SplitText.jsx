import { motion, useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
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
  emphasisClassName = 'text-magenta',
  unit = 'char',
  className = '',
  as: Tag = 'h2',
  delay = 0,
  playOnMount = false,
}) {
  const reduce = useReducedMotion()
  // Touch/small devices (and reduced-motion) can't afford a spring per character
  // — a long heading is dozens of simultaneous springs, which stutters on mobile.
  // There we reveal the whole heading as one composited element instead.
  const lite = reduce || !useHeavyFx()
  const MotionTag = motion(Tag)
  const normalise = s => s.toLowerCase().replace(/[^a-z]/g, '')
  // Accept a single string or an array of strings for multi-word emphasis.
  const emphasisList = emphasis
    ? (Array.isArray(emphasis) ? emphasis : [emphasis])
    : []
  const isPhrase = emphasisList.some(e => e.includes(' '))

  const container = lite
    ? {
        hidden: { opacity: 0, y: reduce ? 0 : 16 },
        show: { opacity: 1, y: 0, transition: { ...SPRING, delay } },
      }
    : {
        hidden: {},
        show: {
          transition: {
            staggerChildren: unit === 'char' ? 0.02 : 0.05,
            delayChildren: delay,
          },
        },
      }

  // In lite mode the units are static (the container does the single reveal);
  // otherwise each unit springs up from y:50 on its own stagger.
  const item = lite
    ? undefined
    : {
        hidden: { y: 50, opacity: 0 },
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
        const lineHasPhrase = isPhrase && emphasisList.some(e => line.toLowerCase().includes(e.toLowerCase()))
        return (
          <span key={li} className="block overflow-hidden pb-[0.08em]">
            {unit === 'char'
              ? line.split(' ').flatMap((word, wi, words) => {
                  const isWordEmph = emphasisList.length > 0 && (
                    isPhrase
                      ? lineHasPhrase
                      : emphasisList.some(e => normalise(word) === normalise(e))
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
                  const isWordEmph = emphasisList.length > 0 && (
                    isPhrase
                      ? lineHasPhrase
                      : emphasisList.some(e => normalise(word) === normalise(e))
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
