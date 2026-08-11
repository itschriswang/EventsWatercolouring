// Emits downscaled WebP variants for the gallery wall's paintings, plus a
// manifest (src/lib/artVariants.json) that the srcset helper in lib/site.js
// reads, so the <source srcset> entries always describe real files at their
// true widths.
//
// Run after adding or replacing gallery art:
//   node scripts/generate-image-variants.mjs
//
// Why only the gallery: those tiles render ~320 CSS px wide yet were shipping
// their full ~1242px sources. The hero paintings are deliberately left alone —
// they render near their natural size AND are <link rel="preload">ed by exact
// URL from the HTML entries; a srcset there would make the browser fetch a
// variant beside the preloaded original, doubling the cost instead of halving it.
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

const WIDTHS = [480, 960, 1440]

const manifest = {}
for (const name of GALLERY) {
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
