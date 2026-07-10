// Shared spring config — every entrance, layout shift and magnetic pull
// hangs off this so the whole page moves with one consistent physics.
export const SPRING = { type: 'spring', stiffness: 100, damping: 20 }

// A slightly looser spring for large, heavy elements (hero art, overlays).
export const SPRING_SOFT = { type: 'spring', stiffness: 70, damping: 18 }

// Shared paper-card ground for the Packages family of cells (base package,
// add-ons, "what does a booking cover?" planner, the FAQ pointer). One ground
// so they read as one set. The radial deliberately resolves to a near-white
// cream (#FCFAF6) that sits *above* the page's paper value (#F7F4EF) — the
// earlier ground faded to the page colour itself, so the cards had no value
// separation from the wash behind them and read as muddy. The pastel arc wash
// (apricot → blush → yellow-green) is kept but lifted a touch in lightness /
// dropped in opacity so it tints without dulling the paper.
export const CARD_BG =
  'linear-gradient(150deg, rgba(247,195,148,0.13) 0%, rgba(242,194,207,0.09) 48%, rgba(228,230,156,0.11) 100%), ' +
  'radial-gradient(ellipse 120% 90% at 50% 0%, #FFFFFF 0%, #FCFAF6 72%)'

// Resolve a /public asset against Vite's configured base path so URLs
// stay correct regardless of where the site is served from.
export const asset = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

// Where the "Enquire" actions point. Root-relative (not a bare `#enquiry`
// hash) so the link still works from other static pages, like /faq/ — same
// document, same-page smooth scroll on the homepage; a normal navigation
// back to the homepage anchor from anywhere else.
export const ENQUIRE_HREF = '/#enquiry'

// Placeholder enquiry address — swap for your real address before launch.
export const EMAIL = 'create@chriswangstudio.com'

// Formspree endpoint that receives enquiry submissions. Create a free form at
// https://formspree.io, then paste its endpoint here (it looks like
// https://formspree.io/f/abcdwxyz). Until a real id is set, the form falls
// back to opening the visitor's email client with the enquiry pre-filled.
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwvdvory'

// True once a real Formspree endpoint has been set (i.e. the placeholder id is
// gone). The form uses this to decide whether it can confirm a real send.
export const FORMSPREE_READY = !FORMSPREE_ENDPOINT.includes('your-form-id')

// Lightweight email shape check — enough to catch typos before submit without
// rejecting valid-but-unusual addresses.
export const isValidEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
