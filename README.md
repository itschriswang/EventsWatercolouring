# Events Watercolouring

Marketing site for [Chris Wang Studio](https://chriswangstudio.com) — live
event watercolour painting in Melbourne and Sydney. A full-bleed, editorial
single page (plus `/faq/` and `/corporate/`) built with React, Vite,
Tailwind CSS and Framer Motion.

## Develop

```sh
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the production build
```

## Layout

| Path | What it is |
|------|------------|
| `src/` | Application code — `content.js` holds all copy, `components/` the sections and effects |
| `index.html`, `faq/`, `corporate/` | The three page entries (static MPA, see `vite.config.js`) |
| `public/assets/` | Artwork and photography (webp + jpg/png pairs) |
| `docs/` | Business documents — contract, pricing, copy and content plans |
| `reference/` | Design references and adapted third-party studies |

See `CLAUDE.md` for the architecture notes and the Pastel Bloom design
system (palette, shadows, motion and performance conventions).
