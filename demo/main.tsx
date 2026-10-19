import {StrictMode, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import maplibregl, {type GeoJSONSourceSpecification} from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import './demo.css';

import {Theme} from '@astryxdesign/core/theme';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {obsidianTheme} from 'astryx-theme-obsidian/themes/obsidian';

import {OVERLAY, areaLayers, firstLabelLayer, lineLayer, obsidianMapStyle, pointLayer} from '../src';

/**
 * The map style on three city extracts, with a planet overview underneath and
 * sample data drawn with the overlay recipes. The panel is built with Astryx
 * and the Obsidian theme, which is what the style was designed beside.
 */
maplibregl.addProtocol('pmtiles', new Protocol().tile);

const BASE = import.meta.env.BASE_URL;
const REPO = 'https://github.com/antoniocapo714/obsidian-map-style';

const CITIES = {
  madrid: {label: 'Madrid', center: [-3.7038, 40.4168] as [number, number]},
  milan: {label: 'Milan', center: [9.19, 45.4642] as [number, number]},
  'mexico-city': {label: 'Mexico City', center: [-99.1332, 19.4326] as [number, number]},
};
type City = keyof typeof CITIES;
/** `?city=milan` opens on that extract; the view itself lives in the URL hash. */
const startCity: City = ((c) => (c && c in CITIES ? (c as City) : 'madrid'))(new URLSearchParams(location.search).get('city'));

const ZOOMS = [
  {label: 'Region', zoom: 9},
  {label: 'City', zoom: 13},
  {label: 'Street', zoom: 15.5},
];

/** Places whose names need more than basic Latin letters, to check the labels. */
const SCRIPTS = [
  {label: 'Poland', center: [19.2, 51.8] as [number, number], zoom: 5.6},
  {label: 'Vietnam', center: [106.0, 20.9] as [number, number], zoom: 6},
];

/** Deterministic sample data around a centre: points, a route and a district. */
function sampleData([lng, lat]: [number, number]) {
  const k = 0.012;
  const points = Array.from({length: 9}, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    const r = k * (1.2 + (i % 3) * 0.9);
    return {type: 'Feature' as const, properties: {}, geometry: {type: 'Point' as const, coordinates: [lng + Math.cos(a) * r * 1.3, lat + Math.sin(a) * r]}};
  });
  const route = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: Array.from({length: 7}, (_, i) => [lng - 4 * k + i * 1.4 * k, lat - 2 * k + Math.sin(i) * 1.6 * k]),
    },
  };
  const district = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[[lng + k, lat + 0.5 * k], [lng + 4 * k, lat + 1.2 * k], [lng + 4.4 * k, lat + 3.6 * k], [lng + 1.6 * k, lat + 4 * k], [lng + 0.6 * k, lat + 2.4 * k], [lng + k, lat + 0.5 * k]]],
    },
  };
  const fc = (features: unknown[]) => ({type: 'geojson', data: {type: 'FeatureCollection', features}}) as GeoJSONSourceSpecification;
  return {points: fc(points), route: fc([route]), district: fc([district])};
}

const LAYERS = {
  points: ['sample-points'],
  route: ['sample-route'],
  district: ['sample-district-fill', 'sample-district-edge'],
};
type Overlay = keyof typeof LAYERS;

function styleFor(city: City) {
  return obsidianMapStyle({
    tiles: `${location.origin}${BASE}tiles/${city}.pmtiles`,
    worldTiles: `${location.origin}${BASE}tiles/world.pmtiles`,
    assets: `${BASE}basemap`,
  });
}

function addOverlays(map: maplibregl.Map, city: City, visible: Record<Overlay, boolean>) {
  const data = sampleData(CITIES[city].center);
  const before = firstLabelLayer(map.getStyle());
  map.addSource('sample-points', data.points);
  map.addSource('sample-route', data.route);
  map.addSource('sample-district', data.district);
  for (const layer of areaLayers({id: 'sample-district', source: 'sample-district', color: OVERLAY.purple, size: 'region'})) map.addLayer(layer, before);
  map.addLayer(lineLayer({id: 'sample-route', source: 'sample-route', color: OVERLAY.orange}), before);
  map.addLayer(pointLayer({id: 'sample-points', source: 'sample-points', color: OVERLAY.blue}), before);
  for (const [key, ids] of Object.entries(LAYERS)) {
    for (const id of ids) map.setLayoutProperty(id, 'visibility', visible[key as Overlay] ? 'visible' : 'none');
  }
}

function Demo() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [city, setCity] = useState<City>(startCity);
  const [visible, setVisible] = useState<Record<Overlay, boolean>>({points: true, route: true, district: true});
  const [zoom, setZoom] = useState(13);
  const firstCity = useRef(true);

  useEffect(() => {
    const m = new maplibregl.Map({
      container: container.current!,
      style: styleFor(startCity),
      center: CITIES[startCity].center,
      zoom: 13,
      // The view is kept in the URL, so any view can be shared as a link.
      hash: true,
      attributionControl: {compact: true},
      dragRotate: false,
      pitchWithRotate: false,
    });
    m.touchZoomRotate.disableRotation();
    m.addControl(new maplibregl.NavigationControl({showCompass: false}), 'top-right');
    const syncZoom = () => setZoom(Math.round(m.getZoom() * 10) / 10);
    m.on('zoomend', syncZoom);
    m.once('load', syncZoom); // a shared link can open at any zoom
    // Protomaps' style names a few icons its own sprite sheet lacks (`townhall`).
    // A transparent placeholder keeps the console clean; the label still draws.
    m.on('styleimagemissing', (e) => {
      if (!m.hasImage(e.id)) m.addImage(e.id, {width: 1, height: 1, data: new Uint8Array(4)});
    });
    m.once('style.load', () => addOverlays(m, startCity, {points: true, route: true, district: true}));
    map.current = m;
    return () => m.remove();
  }, []);

  // A city switch swaps the style (each city is its own extract) and re-adds the data.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    // The first style is set by the constructor; swapping it again while it
    // still loads makes MapLibre rebuild from scratch.
    if (firstCity.current) {
      firstCity.current = false;
      return;
    }
    const load = () => addOverlays(m, city, visible);
    m.once('style.load', load);
    history.replaceState(null, '', `?city=${city}${location.hash}`);
    m.setStyle(styleFor(city));
    m.jumpTo({center: CITIES[city].center, zoom: m.getZoom() < 7 ? 13 : m.getZoom()});
    return () => {
      m.off('style.load', load);
    };
    // `visible` is applied by its own effect; re-adding layers on every toggle would flash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    const m = map.current;
    if (!m || !m.getLayer('sample-points')) return;
    for (const [key, ids] of Object.entries(LAYERS)) {
      for (const id of ids) m.setLayoutProperty(id, 'visibility', visible[key as Overlay] ? 'visible' : 'none');
    }
  }, [visible]);

  const fly = (center: [number, number], z: number) => map.current?.flyTo({center, zoom: z, duration: 900, essential: false});

  return (
    <div className="demo">
      <div ref={container} className="demo-map" />
      <aside className="demo-panel" aria-label="Map style controls">
        <div className="demo-panel-head">
          <Heading level={1}>Obsidian map style</Heading>
          <Text color="secondary">
            A dark MapLibre basemap on Protomaps tiles. It stays near-neutral so the data on top
            can carry colour.
          </Text>
        </div>

        <Selector
          label="City"
          value={city}
          onChange={(v) => setCity(v as City)}
          options={Object.entries(CITIES).map(([value, c]) => ({value, label: c.label}))}
        />

        <div className="demo-group">
          <Text type="label">Zoom</Text>
          <div className="demo-row">
            {ZOOMS.map((z) => (
              <Button
                key={z.label}
                size="sm"
                label={`${z.label} · ${z.zoom}`}
                variant={Math.abs(zoom - z.zoom) < 0.5 ? 'primary' : 'secondary'}
                onClick={() => fly(CITIES[city].center, z.zoom)}
              />
            ))}
          </div>
        </div>

        <div className="demo-group">
          <Text type="label">Data on top</Text>
          <div className="demo-toggle">
            <span className="demo-key demo-key-point" style={{background: OVERLAY.blue}} />
            <Switch label="Points" value={visible.points} onChange={(v) => setVisible((s) => ({...s, points: v}))} />
          </div>
          <div className="demo-toggle">
            <span className="demo-key demo-key-line" style={{background: OVERLAY.orange}} />
            <Switch label="Route" value={visible.route} onChange={(v) => setVisible((s) => ({...s, route: v}))} />
          </div>
          <div className="demo-toggle">
            <span className="demo-key demo-key-area" style={{borderColor: OVERLAY.purple, background: `${OVERLAY.purple}52`}} />
            <Switch label="District" value={visible.district} onChange={(v) => setVisible((s) => ({...s, district: v}))} />
          </div>
        </div>

        <div className="demo-group">
          <Text type="label">Other scripts</Text>
          <Text type="supporting">Labels in Inter, with Noto Sans for every script Inter lacks.</Text>
          <div className="demo-row">
            {SCRIPTS.map((s) => (
              <Button key={s.label} size="sm" label={s.label} onClick={() => fly(s.center, s.zoom)} />
            ))}
          </div>
        </div>

        <Text type="supporting">
          Zoom {zoom.toFixed(1)} ·{' '}
          <a className="demo-link" href={REPO}>
            Source on GitHub
          </a>
        </Text>
      </aside>
    </div>
  );
}


/**
 * The README banner: the map full-bleed with its data in colour, and the name
 * on the same floating panel the demo puts over the map — the banner shows the
 * product as it is used, not a poster about it.
 *
 * Drawn at the size GitHub shows it — an 880×440 frame, captured at 3× — so
 * every word renders at its real type size. Drawn at 1280 and scaled down to
 * the README's width, the tagline fell to 9px and the legend to 7px.
 * Rendered at `?view=banner` (add `&city=madrid` to try another extract).
 */
const FRAME = {width: 880, height: 440};
/** Layout below is authored on a 1280-wide grid and scaled to the frame. */
const K = FRAME.width / 1280;
const BANNER_VIEW: Record<City, {center: [number, number]; zoom: number}> = {
  // Zooms are for the 1280 grid; log2(K) brings the same area into the frame.
  madrid: {center: [-3.6905, 40.4225], zoom: 13.2 + Math.log2(K)},
  milan: {center: [9.1905, 45.4655], zoom: 13.4 + Math.log2(K)},
  'mexico-city': {center: [-99.1332, 19.4326], zoom: 12.9 + Math.log2(K)},
};

/**
 * Banner data, laid out in screen pixels and projected onto whatever the map
 * shows, so the composition holds whichever city is behind it: an area in the
 * upper right, a route sweeping across, points along it — all inside the frame
 * and clear of the band.
 */
function bannerData(m: maplibregl.Map) {
  const at = ([x, y]: [number, number]) => m.unproject([x * K, y * K]).toArray();
  const area: [number, number][] = [[905, 70], [1120, 48], [1196, 214], [1062, 286], [930, 232], [905, 70]];
  const route: [number, number][] = [[560, 612], [640, 520], [742, 468], [858, 452], [962, 392], [1074, 360], [1180, 404], [1300, 382]];
  const points: [number, number][] = [[642, 520], [858, 452], [1074, 360], [1180, 404], [690, 214], [780, 330], [1000, 150], [1092, 236], [1180, 560], [930, 560], [600, 300]];
  const fc = (features: unknown[]) => ({type: 'geojson', data: {type: 'FeatureCollection', features}}) as GeoJSONSourceSpecification;
  const f = (geometry: unknown) => ({type: 'Feature', properties: {}, geometry});
  return {
    area: fc([f({type: 'Polygon', coordinates: [area.map(at)]})]),
    route: fc([f({type: 'LineString', coordinates: route.map(at)})]),
    points: fc(points.map((p) => f({type: 'Point', coordinates: at(p)}))),
  };
}

const bannerCity: City = new URLSearchParams(location.search).get('city') ? startCity : 'milan';

function ReadmeBanner() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const view = BANNER_VIEW[bannerCity];
    const m = new maplibregl.Map({
      container: container.current!,
      style: styleFor(bannerCity),
      center: view.center,
      zoom: view.zoom,
      interactive: false,
      attributionControl: false,
    });
    // The panel covers the left 40%; centre the city in what is left.
    m.setPadding({left: 520 * K, top: 0, right: 0, bottom: 0});
    m.jumpTo({center: view.center, zoom: view.zoom});
    m.on('styleimagemissing', (e) => {
      if (!m.hasImage(e.id)) m.addImage(e.id, {width: 1, height: 1, data: new Uint8Array(4)});
    });
    m.once('style.load', () => {
      const data = bannerData(m);
      const before = firstLabelLayer(m.getStyle());
      m.addSource('banner-area', data.area);
      m.addSource('banner-route', data.route);
      m.addSource('banner-points', data.points);
      for (const layer of areaLayers({id: 'banner-area', source: 'banner-area', color: OVERLAY.purple, size: 'region'})) m.addLayer(layer, before);
      m.addLayer(lineLayer({id: 'banner-route', source: 'banner-route', color: OVERLAY.orange}), before);
      m.addLayer(pointLayer({id: 'banner-points', source: 'banner-points', color: OVERLAY.blue}), before);
    });
    return () => m.remove();
  }, []);
  return (
    <div className="banner-frame" style={FRAME}>
      <div ref={container} className="banner-map" />
      <div className="banner-copy">
        <Heading level={1} type="display-1">
          Obsidian
          <br />
          map style
        </Heading>
        <Text type="large" weight="normal" color="secondary">
          A dark MapLibre basemap that stays quiet, so the colour on the map is your data.
        </Text>
        <ul className="banner-legend">
          <li>
            <span className="demo-key demo-key-point" style={{background: OVERLAY.blue}} />
            <Text>Points</Text>
          </li>
          <li>
            <span className="demo-key demo-key-line" style={{background: OVERLAY.orange}} />
            <Text>Routes</Text>
          </li>
          <li>
            <span className="demo-key demo-key-area" style={{borderColor: OVERLAY.purple, background: `${OVERLAY.purple}52`}} />
            <Text>Areas</Text>
          </li>
        </ul>
      </div>
      <div className="banner-attribution">© OpenStreetMap contributors · Protomaps</div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme theme={obsidianTheme} mode="dark">
      {new URLSearchParams(location.search).get('view') === 'banner' ? <ReadmeBanner /> : <Demo />}
    </Theme>
  </StrictMode>,
);
