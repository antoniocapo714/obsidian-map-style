# Changelog

## 0.2.0

The data now leads the map by brightness as well as colour. At city zoom the avenues were brighter than the blue drawn on top of them, so thin marks were lost among the streets.

- Road ink holds its survey value up to city zoom (13) and rises to street ink by zoom 15. It used to rise from zoom 8 and peak at 13. `INK_RAMP` exports the two zooms.
- Up to city zoom no navigable road is brighter than the first overlay colour: highways go from 5.2:1 to 4.0:1 on the land, major roads from 4.3:1 to 3.7:1. Both stay legible.
- Data lines and area edges sit on a 1.5 px halo of the land colour. New `lineLayers()` returns the halo and the line. `lineLayer()` still returns the line alone and is deprecated. `areaLayers()` now returns three layers: fill, edge halo, edge.
- Points are 10 px from city zoom (were 8 px at street zoom). Lines are 3 px from city zoom (were 2.5 px at street zoom).
- Tests: every navigable road is at least 3:1 at every zoom and no brighter than the blue up to city zoom; the halo is checked.
- Fixed: installing from GitHub gave a package without `dist/`, so every import failed. `dist/` was meant to be committed but was gitignored; it is committed now, and CI fails if it falls behind `src/`.

## 0.1.0

First version.

- `obsidianMapStyle()`: Protomaps' dark style with the Obsidian corrections.
  - Road ink rises with zoom.
  - Opacity is folded into colour, so the rendered value is the measured one.
  - Large areas, buildings included, get a subtle fill and a 3:1 edge.
  - Country borders are visible, labels readable, and the sea is unfilled.
  - Coloured POI icons appear only from zoom 15, so below street level the data is the only colour on the map.
- An optional planet overview underneath, handing lines and labels off to the detailed tiles at zoom 7.
- `pointLayer`, `lineLayer`, `areaLayers` and `OVERLAY` for data on top, in the Obsidian theme's chart colours.
- Obsidian Sans label glyphs: Inter composited over Noto Sans, covering Latin Extended, Vietnamese, Cyrillic and Greek, with every other script falling back to Noto.
- A demo on Madrid, Milan and Mexico City extracts, with a planet overview underneath.
