/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './faq/index.html', './corporate/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Sunset Wash palette — warm ivory paper with airy pastel pigments.
        // Leading swatches: warm apricot #F7D4AE, blush rose #F2C2CF, peach
        // #F2B8AC, soft coral #E8A794, sage glow #D9DEC1. Sage-green hints
        // break the warmth up and let it breathe; lilac, wisteria and
        // powder blue survive only as deliberate accents, never as leads.
        // Text/UI tokens use deepened anchors of the same hues so contrast
        // holds on the ivory ground.
        paper: '#F7F4EF',
        'paper-deep': '#F2EAE6',
        ink: '#42333B',
        'ink-soft': '#816B69',
        line: '#E0D5D2',
        // Primary pigments — terracotta rose, dusty rose, apricot, sage, coral
        terracotta: '#A85450',
        rust: '#9C4A62',
        orange: '#D89A5E',
        ochre: '#DFA455',
        'ochre-light': '#F7D4AE',
        sage: '#6E7D52',
        'sage-deep': '#56633F',
        lime: '#C2CB93',
        cornflower: '#C68A66',
        teal: '#6E8D74',
        rose: '#B45E6E',
        magenta: '#BA5E78',
        blush: '#F2C2CF',
        wine: '#5E3A48',
      },
      fontFamily: {
        // Three-font editorial system:
        //  body     — Manrope, the neutral, legible narrative voice.
        //  mono     — Mynerve, the handwritten voice for UI/logistics and
        //             numerals.
        //  sentient — Darumadrop One, for all titles and wordmarks.
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"Mynerve"', 'cursive'],
        sentient: ['"Darumadrop One"', 'cursive'],
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
