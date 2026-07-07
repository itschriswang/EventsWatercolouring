/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './faq/index.html', './corporate/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Pastel Bloom palette — the reference photograph's blurred pigment
        // field: warm apricot melting through butter yellow into a
        // yellow-green glow, with candy rose, blush, soft lilac and pale
        // periwinkle on the cool side. Everything stays light and luminous;
        // nothing drifts toward brick or terracotta. Token names are legacy
        // slot names — their values point at the pastel scheme's anchors.
        // Text/UI tokens use deepened anchors of the same hues so contrast
        // holds on the ivory ground (all text anchors ≥4.5:1 on paper).
        paper: '#F7F4EF',
        'paper-deep': '#F4ECEF',
        ink: '#3F3552',
        'ink-soft': '#756A7C',
        line: '#E1D6E0',
        // Primary pigments — candy rose, rose-plum, apricot, yellow-green, lilac
        terracotta: '#B04A76',
        rust: '#8E4470',
        orange: '#E89B63',
        ochre: '#C9A94B',
        'ochre-light': '#F5E9AC',
        sage: '#8A9143',
        'sage-deep': '#5F662B',
        lime: '#D8DC8F',
        cornflower: '#9BA3CC',
        teal: '#7E9584',
        rose: '#C1608C',
        magenta: '#C0559A',
        blush: '#F2C2CF',
        wine: '#4E3670',
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
