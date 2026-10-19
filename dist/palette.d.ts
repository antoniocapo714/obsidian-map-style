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
 * are what a reader navigates by. Measured against the land, each class has a
 * floor it holds at every zoom — other 2.9:1, minor 3.3:1, major 4.2:1,
 * highway 5.1:1 — and the highway reaches 7.4:1 at street zoom. A map has to be
 * readable before it can recede.
 *
 * What keeps the roads behind the data is not dimness. They are grey — every
 * one stays under 0.28 saturation, every overlay above 0.42 — and every data
 * mark sits on a halo of the land colour (see overlays.ts), so where a route
 * crosses an avenue there is a dark edge between them.
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
/**
 * Label ink. Every label is text, so every one reaches 4.5:1 against its halo
 * (WCAG 1.4.3) — the halo is the ground a label actually sits on, whether the
 * map under it is land, a bright road or water. Places step up to near-primary
 * text; the rest stay at secondary ink, readable and never bright.
 *
 * Protomaps' own values failed this: street names were #4B5056 on a black halo
 * (2.4:1) drawn across a light grey road, which turned the name into dark
 * smudges, and water names were #3A3F47 on a halo of the water colour (1.1:1).
 */
export declare const LABEL_INK: {
    /** Every label's halo. */
    halo: string;
    /** Cities, regions, countries: 16.5:1. */
    place: string;
    /** Points of interest, major roads and road shields: 7.6:1. */
    poi: string;
    roadMajor: string;
    /** Minor roads, islands, addresses: 6.1:1. */
    road: string;
    other: string;
    /** Seas, lakes, rivers: a grey with a little water in it, 6.5:1. */
    water: string;
};
