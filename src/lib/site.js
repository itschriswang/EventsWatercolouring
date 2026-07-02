// Shared spring config — every entrance, layout shift and magnetic pull
// hangs off this so the whole page moves with one consistent physics.
export const SPRING = { type: 'spring', stiffness: 100, damping: 20 }

// A slightly looser spring for large, heavy elements (hero art, overlays).
export const SPRING_SOFT = { type: 'spring', stiffness: 70, damping: 18 }

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
