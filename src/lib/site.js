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
