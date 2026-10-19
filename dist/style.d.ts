import type { StyleSpecification } from 'maplibre-gl';
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
export declare const ATTRIBUTION = "<a href=\"https://protomaps.com\">Protomaps</a> \u00B7 <a href=\"https://openstreetmap.org/copyright\">\u00A9 OpenStreetMap contributors</a>";
/**
 * The Obsidian basemap as a MapLibre style.
 *
 * Draw your data between the basemap and its labels — insert your layers
 * before `firstLabelLayer(style)` — so place names stay readable on top.
 */
export declare function obsidianMapStyle({ tiles, worldTiles, assets, lang, hideRailways }: ObsidianMapStyleOptions): StyleSpecification;
/** The first label layer: insert data layers before it to keep names on top. */
export declare function firstLabelLayer(style: StyleSpecification): string | undefined;
