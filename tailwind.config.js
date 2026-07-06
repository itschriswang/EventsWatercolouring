/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './faq/index.html', './corporate/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Twilight Jewels palette — cool dusty paper with deep jewel pigments
        paper: '#ECEEF2',
        'paper-deep': '#DCE0E8',
        ink: '#241F2E',
        'ink-soft': '#5C5668',
        line: '#C7CAD6',
        // Primary pigments — sapphire, garnet, gold, emerald, plum
        terracotta: '#2E5C8C',
        rust: '#8C2E3C',
        orange: '#C97A2E',
        ochre: '#D6A63C',
        'ochre-light': '#F0DCA0',
        sage: '#1F6E5C',
        'sage-deep': '#1B5745',
        lime: '#A8BF3C',
        cornflower: '#4A5E8C',
        teal: '#1F6E7E',
        rose: '#8C4A6E',
        magenta: '#A82E6E',
        blush: '#C97A94',
        wine: '#4A1F3C',
      },
      fontFamily: {
        // Three-font editorial system:
        //  body     — Manrope, the neutral, legible narrative voice.
        //  mono     — Mynerve, the handwritten voice for UI/logistics and
        //             numerals.
        //  sentient — Gochi Hand, for all titles and wordmarks.
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"Mynerve"', 'cursive'],
        sentient: ['"Gochi Hand"', 'cursive'],
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
