# Changelog

## 0.1.0

First version.

- `obsidianMapStyle()`: Protomaps' dark style with the Obsidian corrections.
  - Road ink rises with zoom.
  - Opacity is folded into colour, so the rendered value is the measured one.
  - Large areas, buildings included, get a subtle fill and a 3:1 edge.
  - Country borders are visible, labels readable, and the sea is unfilled.
- An optional planet overview underneath, handing lines and labels off to the detailed tiles at zoom 7.
- `pointLayer`, `lineLayer`, `areaLayers` and `OVERLAY` for data on top, in the Obsidian theme's chart colours.
- Obsidian Sans label glyphs: Inter composited over Noto Sans, covering Latin Extended, Vietnamese, Cyrillic and Greek, with every other script falling back to Noto.
- A demo on Madrid, Milan and Mexico City extracts, with a planet overview underneath.
