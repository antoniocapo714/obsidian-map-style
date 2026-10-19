/**
 * Builds the label glyphs: "Obsidian Sans Regular/Medium/Italic".
 *
 * MapLibre asks a static host for one font stack per label layer, so it cannot
 * fall back from one font to another at runtime — a stack like
 * "Inter Regular,Noto Sans Regular" is a single URL nobody can serve. The
 * fallback therefore happens here: for every 256-codepoint range, Inter's
 * subsets are composited first and Noto Sans fills whatever Inter lacks.
 * Labels read in Inter, the theme's body face, wherever Inter has the glyph,
 * and every other script still renders.
 *
 *   node scripts/fetch-assets.mjs          (Noto Sans → .tools/noto)
 *   .tools/pyenv/bin/python scripts/inter-ttf.py   (Inter → .tools/inter)
 *   node scripts/build-glyphs.mjs          (→ assets/fonts)
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const fontnik = createRequire(import.meta.url)('fontnik')
const SUBSETS = ['latin', 'latin-ext', 'vietnamese', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext']
const FACES = ['Regular', 'Medium', 'Italic']

const range = (font, start) =>
  new Promise((resolve, reject) =>
    fontnik.range({ font, start, end: start + 255 }, (e, pbf) => (e ? reject(e) : resolve(pbf))),
  )
const composite = (buffers) =>
  new Promise((resolve, reject) => fontnik.composite(buffers, (e, pbf) => (e ? reject(e) : resolve(pbf))))

for (const face of FACES) {
  const out = `assets/fonts/Obsidian Sans ${face}`
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  const inter = SUBSETS.map((s) => readFileSync(`.tools/inter/Inter-${face}-${s}.ttf`))
  let written = 0
  let fromInter = 0
  for (let start = 0; start < 65536; start += 256) {
    const parts = []
    for (const font of inter) {
      const pbf = await range(font, start)
      if (pbf.length > 50) parts.push(pbf) // an empty range is ~30 bytes of header
    }
    if (parts.length) fromInter++
    const noto = `.tools/noto/Noto Sans ${face}/${start}-${start + 255}.pbf`
    if (existsSync(noto)) {
      const buf = readFileSync(noto)
      if (buf.length > 50) parts.push(buf)
    }
    if (!parts.length) continue
    writeFileSync(`${out}/${start}-${start + 255}.pbf`, parts.length === 1 ? parts[0] : await composite(parts))
    written++
  }
  console.log(`Obsidian Sans ${face}: ${written} ranges (${fromInter} with Inter glyphs)`)
}
