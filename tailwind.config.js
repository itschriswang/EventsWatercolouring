/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm editorial base — the organic paper colour from the original site.
        paper: '#F4EFE6',
        'paper-deep': '#EAE2D4',
        ink: '#2A2724',
        'ink-soft': '#6B6258',
        line: '#D8CFBF',
        // Pigments sampled from the bouquet painting (reused from the legacy site).
        terracotta: '#C2613C',
        rust: '#A4502F',
        orange: '#ED8A33',
        ochre: '#C9A23A',
        sage: '#6E7E4E',
        lime: '#AEBF56',
        cornflower: '#6E8CA8',
        teal: '#3A7F9D',
        rose: '#C98B8C',
        magenta: '#B5395B',
        blush: '#E4889C',
        wine: '#6C2A3E',
      },
      fontFamily: {
        // Three-role editorial system:
        //  display  — Epoch, the new display/sentence sans (replaces Sora).
        //             Used for numbers, prices, and sentence-length display text.
        //             Sora kept as fallback for any chars outside Epoch's basic latin set.
        //  body     — Manrope, the neutral, legible narrative voice.
        //  mono     — Space Mono, the rigid "blueprint" for UI/logistics.
        //  zt-oskon — ZT Bros Oskon 90s, for all titles and wordmarks.
        display: ['"Epoch"', '"Sora"', 'Georgia', 'sans-serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
        'zt-oskon': ['"ZT Oskon 90s"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
      },
      maxWidth: {
        wrap: '78rem',
      },
      transitionTimingFunction: {
        organic: 'cubic-bezier(.22,.61,.36,1)',
      },
    },
  },
  plugins: [],
}
