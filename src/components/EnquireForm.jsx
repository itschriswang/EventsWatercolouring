import { useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Label, { Drop } from './Label.jsx'
import { CalendarDateIcon } from './icons/FreehandIcons.jsx'
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

// The three sheets of the reply card, in order.
const LAST_STEP = 2
const STEP_COUNT = LAST_STEP + 1

// Steps switch on a quick ease-out tween — a spring that feels right for
// entrances reads as sluggish between quiz questions, where the next sheet
// should arrive the moment it's asked for.
const STEP_TWEEN = { duration: 0.26, ease: [0.25, 1, 0.5, 1] }

// Slide direction follows navigation: forward pulls the next sheet in from
// the right, Back returns it from the left. Zeroed under reduced motion.
const stepVariants = (reduce) => ({
  enter: (d) => ({ opacity: 0, x: reduce ? 0 : 28 * d }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: reduce ? 0 : -28 * d }),
})

// Tappable answer chip — same family as the planner's hour buttons, so the
// quiz reads as more of the site's existing language, not a new widget.
const chipClass = (on) =>
  'rounded-full border px-4 py-2 text-left text-sm transition-colors duration-300 ' +
  (on
    ? 'border-terracotta bg-terracotta text-paper'
    : 'border-ink/25 text-ink-soft hover:border-terracotta/60 hover:text-ink')

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
 * The card asks its questions one sheet at a time — what are you after (a
 * tap), when and where (mostly skippable), then a name and an email — so the
 * enquiry feels like three small answers rather than one long form. Because
 * earlier sheets are unmounted by the time the seal is pressed, every answer
 * lives in state and submit builds its own FormData, with the exact field
 * names the old one-sheet form posted — the Formspree payload is unchanged.
 *
 * Form and confirmation share the SAME card: on a confirmed send the sheet
 * floods with pigment and becomes the handwritten thank-you, so the note never
 * appears out of nowhere. Submissions POST to Formspree (see FORMSPREE_ENDPOINT
 * in lib/site.js); if the endpoint is unconfigured or the request fails it
 * falls back to opening the visitor's email client.
 */
export default function EnquireForm({ initialPackage = '', dateLabel = 'Wedding date' }) {
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

  // Every answer, across all three sheets. `initialPackage` lets other pages
  // (e.g. /corporate/) open the card with their audience's option already
  // chosen; the planner event below prefills package and message the same way.
  const [f, setF] = useState({
    name: '',
    phone: '',
    email: '',
    contactMethod: '',
    venue: '',
    package: initialPackage,
    date: '',
    dateUnknown: false,
    message: '',
  })
  const set = (key) => (e) => {
    const v = e.target.value
    setF((p) => ({ ...p, [key]: v }))
  }

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  // Focus follows the step change so keyboard and screen-reader users land on
  // the fresh sheet — but never on first mount, which would yank the page.
  const navigated = useRef(false)
  const stepRef = useRef(null)
  const goto = (next) => {
    navigated.current = true
    setDir(next > step ? 1 : -1)
    setStep(next)
    setError('')
    setInvalidField('')
  }
  useEffect(() => {
    if (!navigated.current) return
    stepRef.current?.focus({ preventScroll: true })
  }, [step])

  // The planner (NightPlanner.jsx) dispatches this just before the anchor
  // navigation lands here — prefill, but never overwrite words the visitor
  // has already typed.
  useEffect(() => {
    const onPlanner = (e) => {
      const { hours } = e.detail || {}
      if (!hours) return
      setF((p) => ({
        ...p,
        message: p.message || `Thinking around ${hours} hours live.`,
        package: p.package || 'Live on the day',
      }))
    }
    window.addEventListener('ew:planner-enquire', onPlanner)
    return () => window.removeEventListener('ew:planner-enquire', onPlanner)
  }, [])

  // Focus the first field that failed validation so keyboard and screen-reader
  // users land on the problem instead of hunting for it.
  const focusField = (form, name) => form?.elements?.[name]?.focus?.()

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (form._gotcha.value) return // honeypot tripped
    // Enter partway through the quiz means "continue", not "send" — the seal
    // only exists on the last sheet, but implicit submission doesn't care.
    if (step < LAST_STEP) {
      goto(step + 1)
      return
    }

    const data = { ...f, date_unknown: f.dateUnknown ? 'true' : '' }

    setNotice('')
    if (!data.name?.trim()) {
      setError('Please add your name so I know who I am writing back to.')
      setInvalidField('name')
      focusField(form, 'name')
      return
    }
    if (!data.email?.trim() || !isValidEmail(data.email)) {
      setError('That email looks off, please check it, like name@example.com.')
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
      // Same field set the one-sheet form used to post, rebuilt from state
      // (earlier sheets are unmounted, so the DOM no longer holds them).
      const fd = new FormData()
      fd.append('_gotcha', form._gotcha.value)
      for (const k of ['name', 'phone', 'email', 'contactMethod', 'date', 'venue', 'package', 'message']) {
        fd.append(k, f[k])
      }
      if (f.dateUnknown) fd.append('date_unknown', 'true')
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
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

  const S = ENQUIRY.steps

  return (
    <section id="enquiry" className="relative w-full px-[5vw] pt-[clamp(3rem,6vw,5.5rem)] pb-[clamp(3.5rem,7vw,6rem)]">
      <div className="grid grid-cols-12 gap-x-8 gap-y-12">
        <div className="relative col-span-12 lg:col-span-4">
          <Label gradient={['#F2A6C1', '#DB6E97']}>{ENQUIRY.label}</Label>
          <h2 className="display-lg mt-5 text-ink">
            {ENQUIRY.title[0]}
            <br />
            <em className="text-terracotta">{ENQUIRY.title[1]}</em>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-ink-soft">{ENQUIRY.intro}</p>
          <p className="mt-6 flex flex-col gap-1 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft sm:flex-row sm:items-baseline sm:gap-1.5">
            <span>Or email</span>
            <a
              href={`mailto:${EMAIL}`}
              className="text-ink underline underline-offset-4 [overflow-wrap:anywhere]"
            >
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
                  { c: '#F2A6C1', pos: '-right-10 -top-12 h-52 w-52', o: 0.14 },
                  { c: '#D4B6E6', pos: '-left-10 bottom-0 h-44 w-44', o: 0.12 },
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
                        'radial-gradient(circle at 50% 50%, #F2A6C1, rgba(212,182,230,0.5) 45%, transparent 72%)',
                      filter: 'blur(34px)',
                    }}
                  />
                )}
              </div>

              {/* Content sits above paper + wash, textured with the site grain. */}
              <div className="paper-grain relative z-10 px-[clamp(1.75rem,4vw,3rem)] py-[clamp(1.75rem,4vw,2.75rem)]">
                {/* Card header — reads the sheet as a reply card, and counts
                    the sheets so the visitor always knows how little is left.
                    Persists across both states so the confirmation stays on
                    the same stationery. */}
                <div className="mb-7 flex items-baseline justify-between border-b border-line/80 pb-4">
                  <span className="eyebrow inline-flex items-center gap-2">
                    <Drop className="h-5 w-auto" gradient={['#F2A6C1', '#DB6E97']} />
                    Reply card
                  </span>
                  <span className="font-mono text-xs lowercase tracking-wide text-ink-soft">
                    {sent ? 'sealed' : `${step + 1} of ${STEP_COUNT}`}
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
                    <motion.form key="form" noValidate onSubmit={onSubmit} initial={false}>
                      {/* honeypot — lives outside the sheets so it's always
                          mounted, whatever step is showing */}
                      <label className="absolute left-[-9999px]" aria-hidden="true">
                        Leave this empty
                        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
                      </label>

                      <AnimatePresence mode="wait" initial={false} custom={dir}>
                        <motion.div
                          key={step}
                          ref={stepRef}
                          tabIndex={-1}
                          custom={dir}
                          variants={stepVariants(reduce)}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={STEP_TWEEN}
                          className="outline-none"
                        >
                          {step > 0 && (
                            <button
                              type="button"
                              onClick={() => goto(step - 1)}
                              className="mb-5 inline-flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                            >
                              <span aria-hidden="true">←</span>
                              {S.back}
                            </button>
                          )}

                          {step === 0 && (
                            <>
                              <StepHeading q={S.what.q} hint={S.what.hint} />
                              <div
                                role="group"
                                aria-label={S.what.q}
                                className="mt-6 flex flex-wrap gap-2"
                              >
                                {ENQUIRY.packageOptions.map((o) => (
                                  <button
                                    key={o}
                                    type="button"
                                    aria-pressed={f.package === o}
                                    onClick={() => {
                                      setF((p) => ({ ...p, package: o }))
                                      goto(1)
                                    }}
                                    className={chipClass(f.package === o)}
                                  >
                                    {o}
                                  </button>
                                ))}
                              </div>
                              {/* A tap advances on its own; the button only
                                  appears when the answer arrived prefilled
                                  (planner, /corporate/) or via Back. */}
                              {f.package && (
                                <div className="mt-8">
                                  <NextButton onClick={() => goto(1)} label={S.next} />
                                </div>
                              )}
                            </>
                          )}

                          {step === 1 && (
                            <>
                              <StepHeading q={S.when.q} hint={S.when.hint} />
                              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                                <div className="flex flex-col">
                                  <label
                                    htmlFor="f-date"
                                    className="mb-2 flex items-center gap-1.5 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink"
                                  >
                                    <CalendarDateIcon width={15} height={15} className="text-terracotta" />
                                    {dateLabel}
                                  </label>
                                  <input
                                    id="f-date"
                                    type="date"
                                    name="date"
                                    value={f.date}
                                    onChange={(e) =>
                                      // A real date and "not sure yet" can't
                                      // both be true — picking one clears the other.
                                      setF((p) => ({ ...p, date: e.target.value, dateUnknown: false }))
                                    }
                                    className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors focus:border-terracotta"
                                  />
                                  <button
                                    type="button"
                                    aria-pressed={f.dateUnknown}
                                    onClick={() =>
                                      setF((p) => ({ ...p, dateUnknown: !p.dateUnknown, date: '' }))
                                    }
                                    className={'mt-4 w-fit ' + chipClass(f.dateUnknown)}
                                  >
                                    {S.notSure}
                                  </button>
                                </div>
                                <Field
                                  name="venue"
                                  label="Venue or city"
                                  placeholder="e.g. Melbourne"
                                  value={f.venue}
                                  onChange={set('venue')}
                                />
                              </div>
                              <div className="mt-8">
                                <NextButton onClick={() => goto(2)} label={S.next} />
                              </div>
                            </>
                          )}

                          {step === 2 && (
                            <>
                              <StepHeading q={S.who.q} hint={S.who.hint} />
                              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                                <Field
                                  name="name"
                                  label="Your name"
                                  required
                                  autoComplete="name"
                                  invalid={invalidField === 'name'}
                                  value={f.name}
                                  onChange={set('name')}
                                />
                                <Field
                                  name="email"
                                  label="Email"
                                  type="email"
                                  required
                                  autoComplete="email"
                                  invalid={invalidField === 'email'}
                                  value={f.email}
                                  onChange={set('email')}
                                />
                                <Field
                                  name="phone"
                                  label="Phone number"
                                  type="tel"
                                  autoComplete="tel"
                                  placeholder="e.g. 0400 000 000"
                                  value={f.phone}
                                  onChange={set('phone')}
                                />
                                <div className="flex flex-col">
                                  <span className="mb-2 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink">
                                    Preferred contact method
                                  </span>
                                  <div
                                    role="group"
                                    aria-label="Preferred contact method"
                                    className="flex gap-2 py-1"
                                  >
                                    {['Email', 'Phone'].map((m) => (
                                      <button
                                        key={m}
                                        type="button"
                                        aria-pressed={f.contactMethod === m}
                                        onClick={() =>
                                          setF((p) => ({
                                            ...p,
                                            contactMethod: p.contactMethod === m ? '' : m,
                                          }))
                                        }
                                        className={chipClass(f.contactMethod === m)}
                                      >
                                        {m}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex flex-col sm:col-span-2">
                                  <label
                                    htmlFor="f-message"
                                    className="mb-2 font-body font-bold text-[0.7rem] uppercase tracking-[0.12em] text-ink"
                                  >
                                    Message <span className="font-normal text-ink-soft">(optional)</span>
                                  </label>
                                  <textarea
                                    id="f-message"
                                    name="message"
                                    rows={3}
                                    value={f.message}
                                    onChange={set('message')}
                                    placeholder="Tell me a little about the day, and the people who matter most."
                                    className="resize-none border-b border-ink/30 bg-transparent py-2 text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-terracotta"
                                  />
                                </div>
                              </div>

                              <div className="mt-8 flex flex-col gap-4">
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
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
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

/** The question each sheet asks, in the card's own voice. */
function StepHeading({ q, hint }) {
  return (
    <>
      <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">{q}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{hint}</p>
    </>
  )
}

/** Forward control between sheets — same pill as the planner's CTA. */
function NextButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2.5 rounded-full bg-terracotta px-5 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-rust"
    >
      {label}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </button>
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
      style={{ filter: 'drop-shadow(0 18px 38px rgba(63,53,82,0.21))' }}
    >
      <svg className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <filter id={filterId} x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="13" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* backing sheet, peeking out below/right — warm kraft, not grey */}
        <rect x="2%" y="2.6%" width="97%" height="97%" rx="3" fill="#E2DFE9" filter={`url(#${filterId})`} />
        {/* front sheet — the writing surface. A touch lighter and warmer than
            the page behind it, so the card reads as its own bright sheet of
            cotton laid on the table rather than a cold grey insert. */}
        <rect x="0.6%" y="0.4%" width="97.4%" height="97.4%" rx="3" fill="#FBF9F4" filter={`url(#${filterId})`} />
      </svg>
    </div>
  )
}

/**
 * Submit control shaped as a wax seal: the iridescent pressed-seal artwork,
 * cut out with a transparent centre so the card shows through the motif.
 * Decorative; the accessible name comes from the button + its visible label.
 */
function SealButton({ sending }) {
  return (
    <button
      type="submit"
      disabled={sending}
      aria-label="Send enquiry"
      className="group inline-flex w-fit items-center gap-4 outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="relative h-20 w-20 shrink-0 transition-transform duration-200 ease-organic group-hover:translate-y-0.5 group-active:translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-terracotta group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-transparent">
        <picture>
          <source srcSet={asset('assets/seal.webp')} type="image/webp" />
          <img
            src={asset('assets/seal.png')}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              filter:
                'sepia(0.15) saturate(1.05) drop-shadow(0 2.5px 3px rgba(94,74,140,0.25))',
            }}
          />
        </picture>

        {/* Oil-film iridescence — always faintly present on the seal,
            blooming brighter on hover as if it were tilted to the light. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[10%] rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: [
              'radial-gradient(circle at 30% 20%, rgba(240,228,158,0.22) 0%, rgba(240,228,158,0) 44%)',
              'radial-gradient(circle at 72% 24%, rgba(176,74,118,0.18) 0%, rgba(176,74,118,0) 46%)',
              'radial-gradient(circle at 26% 76%, rgba(201,169,75,0.18) 0%, rgba(201,169,75,0) 50%)',
              'radial-gradient(circle at 76% 78%, rgba(232,155,99,0.16) 0%, rgba(232,155,99,0) 50%)',
              'radial-gradient(circle at 50% 55%, rgba(176,74,118,0.14) 0%, rgba(176,74,118,0) 56%)',
            ].join(', '),
            mixBlendMode: 'screen',
          }}
        />
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
