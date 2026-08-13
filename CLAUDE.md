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
- `src/lib/watercolour.js` — the pigment/paper physics shared by the live
  washes: the palette as Kubelka-Munk pigments, and GLSL chunks for the paper
  height field, edge darkening, granulation and optical compositing. See the
  Watercolour Model section in the design guide before touching a wash.
- `src/components/` — one component per file. Homepage section order is set
  in `App.jsx`; the section comments there explain the narrative pacing.
- `src/hooks/useMediaQuery.js` — exports `useHeavyFx()`, the performance gate
  (see below).
- Business documents (contract, pricing models, copy notes, content plans)
  live in a separate private repository, not here — this repo is public and
  they were moved out of the old `docs/` directory. (They remain in git
  history before 2026-08.)
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
`index.html` (LCP) — keep those hrefs in sync if the hero art changes. The
gallery wall serves downscaled WebP variants via `srcset` — after adding or
replacing gallery art, run `npm run variants` to
regenerate the variants and the manifest (`src/lib/artVariants.json`) that
`artSrcset()` in `lib/site.js` reads.

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
and title text is the exception: `ink` (#352E30) is a near-neutral dark grey
with only an ever-so-slight burgundy lean (hue ≈ 343°)** — deliberately not the
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

Documented exceptions (deliberate, per their in-code comments — do not
"fix" them, and do not use them as precedent for new work): the hero's
aurora orb (`Hero.jsx`) dissolves yellow-green through to blush inside one
composed orb, and two `CornerBloom` pairs skip a step on the arc
(`Packages.jsx` ochre→apricot, `CorporatePage.jsx` apricot→lime). All three
were art-directed against the built page.

## Watercolour Model

The washes are not stylised gradients. They follow Curtis, Anderson, Seims,
Fleischer and Salesin, *Computer-Generated Watercolor* (SIGGRAPH '97), which is
implemented in `src/lib/watercolour.js` and consumed by `BloomCanvas` and
`GrainCanvas`. Section numbers below are that paper's; the code carries the
same references, so read them before retuning a wash.

**The palette is a set of paints, not a set of colours.** Each pigment in
`PIGMENTS` is specified the way §5.1 lets an artist specify one: `rw`, how a
unit-thickness glaze looks over white paper — which is exactly what the Pastel
Bloom hexes already were, so the art direction is preserved at that anchor —
plus `body` (how far its appearance over black sits off black; low = a
transparent staining paint) and `gran`, the granulation exponent γ borrowed
from the nearest paint in the paper's Figure 5. Add a pigment by naming those
three, never by hand-writing K/S — `kmCoefficients()` inverts them for you.

γ is load-bearing art direction, not trivia. Periwinkle carries French
Ultramarine's 0.91 and the roses carry quinacridone's 0.81, so those passages
break into paper tooth, while the yellow-green glow keeps Phthalo's 0.12 and
stays smooth and luminous. That is how real paint behaves and it protects the
chartreuse voice; don't flatten the spread.

**Four effects the model gives us, and what would break them:**

1. *Edge darkening* (§4.3.3) — pigment dragged to the rim as a wash dries.
   The paper credits this for watercolour's luminosity, and it is the single
   thing that stops a wash reading as an airbrush. Both tiers have it: the
   shader via `edgeDeposit()`, the static CSS via each bloom's rim stop.
2. *Granulation* (§4.5) — deposition favours the sheet's hollows, at a rate
   set by the pigment's γ. It samples `paperHollows()`, deliberately coarser
   than the fibre-scale `paperHeight()` the grain overlay resolves: pigment
   pools between fibres, and sampling per-pixel gives digital speckle instead.
3. *Optical compositing* (§5.2) — glazes are composited with Kubelka-Munk, not
   alpha-blended. Thickening pigment then walks along its characteristic curve
   (the paper's Figure 6) rather than averaging toward grey, which is the same
   failure the anti-mud rules above guard against by hand.
4. *Flow striations* (§4.3, condition 4) — the paper's slope deflects the
   water. Resolve the slope onto the flow direction (`flowStreak()`); adding
   the raw gradient only jitters the wash isotropically and reads as noise.

**One sheet.** `paperHeight()` is sampled in CSS pixels by every layer that
uses it, so the tooth holds a fixed physical size and the wash granulates into
the same hollows the grain overlay darkens. Sample it in device pixels and the
texture gets finer on retina, which is sensor noise, not paper.

### Where blooms live

Every bloom field is declared once, as data, through `BloomField`:

```jsx
<BloomField blooms={[{ pigment: 'apricot', x: 0.28, at: [0.14, 0.22], size: [0.42, 0.36] }]} />
```

That one spec drives two renderings. `fieldCss()` writes CSS for it, and
`BloomCanvas` — one fixed full-viewport WebGL layer — paints the same blooms
optically where the device can afford it, handing over via `data-live-blooms`.

**The canvas is the point.** CSS alpha-blends overlapping washes, which averages
colour toward grey; that is the mud the anti-mud rules above police by hand. On
the canvas an overlap is one layer holding several pigments, K and S weighted by
relative thickness and the thicknesses summed exactly as §5.2 prescribes, so
crossing washes deepen along their own curves instead. It also removes the
banding CSS colour stops produce, and granulates into the shared paper.

**`canvas={false}` when the canvas structurally can't follow.** It is one layer
at one z-index painting one viewport, so it cannot serve a field that an
ancestor masks, that clips to a rounded folder, that blends, or that stacks over
a photograph — the wash would escape the shape it is meant to live in. Those
fields (the masked section washes, EveningTimeline's folder, Footer over its
photo, the hero orb behind its blur) stay on CSS and still get the model, just
through `fieldCss` rather than optically. Element-scoped blooms — `CornerBloom`
over gallery art, the enquiry seal, the lightbox glow — are the same story.

Only fields the canvas actually paints hand over: the fade rule in `index.css`
is scoped to `[data-bloom-field='canvas']`, because hiding an opted-out field
would simply delete its wash.

**Two spec shapes.** `size: [fx, fy]` is a percentage ellipse, fractions of the
element. `sizeVw: N` is a circle of radius N vw — use it behind sections that
run many viewport-heights tall, where a two-axis percentage resolves against
width and height independently and stretches every wash into a sliver.

**`lift`** is unpainted paper held open, not paint: the near-white cores that
keep the busiest overlaps luminous. It subtracts thickness on the canvas
(§4.5's desorption) and stays a cream radial in CSS. It never enters the K/S mix.

### Authoring a bloom as paint

Don't hand-write `radial-gradient(… rgba(r,g,b,a), transparent NN%)` for a new
bloom. Call `bloom()` from `lib/watercolour.js`: name the pigment and how thick
the wash is, and it returns the stops the KM model says that paint produces as
it thins — hue and saturation drifting along Figure 6's curve rather than one
fixed colour fading in alpha. `size`/`at`/`extent` pass the geometry straight
through, so converting an existing bloom changes only its colour.

Two things to get right:

- **`wetness`.** `dry` (default) is wet-on-dry — a wash on paper, so it carries
  the edge-darkened rim. `wet` is wet-in-wet, which §2.2 describes as spreading
  freely into soft feathery shapes: no pinned contact line, so no rim. The hero
  orb is `wet`; forcing the rim there pulled pigment out of the centre and
  visibly shifted an art-directed accent (and the 26px blur would have eaten
  the rim anyway).
- **Solve `x`, don't guess it.** Pick the thickness that reproduces the
  area-weighted load of whatever it replaces, so a conversion is a change of
  model and not a change of weight.

### Darks are mixed, not bought

There is no black pigment. `INK_WASH` is a dark mixed from three transparent
paints — burgundy, olive, ultramarine — solved by `separate()` to land on `ink`
(#352E30) at full thickness. Two pigments aren't enough: burgundy and
ultramarine alone leave blue unabsorbed and land on a violet the palette rules
out, so the third is what pulls the mix back to neutral.

Mixing also buys the thing a bought black can't do — **separation** (§2.2): the
heavy ultramarine settles out where the wash pooled while the light staining
quinacridone stays in suspension and ends up in the thin passages. That's what
paints the hero's brush stroke (`EmphasisBrush` in `SplitText.jsx`): the scan
carries its bristles and bleeding edges in the alpha channel, and an SVG filter
copies alpha into RGB and looks colour up by it, so the stroke reads neutral
where it pooled and burgundy through the dry-brush bristles.

Two constraints if you retune it. Hold luminance constant — the stroke's density
is art direction, and alpha compositing already supplies the fade, so letting
the model set lightness too thins the mid-tones twice and washes the stroke out.
And tune against the *composited* result, not the pigment: paper dilutes exactly
the thin passages where the swing is largest, so a separation that looks ample
in the paint can round away to a pixel or two on the page.

`PIGMENTS` is the paint box; `ARC` is the ordered subset the live wash
interpolates along. Accents that sit off the arc — the client's swatch sheet
(seafoam, lavender, lemonlime, blossom) — belong in the box but not the arc.
Add a pigment when separation can't reach a colour: `separate()` implements
§6.2's colour search and will tell you how far off the palette a target is.
It left the orb's seafoam and lavender 12-19/255 adrift, which is what said
they were paints in their own right rather than mixtures.

**Weight is set by thickness alone.** In `BloomCanvas` the wash's visual load
comes from `X_BASE`/`X_EDGE`; `ALPHA_GAIN` only buys gamut headroom for the
colour/coverage split and cancels out of the composite. When retuning, measure
— the wash sits around 1.3x the mean deviation-from-paper of the pre-model
gradient, and it should stay light. Likewise the static CSS rims were solved to
preserve each bloom's area-weighted alpha exactly: a wash redistributes its
pigment, it never adds any.

## Shadow Palette: No Grey Shadows

**Critical Rule: Never use grey, black, or neutral shadows. All shadows must use tinted, editorial colours from the site's palette.**

### Why
Grey/black shadows break the editorial feel and read as dead pixels against the tinted pastel palette.

### Approved Shadow Colours

All shadows must use these RGBA values (or derived variants at +15% vibrancy):

| Colour | Use Case | RGBA |
|--------|----------|------|
| **Burgundy** (deep) | Primary lift shadows, cards, general elevation | `rgba(126,40,72,0.30)` |
| **Claret Rose** | Strong shadows, aurora button glows | `rgba(150,56,90,0.52)` |
| **Deep Ink** | Deep shadows on overlays, keepsake cards, timeline markers | `rgba(78,38,57,0.58)` |
| **Ink** | Paper shadows, subtle depth | `rgba(78,38,57,0.21)` |
| **Burgundy** | Accent shadows (form elements, special cases) | `rgba(126,40,72,0.25)` |

Note: these are literal RGBA values, NOT token names. In particular the
`rust` *token* resolves to a deep olive (`--rgb-rust`, a Lemon Lime
hover/dark-ground colour) — writing `shadow-rust` does not give you Claret
Rose. Always spell shadows out as arbitrary values from this table.

**Glows are not shadows.** Light-emitting box-shadows (the firefly motes'
warm glow in `Fireflies.jsx`, the lightbox's inset blush/periwinkle glaze in
`SelectedWork.jsx`) may use luminous palette colours — the no-grey rule
governs *darkening* shadows.

### Component Shadow Reference

**Hero Cards** (primary & accent):
```
shadow-[0_28px_52px_-18px_rgba(126,40,72,0.30),0_6px_16px_-6px_rgba(126,40,72,0.12)]
```

**Timeline Markers**:
```
shadow-[0_2px_12px_rgba(78,38,57,0.55)]  /* Primary marker */
shadow-[0_2px_12px_rgba(78,38,57,0.42)]  /* Numbered dots */
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

### Finding Shadows

Shadows now live in ~20 files (every card, folder, pill and page family).
Do not rely on a hand-kept list — audit with:

```
grep -rE 'box-shadow|shadow-\[|drop-shadow' src/
```

### Design Philosophy

Shadows in this project serve **editorial depth**, not functional elevation. Every shadow should feel like it belongs in a high-end watercolour or arts publication—warm, organic, and intentional. The tinted tones make elements feel like they're painted on paper rather than floating on glass.
