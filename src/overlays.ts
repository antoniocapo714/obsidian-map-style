import type {FilterSpecification, LayerSpecification} from 'maplibre-gl';

/**
 * Colours and layer recipes for data drawn on top of the basemap.
 *
 * Data is separated from the map twice. By colour: the basemap is near-neutral
 * and data is saturated, so overlays use these hues, never greys, and every one
 * reaches 3:1 on the land. And by a halo: every mark carries a rim of the land
 * colour, so where a line crosses a bright avenue there is a dark edge between
 * them. Colour alone was not enough — a 2px purple line is darker than the
 * street it crosses, and the eye reads brightness before hue.
 *
 * The colours are the Obsidian theme's categorical chart colours, in the same
 * order, so a chart and a map in one product agree on what "series 1" is.
 */
export const OVERLAY = {
  blue: '#0A72E2',
  orange: '#E36A00',
  purple: '#6D25FF',
  green: '#0E9920',
  pink: '#B32C8B',
  cyan: '#0D9CE0',
  red: '#FE2A4B',
  teal: '#07A4A4',
} as const;

/** Use in this order. Neighbours stay distinguishable for colour-blind readers. */
export const OVERLAY_ORDER = Object.values(OVERLAY);

/** The halo around every mark: the land colour, so data cuts through the map and dots stay legible where they overlap. */
export const RING = '#0F1113';

type Base = {id: string; source: string; sourceLayer?: string; filter?: FilterSpecification};
const src = ({source, sourceLayer}: Base) => ({source, ...(sourceLayer ? {'source-layer': sourceLayer} : {})});

/** Line widths for data: 1.5px at country zoom to 3px at city zoom and closer. */
const LINE_WIDTH = ['interpolate', ['linear'], ['zoom'], 6, 1.5, 13, 3];
/** The halo under a line: 1.5px of land colour each side. */
const HALO_WIDTH = ['interpolate', ['linear'], ['zoom'], 6, 4.5, 13, 6];

/** Points: 10px from city zoom, ringed in the land colour. */
export function pointLayer(base: Base & {color: string}): LayerSpecification {
  return {
    id: base.id,
    type: 'circle',
    ...src(base),
    ...(base.filter ? {filter: base.filter} : {}),
    paint: {
      'circle-color': base.color,
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3, 13, 5],
      'circle-stroke-color': RING,
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 13, 2],
    },
  } as LayerSpecification;
}

/**
 * Lines: a halo in the land colour, then the line, 3px from city zoom at full
 * opacity — opacity is part of the colour. Add both, in order.
 */
export function lineLayers(base: Base & {color: string; dashed?: boolean}): LayerSpecification[] {
  const shared = {...src(base), ...(base.filter ? {filter: base.filter} : {}), layout: {'line-cap': 'round', 'line-join': 'round'}};
  return [
    {id: `${base.id}-halo`, type: 'line', ...shared, paint: {'line-color': RING, 'line-width': HALO_WIDTH}} as LayerSpecification,
    {
      id: base.id,
      type: 'line',
      ...shared,
      paint: {'line-color': base.color, 'line-width': LINE_WIDTH, ...(base.dashed ? {'line-dasharray': [2, 1.5]} : {})},
    } as LayerSpecification,
  ];
}

/**
 * The line alone, without its halo.
 * @deprecated Use `lineLayers`: without the halo, a line is lost where it crosses a bright road.
 */
export function lineLayer(base: Base & {color: string; dashed?: boolean}): LayerSpecification {
  return lineLayers(base)[1];
}

/**
 * Areas: a fill and an edge, because fill weight goes down as an object gets
 * bigger. A region-sized fill at full strength buries the map under it; the
 * edge carries the 3:1 instead, on a halo like a line's. `size` picks the fill
 * weight.
 */
export function areaLayers(base: Base & {color: string; size?: 'region' | 'parcel'}): LayerSpecification[] {
  const opacity = base.size === 'parcel' ? 0.32 : 0.12;
  return [
    {
      id: `${base.id}-fill`,
      type: 'fill',
      ...src(base),
      ...(base.filter ? {filter: base.filter} : {}),
      paint: {'fill-color': base.color, 'fill-opacity': opacity},
    } as LayerSpecification,
    ...lineLayers({...base, id: `${base.id}-edge`}),
  ];
}
