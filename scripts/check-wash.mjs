/**
 * Every bloom field, checked against the paint it is made of.
 *
 * The washes have failed silently three times now, and CLAUDE.md records why:
 * the model can be perfectly correct and still render as nothing (the rim that
 * emitted two levels out of 255), or backwards (γ folded in the wrong way), or
 * — the one this script was written after — the right paint pushed through a
 * renderer that quietly adds a colour the paint never had. Nothing looks wrong
 * in any of those cases. You have to go looking, and the looking is manual.
 *
 * This is the part that need not be manual. Two checks, in the order they earn
 * their keep:
 *
 * 1. AGREEMENT. `renderWash` bakes the bitmap that `fieldCss` describes, and
 *    its own header calls it "identical paint from the identical list" — a
 *    change of WHEN the wash resolves, not of what it looks like. So that is
 *    checkable: render the field both ways and diff.
 *
 * 2. GAMUT. §5.2 says a rendered pixel is the Kubelka-Munk composite of the
 *    glazes standing over the ground, so a field can only produce colours the
 *    paint reaching that pixel can make. A pixel outside that set was invented
 *    by the renderer. This is the independent one: agreement passes happily if
 *    BOTH tiers are wrong the same way, and this cannot, because it never looks
 *    at a rendering to decide what is right.
 *
 * Run against the rasteriser as it was before the lift fix, both fire on
 * exactly the three fields that carry lifts and none of the nine that don't:
 * agreement at 22-33/255, gamut at 35-52, against 2-6 on a healthy field. The
 * gamut check is the sharper of the two here, and the only one that says what
 * is wrong rather than that two pictures differ — it reports the packages lift
 * as "darker than any paint that reaches it", which is the whole diagnosis.
 *
 * WHAT IS COVERED. The two tiers that resolve a field on the CPU and can be
 * read back as pixels. Both ALPHA-composite their lobes rather than summing
 * thickness the way §5.2 prescribes — the documented limit of CSS, and the
 * reason BloomCanvas exists — so the gamut below is built to match what they
 * actually do. BloomCanvas itself is a shader and is not covered here.
 *
 * Run with `npm run check:wash`. Exits non-zero on a violation, naming the
 * field, the tier, the pixel, and which way the colour escaped.
 */

import { createServer } from 'vite'
import { chromium } from 'playwright'

// A phone-shaped field: the aspect the ambient washes run at down a long
// section, which is where the raster tier lives and where the blobs were.
const WIDTH = 393
const HEIGHT = 1400

// The washes carry no detail at the pixel scale, so a stride costs nothing; a
// lift 100px across is still hundreds of samples.
const STRIDE = 2

/**
 * How far a tier may stray before it is a failure, in 8-bit levels.
 *
 * The floor is what the raster legitimately loses: it paints at half resolution
 * or less (`washScale`) and round-trips through 8-bit PNG. A healthy field
 * measures 2-6 here, the hero orb setting the ceiling because its wet profile
 * is by far the steepest thing on the site to resample. Real faults are an
 * order away — the lift bug ran to 33 on agreement and 52 on gamut — so this
 * sits above the noise with room to spare rather than hugging it.
 */
const TOLERANCE = 8

/**
 * Directions the gamut is tested along.
 *
 * A point lies outside a convex set exactly when some direction separates it,
 * so sampling directions gives a LOWER bound on the violation: every failure
 * reported is real, and the only risk is missing one. That is the right way
 * round for a check that fails a build.
 */
const DIRECTIONS = 512

async function main() {
  const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' })
  await server.listen()

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } })
  page.on('pageerror', (e) => console.error('page error:', e.message))
  await page.goto('http://localhost:5199', { waitUntil: 'domcontentloaded' })

  const results = await page.evaluate(check, { WIDTH, HEIGHT, STRIDE, DIRECTIONS })

  await browser.close()
  await server.close()

  let failed = 0
  console.log('field            agree   gamut')
  for (const r of results) {
    if (r.error) {
      console.log(`✗ ${r.field.padEnd(14)} ${r.error}`)
      failed++
      continue
    }
    const bad = r.agree.worst > TOLERANCE || r.gamut.worst > TOLERANCE
    if (bad) failed++
    console.log(
      `${bad ? '✗' : '✓'} ${r.field.padEnd(14)} ` +
        `${r.agree.worst.toFixed(1).padStart(5)}   ${r.gamut.worst.toFixed(1).padStart(5)}  /255`,
    )
    if (r.agree.worst > TOLERANCE) {
      console.log(
        `    agreement: at (${r.agree.at}) css paints rgb(${r.agree.css}) ` +
          `where the raster bakes rgb(${r.agree.raster})`,
      )
    }
    if (r.gamut.worst > TOLERANCE) {
      console.log(
        `    gamut: ${r.gamut.tier} at (${r.gamut.at}) paints rgb(${r.gamut.rgb}) — ${r.gamut.escape}`,
      )
    }
  }

  if (failed) {
    console.log(`\n${failed} field(s) failed. See the header of scripts/check-wash.mjs.`)
    process.exitCode = 1
  } else {
    console.log(`\nAll ${results.length} fields agree across tiers and stay inside their palettes.`)
  }
}

/**
 * Runs inside the page, because both tiers need a browser: `renderWash` paints
 * a real canvas, and the only honest way to resolve `fieldCss` to pixels is to
 * let the browser rasterise the gradients itself.
 */
async function check({ WIDTH, HEIGHT, STRIDE, DIRECTIONS }) {
  const wc = await import('/src/lib/watercolour.js')
  const wr = await import('/src/lib/washRaster.js')

  const [hero, bloom, packages, quote, postcard, corporate, timeline, footer, evening] =
    await Promise.all([
      import('/src/components/Hero.jsx'),
      import('/src/components/WatercolourBloom.jsx'),
      import('/src/components/Packages.jsx'),
      import('/src/components/PullQuote.jsx'),
      import('/src/components/Postcard.jsx'),
      import('/src/pages/CorporatePage.jsx'),
      import('/src/components/EveningTimeline.jsx'),
      import('/src/components/Footer.jsx'),
      import('/src/components/EveningLight.jsx'),
    ])

  // Every field that goes through `fieldLobes`, with the ground it composites
  // onto — the same pairing its component passes at the call site.
  const FIELDS = [
    ['hero', hero.HERO_FIELD, wc.PAPER_REFLECTANCE],
    ['hero orb', hero.HERO_ORB, wc.PAPER_REFLECTANCE],
    ['ambient', bloom.WASH_STATIC, wc.PAPER_REFLECTANCE],
    ['ambient warm', bloom.WASH_WARM, wc.PAPER_REFLECTANCE],
    ['packages', packages.PACKAGES_FIELD, wc.PAPER_DEEP],
    ['pull quote', quote.QUOTE_FIELD, wc.PAPER_REFLECTANCE],
    ['postcard', postcard.POSTCARD_WASH, wc.PAPER_REFLECTANCE],
    ['corporate', corporate.CORPORATE_HERO, wc.PAPER_REFLECTANCE],
    ['dusk glow', timeline.DUSK_GLOW, wc.WINE],
    ['footer glow', footer.FOOTER_GLOW, footer.FOOTER_GROUND],
    ['golden hour', evening.GOLDEN_HOUR, wc.PAPER_REFLECTANCE],
    ['dusk', evening.DUSK, wc.PAPER_REFLECTANCE],
  ]

  // Directions spread by the golden-angle spiral — even coverage without the
  // clumping at the poles a naive random draw gives.
  const dirs = []
  for (let i = 0; i < DIRECTIONS; i++) {
    const z = 1 - (2 * i + 1) / DIRECTIONS
    const r = Math.sqrt(Math.max(0, 1 - z * z))
    const th = i * Math.PI * (3 - Math.sqrt(5))
    dirs.push([r * Math.cos(th), r * Math.sin(th), z])
  }

  const parseRgba = (c) => {
    if (c === 'transparent') return null
    const m = c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?/)
    return m ? [+m[1] / 255, +m[2] / 255, +m[3] / 255, m[4] === undefined ? 1 : +m[4]] : null
  }

  /**
   * The deviations from the ground one lobe can deposit.
   *
   * A lobe's stops were solved so that compositing a stop over the ground
   * reproduces exactly the Kubelka-Munk colour of that pigment at that
   * thickness (§5.2) — so `a·(C − ground)` IS the KM deviation, and reading it
   * back off the shipped stop list means the gamut is derived from the same
   * numbers the renderers consume, with no profile constants restated here.
   *
   * Compositing over a backdrop that is not bare ground adds a second-order
   * term in the deviations, which for washes this light is far under the
   * tolerance.
   */
  const lobeDeviations = (lobe, over) =>
    lobe.stops
      .map(([c]) => parseRgba(c))
      .filter(Boolean)
      .map(([r, g, b, a]) => [(r - over[0]) * a, (g - over[1]) * a, (b - over[2]) * a])

  /** Where a lobe reaches, in field pixels, and how far its paint extends. */
  const lobeGeometry = (lobe) => {
    const rx = lobe.sizeVw ? (lobe.sizeVw[0] * WIDTH) / 100 : (lobe.sizePct[0] / 100) * WIDTH
    const ry = lobe.sizeVw ? (lobe.sizeVw[1] * WIDTH) / 100 : (lobe.sizePct[1] / 100) * HEIGHT
    const cx = (lobe.atPct[0] / 100) * WIDTH + (lobe.offVw ? (lobe.offVw[0] * WIDTH) / 100 : 0)
    const cy = (lobe.atPct[1] / 100) * HEIGHT + (lobe.offVw ? (lobe.offVw[1] * WIDTH) / 100 : 0)
    let extent = 0
    for (const [, pos] of lobe.stops) if (pos != null) extent = Math.max(extent, pos)
    return { cx, cy, rx: rx * (extent / 100), ry: ry * (extent / 100) }
  }

  const rasterise = async (backgroundImage, over) => {
    const ground = `rgb(${over.map((c) => Math.round(c * 255)).join(',')})`
    // foreignObject resolves vw against the SVG box, which is the field's own
    // width here — the same thing the page resolves it against.
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">` +
      `<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" ` +
      `style="width:${WIDTH}px;height:${HEIGHT}px;background-color:${ground};` +
      `background-image:${backgroundImage.replace(/"/g, "'")}"></div></foreignObject></svg>`
    const img = new Image()
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    await img.decode()
    const c = document.createElement('canvas')
    c.width = WIDTH
    c.height = HEIGHT
    const g = c.getContext('2d')
    g.drawImage(img, 0, 0)
    return g.getImageData(0, 0, WIDTH, HEIGHT)
  }

  const results = []
  for (const [name, blooms, over] of FIELDS) {
    if (!blooms) {
      results.push({ field: name, error: 'spec not exported' })
      continue
    }

    let css
    let raster
    try {
      css = await rasterise(wc.fieldCss(blooms, over), over)
      const url = await wr.renderWash({ blooms, over, width: WIDTH, height: HEIGHT, vw: WIDTH })
      const img = new Image()
      img.src = url
      await img.decode()
      const c = document.createElement('canvas')
      c.width = WIDTH
      c.height = HEIGHT
      const g = c.getContext('2d')
      g.fillStyle = `rgb(${over.map((x) => Math.round(x * 255)).join(',')})`
      g.fillRect(0, 0, WIDTH, HEIGHT)
      g.drawImage(img, 0, 0, WIDTH, HEIGHT)
      raster = g.getImageData(0, 0, WIDTH, HEIGHT)
    } catch (e) {
      results.push({ field: name, error: `render failed: ${e.message}` })
      continue
    }

    // 1. Agreement.
    const agree = { worst: 0, at: null, css: null, raster: null }
    for (let y = 0; y < HEIGHT; y += STRIDE) {
      for (let x = 0; x < WIDTH; x += STRIDE) {
        const i = (y * WIDTH + x) * 4
        const d = Math.max(
          Math.abs(css.data[i] - raster.data[i]),
          Math.abs(css.data[i + 1] - raster.data[i + 1]),
          Math.abs(css.data[i + 2] - raster.data[i + 2]),
        )
        if (d > agree.worst) {
          agree.worst = d
          agree.at = `${x},${y}`
          agree.css = `${css.data[i]},${css.data[i + 1]},${css.data[i + 2]}`
          agree.raster = `${raster.data[i]},${raster.data[i + 1]},${raster.data[i + 2]}`
        }
      }
    }

    // 2. Gamut, per pixel against only the lobes that actually reach it.
    //
    // Summing every lobe in the field instead makes the reachable set so large
    // it contains anything — tried, and it passed the very bug this script was
    // written for. What bounds a pixel is the paint that can be AT that pixel.
    const lobes = wc.fieldLobes(blooms, over).map((l) => ({
      ...lobeGeometry(l),
      devs: lobeDeviations(l, over),
    }))

    // Coverage is a property of position, and neighbouring pixels share it, so
    // the support sums are computed once per distinct set of covering lobes.
    const reachCache = new Map()
    const reachFor = (mask) => {
      const key = mask.join(',')
      let reach = reachCache.get(key)
      if (reach) return reach
      reach = new Float64Array(DIRECTIONS)
      for (let d = 0; d < DIRECTIONS; d++) {
        const u = dirs[d]
        let h = 0
        for (const li of mask) {
          let best = 0
          for (const dev of lobes[li].devs) {
            const v = dev[0] * u[0] + dev[1] * u[1] + dev[2] * u[2]
            if (v > best) best = v
          }
          h += best
        }
        reach[d] = h
      }
      reachCache.set(key, reach)
      return reach
    }

    const gamut = { worst: 0, at: null, rgb: null, escape: '', tier: null }
    for (const [tier, pix] of [
      ['css', css],
      ['raster', raster],
    ]) {
      for (let y = 0; y < HEIGHT; y += STRIDE) {
        for (let x = 0; x < WIDTH; x += STRIDE) {
          const i = (y * WIDTH + x) * 4
          const dev = [
            pix.data[i] / 255 - over[0],
            pix.data[i + 1] / 255 - over[1],
            pix.data[i + 2] / 255 - over[2],
          ]
          const mag = Math.hypot(...dev)
          // Nothing within a level or two of the ground can be out of gamut,
          // and that is most of every field.
          if (mag * 255 <= gamut.worst) continue

          const mask = []
          for (let li = 0; li < lobes.length; li++) {
            const l = lobes[li]
            const dx = (x - l.cx) / l.rx
            const dy = (y - l.cy) / l.ry
            if (dx * dx + dy * dy <= 1) mask.push(li)
          }
          const reach = reachFor(mask)

          for (let d = 0; d < DIRECTIONS; d++) {
            const u = dirs[d]
            const escaped = (dev[0] * u[0] + dev[1] * u[1] + dev[2] * u[2]) * 255 - reach[d] * 255
            if (escaped > gamut.worst) {
              gamut.worst = escaped
              gamut.at = `${x},${y}`
              gamut.rgb = `${pix.data[i]},${pix.data[i + 1]},${pix.data[i + 2]}`
              gamut.escape = describe(u)
              gamut.tier = tier
            }
          }
        }
      }
    }

    results.push({ field: name, agree, gamut })
  }

  /** Which way a colour escaped, in words a person can act on. */
  function describe(u) {
    // The separating direction points away from the set, so one that is mostly
    // "all three channels down" means the pixel is darker than the paint can go.
    const lum = (u[0] + u[1] + u[2]) / Math.sqrt(3)
    if (lum < -0.75) return 'darker than any paint that reaches it'
    if (lum > 0.75) return 'lighter than open paper'
    const axis = ['red', 'green', 'blue']
    const mags = u.map(Math.abs)
    const i = mags.indexOf(Math.max(...mags))
    return `${u[i] > 0 ? 'more' : 'less'} ${axis[i]} than any paint that reaches it`
  }

  return results
}

await main()
