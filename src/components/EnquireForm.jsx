import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label from './Label.jsx'
import {
  SPRING,
  EMAIL,
  FORMSPREE_ENDPOINT,
  FORMSPREE_READY,
  isValidEmail,
  asset,
} from '../lib/site.js'
import { ENQUIRY } from '../content.js'

// Compose a mailto: link from the enquiry fields — used as a graceful fallback
// when the Formspree endpoint is not yet configured or the request fails.
const mailtoFor = (data) => {
  const body = [
    `Name: ${data.name}`,
    data.phone && `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    data.contactMethod && `Preferred contact: ${data.contactMethod}`,
    data.date
      ? `Date: ${data.date}`
      : data.date_unknown
      ? 'Date: Not sure yet'
      : null,
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
  // Neutral, non-error guidance (e.g. when we hand off to the email client).
  const [notice, setNotice] = useState('')

  // Focus the first field that failed validation so keyboard and screen-reader
  // users land on the problem instead of hunting for it.
  const focusField = (form, name) => form?.elements?.[name]?.focus?.()

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (form._gotcha.value) return // honeypot tripped
    const data = Object.fromEntries(new FormData(form).entries())

    setNotice('')
    if (!data.name?.trim()) {
      setError('Please add your name so I know who I am writing back to.')
      focusField(form, 'name')
      return
    }
    if (!data.email?.trim() || !isValidEmail(data.email)) {
      setError('That email looks off — please check it, like name@example.com.')
      focusField(form, 'email')
      return
    }
    setError('')

    // No real Formspree id set yet: hand the enquiry to the visitor's email
    // client. We can't confirm it actually sent, so we DON'T show the success
    // state — we guide them instead.
    if (!FORMSPREE_READY) {
      window.location.href = mailtoFor(data)
      setNotice(
        `Opening your email app so you can send this straight to me. If nothing happens, email ${EMAIL} directly.`,
      )
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
      // Only now, on a confirmed send, do we show the thank-you.
      setSent(true)
    } catch {
      // Network or server error — let them reach me by email instead.
      setError(
        `Something went wrong sending that. Please email me directly at ${EMAIL} and I will reply.`,
      )
      window.location.href = mailtoFor(data)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="enquiry" className="relative w-full px-[5vw] py-[clamp(4rem,8vw,7rem)]">
      <div className="grid grid-cols-12 gap-x-8 gap-y-12">
        <div className="relative col-span-12 lg:col-span-4">
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
          {/* Bouquet — flipped, beneath the heading, widescreen only */}
          <img
            src={asset('assets/art-bouquet_transparent.webp')}
            alt=""
            aria-hidden="true"
            className="pointer-events-none mt-10 hidden w-66 opacity-90 [transform:scaleX(-1)] lg:block"
          />
        </div>

        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING}
                className="relative overflow-hidden border border-line bg-paper-deep/40 p-10"
              >
                {/* Two pigment washes bloom into the paper as the note settles,
                    like a wet mark drying. Decorative; static under reduced-motion. */}
                {[
                  { c: '#C2613C', pos: '-right-12 -top-12 h-52 w-52', d: 0 },
                  { c: '#6E8CA8', pos: '-right-2 top-10 h-32 w-32', d: 0.18 },
                ].map((b, i) => (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    initial={reduce ? { opacity: 0.14 } : { opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.14, scale: 1 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 1.5, delay: b.d, ease: [0.22, 0.61, 0.36, 1] }
                    }
                    className={`pointer-events-none absolute ${b.pos} rounded-full mix-blend-multiply`}
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${b.c}, transparent 68%)`,
                      filter: 'blur(28px)',
                    }}
                  />
                ))}
                <h3 className="relative font-display text-3xl font-light text-ink">
                  {ENQUIRY.confirm.title}
                </h3>
                <p className="relative mt-3 max-w-md leading-relaxed text-ink-soft">
                  {ENQUIRY.confirm.body}
                </p>
                {ENQUIRY.confirm.sign && (
                  <motion.p
                    initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.45 }}
                    className="relative mt-6 font-display text-3xl italic text-terracotta"
                  >
                    {ENQUIRY.confirm.sign}
                  </motion.p>
                )}
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
                <Field
                  name="phone"
                  label="Phone number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="e.g. 0400 000 000"
                />
                <Field name="email" label="Email" type="email" required autoComplete="email" />
                <div className="flex flex-col sm:col-span-2">
                  <label
                    htmlFor="f-contactMethod"
                    className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft"
                  >
                    Preferred contact method
                  </label>
                  <select
                    id="f-contactMethod"
                    name="contactMethod"
                    className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors focus:border-terracotta"
                  >
                    <option value="">Choose one</option>
                    <option>Email</option>
                    <option>Phone</option>
                  </select>
                </div>
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
                
                <div className="flex flex-col sm:col-span-2">
                  <label className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                    Wedding date
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="date"
                      name="date"
                      className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors focus:border-terracotta"
                    />
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        name="date_unknown"
                        value="true"
                        className="accent-terracotta"
                      />
                      <span>Not sure yet</span>
                    </label>
                  </div>
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
                  {notice && !error && (
                    <p role="status" className="max-w-md font-mono text-xs leading-relaxed text-ink-soft">
                      {notice}
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
