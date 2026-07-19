# EventsWatercolouring — Project Guide

Marketing site for Chris Wang's live event watercolour painting service
(chriswangstudio.com). React 18 + Vite 5 + Tailwind 3 + Framer Motion,
deployed as a static multi-page build to GitHub Pages.

## Commands

```
npm run dev       # Vite dev server
npm run build     # production build to dist/ (all three pages)
npm run preview   # serve the production build locally
```

There are no tests or linters — verify changes with `npm run build` plus a
visual pass (Playwright is available as a devDependency for screenshots).

## Architecture

**Three static pages, one Vite build** (see `vite.config.js` rollup inputs):

- `/` — `index.html` → `src/main.jsx` → `src/App.jsx` (the homepage)
- `/faq/` — `faq/index.html` → `src/faq-main.jsx` → `src/pages/FaqPage.jsx`
- `/corporate/` — `corporate/index.html` → `src/corporate-main.jsx` → `src/pages/CorporatePage.jsx`

Each HTML entry carries its own SEO meta + a no-JS fallback. This is an MPA:
navigation between pages is a real page load (PageTransition's ink wipe hands
off across it via sessionStorage).

**Key directories:**

- `src/content.js` — ALL site copy lives here, one export per section.
  Chris's voice: plain, warm, Australian English, no em dashes.
- `src/lib/site.js` — shared constants: `SPRING`/`SPRING_SOFT` (the site-wide
  motion physics), `asset()`, `ENQUIRE_HREF`, `EMAIL`, Formspree config.
- `src/components/` — one component per file. Homepage section order is set
  in `App.jsx`; the section comments there explain the narrative pacing.
- `src/hooks/useMediaQuery.js` — exports `useHeavyFx()`, the performance gate
  (see below).
- `docs/` — business documents (contract, pricing models, copy notes,
  content plans). Not part of the build.
- `reference/` — design references and adapted third-party studies. Not part
  of the build.

## Performance conventions

Every expensive effect is tiered, and new effects must follow the same ladder:

1. **`useHeavyFx()`** (roomy fine-pointer devices, no Data Saver, ≥4GiB
   reported memory) gates parallax, WebGL washes, backdrop blur, cursor
   effects. Touch/low-end devices get a cheaper static equivalent — never
   nothing, never jank.
2. **`useReducedMotion()`** (Framer) zeroes translate/scale entrances and
   skips loops; `index.css` has a global reduced-motion safety net for CSS
   animations. The static tilt/washes may remain.
3. **WebGL** (`BloomCanvas`, `GrainCanvas` via `src/lib/webgl.js`) always has
   a CSS/SVG fallback (`WatercolourBloom`, `GrainOverlay`) and tears down via
   `WEBGL_lose_context`.

Images ship as `<picture>` webp + jpg/png pairs in `public/assets/`; anything
below the fold is `loading="lazy"`. The two hero paintings are preloaded from
`index.html` (LCP) — keep those hrefs in sync if the hero art changes.

## Working in this codebase

- Comments explain *why* an effect or value exists (often hard-won fixes —
  oscillating headers, mask clipping, gradient bleed). Read them before
  "simplifying" something that looks odd; keep the style when adding code.
- `terracotta`/`rust`/`ochre` token names are legacy slots pointing at the
  pastel palette — do not rename them site-wide, and never introduce actual
  terracotta/brick tones (see below).
- Anchor ids (`#night`, `#work`, `#painter`, `#offerings`, `#enquiry`,
  `#faq`) are load-bearing: nav, footer, FAQ cross-links and the planner all
  point at them. `section[id]` gets `scroll-margin-top` from `index.css`.
- The enquiry form posts to Formspree with a fixed field set — if you change
  fields, keep the posted payload keys stable (see `EnquireForm.jsx`).

# Design System Guide

## Palette: Pastel Bloom

The site's colour scheme is drawn from a single reference photograph — a soft,
blurred pastel field. Its hue arc, in blending order:

**apricot → butter yellow → yellow-green (chartreuse glow) → pale periwinkle →
soft lilac → blush → candy rose → (wraps to apricot)**

Everything stays light and luminous. The yellow-green glow is a deliberate,
protected voice — do not lose it when adding or retuning washes, and the
yellows deliberately lean green (chartreuse), never toward gold or amber.
**Never introduce terracotta / brick / burnt-orange tones anywhere.** Token
names in code (`terracotta`, `rust`, `ochre`, …) are legacy slot names — their
values point at the pastel scheme's anchors (see `tailwind.config.js`).

**Deep *decorative* anchors are burgundy, not purple.** Where the palette needs
depth in the decorative layer — shadows, the dark "nightfall" grounds (`wine`),
label-gradient dark stops, bloom pairs — it reaches for burgundy/claret wine
tones (hue ≈ 335–345°), the chic counterpart to the chartreuse accent. **Body
and title text is the exception: `ink` (#423A3D) is a near-neutral dark grey
with only an ever-so-slight burgundy lean (hue ≈ 337°)** — deliberately not the
old mauve/violet cast, and never a full wine. That one deep slot reads as a true
neutral slate first, warmth second, so the copy never looks purple or wine. The
light pastels (soft lilac, periwinkle, lavender washes) stay on the arc as-is.
Do not reintroduce deep violet/purple decorative anchors, and do not push the
ink text past its faint burgundy whisper toward actual burgundy/wine.

**Multi-hue "keepsake" swatches keep the full rainbow.** Sections that stand in
for a spread of real paintings (the NightPlanner thumbnail grid, gallery
tiles) deliberately cycle the *whole* pastel arc — warm apricot/orange included
— for a lowkey-rainbow feel. Don't collapse these to the deep anchors; the
warms belong there.

### Anti-mud rules for overlapping blooms/gradients

1. Blooms whose soft edges overlap must be neighbours on the arc above —
   never complements. Yellow-green may touch butter and periwinkle, never
   rose/blush directly (bridge with butter or a cream gap).
2. Keep overlap zones high-lightness; where 3+ blooms meet, lay a near-white
   cream radial (`rgba(255,252,242,…)`) on top so the centre glows instead of
   averaging to grey.
3. `CornerBloom` multiplies into the card ground — its `from`/`to` pair must
   be hue-adjacent (rose+lilac, apricot+butter, butter+yellow-green…).
4. `BloomCanvas.jsx`'s shader ramp is ordered along the arc so every
   interpolation segment blends neighbours; keep it that way.

## Shadow Palette: No Grey Shadows

**Critical Rule: Never use grey, black, or neutral shadows. All shadows must use tinted, editorial colours from the site's palette.**

### Why
Grey/black shadows break the editorial feel and read as dead pixels against the tinted pastel palette.

### Approved Shadow Colours

All shadows must use these RGBA values (or derived variants at +15% vibrancy):

| Colour | Use Case | RGBA |
|--------|----------|------|
| **Burgundy** (deep) | Primary lift shadows, cards, general elevation | `rgba(126,40,72,0.30)` |
| **Claret Rose** (token: rust) | Timeline markers, strong shadows | `rgba(150,56,90,0.52)` |
| **Deep Ink** | Deep shadows on overlays, keepsake cards | `rgba(78,38,57,0.58)` |
| **Ink** | Paper shadows, subtle depth | `rgba(78,38,57,0.21)` |
| **Burgundy** | Accent shadows (form elements, special cases) | `rgba(126,40,72,0.25)` |

### Component Shadow Reference

**Hero Cards** (primary & accent):
```
shadow-[0_28px_52px_-18px_rgba(126,40,72,0.30),0_6px_16px_-6px_rgba(126,40,72,0.12)]
```

**Timeline Markers**:
```
shadow-[0_2px_12px_rgba(150,56,90,0.52)]  /* Primary marker */
shadow-[0_2px_12px_rgba(150,56,90,0.40)]  /* Numbered dots */
```

**Gallery/Lightbox Images**:
```
shadow-[0_28px_60px_-10px_rgba(126,40,72,0.65)]  /* Strong burgundy for modal */
```

**Package Cards**:
```
shadow-[0_24px_50px_-20px_rgba(126,40,72,0.32)]  /* Primary shadow */
shadow-[0_24px_50px_-20px_rgba(126,40,72,0.25)]  /* Secondary shadow */
```

**Keepsake Cards** (What You Keep):
```
shadow-[0_10px_30px_-18px_rgba(78,38,57,0.58)]
```

**Enquire Form**:
```
drop-shadow(0 18px 38px rgba(78,38,57,0.21))     /* Paper drop shadow */
drop-shadow(0 2.5px 3px rgba(126,40,72,0.25))    /* Accent shadow */
```

### Adding New Shadows

When adding shadows to new components:

1. **Pick a base colour** from the approved list above
2. **Match the site's aesthetic**: Use burgundy or claret rose for most cases
3. **Adjust opacity as needed**, but keep RGB values within the palette
4. **Test on dark backgrounds** (like the dusk timeline and footer) to ensure visibility
5. **Never use**: `rgba(0,0,0,...)`, `rgba(128,128,128,...)`, or any neutral greys

### Vibrancy Guidelines

- **+15% increase** for enhanced visual impact (standard for hover/active states)
- **-15% decrease** for subtle background shadows
- Formula: Multiply both RGB and alpha by the percentage (e.g., `0.30 * 1.15 ≈ 0.35`)

### Files Containing Shadows

- `src/components/Hero.jsx`
- `src/components/EveningTimeline.jsx`
- `src/components/SelectedWork.jsx`
- `src/components/Packages.jsx`
- `src/components/EnquireForm.jsx`
- `src/components/Footer.jsx`

### Design Philosophy

Shadows in this project serve **editorial depth**, not functional elevation. Every shadow should feel like it belongs in a high-end watercolour or arts publication—warm, organic, and intentional. The tinted tones make elements feel like they're painted on paper rather than floating on glass.
