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
        // Deepened from #A4502F so body-size `text-rust` clears WCAG AA (4.5:1)
        // on the warm paper/card backgrounds, and the timeline section it backs
        // (`bg-rust`) sits a touch richer.
        rust: '#9A4A2B',
        orange: '#ED8A33',
        ochre: '#C9A23A',
        // Light ochre for emphasis set on the dark rust timeline — a mid ochre
        // sits too close to rust to read (2.6:1); this clears AA (~5:1).
        'ochre-light': '#F8E6AE',
        sage: '#6E7E4E',
        // Darker sage for sage used as *text* (chips, section numerals): the
        // base sage is a fill/accent green and only reaches 3.85:1 on paper.
        'sage-deep': '#566443',
        lime: '#AEBF56',
        cornflower: '#6E8CA8',
        teal: '#3A7F9D',
        rose: '#C98B8C',
        magenta: '#B5395B',
        blush: '#E4889C',
        wine: '#6C2A3E',
      },
      fontFamily: {
        // Three-font editorial system:
        //  body     — Manrope, the neutral, legible narrative voice.
        //  mono     — Mynerve, the handwritten voice for UI/logistics and
        //             numerals.
        //  sentient — Instrument Serif, for all titles and wordmarks.
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"Mynerve"', 'cursive'],
        sentient: ['"Instrument Serif"', 'Georgia', 'serif'],
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
