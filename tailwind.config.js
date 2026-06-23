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
        // Headings — Instrument Sans. Body + all UI text — Plus Jakarta Sans.
        // `mono` keeps its name as the small-label slot but now points at
        // Jakarta too, so the site reads as a clean two-font system; the
        // labels hold their identity through uppercase + wide tracking.
        display: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
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
