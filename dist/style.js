import { layers, namedFlavor } from '@protomaps/basemaps';
import { FLAVOR } from './palette.js';
import { foldOpacity, withFillEdges, withQuietIcons, withReadableLabels, withVisibleBorders, withZoomAwareInk } from './transforms.js';
/** Credit owed whenever the basemap is on screen. */
export const ATTRIBUTION = '<a href="https://protomaps.com">Protomaps</a> · <a href="https://openstreetmap.org/copyright">© OpenStreetMap contributors</a>';
const toPmtiles = (url) => (url.endsWith('.pmtiles') && !url.startsWith('pmtiles://') ? `pmtiles://${url}` : url);
/** MapLibre 5 rejects a relative sprite URL, so assets are resolved before they are used. */
function absolute(url) {
    const base = typeof location !== 'undefined' ? location.href : 'http://localhost/';
    return new URL(url.endsWith('/') ? url : `${url}/`, base).href.replace(/\/$/, '');
}
function obsidianLayers(source, lang, hideRailways) {
    const flavor = { ...namedFlavor('dark'), ...FLAVOR };
    return withFillEdges(withVisibleBorders(foldOpacity(withZoomAwareInk(withQuietIcons(withReadableLabels(layers(source, flavor, { lang }))), { hideRailways }))));
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
function worldUnderlay(lang) {
    return obsidianLayers('world', lang, false)
        .filter((l) => UNDERLAY_FILLS.has(l.id) || HANDED_OFF.has(l.id))
        .map((l) => ({ ...l, id: `${l.id}__world`, ...(UNDERLAY_FILLS.has(l.id) ? {} : { maxzoom: HAND_OFF }) }));
}
/**
 * The Obsidian basemap as a MapLibre style.
 *
 * Draw your data between the basemap and its labels — insert your layers
 * before `firstLabelLayer(style)` — so place names stay readable on top.
 */
export function obsidianMapStyle({ tiles, worldTiles, assets, lang = 'en', hideRailways = false }) {
    const base = absolute(assets);
    const all = obsidianLayers('protomaps', lang, hideRailways);
    const underlay = worldTiles ? worldUnderlay(lang) : [];
    const detail = underlay.length
        ? all.map((l) => (HANDED_OFF.has(l.id) ? { ...l, minzoom: Math.max(l.minzoom ?? 0, HAND_OFF) } : l))
        : all;
    const isSymbol = (l) => l.type === 'symbol';
    const isBackground = (l) => l.type === 'background';
    return {
        version: 8,
        glyphs: `${base}/fonts/{fontstack}/{range}.pbf`,
        sprite: `${base}/sprites/dark`,
        sources: {
            protomaps: { type: 'vector', url: toPmtiles(tiles), attribution: ATTRIBUTION },
            ...(worldTiles ? { world: { type: 'vector', url: toPmtiles(worldTiles), attribution: ATTRIBUTION } } : {}),
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
export function firstLabelLayer(style) {
    return style.layers.find((l) => l.type === 'symbol')?.id;
}
