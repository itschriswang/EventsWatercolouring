import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SPRING, FORMSPREE_ENDPOINT, EMAIL } from '../lib/site.js'
import { DATE_CHECK } from '../content.js'

/**
 * A slim lead-capture strip between the hero and the "Why" section. Two fields
 * (wedding date + email), a submit, and a dismiss × — nothing more. Keeps the
 * editorial tone; the copy is low-pressure, the layout is horizontal.
 *
 * Submissions go to Formspree with a distinct _subject so they land in their
 * own bucket, separate from full enquiries. Falls back to a mailto if the
 * endpoint is not yet configured.
 */
export default function DateCheck() {
  const reduce = useReducedMotion()
  const [sent, setSent] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    if (!data.email?.trim() || !data.date) return

    if (FORMSPREE_ENDPOINT.includes('your-form-id')) {
      // Fallback: open email client with the date pre-filled.
      window.location.href =
        `mailto:${EMAIL}?subject=${encodeURIComponent('Date availability check')}` +
        `&body=${encodeURIComponent(`Wedding date: ${data.date}\nEmail: ${data.email}`)}`
      setSent(true)
      return
    }

    setSending(true)
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      // Network failure — fall back to mailto silently.
      window.location.href =
        `mailto:${EMAIL}?subject=${encodeURIComponent('Date availability check')}` +
        `&body=${encodeURIComponent(`Wedding date: ${data.date}\nEmail: ${data.email}`)}`
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="datecheck"
          initial={{ opacity: 0, y: reduce ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -8, height: 0, marginBottom: 0 }}
          transition={SPRING}
          className="relative z-10 w-full border-y border-line bg-paper-deep px-[5vw] py-4"
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-4"
              >
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink">
                  <span className="text-terracotta">{DATE_CHECK.confirm.title}</span>
                  {' '}
                  {DATE_CHECK.confirm.body}
                </p>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss"
                  className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              >
                {/* Hidden Formspree fields */}
                <input type="hidden" name="_subject" value="Date availability check" />
                {/* Honeypot */}
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px]"
                />

                <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink-soft">
                  {DATE_CHECK.prompt}
                </span>

                <div className="flex grow flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                  <input
                    type="date"
                    name="date"
                    required
                    aria-label={DATE_CHECK.datePlaceholder}
                    className="min-w-0 flex-1 border-b border-ink/30 bg-transparent py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink outline-none transition-colors focus:border-terracotta sm:max-w-[10rem]"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={DATE_CHECK.emailPlaceholder}
                    aria-label={DATE_CHECK.emailPlaceholder}
                    className="min-w-0 flex-1 border-b border-ink/30 bg-transparent py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-terracotta"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="shrink-0 rounded-full border border-ink bg-ink px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-terracotta hover:border-terracotta disabled:opacity-50"
                  >
                    {sending ? '…' : DATE_CHECK.cta}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss"
                  className="absolute right-[5vw] top-1/2 -translate-y-1/2 text-lg leading-none text-ink-soft transition-colors hover:text-ink sm:static sm:translate-y-0"
                >
                  ×
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
