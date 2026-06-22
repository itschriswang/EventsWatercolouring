# Website brief: bespoke wedding watercolour service

## Objective

Build me a single-page (or lightly multi-page) marketing website for my bespoke wedding watercolour service, where I paint couples and guests, both live on the day and as commissioned portraits from photographs. The site exists to attract engaged couples and wedding planners, show my work, explain how booking runs, and capture enquiries. It should feel highly editorial, modern, and design-led, with rich but purposeful motion and watercolour-native effects.

## About me and the brand

I am an architect and engineer by training who returned to making art. I bring a design-led eye to portraiture: strong composition, restraint, and a warm, filmic sensibility. Position the brand around "design-led wedding portraiture in watercolour" rather than craft-fair hobby work. The personality is refined, warm, quietly confident, and intimate. Think a fashion editorial that happens to be about painting people on the most photographed day of their lives.

## Audience and positioning

Primary audience: design-conscious engaged couples aged 25 to 40 booking 6 to 18 months out, plus the planners and stylists who refer them. They care about aesthetics, keepsakes with provenance, and a guest experience that photographs well. Speak to taste and emotion, not discounts.

## Visual direction

### Mood and references
Editorial print magazine meets a working artist's studio. Reference the structure and whitespace of Kinfolk and Cereal, the type contrast of a fashion masthead, and the organic texture of paper and pigment. Hold a tension between architectural grid discipline and soft, bleeding watercolour. The grid keeps it modern. The watercolour keeps it human.

### Colour
Warm, filmic, low-saturation palette on a paper base.
- Background: warm bone or cream (#F4EFE6 range), with a faint paper grain.
- Text: soft charcoal ink (#2A2724 range), never pure black.
- Accents: pick two muted washes from terracotta, sage, dusty blue, or ochre. Use them as watercolour blooms, not flat fills.
- Keep contrast gentle and warm. No cool greys, no default blue links, no high-key white.

### Typography
Editorial pairing with clear hierarchy.
- Display headlines: a high-contrast serif with personality (something in the vein of a fashion serif). Large, tight, occasionally set in italic for romantic emphasis.
- Body and UI: a clean neutral grotesque sans at generous line height.
- Use one hand-drawn or script accent sparingly, for a signature or a single pull quote only.
- Generous margins, wide leading, confident scale jumps between heading and body.

### Layout and grid
Strict editorial grid underneath, broken deliberately by full-bleed portraits and off-axis captions. Asymmetry, large negative space, magazine-style image and caption pairings. Avoid centred-everything templates and card-grid sameness.

### Texture
Subtle paper grain across the whole page. Watercolour edges should feel wet, with irregular bleed rather than clean rectangles. Apply a faint film grain overlay for the filmic quality.

## Motion and interaction

Motion is a priority. Make it smooth, tasteful, and tied to the watercolour metaphor. Respect prefers-reduced-motion and disable heavy effects for those users.

- Smooth inertia scrolling across the whole site (Lenis or equivalent).
- Hero portrait that "paints in" on load: a watercolour image revealed through an animated mask so it appears to wash onto the paper.
- SVG line-art that draws itself on scroll using stroke-dashoffset, so section dividers and a portrait outline appear to be sketched live.
- Hover states on gallery portraits that cross-fade between a line sketch and the finished watercolour.
- Watercolour bleed reveals: as each section enters the viewport, content fades in behind an irregular wet-edge mask rather than a hard wipe.
- A soft brush or pigment trail that follows the cursor on desktop, low opacity, easing out slowly.
- Gentle parallax on portrait galleries and large pull quotes.
- A horizontal marquee strip of portrait works that drifts slowly and reacts to scroll velocity.
- Section transitions that use a paint-wash or ink-spread wipe rather than a plain slide.
- Micro-interactions on buttons and links: a hand-drawn underline that draws in on hover, a slight pigment bloom on press.

## SVG and effects

- Use SVG feTurbulence and feDisplacementMap to give image and shape edges an irregular watercolour wobble.
- Generate the paper and film grain with an animated feTurbulence overlay at very low opacity.
- Hand-drawn SVG dividers, underlines, and arrows, animated with stroke-dash drawing.
- A morphing blob or wash shape behind the hero headline that drifts slowly.
- Keep all of this GPU-friendly and performant. Lazy-load gallery images and pause off-screen animation.

## Site structure

Single long scroll with anchor navigation, plus a sticky minimal header (wordmark left, enquiry CTA right).

1. Hero: wordmark, one-line positioning statement, a watercolour portrait that paints in, primary CTA "Enquire".
2. Introduction: short first-person statement of who I am and the design-led approach. Architect-turned-artist angle.
3. The work: editorial portrait gallery with magazine-style captions. Mix of live-event and commissioned pieces.
4. How it works: two paths, "Live on the day" and "Commissioned from photographs", each with a 3-step process.
5. Offerings: package tiers with inclusions. [I will supply final names and prices.]
6. Words from couples: testimonials. [Placeholder until I have real ones.]
7. FAQ: turnaround time, travel, materials, framing, deposit and cancellation.
8. Enquiry: a warm, low-friction contact form (name, partner name, wedding date, venue or city, package interest, message). Reassuring confirmation state.
9. Footer: wordmark, Instagram, RedNote, email, copyright.

## Copy tone

Warm, editorial, intimate, and assured. Australian English and spelling throughout. Active voice. Short, confident sentences. No clichés, no exclamation marks, no hard-sell. Write as me, the artist, speaking directly to a couple. Avoid em dashes and en dashes; restructure sentences instead.

## Technical notes

- Responsive and mobile-first. Motion must degrade gracefully on phones and respect reduced-motion settings.
- Fast load: optimise and lazy-load imagery, keep effects performant.
- Accessible: sufficient text contrast, alt text on portraits, keyboard-navigable form.
- Clean semantic structure and basic on-page SEO for terms like wedding watercolour portrait, live wedding painter, and my city.

## Placeholders to swap in
- Business name and wordmark: [TO ADD]
- Location and travel radius: [Sydney / Melbourne, confirm]
- Contact email and socials: [TO ADD]
- Package names and pricing: [TO ADD]
- Real portfolio images and captions: [TO ADD]
- Testimonials: [TO ADD once available]

## Build instructions
Produce a polished, production-quality front end. Prioritise the editorial typographic system, the warm filmic palette, and the watercolour-native motion. Use placeholder watercolour portraits where I have not supplied images, and mark every placeholder clearly so I can replace it. Deliver clean, well-structured, commented code I can hand to a developer or extend myself.
