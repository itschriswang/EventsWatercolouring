// Shared spring config — every entrance, layout shift and magnetic pull
// hangs off this so the whole page moves with one consistent physics.
export const SPRING = { type: 'spring', stiffness: 100, damping: 20 }

// A slightly looser spring for large, heavy elements (hero art, overlays).
export const SPRING_SOFT = { type: 'spring', stiffness: 70, damping: 18 }

// Resolve a /public asset against Vite's configured base path so URLs
// stay correct under the GitHub Pages sub-path (/EventsWatercolouring/).
export const asset = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

// Where the "Enquire" actions point in-page.
export const ENQUIRE_HREF = '#enquiry'

// Placeholder enquiry address, carried over verbatim from the legacy copy.
export const EMAIL = 'hello@example.com'
