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
        // Text sits on a near-neutral dark grey (the `ink` slot) with an
        // ever-so-slight burgundy lean (hue ≈ 337°) — deliberately NOT the old
        // mauve/violet cast, and never a full wine. Burgundy proper stays a
        // *decorative* deep anchor (shadows, night grounds, washes). All text
        // anchors ≥4.5:1 on paper.
        paper: '#F7F4EF',
        'paper-deep': '#F4ECEF',
        ink: '#352E30',
        // Secondary text: most of the body copy on the site. It was #6B6065,
        // which cleared AA on paper (5.5:1) but only just on the tinted grounds
        // it mostly sits on, 4.6:1 inside the timeline's cards and 5.0:1 over
        // the Packages wash, and read washed out at 17px. Same hue, a step
        // darker: 6.9:1 on paper, 5.8:1 on those cards, still well clear of
        // `ink` (12:1) so the two rungs stay distinct.
        'ink-soft': '#5B5256',
        line: '#E1D6E0',
        // Primary accent pigments. The dominant UI accent is Lemon Lime
        // (#D8DB7A), one of the client's reference swatches, deepened just
        // enough to read as text — see the full swatch-to-hex mapping in
        // index.css. Driven by CSS custom properties (`--rgb-terracotta` /
        // `--rgb-rust`, defined in index.css) so the whole site's accent can
        // be retuned from one place. Token names stay (legacy slots); the
        // soft pastel bloom washes are untouched.
        terracotta: 'rgb(var(--rgb-terracotta) / <alpha-value>)',
        rust: 'rgb(var(--rgb-rust) / <alpha-value>)',
        orange: '#E89B63',
        ochre: '#B0AC42',
        'ochre-light': '#EFEFA0',
        sage: '#8A9143',
        'sage-deep': '#5F662B',
        lime: '#D8DC8F',
        cornflower: '#9BA3CC',
        teal: '#7E9584',
        rose: '#C1608C',
        magenta: '#C0559A',
        blush: '#F2C2CF',
        wine: '#311B26', // deep burgundy-ink night ground (was pine #1F2E2A) —
        // the dark "nightfall" sections (evening timeline, footer) sit on the
        // palette's own deep wine rather than the old masculine forest.
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
