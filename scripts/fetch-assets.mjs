/**
 * Downloads the third-party pieces the build combines:
 *   - Noto Sans glyphs (Regular, Medium, Italic), every 256-codepoint range
 *     Protomaps publishes, into .tools/noto/ — the fallback for scripts Inter
 *     does not cover (Arabic, Devanagari, Thai, Tifinagh…). Not committed: they
 *     are only an input to scripts/build-glyphs.mjs.
 *   - Protomaps' dark sprite sheet (POI icons, road shields) into
 *     assets/sprites/ — committed, served with the style.
 *
 * Sources: https://github.com/protomaps/basemaps-assets — fonts under the SIL
 * Open Font License, sprites derived from MIT-licensed tangrams/icons.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = 'https://protomaps.github.io/basemaps-assets'
const FACES = ['Noto Sans Regular', 'Noto Sans Medium', 'Noto Sans Italic']

async function grab(url, dest) {
  const res = await fetch(url)
  if (res.status === 404) return false
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const type = res.headers.get('content-type') ?? ''
  if (/html/.test(type)) throw new Error(`${url} answered with a page, not a file`)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  return true
}

for (const face of FACES) {
  let n = 0
  const jobs = []
  for (let start = 0; start < 65536; start += 256) {
    const range = `${start}-${start + 255}`
    jobs.push(grab(`${BASE}/fonts/${encodeURIComponent(face)}/${range}.pbf`, `.tools/noto/${face}/${range}.pbf`).then((ok) => ok && n++))
    if (jobs.length === 16) await Promise.all(jobs.splice(0))
  }
  await Promise.all(jobs)
  console.log(`${face}: ${n} ranges`)
}
for (const f of ['dark.json', 'dark.png', 'dark@2x.json', 'dark@2x.png']) {
  await grab(`${BASE}/sprites/v4/${f}`, `assets/sprites/${f}`)
}
console.log('sprites: dark, 1x and 2x')
