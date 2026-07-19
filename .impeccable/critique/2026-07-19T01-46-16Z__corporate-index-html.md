---
target: corporate (/corporate/)
total_score: 37
p0_count: 0
p1_count: 0
timestamp: 2026-07-19T01-46-16Z
slug: corporate-index-html
---
# Impeccable critique — Corporate page (/corporate/)

Method: dual-agent (A: isolated design-director sub-agent · B: deterministic detector + WCAG pass + browser screenshots)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 3 | Header active-underline + form step counter ("1 of 3") + Sealing state + scroll progress are all excellent, but the mobile bottom dock shows no current-page/active state on /corporate/ and none of its items (bar Enquire) target this page. |
| 2 | Match between system and real world | 4 | n/a — solid. "Reply card", "Seal & send", "On the night" and the whole voice map cleanly to a planner's mental model. |
| 3 | User control and freedom | 4 | n/a — solid. Stepped form has a real Back button, chips toggle off, date/not-sure are mutually clearing. |
| 4 | Consistency and standards | 4 | n/a — solid. Reuses the homepage's card ground, Label/Drop, EnquireForm and header so the page reads as one system. |
| 5 | Error prevention | 4 | n/a — solid. Date min=today, honeypot, email validity check, and a mailto fallback when Formspree is unconfigured or fails. |
| 6 | Recognition rather than recall | 4 | n/a — solid. Corporate option is pre-selected in the reply card; facts/prices are shown, not remembered. |
| 7 | Flexibility and efficiency of use | 4 | n/a — solid. Implicit Enter-submit advances sheets, a chip tap auto-advances, magnetic CTA jumps straight to #enquiry. |
| 8 | Aesthetic and minimalist design | 3 | At 1440 the hero leaves a large empty band between the copy column and a single small study card floating top-right; the composition reads under-anchored rather than intentionally spare. |
| 9 | Help users recognize, diagnose, recover from errors | 4 | n/a — solid. Inline role=alert error, aria-invalid/aria-describedby wiring, focus jumps to the failed field, network failure hands off to email. |
| 10 | Help and documentation | 3 | Copy answers most objections inline ("tell me what you are planning", insurance, retainer), but the page offers no in-page section jump on mobile and no corporate-specific FAQ cross-link, so a deep question sends a skimmer to the generic FAQ. |
| **Total** | | **37/40** | Excellent |

## Anti-patterns verdict

Not AI-slop. This reads as a committed, hand-built brand system, not a template. The watercolour gradient-clipped CTA labels ("Enquire about your event"), the per-glyph hand-placed display type, the kit diorama (portrait with tools fanning/orbiting on scroll), and the deckle-edged reply card are all specific, load-bearing identity — exactly the things the constraints protect, so none of them count against it. Copy is the opposite of slop: concrete, Australian, plainspoken ("Most event merch is in a drawer by Monday", "I need a table, a chair and a corner of the room"), with real numbers (5–10 min a piece, ~8/hour, From $1000). The only faintly generic move is the airy single-card hero, but even that is a deliberate "proof of the hand, not a gallery" decision. No stock-hero, no lorem rhythm, no uniform card grid — this is authored.

## Cognitive load

0 of 8 fail. Single focus: hero carries one CTA. Chunking: why(3)/where/how(4)/engagement(2 cards)/enquire are cleanly separated. Grouping: facts, bullets and scale items are visually bound. Visual hierarchy: display headings > sentient sub-heads > body > mono meta is legible and consistent (only weak spot is the tiny mono metadata, noted separately). One-thing-at-a-time: the reply card asks in three sheets. Minimal choices: occasions is a scannable 6-item list, packages are base + scale, not a matrix. Working memory: prices/facts/insurance stay on screen where needed. Progressive disclosure: stepped form + scale-up details. This is genuinely low-load.

## What's working

- Conversion copy is best-in-class for a B2B arts service: every claim is concrete and objection-answering (keepsake-vs-merch, "no AV, no power, no fuss", public liability, 50% retainer, ~8 pieces/hour) in a warm, specific voice — no filler.
- The stepped reply card is a standout form: pre-selects the corporate package, validates only name/email, degrades to mailto on failure, and wires aria-invalid/aria-describedby with focus-to-error — accessible and low-friction.
- Motion is intentional, not reflexive: the kit fan+orbit, ink-bleed title lens and gradient-flow emphasis are each tiered through useHeavyFx/useReducedMotion with static fallbacks, and every shadow uses the approved burgundy/claret palette.
- Strong system consistency — the page borrows the homepage's paper ground, Label/Drop pigments, deckle card and header so it never feels like a bolted-on microsite.

## Priority issues

### [P2] Below-fold headings and cards are entirely gated behind whileInView reveals
- **Why:** Every section h2 (SplitText) and every why/occasions/how/engagement card animates from opacity:0 via whileInView (once, margin -60px) with only a pinch-zoom latch as a backstop. In the desktop full-page capture the "How it runs" and "The engagement" headings and their cards render completely invisible while their plain-span Labels ("On the night", "The engagement") and the non-SplitText enquiry h2 show — i.e. exactly the reveal-gated content is stranded at opacity:0. If an IntersectionObserver ever misfires on a fast/tall load, a planner sees empty pastel bands where the pricing and process should be.
- **Fix:** Verify the reveal fires for the deep sections, then add a safety net so reveal-gated content can never stay permanently invisible: e.g. a no-JS/settle fallback that resolves opacity to 1 after a short timeout, or widen the IO rootMargin, mirroring the existing `zoomed` latch. Keep the entrance for users who do scroll; only guarantee the resting state is visible.
- **Command:** /impeccable harden  (src/pages/CorporatePage.jsx:41)

### [P2] Hero is under-anchored on desktop — a big empty band and one small, tonally-ambiguous proof card
- **Why:** At 1440 the copy sits in cols 1–7 and a single ~250px character-study card floats at col-start-9, leaving a wide dead zone through the centre and lower-right. For a B2B skimmer the one proof image is a whimsical hatted-girl character that reads as illustration, not "live portraits of your guests", so the hero's strongest job (instant proof of the offer) is under-served by both the emptiness and the image choice.
- **Fix:** Anchor the right side without breaking the airy voice: widen the study column (e.g. lg:col-span-4 col-start-8) and/or layer a second overlapping guest-portrait study on tape so it reads as a small stack of real event pieces, and pick a study that visibly looks like a person portrait. Keep the existing burgundy card shadow and CornerBloom pigments.
- **Command:** /impeccable layout  (src/pages/CorporatePage.jsx:109)

### [P3] Tiny low-contrast mono metadata at the legibility floor
- **Why:** The hero note is text-ink-soft/85 at 0.6rem (~9.6px) and the figcaption is 0.54rem — ink-soft is documented as ~5.2:1 on paper, so the /85 knock-down plus the small size pushes these under AA for the skim audience they target (location, "Painted live · Cotton paper").
- **Fix:** Drop the /85 on the hero note (use full text-ink-soft) and nudge it to ~0.65rem; leave the tracking. Same for the figcaption — ink-soft at full strength keeps the editorial hush while clearing AA.
- **Command:** /impeccable colorize  (src/pages/CorporatePage.jsx:102)

## Persona red flags

**Jordan (first-timer)**
- The lone hero proof image is a stylised character (girl in a hat), which can read as children's illustration rather than "live watercolour portraits of your corporate guests" — the visual doesn't confirm the offer the headline promises.
- No single confirming "this is what your guests get" moment above the fold beyond that one small card.

**Casey (mobile)**
- Bottom dock labels are 0.56rem (~9px) — near the legibility floor on a phone.
- On /corporate/ the dock's Gallery/About/Packages/FAQ all jump to the homepage and there's no on-page section jump or current-page indicator, so a mobile skimmer can't leap to pricing/process — only linear scroll.

**Riley (stress-tester)**
- The form itself is robust (honeypot, date-min, email check, mailto fallback), but the whole lower page depends on whileInView reveals — a misfired observer leaves pricing/process bands blank (seen in the desktop full-page capture).
- Rapid Enter through the sheets is handled (implicit submit = continue), so the stress surface is really the reveal robustness, not the form.

## Minor observations

- Hero image alt ("...in olive green and ochre") describes pigment rather than subject; a corporate visitor's screen reader hears colours, not "a guest portrait".
- Emphasis pigment (queue / drawcard, / people / runs.) is consistently the on-brand olive #66681C italic — reads well and stays clear of the terracotta ban.
- The bird accent and lg-only bouquet are correctly decorative (aria-hidden, hidden on small screens) — no a11y or overflow cost.
- num-wide "01–04" in rust (#4E5016) on the paper-deep ground is legible; no action needed.
- Consider a corporate-flavoured line in the note text near the enquiry ("usually reply within a few days") is already present and reassuring — keep it.
