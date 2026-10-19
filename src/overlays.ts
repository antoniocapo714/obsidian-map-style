import type {FilterSpecification, LayerSpecification} from 'maplibre-gl';

/**
 * Colours and layer recipes for data drawn on top of the basemap.
 *
 * The basemap is near-neutral; data is saturated. That is the whole separation
 * — so overlays use these hues, never greys, and every one reaches 3:1 on the
 * land. They are the Obsidian theme's categorical chart colours, in the same
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

/** The ring around a point: the land colour, so dots stay legible where they overlap. */
export const RING = '#0F1113';

type Base = {id: string; source: string; sourceLayer?: string; filter?: FilterSpecification};
const src = ({source, sourceLayer}: Base) => ({source, ...(sourceLayer ? {'source-layer': sourceLayer} : {})});

/** Points: 8px at street zoom, ringed in the land colour. */
export function pointLayer(base: Base & {color: string}): LayerSpecification {
  return {
    id: base.id,
    type: 'circle',
    ...src(base),
    ...(base.filter ? {filter: base.filter} : {}),
    paint: {
      'circle-color': base.color,
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2.5, 14, 4],
      'circle-stroke-color': RING,
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 14, 2],
    },
  } as LayerSpecification;
}

/** Lines: 2px at street zoom, full opacity — opacity is part of the colour. */
export function lineLayer(base: Base & {color: string; dashed?: boolean}): LayerSpecification {
  return {
    id: base.id,
    type: 'line',
    ...src(base),
    ...(base.filter ? {filter: base.filter} : {}),
    layout: {'line-cap': 'round', 'line-join': 'round'},
    paint: {
      'line-color': base.color,
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 14, 2.5],
      ...(base.dashed ? {'line-dasharray': [2, 1.5]} : {}),
    },
  } as LayerSpecification;
}

/**
 * Areas: a fill and an edge, because fill weight goes down as an object gets
 * bigger. A region-sized fill at full strength buries the map under it; the
 * edge carries the 3:1 instead. `size` picks the fill weight.
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
    {
      id: `${base.id}-edge`,
      type: 'line',
      ...src(base),
      ...(base.filter ? {filter: base.filter} : {}),
      paint: {'line-color': base.color, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 14, 2]},
    } as LayerSpecification,
  ];
}
