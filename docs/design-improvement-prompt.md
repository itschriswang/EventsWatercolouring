# Design-improvement prompt

A ready-to-paste prompt for a Claude Code session that uses the imported
**taste** and **emildesign** skills (now living in `.claude/skills/`) to lift
the quality of chriswangstudio.com without breaking what already works.

## Which skills to reach for

The repo now carries the full taste + emildesign skill libraries. For *this*
site — a polished watercolour marketing MPA with an established design system —
the load-bearing ones are:

- `redesign-skill` — audit-first upgrade of an existing site; finds generic
  patterns and fixes them without breaking functionality.
- `taste-skill` — anti-slop direction and a strict pre-flight check.
- `soft-skill` — the "make it feel expensive" agency rules (spacing, shadows,
  card structure, type).
- `apple-design` — spring physics, interruptible/gesture motion, materials,
  optical typography.
- `emil-design-eng` — the invisible-details craft bar for UI polish.
- `find-animation-opportunities` → `improve-animations` → `review-animations`
  — the read-only propose → plan → review loop for motion.
- `impeccable` — already installed; the umbrella design/critique/live-iterate
  skill for browser-driven polish.

Skip the image-generation and other-tool skills (`brandkit`, `imagegen-*`,
`image-to-code-skill`, `stitch-skill`, `gpt-tasteskill`, `brutalist-skill`,
`minimalist-skill`, `output-skill`) — they target Codex/Stitch/GPT or a look
this brand deliberately isn't.

---

## The prompt

> I want to raise the craft bar on this site (chriswangstudio.com) — a live
> event watercolour marketing MPA — using the design skills now in
> `.claude/skills/`. This is a **polish-and-elevate pass on an existing,
> shipped site, not a redesign.** Preserve the brand, the copy voice, and the
> information architecture.
>
> **Hard constraints — read `CLAUDE.md` first and treat it as law:**
> - Palette is *Pastel Bloom* (apricot → butter → chartreuse glow →
>   periwinkle → lilac → blush → candy rose). Keep the protected yellow-green
>   glow. **Never** introduce terracotta / brick / burnt-orange. Deep
>   decorative anchors are **burgundy/claret**, never purple; body/title text
>   stays `ink` (#423A3D), never pushed toward wine.
> - **No grey/black/neutral shadows** — every shadow uses the tinted burgundy /
>   claret values in the CLAUDE.md shadow table.
> - Respect the performance ladder: gate new expensive effects behind
>   `useHeavyFx()`, honour `useReducedMotion()`, and give every WebGL effect a
>   CSS/SVG fallback. Never ship jank to touch/low-end devices.
> - Copy voice: plain, warm, Australian English, **no em dashes**. All copy
>   lives in `src/content.js`.
> - Keep anchor ids (`#night`, `#work`, `#painter`, `#offerings`, `#enquiry`,
>   `#faq`) and the Formspree payload keys stable.
> - There are no tests. Verify with `npm run build` plus a visual pass
>   (Playwright is available for screenshots).
>
> **Do it in phases, and stop for my sign-off between each:**
>
> 1. **Audit.** Invoke `redesign-skill` and `taste-skill` to audit the current
>    homepage, `/faq/`, and `/corporate/` against a premium bar. Separately
>    invoke `find-animation-opportunities` (read-only) to list places that
>    should animate but don't, and `improve-animations` to survey the existing
>    motion. Give me one prioritised findings list (impact × effort), with each
>    item tied to a concrete file/component. Do **not** edit anything yet.
>
> 2. **Plan.** For the items I approve, cross-check each against `soft-skill`,
>    `apple-design`, and `emil-design-eng` and write self-contained
>    implementation notes (exact tokens, spring values, spacing, shadow RGBAs
>    from the CLAUDE.md table). Flag anything that would touch the protected
>    palette, the perf tiers, or the copy voice so I can veto it.
>
> 3. **Implement,** one component at a time. After each, run `npm run build`
>    and take before/after screenshots at desktop + mobile widths. Then run
>    `review-animations` over any motion you touched and address what it flags
>    (approval is earned there, so expect pushback).
>
> Start with phase 1 only. Report the audit and wait.

---

## Notes

- The Skill tool keys these by directory name (`taste-skill`, `redesign-skill`,
  `soft-skill`, `apple-design`, `emil-design-eng`, `find-animation-opportunities`,
  `improve-animations`, `review-animations`, `animation-vocabulary`,
  `impeccable`).
- `review-animations` has `disable-model-invocation: true`, so invoke it
  explicitly by name — it won't auto-trigger.
- Keep the phases gated. These skills are opinionated and, run unsupervised on a
  site with a protected palette, will happily "improve" the chartreuse glow or a
  burgundy shadow right out of existence. The audit-first, sign-off-between-phases
  shape is what keeps the brand intact.
