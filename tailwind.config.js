/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './faq/index.html', './corporate/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Aurora Rose palette — warm ivory paper with airy pastel pigments.
        // Leading swatches: soft lilac #D8C6EA, blush rose #F2C2CF, warm
        // apricot #F7D4AE, sage glow #D9DEC1, with wisteria/mauve standing
        // in for the cool voice. Blue is deliberately absent as a lead.
        // Text/UI tokens use deepened anchors of the same hues so contrast
        // holds on the ivory ground.
        paper: '#F7F4EF',
        'paper-deep': '#ECE9F2',
        ink: '#3A2F4A',
        'ink-soft': '#776C88',
        line: '#D5D2E1',
        // Primary pigments — orchid rose, dusty rose, apricot, sage, mauve
        terracotta: '#9E5789',
        rust: '#9C4A62',
        orange: '#D89A5E',
        ochre: '#DFA455',
        'ochre-light': '#F7D4AE',
        sage: '#6E7D52',
        'sage-deep': '#56633F',
        lime: '#C2CB93',
        cornflower: '#9078BE',
        teal: '#6E8D74',
        rose: '#A85E93',
        magenta: '#A0568E',
        blush: '#F2C2CF',
        wine: '#514066',
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
