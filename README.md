<p align="center">
  <img src="docs/banner.jpg" alt="Obsidian map: central Milan in the style, with a district, a route and points drawn on top as the only colour on the map" width="100%">
</p>

<h1 align="center">Obsidian map style</h1>

<p align="center">
  A dark basemap style for <a href="https://maplibre.org">MapLibre GL</a> on <a href="https://protomaps.com">Protomaps</a> tiles,<br>
  designed to sit behind data.
</p>

<p align="center">
  <b>Version 0.3</b> · Built on <a href="https://github.com/protomaps/basemaps">Protomaps basemaps 5</a> and <a href="https://maplibre.org">MapLibre GL 6</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.3.0-2D72D2?labelColor=1A1D21" alt="Version 0.3.0">
  <img src="https://img.shields.io/badge/license-MIT-238551?labelColor=1A1D21" alt="MIT licence">
  <img src="https://img.shields.io/badge/maplibre-6-8A8F98?labelColor=1A1D21" alt="MapLibre 6">
  <img src="https://img.shields.io/badge/no_API_key-self--hosted-6FA6E8?labelColor=1A1D21" alt="No API key, self-hosted">
</p>

<p align="center">
  <a href="https://creative-context.github.io/obsidian-map-style/"><img src="https://img.shields.io/badge/Demo-live-2D72D2?labelColor=1A1D21" alt="Live demo"></a>
</p>

<p align="center">
  <a href="https://creative-context.github.io/obsidian-map-style/"><b>Live demo</b></a> ·
  <a href="#getting-started"><b>Getting started</b></a> ·
  <a href="#data-on-top"><b>Data on top</b></a> ·
  <a href="#tiles"><b>Tiles</b></a> ·
  <a href="https://github.com/creative-context/astryx-theme-obsidian"><b>Obsidian theme</b></a> ·
  <a href="#ai-assistants"><b>AI assistants</b></a> ·
  <a href="CHANGELOG.md"><b>Changelog</b></a>
</p>

## Overview

A map in a data product has one job: give the data a place to stand. This style keeps the basemap near-neutral and readable, so whatever you draw on top — points, routes, regions, heatmaps — is the most colourful thing on screen.

The [live demo](https://creative-context.github.io/obsidian-map-style/) shows it on Madrid, Milan and Mexico City, with sample data on top.

It is the map companion to the [Obsidian theme for Astryx](https://github.com/creative-context/astryx-theme-obsidian), and uses the same colours, type and rules, but it works in any MapLibre app.

**What makes it different:**

- **The data leads.** Roads, buildings and labels are grey, and every overlay colour carries chroma. The map's greys are as neutral as the theme's, so no road or river shares a hue with the data. Every data mark sits on a dark halo, so where a route crosses an avenue there is an edge between them and the route wins. POI icons are greyscale and appear only at street zoom (15 and up).
- **Readable at every zoom, brighter where you read streets.** Each road class holds a floor at every zoom (motorways 5.1:1, avenues 4.2:1, streets 3.3:1) and rises from city zoom (13) to street zoom (15), where motorways reach 7.4:1.
- **Large areas are quiet, edges are not.** Airports, industrial land and water get a subtle fill and an outline that carries the contrast. Buildings all but merge with the land up to city zoom, where you look at data, and are drawn by their footprint edge from zoom 14, where you read streets.
- **Labels in every script.** Labels use Inter, the theme's typeface. Inter is composited with Noto Sans into one font stack, so "Łódź", "Nam Định", Cyrillic, Thai and the rest render in full instead of losing letters.
- **No black edges.** An optional planet overview sits under your tiles, so an extract of one city or country fades into the world instead of ending in a straight black line.
- **Self-hosted.** It needs no API key and makes no request to a third-party map provider.

![Madrid at city zoom, with sample points, a route and a district drawn on top](docs/hero.jpg)

![Central Milan at street zoom: subtle building footprints, legible streets](docs/street.jpg)

## Getting started

```bash
npm install github:creative-context/obsidian-map-style#v0.3.1 maplibre-gl pmtiles
```

`#v0.3.1` pins a [release](https://github.com/creative-context/obsidian-map-style/releases); without it you get the tip of `main`.

Serve the package's `assets/` folder (label glyphs and sprites) from your app, for example by copying `node_modules/obsidian-map-style/assets` into your public directory. Then:

```ts
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import {Protocol} from 'pmtiles';
import {obsidianMapStyle} from 'obsidian-map-style';
import 'maplibre-gl/dist/maplibre-gl.css';

maplibregl.setWorkerUrl(workerUrl);
maplibregl.addProtocol('pmtiles', new Protocol().tile);

const map = new maplibregl.Map({
  container: 'map',
  style: obsidianMapStyle({
    tiles: 'https://your-host/tiles/area.pmtiles',
    worldTiles: 'https://your-host/tiles/world.pmtiles', // optional
    assets: '/basemap', // where you serve assets/
  }),
  center: [-3.7038, 40.4168],
  zoom: 13,
});
```

Use MapLibre GL 6.4.1 or later; earlier versions, 5.x included, have a published XSS advisory ([GHSA-jrc7-96c5-q579](https://github.com/advisories/GHSA-jrc7-96c5-q579)). MapLibre 6 has no default export, and it loads its worker from a separate file that a bundler does not find on its own: `?url` (Vite) emits the worker and `setWorkerUrl` points MapLibre at it. The style itself works with MapLibre 5 and 6.

### Options

| Option | Default | What it does |
|---|---|---|
| `tiles` | — | The detailed tiles: a PMTiles archive or a TileJSON URL, Protomaps v4 schema. |
| `worldTiles` | none | A low-zoom planet archive drawn underneath. Lines and labels hand off to `tiles` at zoom 7, so nothing is drawn twice. |
| `assets` | — | Where `fonts/` and `sprites/` are served. Resolved to an absolute URL, which MapLibre requires for sprites since version 5. |
| `lang` | `en` | Label language. |
| `hideRailways` | `false` | Hide the basemap's railways, for apps that draw their own. |

### AI assistants

Two files tell an AI assistant how to work with the style:

- **[`llms.txt`](llms.txt)** is for an assistant building a map *with* the style: install, the options, how to draw data on top, the colour order and the attribution it must keep. It ships in the package and with the demo.
- **[`AGENTS.md`](AGENTS.md)** is for an assistant working *on* this repository: the layout, which files are generated and must not be edited by hand, the commands, and the rules the tests enforce. `CLAUDE.md` imports it.


## Data on top

Draw your layers between the basemap and its labels, so place names stay readable:

```ts
import {OVERLAY, areaLayers, firstLabelLayer, lineLayers, pointLayer} from 'obsidian-map-style';

map.on('load', () => {
  const before = firstLabelLayer(map.getStyle());
  map.addSource('sites', {type: 'geojson', data: sites});
  map.addSource('route', {type: 'geojson', data: route});
  map.addSource('zones', {type: 'geojson', data: zones});
  map.addLayer(pointLayer({id: 'sites', source: 'sites', color: OVERLAY.blue}), before);
  for (const layer of lineLayers({id: 'route', source: 'route', color: OVERLAY.orange})) {
    map.addLayer(layer, before);
  }
  for (const layer of areaLayers({id: 'zones', source: 'zones', color: OVERLAY.purple, size: 'region'})) {
    map.addLayer(layer, before);
  }
});
```

- **Colours.** `OVERLAY` holds the Obsidian theme's categorical chart colours: blue, orange, purple, green, pink, cyan, red and teal. Use them in that order. Neighbours stay distinguishable for colour-blind readers, and every one reaches 3:1 on the land.
- **Every mark has a halo** of the land colour: a 2 px ring on points, 1.5–2 px either side of lines and area edges. It is what keeps a line readable where it crosses a bright road.
- **Points** are 10 px at city zoom and 14 px at street zoom.
- **Lines** grow with zoom like the roads they cross: 3 px at zoom 13, 4.5 px at 15, 7 px at 18, at full opacity. Opacity is part of the colour, so a half-transparent line is a dimmer line. `lineLayers` returns the halo and the line; add both, in order.
- **Areas** are a fill plus an edge. `size: 'region'` gives a 12% wash and `'parcel'` gives 32%: the bigger the area, the quieter its fill, and the edge carries the contrast either way.

## Tiles

The style reads the [Protomaps basemap](https://docs.protomaps.com/basemaps/downloads), version 4, from OpenStreetMap. A single PMTiles file is served with HTTP range requests, so it needs no tile server.

- **The whole planet** is a daily build you can download from Protomaps: over 100 GB to zoom 15.
- **An area** is cut from it with the `pmtiles` CLI. A city to zoom 14 is 15–20 MB:

  ```bash
  pmtiles extract https://build.protomaps.com/<date>.pmtiles madrid.pmtiles --bbox=-3.92,40.28,-3.49,40.60 --maxzoom=14
  ```
- **The planet overview** for `worldTiles` is the same build cut to zoom 6, about 45 MB.

Host the files anywhere that answers range requests: object storage such as S3 or R2, a CDN, or GitHub Pages for small extracts.

## Labels

`assets/fonts/` holds **Obsidian Sans** Regular, Medium and Italic. These are SDF glyph ranges built from Inter (Latin, Latin Extended, Vietnamese, Cyrillic and Greek) and composited over Noto Sans for every other script. MapLibre can't fall back between font stacks on a static host, so the fallback is baked in. Rebuild them with `bun run glyphs`.

CJK labels are drawn by the browser from local fonts, as MapLibre does by default.

## Accessibility

- Every road class you navigate by holds its floor on the land at every zoom: 2.9:1 for service roads, 3.3:1 for streets, 4.2:1 for avenues, 5.1:1 for motorways. Motorways reach 7.4:1 at street zoom.
- Building footprints are drawn by a 4.0:1 edge from zoom 14.
- Every label reaches 4.5:1 against its halo.
- The basemap's greys carry no more colour than the theme's (OKLCH chroma ≤ 0.012), so hue alone marks what is data.
- Large areas carry their contrast on an edge of at least 3:1.
- Overlay colours reach 3:1 on the land, and their order keeps neighbours apart for protanopic and deuteranopic readers.
- `test/style.test.ts` measures all of it, including that the label glyphs contain every letter of "Łódź", "Nam Định" and "Калининград".

## Known issues

- Protomaps' style asks for a few icons its own sprite sheet doesn't have, such as `townhall`, and MapLibre logs a warning. The label still draws. The demo answers with a transparent placeholder on `styleimagemissing`.

## Develop

```bash
bun install
bun run demo          # Madrid, Milan and Mexico City at http://localhost:5173
bun run test
bun run build         # src → dist
bun run glyphs        # rebuild Obsidian Sans (needs Python 3 with fonttools; see scripts/)
```

The demo opens on `?city=madrid|milan|mexico-city`, and the view is kept in the URL hash, so any view can be shared as a link.

## Credits and licences

- Code: [MIT](LICENSE).
- Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), [ODbL](https://opendatacommons.org/licenses/odbl/). Tiles and base style by [Protomaps](https://protomaps.com) (BSD-3-Clause).
- Inter and Noto Sans: SIL Open Font License 1.1 (`assets/fonts/`).
- Sprites: Protomaps basemaps-assets, derived from MIT-licensed tangrams/icons, turned to greyscale (`assets/sprites/`).
