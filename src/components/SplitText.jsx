import { motion, useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING } from '../lib/site.js'

/**
 * Splits a headline into masked lines and reveals each unit (word or character)
 * with a staggered spring, rising from y:50. Each line sits in an
 * overflow-hidden mask. A single word can be flagged for display emphasis via
 * `emphasis` (rendered with `emphasisClassName`, defaulting to terracotta).
 * Pass `emphasisItalic` to set those words in the family's italic cut for an
 * editorial style contrast against the upright headline.
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
  emphasisClassName = 'bg-gradient-to-r from-terracotta via-orange to-blush bg-clip-text text-transparent',
  emphasisItalic = false,
  unit = 'char',
  className = '',
  as: Tag = 'h2',
  delay = 0,
  playOnMount = false,
}) {
  const reduce = useReducedMotion()
  const lite = reduce || !useHeavyFx()
  const MotionTag = motion(Tag)
  const normalise = s => s.toLowerCase().replace(/[^a-z]/g, '')

  const emphasisList = emphasis
    ? (Array.isArray(emphasis) ? emphasis : [emphasis])
    : []
  const isPhrase = emphasisList.some(e => e.includes(' '))

  const isWordEmphasisized = (word) => {
    if (emphasisList.length === 0) return false
    return emphasisList.some(e => normalise(word) === normalise(e))
  }

  // Build a map of which words are emphasized and their global position
  const emphasisMap = new Map()
  let globalWordIndex = 0
  let firstEmphIndex = null
  let lastEmphIndex = null

  lines.forEach((line) => {
    line.split(' ').forEach((word) => {
      if (isWordEmphasisized(word)) {
        if (firstEmphIndex === null) firstEmphIndex = globalWordIndex
        lastEmphIndex = globalWordIndex
        emphasisMap.set(globalWordIndex, true)
      }
      globalWordIndex++
    })
  })

  // Calculate gradient span: each emphasized word gets inline style to position the gradient
  const getGradientStyle = (wordIndex) => {
    if (!emphasisMap.has(wordIndex) || firstEmphIndex === null) return {}

    const totalSpan = lastEmphIndex - firstEmphIndex + 1
    const posInSpan = wordIndex - firstEmphIndex
    const startPercent = (posInSpan / totalSpan) * 100
    const endPercent = ((posInSpan + 1) / totalSpan) * 100

    return {
      background: 'linear-gradient(110deg, #A4502F, #C2613C, #6C2A3E)',
      backgroundSize: `${totalSpan * 100}% 100%`,
      backgroundPosition: `${-posInSpan * 100}% 0`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }
  }

  // Group consecutive emphasized words on same line
  const groupEmphasisWords = (words) => {
    const groups = []
    let currentGroup = []

    words.forEach((word) => {
      if (isWordEmphasisized(word)) {
        currentGroup.push({ word, isEmph: true })
      } else {
        if (currentGroup.length > 0) {
          groups.push({ words: currentGroup, isGroup: true })
          currentGroup = []
        }
        groups.push({ word, isEmph: false })
      }
    })
    if (currentGroup.length > 0) {
      groups.push({ words: currentGroup, isGroup: true })
    }
    return groups
  }

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
        const lineWords = line.split(' ')
        const groupedWords = groupEmphasisWords(lineWords)

        // Track word index for gradient positioning
        let wordIndexInHeading = 0
        for (let prevLi = 0; prevLi < li; prevLi++) {
          wordIndexInHeading += lines[prevLi].split(' ').length
        }

        return (
          <span key={li} className="block overflow-hidden pb-[0.08em]">
            {unit === 'char'
              ? groupedWords.flatMap((group, gi) => {
                  if (group.isGroup) {
                    const spanStyle = getGradientStyle(wordIndexInHeading)
                    wordIndexInHeading += group.words.length
                    return [
                      <span
                        key={`g${li}-${gi}`}
                        className={emphasisItalic ? 'inline-block italic' : 'inline-block'}
                        style={spanStyle}
                      >
                        {group.words.flatMap((w, wi) => [
                          ...Array.from(w.word).map((ch, ci) => (
                            <motion.span
                              key={`${gi}-${wi}-${ci}`}
                              variants={item}
                              aria-hidden="true"
                              className="inline-block"
                            >
                              {ch}
                            </motion.span>
                          )),
                          wi < group.words.length - 1 ? (
                            <motion.span
                              key={`space-${gi}-${wi}`}
                              variants={item}
                              aria-hidden="true"
                              className="inline-block whitespace-pre"
                            >
                              {' '}
                            </motion.span>
                          ) : null,
                        ])}
                      </span>,
                      gi < groupedWords.length - 1 ? (
                        <motion.span
                          key={`sp${li}-${gi}`}
                          variants={item}
                          aria-hidden="true"
                          className="inline-block whitespace-pre"
                        >
                          {' '}
                        </motion.span>
                      ) : null,
                    ]
                  }
                  wordIndexInHeading++
                  return [
                    <span
                      key={`w${li}-${gi}`}
                      className="inline-block"
                    >
                      {Array.from(group.word).map((ch, ci) => (
                        <motion.span
                          key={ci}
                          variants={item}
                          aria-hidden="true"
                          className="inline-block"
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </span>,
                    gi < groupedWords.length - 1 ? (
                      <motion.span
                        key={`sp${li}-${gi}`}
                        variants={item}
                        aria-hidden="true"
                        className="inline-block whitespace-pre"
                      >
                        {' '}
                      </motion.span>
                    ) : null,
                  ]
                })
              : groupedWords.flatMap((group, gi) => {
                  if (group.isGroup) {
                    const spanStyle = getGradientStyle(wordIndexInHeading)
                    wordIndexInHeading += group.words.length
                    return [
                      <motion.span
                        key={`g${li}-${gi}`}
                        variants={item}
                        aria-hidden="true"
                        className={emphasisItalic ? 'inline-block italic' : 'inline-block'}
                        style={spanStyle}
                      >
                        {group.words.map((w, wi) => (
                          <span key={wi}>
                            {w.word}
                            {wi < group.words.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </motion.span>,
                      gi < groupedWords.length - 1 ? (
                        <motion.span
                          key={`sp${li}-${gi}`}
                          variants={item}
                          aria-hidden="true"
                          className="inline-block whitespace-pre"
                        >
                          {' '}
                        </motion.span>
                      ) : null,
                    ]
                  }
                  wordIndexInHeading++
                  return [
                    <motion.span
                      key={`w${li}-${gi}`}
                      variants={item}
                      aria-hidden="true"
                      className="inline-block"
                    >
                      {group.word}
                      {gi < groupedWords.length - 1 ? ' ' : ''}
                    </motion.span>,
                  ]
                })}
          </span>
        )
      })}
    </MotionTag>
  )
}
