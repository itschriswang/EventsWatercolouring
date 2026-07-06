/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './faq/index.html', './corporate/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Pastel Aurora palette — warm ivory paper with airy pastel pigments.
        // Source swatches: powder blue #9EC9DF, azure #5D9DDA, dusty
        // periwinkle #8C9ED6, soft lilac #D8C6EA, blush rose #F2C2CF, warm
        // apricot #F7D4AE, sage glow #D9DEC1. Text/UI tokens use deepened
        // anchors of the same hues so contrast holds on the ivory ground.
        paper: '#F7F4EF',
        'paper-deep': '#E6EBF1',
        ink: '#2F3450',
        'ink-soft': '#646C88',
        line: '#CFD5E1',
        // Primary pigments — azure, dusty rose, apricot, sage, periwinkle
        terracotta: '#386DB4',
        rust: '#9C4A62',
        orange: '#D89A5E',
        ochre: '#DFA455',
        'ochre-light': '#F7D4AE',
        sage: '#6E7D52',
        'sage-deep': '#56633F',
        lime: '#C2CB93',
        cornflower: '#6E80C0',
        teal: '#3F7A9C',
        rose: '#7E62A8',
        magenta: '#A0568E',
        blush: '#F2C2CF',
        wine: '#453D66',
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
