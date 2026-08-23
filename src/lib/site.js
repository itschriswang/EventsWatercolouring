// Shared spring config — every entrance, layout shift and magnetic pull
// hangs off this so the whole page moves with one consistent physics.
export const SPRING = { type: 'spring', stiffness: 100, damping: 20 }

// A slightly looser spring for large, heavy elements (hero art, overlays).
export const SPRING_SOFT = { type: 'spring', stiffness: 70, damping: 18 }

// Shared paper-card ground for the Packages family of cells (base package,
// add-ons, "what does a booking cover?" planner, the FAQ pointer). One ground
// so they read as one set. Plain near-white/cream, with no pastel tint of its
// own: the page these cards sit on (Packages' "warm" WatercolourBloom wash)
// already washes apricot/blush/yellow-green/lilac across the same paper-deep
// ground at similar low opacities, so a matching tint on the card itself
// landed at nearly the same value as the page — cards barely separated from
// their surroundings and all read as one blurred wash. Keeping the card
// itself untinted (colour instead lives only in each card's CornerBloom
// corners) is what gives the tile its lift.
export const CARD_BG =
  'radial-gradient(ellipse 120% 90% at 50% 0%, #FFFFFF 0%, #FCFAF6 65%, #F8F4EC 100%)'

// Resolve a /public asset against Vite's configured base path so URLs
// stay correct regardless of where the site is served from.
export const asset = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

// srcset for a gallery painting's WebP <source>, built from the manifest that
// scripts/generate-image-variants.mjs writes — so every entry names a file
// that exists, at its true width. Names without variants (or added before the
// script is re-run) fall back to the original alone, which is exactly what
// the <source> shipped before variants existed.
import ART_VARIANTS from './artVariants.json'
export const artSrcset = (name) => {
  const v = ART_VARIANTS[name]
  const original = `${asset(`assets/${name}.webp`)}${v ? ` ${v.width}w` : ''}`
  if (!v) return original
  return [...v.widths.map((w) => `${asset(`assets/${name}-${w}.webp`)} ${w}w`), original].join(', ')
}

/**
 * The framer `viewport` every scroll-triggered entrance shares.
 *
 * The lead is the point, and it used to run the other way: seventeen reveals
 * across the site each carried their own margin between -40px and -90px, which
 * asks the browser to hold the content invisible until it is already that far
 * INSIDE the viewport. On a desktop the observer fires immediately and nobody
 * notices. On iOS Safari, which is slow to deliver IntersectionObserver
 * callbacks while a flick is still carrying the page, the element is on screen
 * — blank — before its own trigger qualifies, and the whole run then arrives at
 * once when the scroll settles. That is the "popping in".
 *
 * A positive BOTTOM margin extends the observation box below the fold instead,
 * so a reveal is asked for while the element is still off screen and has
 * finished, or nearly, by the time it is looked at. 20% of the viewport is
 * enough lead to absorb that latency while still being short enough that a
 * reading-speed scroll watches the entrance play, which is what it is for.
 *
 * Shared rather than repeated so the next reveal starts in the right place, and
 * so this is one edit if the lead ever needs retuning.
 */
export const REVEAL_VIEWPORT = { once: true, margin: '0px 0px 20% 0px' }

// Where the "Enquire" actions point. Root-relative (not a bare `#enquiry`
// hash) so the link still works from other static pages, like /faq/ — same
// document, same-page smooth scroll on the homepage; a normal navigation
// back to the homepage anchor from anywhere else.
export const ENQUIRE_HREF = '/#enquiry'

// The live enquiry address.
export const EMAIL = 'create@chriswangstudio.com'

// Formspree endpoint that receives enquiry submissions.
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwvdvory'

// Flip to false if the endpoint above ever reverts to a placeholder — the
// form then routes visitors to a pre-filled email instead of pretending a
// POST can succeed. (The old `!includes('your-form-id')` check was a
// tautology once the real id landed.)
export const FORMSPREE_READY = true

// Lightweight email shape check — enough to catch typos before submit without
// rejecting valid-but-unusual addresses.
export const isValidEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
