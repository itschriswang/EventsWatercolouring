import { useId, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label, { Drop } from './Label.jsx'
import {
  SPRING,
  EMAIL,
  FORMSPREE_ENDPOINT,
  FORMSPREE_READY,
  isValidEmail,
  asset,
} from '../lib/site.js'
import { ENQUIRY } from '../content.js'

// Pull a first name out of the full name field for the thank-you greeting:
// the first whitespace-delimited token, with its first letter capitalised so
// "sarah lee" still greets as "Sarah". Returns '' when there's nothing usable.
const firstNameOf = (name = '') => {
  const token = name.trim().split(/\s+/)[0] || ''
  return token ? token.charAt(0).toUpperCase() + token.slice(1) : ''
}

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
 * Enquiry form, staged as a hand-placed reply card.
 *
 * Rather than blending into the page like the sections above it, the form sits
 * on a deckle-edged sheet of watercolour paper (torn edges are a live SVG
 * turbulence + displacement filter, see DecklePaper), layered over a second
 * sheet and cast in a soft shadow so it reads as a physical object laid on the
 * table. The card is tilted at rest and straightens (`focus-within`) when the
 * visitor starts filling it in. Submitting presses a terracotta wax seal.
 *
 * Form and confirmation share the SAME card: on a confirmed send the sheet
 * floods with pigment and becomes the handwritten thank-you, so the note never
 * appears out of nowhere. Submissions POST to Formspree (see FORMSPREE_ENDPOINT
 * in lib/site.js); if the endpoint is unconfigured or the request fails it
 * falls back to opening the visitor's email client.
 */
export default function EnquireForm() {
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [error, setError] = useState('')
  // Which field the current error belongs to, so it can be wired to the input
  // via aria-invalid / aria-describedby for screen-reader users.
  const [invalidField, setInvalidField] = useState('')
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
      setInvalidField('name')
      focusField(form, 'name')
      return
    }
    if (!data.email?.trim() || !isValidEmail(data.email)) {
      setError('That email looks off — please check it, like name@example.com.')
      setInvalidField('email')
      focusField(form, 'email')
      return
    }
    setError('')
    setInvalidField('')

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
      // Only now, on a confirmed send, do we show the thank-you — greeted by
      // name, so it reads like a real reply rather than a generic receipt.
      setFirstName(firstNameOf(data.name))
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
    <section id="enquiry" className="relative w-full px-[5vw] pt-[clamp(3rem,6vw,5.5rem)] pb-[clamp(5rem,10vw,9rem)]">
      <div className="grid grid-cols-12 gap-x-8 gap-y-12">
        <div className="relative col-span-12 lg:col-span-4">
          <Label>{ENQUIRY.label}</Label>
          <h2 className="mt-5 font-sentient text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em] text-ink">
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
            className="pointer-events-none mt-10 hidden w-64 opacity-90 [transform:scaleX(-1)] lg:block"
          />
        </div>

        {/* The card column. The outer wrapper carries the resting tilt and
            straightens on focus-within; the inner motion.div settles the sheet
            into place on first reveal (a placed-on-the-table drop). Tilt is a
            static transform, safe under reduced-motion. */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <div className="-rotate-1 transition-transform duration-500 ease-organic hover:-rotate-[0.4deg] focus-within:rotate-0">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={SPRING}
              className="relative"
            >
              <DecklePaper id={uid} />

              {/* Pigment life clipped to roughly the paper bounds — a resting
                  wash in both states, plus a one-time flood when the note
                  arrives. Sits above the paper, below the content. */}
              <div className="pointer-events-none absolute inset-[3%] z-[1] overflow-hidden rounded-[3px]">
                {[
                  { c: '#C2613C', pos: '-right-10 -top-12 h-52 w-52', o: 0.1 },
                  { c: '#6E8CA8', pos: '-left-10 bottom-0 h-44 w-44', o: 0.09 },
                ].map((b, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`absolute ${b.pos} rounded-full mix-blend-multiply`}
                    style={{
                      opacity: b.o,
                      background: `radial-gradient(circle at 50% 50%, ${b.c}, transparent 68%)`,
                      filter: 'blur(30px)',
                    }}
                  />
                ))}
                {sent && (
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? { opacity: 0.12 } : { opacity: 0, scale: 0.4 }}
                    animate={reduce ? { opacity: 0.12 } : { opacity: [0, 0.22, 0.12], scale: 1.7 }}
                    transition={reduce ? { duration: 0 } : { duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
                    className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, #C2613C, rgba(233,136,156,0.5) 45%, transparent 72%)',
                      filter: 'blur(34px)',
                    }}
                  />
                )}
              </div>

              {/* Content sits above paper + wash, textured with the site grain. */}
              <div className="paper-grain relative z-10 px-[clamp(1.75rem,4vw,3rem)] py-[clamp(1.75rem,4vw,2.75rem)]">
                {/* Card header — reads the sheet as a reply card. Persists across
                    both states so the confirmation stays on the same stationery. */}
                <div className="mb-7 flex items-baseline justify-between border-b border-line/80 pb-4">
                  <span className="eyebrow inline-flex items-center gap-2">
                    <Drop className="h-5 w-auto" fill="#C2613C" />
                    Reply card
                  </span>
                  <span className="font-mono text-xs lowercase tracking-wide text-ink-soft">
                    fill freely
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={SPRING}
                      className="relative"
                    >
                      <h3 className="font-sentient text-3xl tracking-[-0.04em] text-ink">
                        {ENQUIRY.confirm.title}
                        {firstName && <span className="text-terracotta">, {firstName}</span>}.
                      </h3>
                      <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
                        {ENQUIRY.confirm.body}
                      </p>
                      {ENQUIRY.confirm.sign && (
                        <motion.p
                          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.45 }}
                          className="mt-6 font-sentient text-3xl italic text-terracotta"
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

                      <Field name="name" label="Your name" required autoComplete="name" invalid={invalidField === 'name'} />
                      <Field
                        name="phone"
                        label="Phone number"
                        type="tel"
                        autoComplete="tel"
                        placeholder="e.g. 0400 000 000"
                      />
                      <Field name="email" label="Email" type="email" required autoComplete="email" invalid={invalidField === 'email'} />
                      <div className="flex flex-col sm:col-span-2">
                        <label
                          htmlFor="f-contactMethod"
                          className="mb-2 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink"
                        >
                          Preferred contact method
                        </label>
                        <div className="relative">
                          <select
                            id="f-contactMethod"
                            name="contactMethod"
                            className="w-full appearance-none border-b border-ink/30 bg-transparent py-3 pr-8 text-ink outline-none transition-colors focus:border-terracotta"
                          >
                            <option value="">Choose one</option>
                            <option>Email</option>
                            <option>Phone</option>
                          </select>
                          <svg
                            className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>
                      <Field name="venue" label="Venue or city" placeholder="e.g. Melbourne" />

                      <div className="flex flex-col">
                        <label htmlFor="f-package" className="mb-2 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink">
                          What are you after?
                        </label>
                        <div className="relative">
                          <select
                            id="f-package"
                            name="package"
                            className="w-full appearance-none border-b border-ink/30 bg-transparent py-3 pr-8 text-ink outline-none transition-colors focus:border-terracotta"
                          >
                            <option value="">Choose one</option>
                            {ENQUIRY.packageOptions.map((o) => (
                              <option key={o}>{o}</option>
                            ))}
                          </select>
                          <svg
                            className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex flex-col sm:col-span-2">
                        <label htmlFor="f-message" className="mb-2 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink">
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
                        <label className="mb-2 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink">
                          Wedding date
                        </label>
                        <div className="flex flex-col gap-3">
                          <input
                            type="date"
                            name="date"
                            className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors focus:border-terracotta"
                          />
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              name="date_unknown"
                              value="true"
                              className="h-5 w-5 rounded border border-ink/30 bg-transparent accent-terracotta cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-0"
                            />
                            <span className="text-sm text-ink transition-colors group-hover:text-terracotta">Not sure yet</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 sm:col-span-2">
                        <SealButton sending={sending} />
                        {error && (
                          <p id="enquire-error" role="alert" className="font-mono text-xs text-rust">
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The sheet the card is printed on: two stacked, slightly offset rectangles
 * whose edges are roughened by a shared feTurbulence + feDisplacementMap so
 * they read as torn watercolour paper rather than a crisp box. The whole layer
 * is cast in a soft, warm drop-shadow so the card lifts off the page. Static
 * (no animation) — cheap on mobile. Purely decorative, hidden from a11y.
 */
function DecklePaper({ id }) {
  const filterId = `deckle-${id}`
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ filter: 'drop-shadow(0 18px 38px rgba(42,39,36,0.18))' }}
    >
      <svg className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <filter id={filterId} x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="13" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* backing sheet, peeking out below/right */}
        <rect x="2%" y="2.6%" width="97%" height="97%" rx="3" fill="#DBCFBB" filter={`url(#${filterId})`} />
        {/* front sheet — the writing surface */}
        <rect x="0.6%" y="0.4%" width="97.4%" height="97.4%" rx="3" fill="#ECE4D6" filter={`url(#${filterId})`} />
      </svg>
    </div>
  )
}

/**
 * Submit control shaped as a wax seal, cast in translucent iridescent glass.
 *
 * The wax-seal read is preserved through four optical cues, only the material
 * changes: a domed body (light gathers top-left via the frosted highlight,
 * falls off bottom-right via the inner shadow); a bright Fresnel rim where the
 * glass edge catches light; oil-film iridescence (cyan/violet/peach/mint
 * blotches) that shifts on hover as if the glass were tilted; and the orchid
 * motif embossed into the surface — its dual drop-shadow (lit up-left,
 * shadowed down-right) makes it read as relief pressed into clear glass rather
 * than a flat glyph. `backdrop-blur` frosts the paper showing through. The disc
 * is decorative; the accessible name comes from the button + its visible label.
 */
function SealButton({ sending }) {
  return (
    <button
      type="submit"
      disabled={sending}
      aria-label="Send enquiry"
      className="group inline-flex w-fit items-center gap-4 outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full backdrop-blur-md transition-transform duration-200 ease-organic group-hover:translate-y-0.5 group-active:translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-terracotta group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-transparent"
        style={{
          // Frosted, translucent body with oil-film colour blotches — brightest
          // top-left where the light source sits, so the disc reads as a dome.
          background: [
            'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 42%)',
            'radial-gradient(circle at 74% 30%, rgba(120,220,235,0.5) 0%, rgba(120,220,235,0) 46%)',
            'radial-gradient(circle at 28% 80%, rgba(196,150,235,0.48) 0%, rgba(196,150,235,0) 52%)',
            'radial-gradient(circle at 80% 82%, rgba(245,190,150,0.46) 0%, rgba(245,190,150,0) 50%)',
            'radial-gradient(circle at 52% 58%, rgba(150,235,200,0.36) 0%, rgba(150,235,200,0) 56%)',
            'linear-gradient(135deg, rgba(255,255,255,0.26), rgba(210,224,255,0.12))',
          ].join(', '),
          boxShadow: [
            'inset 0 1.5px 1.5px rgba(255,255,255,0.9)', // top rim catch
            'inset 1.5px 0 2px rgba(255,255,255,0.45)', // left rim catch
            'inset -3px -4px 8px rgba(70,50,110,0.28)', // dome falloff, lower-right
            'inset 0 0 0 1px rgba(255,255,255,0.35)', // glass edge
            '0 8px 18px rgba(80,60,130,0.3)', // cool cast shadow
            '0 2px 4px rgba(40,30,70,0.25)', // contact shadow
          ].join(', '),
        }}
      >
        {/* Bright crescent glare across the top — glass catching the light. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(120% 78% at 28% 6%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 40%)',
          }}
        />
        {/* Iridescent sheen that blooms on hover, as if the glass were tilted. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at 72% 18%, rgba(255,120,200,0.5) 0%, rgba(255,120,200,0) 46%), radial-gradient(circle at 22% 74%, rgba(120,255,220,0.45) 0%, rgba(120,255,220,0) 50%)',
            mixBlendMode: 'screen',
          }}
        />
        {/* Orchid embossed into the glass: an icy translucent face whose dual
            drop-shadow gives it a lit upper edge and a shadowed lower recess. */}
        <span
          aria-hidden="true"
          className="relative h-7 w-7 opacity-80"
          style={{
            filter:
              'drop-shadow(0.6px 0.9px 0.5px rgba(55,38,90,0.5)) drop-shadow(-0.6px -0.7px 0.4px rgba(255,255,255,0.85))',
          }}
        >
          <Drop className="h-7 w-7" fill="#EEF5FF" />
        </span>
      </span>
      <span className="font-sentient text-2xl tracking-[-0.02em] text-ink transition-colors group-hover:text-terracotta">
        {sending ? 'Sealing…' : 'Seal & send'}
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
    </button>
  )
}

function Field({ name, label, type = 'text', required, invalid = false, ...rest }) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={`f-${name}`}
        className="mb-2 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink"
      >
        {label}
        {required && <span className="text-rust"> *</span>}
      </label>
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'enquire-error' : undefined}
        className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-terracotta"
        {...rest}
      />
    </div>
  )
}
