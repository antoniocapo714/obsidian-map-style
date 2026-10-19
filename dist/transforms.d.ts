import type { StyleSpecification } from 'maplibre-gl';
type Layers = StyleSpecification['layers'];
/**
 * Composite any line or fill opacity below 1 into the colour, and set the
 * opacity to 1. Protomaps ships buildings and railways at 0.5 alpha, which
 * halves their contrast on screen: a value measured on the hex is not the value
 * a reader sees. Folding the alpha makes the two the same. Walks the whole
 * paint value, because by now the colour is usually a zoom interpolation.
 */
export declare function foldOpacity(layers: Layers): Layers;
/** Adds an `${id}_edge` outline after each large-area fill in EDGED_FILLS. */
export declare function withFillEdges(layers: Layers): Layers;
/** Country borders at 0.9–2.4px instead of 0.7: which side of a border you are on is context worth seeing. */
export declare function withVisibleBorders(layers: Layers): Layers;
/**
 * The zooms between which the basemap's ink rises from survey to street.
 *
 * Up to city zoom the map is the ground under the data: roads stay at survey
 * ink, darker than the overlay colours they would otherwise outshine. From
 * there to street zoom the map becomes the thing being read, and the ink rises
 * with it. The ramp used to run from 8 to 13, so at city zoom — where a
 * district, a route and its points are usually looked at — every avenue was
 * already brighter than the blue on top of it.
 */
export declare const INK_RAMP: readonly [13, 15];
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
export declare function withZoomAwareInk(layers: Layers, { hideRailways }?: {
    hideRailways?: boolean | undefined;
}): Layers;
/**
 * Wider, darker halos so a label reads over data as well as over the map, and
 * an ink per kind of label from LABEL_INK — every one 4.5:1 or more against
 * the halo. Place names step up to near-primary text; POI labels lose the
 * saturated colours Protomaps gives them, because that colour belongs to the
 * data.
 */
export declare function withReadableLabels(layers: Layers): Layers;
/** The zoom from which POI icons appear. */
export declare const ICONS_FROM = 15;
/**
 * POI icons only at street zoom. Protomaps' sprite is coloured — pink stars,
 * green parks, blue stations — and at city zoom those icons were the only
 * colour on the basemap, competing with the data the style exists to carry.
 * The labels stay: they orient. Below ICONS_FROM the icon is simply empty.
 */
export declare function withQuietIcons(layers: Layers): Layers;
export {};
