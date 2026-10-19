import type { FilterSpecification, LayerSpecification } from 'maplibre-gl';
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
export declare const OVERLAY: {
    readonly blue: "#0A72E2";
    readonly orange: "#E36A00";
    readonly purple: "#6D25FF";
    readonly green: "#0E9920";
    readonly pink: "#B32C8B";
    readonly cyan: "#0D9CE0";
    readonly red: "#FE2A4B";
    readonly teal: "#07A4A4";
};
/** Use in this order. Neighbours stay distinguishable for colour-blind readers. */
export declare const OVERLAY_ORDER: ("#0A72E2" | "#E36A00" | "#6D25FF" | "#0E9920" | "#B32C8B" | "#0D9CE0" | "#FE2A4B" | "#07A4A4")[];
/** The halo around every mark: the land colour, so data cuts through the map and dots stay legible where they overlap. */
export declare const RING = "#0F1113";
type Base = {
    id: string;
    source: string;
    sourceLayer?: string;
    filter?: FilterSpecification;
};
/** Points: 10px from city zoom, ringed in the land colour. */
export declare function pointLayer(base: Base & {
    color: string;
}): LayerSpecification;
/**
 * Lines: a halo in the land colour, then the line, 3px from city zoom at full
 * opacity — opacity is part of the colour. Add both, in order.
 */
export declare function lineLayers(base: Base & {
    color: string;
    dashed?: boolean;
}): LayerSpecification[];
/**
 * The line alone, without its halo.
 * @deprecated Use `lineLayers`: without the halo, a line is lost where it crosses a bright road.
 */
export declare function lineLayer(base: Base & {
    color: string;
    dashed?: boolean;
}): LayerSpecification;
/**
 * Areas: a fill and an edge, because fill weight goes down as an object gets
 * bigger. A region-sized fill at full strength buries the map under it; the
 * edge carries the 3:1 instead, on a halo like a line's. `size` picks the fill
 * weight.
 */
export declare function areaLayers(base: Base & {
    color: string;
    size?: 'region' | 'parcel';
}): LayerSpecification[];
export {};
