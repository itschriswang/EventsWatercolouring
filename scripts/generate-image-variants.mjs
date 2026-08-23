// Emits downscaled WebP variants for the gallery wall's paintings, plus a
// manifest (src/lib/artVariants.json) that the srcset helper in lib/site.js
// reads, so the <source srcset> entries always describe real files at their
// true widths.
//
// Run after adding or replacing gallery art:
//   node scripts/generate-image-variants.mjs
//
// Why the gallery: those tiles render ~320 CSS px wide yet were shipping their
// full ~1242px sources.
//
// The hero pair and the footer photograph were excluded from that for a long
// time on the grounds that they render near their natural size. That is true on
// a desktop, where the hero cards top out around 400 CSS px — and wrong on a
// phone, where the same cards render 162-213 px and were still handed the full
// master. Measured on a Pixel 7: 8.5MB, 7.3MB and 6.0MB of decoded image memory
// for three pictures, inside a page already holding ~91MB of layers. That is
// the kind of total that gets a Safari tab purged, and a purged tab reloads and
// loses the visitor's place.
//
// The old objection was real, and is answered rather than ignored: a <source
// srcset> beside a <link rel="preload"> naming one exact URL makes the browser
// fetch a variant next to the preloaded original, doubling the cost. index.html
// now preloads with imagesrcset/imagesizes carrying the SAME candidate list and
// the SAME sizes as the <picture>, so the preload and the element resolve to one
// file. Those three attributes are hand-written there — keep them in step with
// this list and with the `sizes` in Hero.jsx / Footer.jsx.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const assets = join(root, 'public', 'assets')

// Keep in step with the `img` entries in src/content.js WORK.groups.
const GALLERY = [
  'art-couple-vows',
  'art-couple-sage',
  'art-couple-blush',
  'art-couple-hanbok',
  'art-toast-friends',
  'art-toast-video-poster',
  'art-character-girl',
  'art-character-boy',
  'art-character-boy2',
]

// The hero pair and the footer photograph. `art-character-boy` is already in
// GALLERY above (it is both the hero card and a wall tile), so it is not
// repeated here.
const HERO = ['art-bouquet', 'fireflies-night']

// 640 earns its place on phones specifically: a hero card at 172-213 CSS px on
// a 3x screen needs 516-639 real pixels, so without it the picker jumps to 960
// and carries roughly twice the decoded bytes it needs.
const WIDTHS = [480, 640, 960, 1440]

const manifest = {}
for (const name of [...GALLERY, ...HERO]) {
  // The .jpg is the least-recompressed master we keep in the repo; resizing
  // from the (already lossy) .webp would compound two generations of loss.
  const src = join(assets, `${name}.jpg`)
  const meta = await sharp(src).metadata()
  const widths = WIDTHS.filter((w) => w < meta.width)
  for (const w of widths) {
    await sharp(src).resize(w).webp({ quality: 80 }).toFile(join(assets, `${name}-${w}.webp`))
  }
  manifest[name] = { widths, width: meta.width }
  console.log(name, `${meta.width}px →`, widths.join(', ') || '(no variants; source is small)')
}

writeFileSync(join(root, 'src', 'lib', 'artVariants.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log('wrote src/lib/artVariants.json')
