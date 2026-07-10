import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Ink spread reveal effect — a sprite-based animation that spreads across the
 * viewport after the preloader completes. Uses a 25-frame PNG sprite sheet of
 * ink dispersing, animated via CSS keyframes for smooth performance.
 *
 * Triggers automatically when `reveal` becomes true, creating a visual
 * transition from the preloader's bloom dissolve to the page reveal.
 */
export default function InkSpreadReveal({ reveal }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (reveal && !isDone) {
      setIsAnimating(true)
      // Animation duration matches the sprite sequence timing (0.8s)
      const timer = setTimeout(() => {
        setIsDone(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [reveal, isDone])

  if (!isAnimating) return null

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden pointer-events-none"
      style={{ opacity: isDone ? 0 : 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div
        className={`absolute inset-0 ${isDone ? 'pointer-events-none' : ''}`}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translateY(-50%) translateX(-2%)',
          width: '2500%', // 25 frames
          height: '100%',
          backgroundImage: 'url(/assets/ink-spread.png)',
          backgroundPosition: '0 0',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          animation: isAnimating ? 'ink-spread-sequence 0.8s steps(24) forwards' : 'none',
        }}
      />
      <style>{`
        @keyframes ink-spread-sequence {
          0% {
            transform: translateY(-50%) translateX(-2%);
          }
          100% {
            transform: translateY(-50%) translateX(-98%);
          }
        }
      `}</style>
    </motion.div>
  )
}
