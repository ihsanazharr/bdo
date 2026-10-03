'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GeoJSON,
  MapContainer,
  Pane,
  TileLayer,
  ZoomControl,
  useMapEvents,
} from 'react-leaflet';
import type { DistrictCollection, DistrictFeature, DistrictProps, Metric } from '@/lib/types';
import { METRICS, buildRanker, getDistrictName, getScore, scoreColor } from '@/lib/scoring';

interface Props {
  metric: Metric;
  selectedName: string | null;
  onSelect: (props: DistrictProps | null) => void;
}

const CENTER: [number, number] = [-6.9175, 107.6191];
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY ?? '';

const tileUrl = (style: string) =>
  `https://{s}.basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}.png?key=${CARTO_KEY}`;

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function tooltipHtml(p: DistrictProps, metric: Metric) {
  const label = METRICS.find((m) => m.id === metric)?.label ?? '';
  const score = getScore(p, metric);
  return `<div class="bdo-tip-row">
    <span class="bdo-tip-name">${esc(getDistrictName(p))}</span>
    <span class="bdo-tip-score">${score === null ? '–' : score.toFixed(0)}</span>
  </div>
  <div class="bdo-tip-meta">${esc(label)}${score === null ? ' (data belum tersedia)' : ''}</div>`;
}

function ClickAway({ onClear }: { onClear: () => void }) {
  useMapEvents({ click: onClear });
  return null;
}

export default function MapComponent({ metric, selectedName, onSelect }: Props) {
  const [data, setData] = useState<DistrictCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const geoRef = useRef<L.GeoJSON | null>(null);

  // Peringkat tiap wilayah per metrik, dipakai untuk pewarnaan
  const rankers = useMemo(() => {
    const feats = data?.features ?? [];
    const mk = (m: Metric) => buildRanker(feats.map((f) => getScore(f.properties, m)));
    return {
      komposit: mk('komposit'),
      rth: mk('rth'),
      biopori: mk('biopori'),
      jalan: mk('jalan'),
    } as Record<Metric, (v: number | null) => number | null>;
  }, [data]);

  // Ref agar handler Leaflet (dibuat sekali) selalu membaca state terbaru
  const metricRef = useRef(metric);
  const selectedRef = useRef(selectedName);
  const onSelectRef = useRef(onSelect);
  const rankersRef = useRef(rankers);
  metricRef.current = metric;
  selectedRef.current = selectedName;
  onSelectRef.current = onSelect;
  rankersRef.current = rankers;

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/data/bdo_data_final.geojson', { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: DistrictCollection) => {
        console.info(`[BDO] ${json.features.length} poligon dimuat`);
        setData(json);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError('Data peta tidak dapat dimuat.');
      });
    return () => ctrl.abort();
  }, []);

  // Tampilkan seluruh kota begitu data siap
  useEffect(() => {
    if (!data || !mapRef.current) return;
    const bounds = L.geoJSON(data as never).getBounds();
    if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [data]);

  const styleFor = (f: DistrictFeature, hover = false): L.PathOptions => {
    const p = f.properties;
    const m = metricRef.current;
    const isSelected = getDistrictName(p) === selectedRef.current;
    const rank = rankersRef.current[m](getScore(p, m));
    return {
      stroke: true,
      fill: true,
      fillColor: scoreColor(rank),
      fillOpacity: isSelected ? 0.8 : hover ? 0.75 : 0.6,
      color: isSelected ? '#6ee7b7' : '#ffffff',
      opacity: isSelected ? 1 : hover ? 0.7 : 0.3,
      weight: isSelected ? 2.5 : hover ? 1.5 : 0.8,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, DistrictProps>, layer: L.Layer) => {
    const f = feature as DistrictFeature;
    layer.bindTooltip(tooltipHtml(f.properties, metricRef.current), {
      sticky: true,
      direction: 'top',
      offset: [0, -8],
      opacity: 1,
      className: 'bdo-tooltip',
    });

    layer.on({
      mouseover: (e) => {
        const t = e.target as L.Path;
        t.setStyle(styleFor(f, true));
        t.bringToFront();
      },
      mouseout: (e) => {
        (e.target as L.Path).setStyle(styleFor(f));
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current(f.properties);
        const wide = window.innerWidth >= 640;
        mapRef.current?.flyToBounds((e.target as L.Polygon).getBounds(), {
          paddingTopLeft: [40, 40],
          paddingBottomRight: [wide ? 440 : 40, 40],
          maxZoom: 14.5,
          duration: 0.9,
        });
      },
    });
  };

  // Sinkronkan warna, sorotan, dan isi tooltip saat metrik / pilihan berubah
  useEffect(() => {
    const g = geoRef.current;
    if (!g) return;
    g.eachLayer((layer) => {
      const l = layer as L.Path & { feature?: DistrictFeature };
      if (!l.feature) return;
      l.setStyle(styleFor(l.feature));
      l.setTooltipContent(tooltipHtml(l.feature.properties, metric));
      if (getDistrictName(l.feature.properties) === selectedName) l.bringToFront();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, selectedName, data]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={CENTER}
        zoom={12}
        minZoom={10}
        maxZoom={17}
        zoomSnap={0.25}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* Basemap: selalu di bawah poligon */}
        <TileLayer
          url={tileUrl('dark_nolabels')}
          className="bdo-basemap"
          attribution={ATTRIBUTION}
          subdomains="abcd"
          maxZoom={20}
          detectRetina
        />

        {/* Poligon punya pane sendiri (z-index 450) supaya tidak pernah tertutup tile */}
        <Pane name="districts" style={{ zIndex: 450 }}>
          {data && (
            <GeoJSON
              ref={geoRef}
              pane="districts"
              data={data}
              style={(f) => styleFor(f as DistrictFeature)}
              onEachFeature={onEachFeature}
            />
          )}
        </Pane>

        {/* Label jalan di atas poligon, tidak menangkap klik */}
        <Pane name="labels" style={{ zIndex: 640, pointerEvents: 'none' }}>
          <TileLayer
            url={tileUrl('dark_only_labels')}
            subdomains="abcd"
            maxZoom={20}
            detectRetina
            pane="labels"
          />
        </Pane>

        <ZoomControl position="bottomright" />
        <ClickAway onClear={() => onSelectRef.current(null)} />
      </MapContainer>

      {!data && (
        <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center">
          <p className="font-mono text-xs text-neutral-500">
            {error ?? 'Memuat batas kelurahan…'}
          </p>
        </div>
      )}
    </div>
  );
}