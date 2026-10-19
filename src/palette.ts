import type {Flavor} from '@protomaps/basemaps';

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
export const LAND = '#0F1113';

export const FLAVOR: Partial<Flavor> = {
  background: '#08090A',
  earth: LAND,
  park_a: '#1C221F',
  park_b: '#1C221F',
  hospital: '#232427',
  industrial: '#3B3733',
  school: '#232427',
  wood_a: '#1A201D',
  wood_b: '#1A201D',
  pedestrian: '#2B2F35',
  scrub_a: '#1E211C',
  scrub_b: '#1E211C',
  glacier: '#2E3237',
  sand: '#2A2822',
  beach: '#2A2822',
  aerodrome: '#2E3136',
  runway: '#666C77',
  water: '#38444C',
  zoo: '#1C221F',
  military: '#1F2124',

  // Casings stay near-black: they are the halo that separates a road from its
  // surroundings, and a bright casing reads as a second road.
  tunnel_other_casing: '#0A0C0E',
  tunnel_minor_casing: '#0A0C0E',
  tunnel_link_casing: '#0A0C0E',
  tunnel_major_casing: '#0A0C0E',
  tunnel_highway_casing: '#0A0C0E',
  tunnel_other: '#3B4048',
  tunnel_minor: '#3B4048',
  tunnel_link: '#3B4048',
  tunnel_major: '#4E545E',
  tunnel_highway: '#5B6270',
  minor_service_casing: '#0A0C0E',
  minor_casing: '#0A0C0E',
  link_casing: '#0A0C0E',
  major_casing_late: '#0A0C0E',
  highway_casing_late: '#0A0C0E',
  major_casing_early: '#0A0C0E',
  highway_casing_early: '#0A0C0E',

  // Survey-zoom road inks; ZOOM_INK lifts them toward street zoom.
  other: '#5A606B',
  minor_service: '#5A606B',
  minor_a: '#616874',
  minor_b: '#616874',
  link: '#616874',
  major: '#707885',
  highway: '#7E8796',
  railway: '#7C8490',
  boundaries: '#707885',

  // Labels: readable, never bright. Full brightness is left to the data.
  ocean_label: '#3A3F47',
  subplace_label: '#62666D',
  subplace_label_halo: '#08090A',
  roads_label_minor: '#4A5058',
  roads_label_minor_halo: '#08090A',
  roads_label_major: '#62666D',
  roads_label_major_halo: '#08090A',
  buildings: '#5A606B',
  pier: '#34383D',
  city_label: '#8A8F98',
  city_label_halo: '#08090A',
  state_label: '#62666D',
  state_label_halo: '#08090A',
  country_label: '#8A8F98',

  // Inter wherever Inter has the glyph, Noto Sans for every other script —
  // composited into one stack by scripts/build-glyphs.mjs.
  regular: 'Obsidian Sans Regular',
  bold: 'Obsidian Sans Medium',
  italic: 'Obsidian Sans Italic',
};

/**
 * Ink that rises with zoom: [survey colour at z8, street colour at z13].
 *
 * At survey zoom the basemap shares the screen with large data overlays and
 * should stay low; at street zoom those overlays are usually gone or thin, and
 * the roads are what a reader navigates by. Measured against the land, roads
 * run about 1.3–2.6:1 at survey zoom and 2–5:1 at street zoom.
 *
 * Keys are layer-id prefixes, matched longest first (`water` is a prefix of
 * `water_stream`).
 */
export const ZOOM_INK: Record<string, [string, string]> = {
  roads_other: ['#5A606B', '#707885'],
  roads_minor: ['#616874', '#78818F'],
  roads_link: ['#616874', '#78818F'],
  roads_major: ['#707885', '#8892A2'],
  roads_highway: ['#7E8796', '#98A3B5'],
  roads_rail: ['#7C8490', '#8E97A4'],
  roads_runway: ['#666C77', '#7C8390'],
  roads_taxiway: ['#666C77', '#7C8390'],
  buildings: ['#5A606B', '#707885'],
  water: ['#506773', '#627E8C'],
  water_stream: ['#5A6E7C', '#6D8394'],
  water_river: ['#5A6E7C', '#6D8394'],
  landuse_industrial: ['#3B3733', '#4B453F'],
  landuse_aerodrome: ['#2E3136', '#393D43'],
  landuse_runway: ['#666C77', '#7C8390'],
};

/**
 * Large areas keep a subtle fill and get an outline that carries the contrast.
 * Fill weight goes down as an object gets bigger: an airport filled at 3:1 is
 * the brightest thing on screen at street zoom, while its edge at 3:1 tells
 * you where it is without shouting.
 */
export const EDGED_FILLS: Record<string, string> = {
  landuse_aerodrome: '#5F646E',
  landuse_industrial: '#6F675F',
  // The coastline: the sea has no fill, so this line is what shows where the
  // land stops.
  water: '#56636C',
};

/** Populated-place labels step up to near-primary text; POIs lose their colour. */
export const LABEL_INK = {
  place: '#E8EAED',
  placeHalo: 'rgba(8, 9, 10, 0.9)',
  poi: '#9AA0AA',
  poiHalo: 'rgba(8, 9, 10, 0.92)',
};
