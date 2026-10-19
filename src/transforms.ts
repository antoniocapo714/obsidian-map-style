import type {StyleSpecification} from 'maplibre-gl';
import {EDGED_FILLS, LABEL_INK, LAND, ZOOM_INK} from './palette.js';

type Layers = StyleSpecification['layers'];
type Layer = Layers[number];
type Paint = Record<string, unknown>;

/** One step darker on the same near-neutral hue (tunnels sit a class down). */
function dim(hex: string): string {
  const rgb = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.82));
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Composite any line or fill opacity below 1 into the colour, and set the
 * opacity to 1. Protomaps ships buildings and railways at 0.5 alpha, which
 * halves their contrast on screen: a value measured on the hex is not the value
 * a reader sees. Folding the alpha makes the two the same. Walks the whole
 * paint value, because by now the colour is usually a zoom interpolation.
 */
export function foldOpacity(layers: Layers): Layers {
  const land = [1, 3, 5].map((i) => parseInt(LAND.slice(i, i + 2), 16));
  const blend = (hex: string, alpha: number) =>
    '#' +
    [1, 3, 5]
      .map((i, n) =>
        Math.round(parseInt(hex.slice(i, i + 2), 16) * alpha + land[n] * (1 - alpha))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase();
  const fold = (node: unknown, alpha: number): unknown => {
    if (typeof node === 'string') return /^#[0-9A-Fa-f]{6}$/.test(node) ? blend(node, alpha) : node;
    if (Array.isArray(node)) return node.map((n) => fold(n, alpha));
    return node;
  };
  return layers.map((l) => {
    const paint = {...(l.paint ?? {})} as Paint;
    const key = l.type === 'line' ? 'line-opacity' : l.type === 'fill' ? 'fill-opacity' : null;
    if (!key) return l;
    const alpha = paint[key];
    if (typeof alpha !== 'number' || alpha >= 1) return l;
    const colourKey = l.type === 'line' ? 'line-color' : 'fill-color';
    if (!(colourKey in paint)) return l;
    paint[colourKey] = fold(paint[colourKey], alpha);
    paint[key] = 1;
    return {...l, paint} as Layer;
  });
}

/** Adds an `${id}_edge` outline after each large-area fill in EDGED_FILLS. */
export function withFillEdges(layers: Layers): Layers {
  const out: Layers = [];
  for (const l of layers) {
    out.push(l);
    const edge = EDGED_FILLS[l.id];
    if (!edge || l.type !== 'fill') continue;
    out.push({
      id: `${l.id}_edge`,
      type: 'line',
      source: (l as {source: string}).source,
      'source-layer': (l as {'source-layer'?: string})['source-layer'],
      filter: (l as {filter?: unknown}).filter,
      minzoom: l.id === 'buildings' ? 14 : 9,
      paint: {
        'line-color': edge,
        // Footprints are small and many: a hairline, not a stroke.
        'line-width': l.id === 'buildings'
          ? ['interpolate', ['linear'], ['zoom'], 14, 0.4, 17, 1]
          : ['interpolate', ['linear'], ['zoom'], 9, 0.6, 14, 1.4],
      },
    } as Layer);
  }
  return out;
}

/** Country borders at 0.9–2.4px instead of 0.7: which side of a border you are on is context worth seeing. */
export function withVisibleBorders(layers: Layers): Layers {
  return layers.map((l) => {
    if (!l.id.startsWith('boundaries')) return l;
    const country = l.id === 'boundaries_country';
    const paint = {...(l.paint ?? {})} as Paint;
    paint['line-width'] = ['interpolate', ['linear'], ['zoom'], 4, country ? 0.9 : 0.5, 13, country ? 2.4 : 1.2];
    return {...l, paint} as Layer;
  });
}

/**
 * Applies ZOOM_INK, and keeps the sea unfilled while inland water is lifted.
 *
 * - Casings and labels are left alone: brightening a casing turns it into a
 *   second road.
 * - Bridges and tunnels are the same road classes under other ids; they get the
 *   same ink (tunnels one step down), or a road changes colour on a bridge.
 * - The sea takes the land colour. Lakes, rivers and reservoirs are small
 *   objects and keep a visible fill; the ocean is a large area with nothing to
 *   say, and the coastline edge already shows where the land stops.
 * - The `case` sits inside each interpolation stop: MapLibre requires zoom
 *   expressions at the top level, and a zoom interpolation nested in a `case`
 *   fails validation silently — the style never loads.
 */
export function withZoomAwareInk(layers: Layers, {hideRailways = false} = {}): Layers {
  const keys = Object.keys(ZOOM_INK).sort((a, b) => b.length - a.length);
  return layers.map((l) => {
    if (hideRailways && l.id === 'roads_rail') {
      return {...l, layout: {...(l.layout ?? {}), visibility: 'none'}} as Layer;
    }
    if (l.id.includes('casing') || l.id.includes('label')) return l;
    const isTunnel = l.id.includes('tunnels_');
    const normalised = l.id.replace('bridges_', '').replace('tunnels_', '');
    const key = keys.find((k) => normalised.startsWith(k));
    if (!key) return l;
    const prop = l.type === 'line' ? 'line-color' : l.type === 'fill' ? 'fill-color' : null;
    if (!prop) return l;
    const [survey, street] = ZOOM_INK[key];
    const [a, b] = isTunnel ? [dim(survey), dim(street)] : [survey, street];
    const water = (colour: string) => ['case', ['==', ['get', 'kind'], 'ocean'], LAND, colour];
    const paint = {...(l.paint ?? {})} as Paint;
    paint[prop] =
      l.id === 'water'
        ? ['interpolate', ['linear'], ['zoom'], 8, water(a), 13, water(b)]
        : ['interpolate', ['linear'], ['zoom'], 8, a, 13, b];
    // Colour and alpha together, so the measured value is the rendered one.
    paint[l.type === 'line' ? 'line-opacity' : 'fill-opacity'] = 1;
    return {...l, paint} as Layer;
  });
}

/**
 * Wider, darker halos so a label reads over data as well as over the map;
 * place names step up to near-primary text, and POI labels lose the saturated
 * colours Protomaps gives them — that colour belongs to the data.
 */
export function withReadableLabels(layers: Layers): Layers {
  return layers.map((l) => {
    if (l.type !== 'symbol') return l;
    const paint = {...(l.paint ?? {})} as Paint;
    if (!('text-halo-color' in paint) && !('text-color' in paint)) return l;
    paint['text-halo-width'] = 1.8;
    paint['text-halo-blur'] = 0.4;
    const sourceLayer = (l as {'source-layer'?: string})['source-layer'];
    if (sourceLayer === 'places') {
      paint['text-color'] = LABEL_INK.place;
      paint['text-halo-color'] = LABEL_INK.placeHalo;
    }
    if (sourceLayer === 'pois') {
      paint['text-color'] = LABEL_INK.poi;
      paint['text-halo-color'] = LABEL_INK.poiHalo;
    }
    return {...l, paint} as Layer;
  });
}
