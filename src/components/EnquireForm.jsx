import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import { SPRING, EMAIL, FORMSPREE_ENDPOINT } from '../lib/site.js'
import { ENQUIRY } from '../content.js'

// Compose a mailto: link from the enquiry fields — used as a graceful fallback
// when the Formspree endpoint is not yet configured or the request fails.
const mailtoFor = (data) => {
  const body = [
    `Name: ${data.name}`,
    data.partner && `Partner: ${data.partner}`,
    `Email: ${data.email}`,
    data.date && `Date: ${data.date}`,
    data.venue && `Venue: ${data.venue}`,
    data.package && `Looking for: ${data.package}`,
    '',
    data.message || '',
  ]
    .filter(Boolean)
    .join('\n')
  return `mailto:${EMAIL}?subject=${encodeURIComponent(
    'Wedding watercolour enquiry',
  )}&body=${encodeURIComponent(body)}`
}

/**
 * Enquiry form — minimalist bottom-border fields that blend into the canvas.
 * Submissions POST to Formspree (see FORMSPREE_ENDPOINT in lib/site.js) and
 * show a thank-you state on success. If the endpoint is unconfigured or the
 * request fails, it falls back to opening the visitor's email client.
 */
export default function EnquireForm() {
  const reduce = useReducedMotion()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (form._gotcha.value) return // honeypot tripped
    const data = Object.fromEntries(new FormData(form).entries())
    if (!data.name?.trim() || !data.email?.trim()) {
      setError('Please add your name and email so I can reply.')
      return
    }
    setError('')

    // Fall back to a mailto when no real Formspree id has been set yet.
    if (FORMSPREE_ENDPOINT.includes('your-form-id')) {
      window.location.href = mailtoFor(data)
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
      if (!res.ok) throw new Error('Bad response')
      setSent(true)
    } catch {
      // Network or server error — let them reach me by email instead.
      setError(
        'Something went wrong sending that. Please email me directly and I will reply.',
      )
      window.location.href = mailtoFor(data)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="enquiry" className="relative w-full px-[5vw] py-[clamp(4rem,10vw,9rem)]">
      <div className="grid grid-cols-12 gap-x-8 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <Label>{ENQUIRY.label}</Label>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,4rem)] font-light uppercase leading-[0.9] tracking-tight text-ink">
            {ENQUIRY.title[0]}
            <br />
            <em className="text-terracotta">{ENQUIRY.title[1]}</em>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-ink-soft">{ENQUIRY.intro}</p>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
            Or email{' '}
            <a href={`mailto:${EMAIL}`} className="text-ink underline underline-offset-4">
              {EMAIL}
            </a>
          </p>
        </div>

        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING}
                className="border border-line bg-paper-deep/40 p-10"
              >
                <h3 className="font-display text-3xl font-light text-ink">
                  {ENQUIRY.confirm.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
                  {ENQUIRY.confirm.body}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={onSubmit}
                initial={false}
                className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2"
              >
                {/* honeypot */}
                <label className="absolute left-[-9999px]" aria-hidden="true">
                  Leave this empty
                  <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
                </label>

                <Field name="name" label="Your name" required autoComplete="name" />
                <Field name="partner" label="Your partner’s name" autoComplete="off" />
                <Field name="email" label="Email" type="email" required autoComplete="email" />
                <Field name="date" label="Wedding date" type="date" />
                <Field name="venue" label="Venue or city" placeholder="e.g. Melbourne" />

                <div className="flex flex-col">
                  <label htmlFor="f-package" className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                    What are you after?
                  </label>
                  <select
                    id="f-package"
                    name="package"
                    className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors focus:border-terracotta"
                  >
                    <option value="">Choose one</option>
                    {ENQUIRY.packageOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <label htmlFor="f-message" className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                    Message
                  </label>
                  <textarea
                    id="f-message"
                    name="message"
                    rows={4}
                    placeholder="Tell me a little about the day, and the people who matter most."
                    className="resize-none border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-terracotta"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="group inline-flex w-fit items-center gap-3 rounded-full bg-ink px-9 py-5 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? 'Sending…' : 'Send enquiry'}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                  {error && (
                    <p role="alert" className="font-mono text-xs text-rust">
                      {error}
                    </p>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Field({ name, label, type = 'text', required, ...rest }) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={`f-${name}`}
        className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft"
      >
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </label>
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        required={required}
        className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-terracotta"
        {...rest}
      />
    </div>
  )
}
