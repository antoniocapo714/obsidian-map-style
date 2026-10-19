import {layers, namedFlavor, type Flavor} from '@protomaps/basemaps';
import type {StyleSpecification} from 'maplibre-gl';
import {FLAVOR} from './palette.js';
import {foldOpacity, withFillEdges, withReadableLabels, withVisibleBorders, withZoomAwareInk} from './transforms.js';

export type ObsidianMapStyleOptions = {
  /**
   * The detailed tiles: a PMTiles archive (`https://…/area.pmtiles`, or with
   * the `pmtiles://` prefix) or a TileJSON URL, in the Protomaps v4 schema.
   * PMTiles needs the protocol registered once — see the README.
   */
  tiles: string;
  /**
   * Optional low-zoom archive of the whole planet, drawn underneath. Where the
   * detailed tiles end — an extract of one city, one country — the map would
   * otherwise stop in a straight black edge.
   */
  worldTiles?: string;
  /** Where `fonts/` and `sprites/` from this package are served. Resolved to an absolute URL. */
  assets: string;
  /** Label language, as Protomaps understands it. Default `en`. */
  lang?: string;
  /** Hide the basemap's own railways, for apps that draw their own. */
  hideRailways?: boolean;
};

/** Credit owed whenever the basemap is on screen. */
export const ATTRIBUTION =
  '<a href="https://protomaps.com">Protomaps</a> · <a href="https://openstreetmap.org/copyright">© OpenStreetMap contributors</a>';

type Layers = StyleSpecification['layers'];

const toPmtiles = (url: string) => (url.endsWith('.pmtiles') && !url.startsWith('pmtiles://') ? `pmtiles://${url}` : url);

/** MapLibre 5 rejects a relative sprite URL, so assets are resolved before they are used. */
function absolute(url: string): string {
  const base = typeof location !== 'undefined' ? location.href : 'http://localhost/';
  return new URL(url.endsWith('/') ? url : `${url}/`, base).href.replace(/\/$/, '');
}

function obsidianLayers(source: string, lang: string, hideRailways: boolean): Layers {
  const flavor = {...namedFlavor('dark'), ...FLAVOR} as Flavor;
  return withFillEdges(
    withVisibleBorders(foldOpacity(withZoomAwareInk(withReadableLabels(layers(source, flavor, {lang})), {hideRailways}))),
  );
}

/*
 * The world underlay may only draw what cannot be duplicated:
 *  - fills at every zoom (earth, landcover, water): opaque and the same colour
 *    as the detail's, so the detail covers them exactly where it exists;
 *  - lines and labels below HAND_OFF, after which the detail takes over. Both
 *    archives come from the same planet build, so below z7 they hold the same
 *    places — drawing both stacks "Berlin" over "Berlin" (MapLibre's collision
 *    does not catch it), and past z6 the world tiles are overzoomed and their
 *    borders drift beside the real ones.
 * Ids keep their prefix (`water__world`), so anything keyed on the prefix still
 * applies to them.
 */
const UNDERLAY_FILLS = new Set(['earth', 'landcover', 'water']);
const HANDED_OFF = new Set(['water_edge', 'boundaries_country', 'boundaries', 'places_country', 'places_region', 'places_locality']);
const HAND_OFF = 7;

function worldUnderlay(lang: string): Layers {
  return obsidianLayers('world', lang, false)
    .filter((l) => UNDERLAY_FILLS.has(l.id) || HANDED_OFF.has(l.id))
    .map((l) => ({...l, id: `${l.id}__world`, ...(UNDERLAY_FILLS.has(l.id) ? {} : {maxzoom: HAND_OFF})})) as Layers;
}

/**
 * The Obsidian basemap as a MapLibre style.
 *
 * Draw your data between the basemap and its labels — insert your layers
 * before `firstLabelLayer(style)` — so place names stay readable on top.
 */
export function obsidianMapStyle({tiles, worldTiles, assets, lang = 'en', hideRailways = false}: ObsidianMapStyleOptions): StyleSpecification {
  const base = absolute(assets);
  const all = obsidianLayers('protomaps', lang, hideRailways);
  const underlay = worldTiles ? worldUnderlay(lang) : [];
  const detail = underlay.length
    ? (all.map((l) => (HANDED_OFF.has(l.id) ? {...l, minzoom: Math.max(l.minzoom ?? 0, HAND_OFF)} : l)) as Layers)
    : all;
  const isSymbol = (l: {type: string}) => l.type === 'symbol';
  const isBackground = (l: {type: string}) => l.type === 'background';
  return {
    version: 8,
    glyphs: `${base}/fonts/{fontstack}/{range}.pbf`,
    sprite: `${base}/sprites/dark`,
    sources: {
      protomaps: {type: 'vector', url: toPmtiles(tiles), attribution: ATTRIBUTION},
      ...(worldTiles ? {world: {type: 'vector' as const, url: toPmtiles(worldTiles), attribution: ATTRIBUTION}} : {}),
    },
    // The detail's background paints the whole viewport, so it goes first or
    // it hides the world underneath.
    layers: [
      ...detail.filter(isBackground),
      ...underlay.filter((l) => !isSymbol(l)),
      ...detail.filter((l) => !isBackground(l) && !isSymbol(l)),
      ...underlay.filter(isSymbol),
      ...detail.filter(isSymbol),
    ],
  };
}

/** The first label layer: insert data layers before it to keep names on top. */
export function firstLabelLayer(style: StyleSpecification): string | undefined {
  return style.layers.find((l) => l.type === 'symbol')?.id;
}
