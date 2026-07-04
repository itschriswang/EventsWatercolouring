/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './faq/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Bold Poster palette — vibrant, high-saturation contemporary aesthetic
        paper: '#F6F1E7',
        'paper-deep': '#EAE2D4',
        ink: '#1E1B18',
        'ink-soft': '#6B6258',
        line: '#D8CFBF',
        // Primary pigments — punchy, saturated
        terracotta: '#FF5A3C',
        rust: '#B32617',
        orange: '#FF7A1A',
        ochre: '#E0A81E',
        'ochre-light': '#F8E6AE',
        sage: '#6E7E4E',
        'sage-deep': '#566443',
        lime: '#C6F04A',
        cornflower: '#1E5BE0',
        teal: '#0E86A0',
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
