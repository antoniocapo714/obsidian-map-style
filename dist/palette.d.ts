import type { Flavor } from '@protomaps/basemaps';
/**
 * The basemap's colours. A MapLibre style is JSON evaluated on a worker, so it
 * cannot read CSS custom properties; these mirror the Obsidian theme's tokens
 * by value, and test/legibility.test.ts measures every one.
 *
 * The rule behind them: the basemap is near-neutral and the data on top is
 * saturated. A large coloured overlay dominates a 1px grey line whatever the
 * line's own contrast, because dominance is area and chroma, not luminance —
 * so the basemap can keep ordinary dark-map contrast for legibility and still
 * recede, as long as it never spends colour.
 */
export declare const LAND = "#0F1113";
export declare const FLAVOR: Partial<Flavor>;
/**
 * Ink that rises with zoom: [survey colour up to city zoom, street colour at
 * street zoom] — the zooms are INK_RAMP, 13 and 15.
 *
 * Up to city zoom the basemap shares the screen with data and stays a step
 * lower; at street zoom the overlays are usually gone or thin, and the roads
 * are what a reader navigates by. Measured against the land, the navigable
 * classes run 3.4–4.0:1 up to city zoom and 4.3–7.4:1 at street zoom.
 *
 * Two things keep them behind the data. They are grey: every one stays under
 * 0.28 saturation, every overlay above 0.42. And up to city zoom none is
 * brighter than the first overlay colour (blue, luminance 0.176) — minor 0.137,
 * major 0.155, highway 0.173 — because the eye reads brightness before hue, and
 * at 5.2:1 the highways were the brightest thing on a map of data.
 *
 * Keys are layer-id prefixes, matched longest first (`water` is a prefix of
 * `water_stream`).
 */
export declare const ZOOM_INK: Record<string, [string, string]>;
/**
 * Large areas keep a subtle fill and get an outline that carries the contrast.
 * Fill weight goes down as an object gets bigger: an airport filled at 3:1 is
 * the brightest thing on screen at street zoom, while its edge at 3:1 tells
 * you where it is without shouting.
 */
export declare const EDGED_FILLS: Record<string, string>;
/** Populated-place labels step up to near-primary text; POIs lose their colour. */
export declare const LABEL_INK: {
    place: string;
    placeHalo: string;
    poi: string;
    poiHalo: string;
};
