# Instructions for AI agents working on this repository

This is the **Obsidian map style**: a dark MapLibre GL basemap on Protomaps v4 tiles, designed to sit behind data. It is the map companion to the Obsidian theme for Astryx.

## Layout

- `src/palette.ts` — every basemap colour: the flavour, zoom-aware ink (`ZOOM_INK`), edged areas (`EDGED_FILLS`), label ink.
- `src/transforms.ts` — the corrections applied to Protomaps' dark style.
- `src/style.ts` — `obsidianMapStyle()` and the world underlay hand-off.
- `src/overlays.ts` — colours and layer recipes for data on top.
- `dist/` — **generated** by `bun run build`. Never edit by hand; commit it with the source change (the package installs from GitHub).
- `assets/fonts/` — **generated** "Obsidian Sans" glyphs (`bun run glyphs`). Never edit by hand.
- `assets/sprites/` — Protomaps' sprite sheet, fetched by `scripts/fetch-assets.mjs` and turned to greyscale by `scripts/grey-sprites.py`. Run both, in that order; a coloured sprite puts colour on the basemap that is not data.
- `demo/` — the demo; `demo/public/tiles/` holds the city extracts and the world overview.
- `test/style.test.ts` — the style's contract.
- `.tools/` — downloaded build tools (pmtiles CLI, Python env). Gitignored.

## Commands

```bash
bun install
bun run test     # contrast, opacity, hand-off, glyph coverage
bun run build    # src → dist; run after any change to src/
bun run demo     # http://localhost:5173 — ?city=madrid|milan|mexico-city, view in the URL hash
bun run glyphs   # rebuild Obsidian Sans (needs Python 3 + fonttools in .tools/pyenv)
```

## Rules

- **Colour is reserved for data.** Basemap greys are as neutral as the theme's (OKLCH chroma 0.012 or less, water 0.02); overlay colours carry at least 0.1 and reach 3:1 on the land. Sprites stay greyscale. The tests enforce all of it.
- **Large areas get a subtle fill and a 3:1 edge** — airports, industrial land, water, buildings. Never make an area fill the brightest thing on screen.
- **Opacity is part of the colour.** Fold any alpha into the hex; a layer that ships at 0.5 opacity is a different colour from the one measured.
- **Zoom expressions go at the top level.** Put `case` inside interpolation stops, never around them — the reverse fails style validation silently and the map never loads.
- **Never draw a line or label from both the world underlay and the detailed tiles at the same zoom**; they hand off at z7.
- **Fix a failing contrast or coverage test by fixing the style**, never by relaxing the threshold.
- **No product or personal names, and no other brands**, in code, comments, docs or demo content. Documentation in English, short and plain.
- Map data is OpenStreetMap (ODbL): keep the attribution on every rendered map, including images.

## Releasing

1. Bump `version` in `package.json` and add a `## x.y.z` section to `CHANGELOG.md`. Run `bun run build` and commit `dist/`.
2. Update the pinned tag in the install lines of `README.md` and `llms.txt` (`#vx.y.z`).
3. Commit, push, and wait for CI to pass on `main`.
4. Publish the release on that commit, with its CHANGELOG section as the notes:
   `gh release create vx.y.z --target <commit> --title vx.y.z --notes-file <notes>`.
5. Never move or delete a published tag. A fix is a new patch version.
