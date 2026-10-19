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
  runway: '#686C73',
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
  tunnel_other: '#3C4046',
  tunnel_minor: '#3C4046',
  tunnel_link: '#3C4046',
  tunnel_major: '#50545B',
  tunnel_highway: '#5E6269',
  minor_service_casing: '#0A0C0E',
  minor_casing: '#0A0C0E',
  link_casing: '#0A0C0E',
  major_casing_late: '#0A0C0E',
  highway_casing_late: '#0A0C0E',
  major_casing_early: '#0A0C0E',
  highway_casing_early: '#0A0C0E',

  // Survey-zoom road inks; ZOOM_INK lifts them toward street zoom.
  other: '#5C6067',
  minor_service: '#5C6067',
  minor_a: '#64686F',
  minor_b: '#64686F',
  link: '#64686F',
  major: '#73787F',
  highway: '#82878E',
  railway: '#7F848B',
  boundaries: '#73787F',

  // Labels: readable, never bright. Full brightness is left to the data.
  ocean_label: '#3A3F47',
  subplace_label: '#62666D',
  subplace_label_halo: '#08090A',
  roads_label_minor: '#4B5056',
  roads_label_minor_halo: '#08090A',
  roads_label_major: '#62666D',
  roads_label_major_halo: '#08090A',
  buildings: '#5C6067',
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
export const ZOOM_INK: Record<string, [string, string]> = {
  roads_other: ['#5C6067', '#73787F'],
  roads_minor: ['#64686F', '#7C8188'],
  roads_link: ['#64686F', '#7C8188'],
  roads_major: ['#73787F', '#8D9299'],
  roads_highway: ['#82878E', '#9EA3AA'],
  roads_rail: ['#7F848B', '#92979E'],
  roads_runway: ['#686C73', '#7F838A'],
  roads_taxiway: ['#686C73', '#7F838A'],
  // Buildings are context, and in a dense centre they ARE the block. Filled at
  // 3:1 they turned a city into a grey slab that buried the data; at 4.25:1
  // the streets became black gaps in it. So up to city zoom they all but merge
  // with the land (1.2:1) and leave the ground to the data; toward street zoom
  // the fill rises to 1.7:1 and the footprint's edge, at 4.0:1 from zoom 14,
  // draws each building (EDGED_FILLS). Visible where you read a street, quiet
  // where you read the data.
  buildings: ['#202226', '#373A40'],
  water: ['#58666D', '#6E7C83'],
  water_stream: ['#616D75', '#76828B'],
  water_river: ['#616D75', '#76828B'],
  landuse_industrial: ['#3B3733', '#4B453F'],
  landuse_aerodrome: ['#2E3136', '#393D43'],
  landuse_runway: ['#686C73', '#7F838A'],
};

/**
 * Large areas keep a subtle fill and get an outline that carries the contrast.
 * Fill weight goes down as an object gets bigger: an airport filled at 3:1 is
 * the brightest thing on screen at street zoom, while its edge at 3:1 tells
 * you where it is without shouting.
 */
export const EDGED_FILLS: Record<string, string> = {
  landuse_aerodrome: '#60646B',
  landuse_industrial: '#6D6761',
  buildings: '#70747B',
  // The coastline: the sea has no fill, so this line is what shows where the
  // land stops.
  water: '#57636B',
};

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
export const LABEL_INK = {
  /** Every label's halo. */
  halo: 'rgba(8, 9, 10, 0.9)',
  /** Cities, regions, countries: 16.5:1. */
  place: '#E8EAED',
  /** Points of interest, major roads and road shields: 7.6:1. */
  poi: '#9AA0AA',
  roadMajor: '#9AA0AA',
  /** Minor roads, islands, addresses: 6.1:1. */
  road: '#8A8F98',
  other: '#8A8F98',
  /** Seas, lakes, rivers: a grey with a little water in it, 6.5:1. */
  water: '#8496A3',
};
