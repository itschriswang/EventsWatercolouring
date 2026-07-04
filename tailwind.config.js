/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './faq/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm but calm palette — softer, desaturated contemporary aesthetic
        paper: '#F6F1E7',
        'paper-deep': '#EAE2D4',
        ink: '#1E1B18',
        'ink-soft': '#6B6258',
        line: '#D8CFBF',
        // Primary pigments — muted, editorial warmth
        terracotta: '#C98B8C',
        rust: '#A82E1F',
        orange: '#E8722A',
        ochre: '#D4A12E',
        'ochre-light': '#F8E6AE',
        sage: '#6E7E4E',
        'sage-deep': '#566443',
        lime: '#B8D952',
        cornflower: '#2E5FA8',
        teal: '#2B7E8C',
        rose: '#C98B8C',
        magenta: '#FF2E80',
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
