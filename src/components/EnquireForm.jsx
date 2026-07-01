import { useId, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion'
import Label, { Drop } from './Label.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
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

// One orchid petal (from the Label glyph) and the five rotations that compose
// the bloom — reused as the pressed motif stamped into the seal.
const PETAL_D = 'M 0,0 C -12,-4 -14,-24 -2,-35 C 0,-36 2,-35 0,-36 C 14,-24 12,-4 0,0 Z'
const PETAL_ROT = [128, -128, 75, -75, 0]

// Trapped air bubbles, pressed as tiny raised specks so the lighting catches
// them too. Coordinates are in the seal's 0–100 viewBox.
const SEAL_BUBBLES = [
  { cx: 66, cy: 30, r: 1.7 },
  { cx: 62, cy: 72, r: 1.3 },
  { cx: 31, cy: 66, r: 1.1 },
]

// Resting light position (top-left) used on touch/reduced-motion, and the
// horizontal/vertical sweep the point light travels as the seal scrolls.
const LIGHT_REST = { x: 40, y: 26 }
const lightAt = (v) => ({ x: 34 + v * 32, y: 23 + v * 8 })

/**
 * Submit control shaped as a real, gooey wax seal, lit in 3D.
 *
 * The seal is built as TWO layered height maps run through real lighting
 * filters (feDiffuseLighting + feSpecularLighting), not stacked CSS gradients:
 *
 *  - The BASE (floor disc + raised rim ring) gets a big, low-frequency
 *    feTurbulence + a wide feDisplacementMap, so the whole silhouette pours out
 *    unevenly — thicker in some places, thinner in others — like real dripped
 *    wax rather than a uniform ring. Its height map is blurred wide enough
 *    that the rim has no flat plateau: it's a genuine rounded bead, brightest
 *    where it curves toward the light and shaded where it curves away.
 *  - The MOTIF (the pressed orchid + trapped bubbles) is layered on top with
 *    only a light blur and no displacement, so the fine relief stays crisp
 *    while still catching its own curved highlight.
 *
 * Both layers are warmed (ivory/tan lighting colours, not steel) and their
 * point lights share one scroll-driven position on desktop, so the whole seal
 * re-lights together as it scrolls — the highlight sweeping across the ridge
 * like a real seal tilted in the hand. Touch and reduced-motion hold the light
 * at rest. Iridescence blooms on hover. Decorative; the accessible name comes
 * from the button + its visible label.
 */
function SealButton({ sending }) {
  const uid = useId().replace(/:/g, '')
  const baseId = `waxbase-${uid}`
  const motifId = `waxmotif-${uid}`
  const reduce = useReducedMotion()
  const parallax = useHeavyFx() && !reduce

  // Drive both filters' point lights imperatively off scroll so re-lighting the
  // SVG never triggers a React render. All four lights share one motion value.
  const sealRef = useRef(null)
  const baseDiffRef = useRef(null)
  const baseSpecRef = useRef(null)
  const motifDiffRef = useRef(null)
  const motifSpecRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sealRef,
    offset: ['start end', 'end start'],
  })
  const light = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  useMotionValueEvent(light, 'change', (v) => {
    if (!parallax) return
    const { x, y } = lightAt(v)
    for (const ref of [baseDiffRef, baseSpecRef, motifDiffRef, motifSpecRef]) {
      ref.current?.setAttribute('x', x.toFixed(1))
      ref.current?.setAttribute('y', y.toFixed(1))
    }
  })

  return (
    <button
      type="submit"
      disabled={sending}
      aria-label="Send enquiry"
      className="group inline-flex w-fit items-center gap-4 outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        ref={sealRef}
        className="relative h-14 w-14 shrink-0 transition-transform duration-200 ease-organic group-hover:translate-y-0.5 group-active:translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-terracotta group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-transparent"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full overflow-visible"
          style={{ filter: 'drop-shadow(0 2.5px 3px rgba(58,44,92,0.22))' }}
        >
          <defs>
            {/* BASE: the poured blob + its plump, unevenly-rounded rim.
                Two blur widths do different jobs: H (wide) feeds the lighting
                so the rim curves with no flat plateau; Hclip (tight) is what
                the visible paint is masked to, so the colour itself doesn't
                melt outward into a wide halo the way the lighting's height map
                needs to. */}
            <filter id={baseId} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="7" result="noise" />
              <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="H" />
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="Hclip" />
              {/* Low-opacity flood: a clear-gel tint, not opaque wax colour —
                  most of the card behind is meant to read through. */}
              <feFlood floodColor="#F1EEFA" floodOpacity="0.4" result="tint" />
              <feComposite in="tint" in2="Hclip" operator="in" result="body" />
              <feDiffuseLighting in="H" surfaceScale="7.5" diffuseConstant="1" lightingColor="#e9ecf7" result="diffRaw">
                <fePointLight ref={baseDiffRef} x={LIGHT_REST.x} y={LIGHT_REST.y} z="46" />
              </feDiffuseLighting>
              {/* Raise the shadow FLOOR on colour (R/G/B), not alpha — otherwise
                  the diffuse shading still crushes to near-black in shadow and
                  drags the translucent body dark when multiplied below. */}
              <feComponentTransfer in="diffRaw" result="diffSoft">
                <feFuncR type="linear" slope="0.55" intercept="0.42" />
                <feFuncG type="linear" slope="0.55" intercept="0.42" />
                <feFuncB type="linear" slope="0.55" intercept="0.42" />
              </feComponentTransfer>
              <feComposite in="diffSoft" in2="Hclip" operator="in" result="diff" />
              <feSpecularLighting in="H" surfaceScale="7.5" specularConstant="0.8" specularExponent="9" lightingColor="#ffffff" result="specRaw">
                <fePointLight ref={baseSpecRef} x={LIGHT_REST.x} y={LIGHT_REST.y} z="46" />
              </feSpecularLighting>
              <feComposite in="specRaw" in2="Hclip" operator="in" result="spec" />
              <feBlend in="body" in2="diff" mode="multiply" result="shaded" />
              <feComposite in="spec" in2="shaded" operator="arithmetic" k1="0" k2="0.85" k3="1" k4="0" result="lit" />
              <feComponentTransfer in="lit" result="glass">
                <feFuncA type="linear" slope="0.85" />
              </feComponentTransfer>
              <feDisplacementMap in="glass" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            {/* MOTIF: the pressed orchid + bubbles — crisp, not displaced,
                same clear-gel translucency as the base. */}
            <filter id={motifId} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="Hm" />
              <feFlood floodColor="#F1EEFA" floodOpacity="0.45" result="mtint" />
              <feComposite in="mtint" in2="Hm" operator="in" result="mbody" />
              <feDiffuseLighting in="Hm" surfaceScale="4" diffuseConstant="1" lightingColor="#e9ecf7" result="mdiffRaw">
                <fePointLight ref={motifDiffRef} x={LIGHT_REST.x} y={LIGHT_REST.y} z="46" />
              </feDiffuseLighting>
              <feComponentTransfer in="mdiffRaw" result="mdiffSoft">
                <feFuncR type="linear" slope="0.6" intercept="0.35" />
                <feFuncG type="linear" slope="0.6" intercept="0.35" />
                <feFuncB type="linear" slope="0.6" intercept="0.35" />
              </feComponentTransfer>
              <feComposite in="mdiffSoft" in2="Hm" operator="in" result="mdiff" />
              <feSpecularLighting in="Hm" surfaceScale="4" specularConstant="0.7" specularExponent="14" lightingColor="#ffffff" result="mspecRaw">
                <fePointLight ref={motifSpecRef} x={LIGHT_REST.x} y={LIGHT_REST.y} z="46" />
              </feSpecularLighting>
              <feComposite in="mspecRaw" in2="Hm" operator="in" result="mspec" />
              <feBlend in="mbody" in2="mdiff" mode="multiply" result="mshaded" />
              <feComposite in="mspec" in2="mshaded" operator="arithmetic" k1="0" k2="0.85" k3="1" k4="0" />
            </filter>
          </defs>

          {/* Silhouette that becomes the BASE height map: a thin, mostly-clear
              floor disc and a much more opaque raised rim ring. The big gap
              between the floor's alpha (0.16) and the ring's (0.95) is what
              gives the rim a real INNER slope too — a symmetric step down on
              both its outer face (rim → background) and inner face (rim →
              recessed centre), so both sides pick up their own highlight and
              shadow instead of just the outer edge. Fill colour is irrelevant
              — only the alpha feeds the lighting. */}
          <g filter={`url(#${baseId})`} fill="#fff">
            <circle cx="50" cy="50" r="43" opacity="0.16" />
            <circle cx="50" cy="50" r="37" fill="none" stroke="#fff" strokeWidth="12" opacity="0.95" />
          </g>

          {/* MOTIF layer, stamped on top: the pressed orchid + bubbles. */}
          <g filter={`url(#${motifId})`} fill="#fff">
            <g transform="translate(50 52) scale(0.4)" opacity="0.65">
              {PETAL_ROT.map((r, i) => (
                <path key={i} d={PETAL_D} transform={`rotate(${r})`} />
              ))}
            </g>
            {SEAL_BUBBLES.map((b, i) => (
              <circle key={i} cx={b.cx} cy={b.cy} r={b.r} opacity="0.6" />
            ))}
          </g>
        </svg>

        {/* Oil-film iridescence — always faintly present on the clear gel,
            blooming brighter on hover as if the seal were tilted to the light. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[10%] rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: [
              'radial-gradient(circle at 30% 20%, rgba(140,225,240,0.42) 0%, rgba(140,225,240,0) 44%)',
              'radial-gradient(circle at 72% 24%, rgba(255,140,205,0.4) 0%, rgba(255,140,205,0) 46%)',
              'radial-gradient(circle at 26% 76%, rgba(200,165,235,0.38) 0%, rgba(200,165,235,0) 50%)',
              'radial-gradient(circle at 76% 78%, rgba(255,195,150,0.36) 0%, rgba(255,195,150,0) 50%)',
              'radial-gradient(circle at 50% 55%, rgba(150,235,205,0.3) 0%, rgba(150,235,205,0) 56%)',
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
