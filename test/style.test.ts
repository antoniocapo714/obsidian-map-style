import {readFileSync, readdirSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {EDGED_FILLS, LAND, OVERLAY, ZOOM_INK, obsidianMapStyle} from '../src';

/**
 * The style's contract, measured rather than eyeballed:
 *  - every road class a reader navigates by is visible on the land at street
 *    zoom (≥ 3:1), steps down at survey zoom, and stays grey — the data is
 *    separated from the basemap by colour, not by brightness;
 *  - no line or fill ships with opacity below 1 — the rendered colour is the
 *    measured colour;
 *  - overlay colours reach 3:1 on the land and carry chroma, so data never
 *    reads as part of the basemap;
 *  - with a world underlay, each line and label has exactly one owner per zoom.
 */
const style = obsidianMapStyle({tiles: 'https://example.com/a.pmtiles', worldTiles: 'https://example.com/w.pmtiles', assets: 'https://example.com/assets'});

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h: string) => {
  const [r, g, b] = hex(h).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const saturation = (h: string) => {
  const [r, g, b] = hex(h).map((c) => c / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
};

describe('roads and buildings', () => {
  const navigation = ['roads_minor', 'roads_major', 'roads_highway', 'roads_rail'];
  for (const key of navigation) {
    const [survey, street] = ZOOM_INK[key];
    it(`${key} is visible at street zoom`, () => expect(contrast(street, LAND)).toBeGreaterThanOrEqual(3));
    it(`${key} steps down at survey zoom`, () => expect(contrast(survey, LAND)).toBeLessThan(contrast(street, LAND)));
    it(`${key} is near-neutral, leaving colour to the data`, () => expect(saturation(street)).toBeLessThan(0.28));
  }
  it('buildings are a subtle area: the block never outshines the streets', () => {
    expect(contrast(ZOOM_INK.buildings[1], LAND)).toBeLessThan(1.6);
    expect(contrast(ZOOM_INK.buildings[1], LAND)).toBeLessThan(contrast(ZOOM_INK.roads_minor[1], LAND));
  });
  it('large areas carry their contrast on the edge', () => {
    for (const [id, edge] of Object.entries(EDGED_FILLS)) expect(contrast(edge, LAND), id).toBeGreaterThanOrEqual(3);
  });
});

describe('colour is reserved for data', () => {
  it('the basemap shows no coloured POI icons below street zoom', () => {
    const pois = style.layers.find((l) => l.id === 'pois') as {layout: Record<string, unknown>};
    const icon = pois.layout['icon-image'] as unknown[];
    expect(icon.slice(0, 4)).toEqual(['step', ['zoom'], '', 15]);
  });
});

describe('opacity is part of the colour', () => {
  it('no line or fill ships below full opacity, except the sample-free ones Protomaps leaves alone', () => {
    const partial = style.layers.filter((l) => {
      const paint = (l as {paint?: Record<string, unknown>}).paint ?? {};
      const a = paint['line-opacity'] ?? paint['fill-opacity'];
      return typeof a === 'number' && a < 1 && /^(roads|buildings|water|landuse)/.test(l.id);
    });
    expect(partial.map((l) => l.id)).toEqual([]);
  });
});

describe('overlays', () => {
  for (const [name, c] of Object.entries(OVERLAY)) {
    it(`${name} reaches 3:1 on the land and reads as a colour`, () => {
      expect(contrast(c, LAND)).toBeGreaterThanOrEqual(3);
      expect(saturation(c)).toBeGreaterThanOrEqual(0.42);
    });
  }
});

describe('the world underlay', () => {
  const world = style.layers.filter((l) => l.id.endsWith('__world'));
  it('exists and draws no roads, buildings or POIs', () => {
    expect(world.length).toBeGreaterThan(0);
    expect(world.filter((l) => /^(roads|buildings|pois|landuse)/.test(l.id))).toEqual([]);
  });
  it('hands each line and label to the detail at one zoom', () => {
    for (const w of world.filter((l) => l.type !== 'fill')) {
      const detail = style.layers.find((l) => l.id === w.id.replace(/__world$/, ''))!;
      expect(detail.minzoom ?? 0, w.id).toBeGreaterThanOrEqual(w.maxzoom!);
    }
  });
  it('sits under the detail: the background first, world labels before detail labels', () => {
    expect(style.layers[0].type).toBe('background');
    const ids = style.layers.map((l) => l.id);
    const firstWorldLabel = ids.findIndex((id) => id.startsWith('places_') && id.endsWith('__world'));
    const firstDetailLabel = ids.findIndex((id) => id.startsWith('places_') && !id.endsWith('__world'));
    expect(firstWorldLabel).toBeLessThan(firstDetailLabel);
  });
});

describe('assets', () => {
  it('resolves the sprite to an absolute URL, which MapLibre 5 requires', () => {
    expect(style.sprite).toBe('https://example.com/assets/sprites/dark');
  });
  it('every font the style asks for exists', () => {
    // text-font can be an expression; collect every font name inside it.
    const names = (node: unknown): string[] =>
      typeof node === 'string' ? (/Sans/.test(node) ? [node] : []) : Array.isArray(node) ? node.flatMap(names) : [];
    const stacks = new Set(style.layers.flatMap((l) => names((l as {layout?: {'text-font'?: unknown}}).layout?.['text-font'])));
    expect(stacks.size).toBeGreaterThan(0);
    const built = readdirSync('assets/fonts', {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name);
    for (const s of stacks) expect(built, s).toContain(s);
  });
});

/** Glyph ids in a MapLibre glyph PBF (fontstacks=1 → glyphs=3 → id=1). */
function glyphIds(file: string): Set<number> {
  const buf = readFileSync(file);
  const ids = new Set<number>();
  const varint = (b: Buffer, p: {i: number}) => {
    let v = 0, s = 0, byte;
    do {
      byte = b[p.i++];
      v += (byte & 0x7f) * 2 ** s;
      s += 7;
    } while (byte & 0x80);
    return v;
  };
  const walk = (b: Buffer, depth: number) => {
    const p = {i: 0};
    while (p.i < b.length) {
      const key = varint(b, p), field = key >> 3, wire = key & 7;
      if (wire === 0) {
        const v = varint(b, p);
        if (depth === 2 && field === 1) ids.add(v);
      } else if (wire === 2) {
        const len = varint(b, p), sub = b.subarray(p.i, p.i + len);
        p.i += len;
        if ((depth === 0 && field === 1) || (depth === 1 && field === 3)) walk(sub, depth + 1);
      } else if (wire === 5) p.i += 4;
      else if (wire === 1) p.i += 8;
    }
  };
  walk(buf, 0);
  return ids;
}

describe('labels in every script the extracts use', () => {
  const has = (face: string, ch: string) => {
    const cp = ch.codePointAt(0)!;
    const start = Math.floor(cp / 256) * 256;
    return glyphIds(`assets/fonts/Obsidian Sans ${face}/${start}-${start + 255}.pbf`).has(cp);
  };
  for (const word of ['Łódź', 'Kraków', 'Nam Định', 'Hải Phòng', 'Калининград', 'Αθήνα', 'São Paulo']) {
    it(`renders "${word}" in full`, () => {
      for (const face of ['Regular', 'Medium', 'Italic']) {
        for (const ch of word.replace(/\s/g, '')) expect(has(face, ch), `${face} ${ch}`).toBe(true);
      }
    });
  }
});
