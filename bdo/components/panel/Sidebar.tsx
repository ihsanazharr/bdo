'use client';

import { Droplets, Route, TreePine, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import ScoreBar from '@/components/panel/ScoreBar';
import type { DistrictProps } from '@/lib/types';
import {
  AREA_LABEL,
  RAW_UNITS,
  formatRaw,
  getDistrictName,
  getKecamatan,
  getScore,
  levelOf,
} from '@/lib/scoring';

interface Props {
  data: DistrictProps | null;
  onClose: () => void;
}

export default function Sidebar({ data, onClose }: Props) {
  const [shown, setShown] = useState<DistrictProps | null>(data);
  useEffect(() => {
    if (data) setShown(data);
  }, [data]);

  const open = data !== null;
  const rth = shown ? getScore(shown, 'rth') : null;
  const biopori = shown ? getScore(shown, 'biopori') : null;
  const jalan = shown ? getScore(shown, 'jalan') : null;
  const composite = shown ? getScore(shown, 'komposit') : null;
  const kecamatan = shown ? getKecamatan(shown) : null;

  const radarData = [
    { axis: 'RTH', value: rth ?? 0 },
    { axis: 'Biopori', value: biopori ?? 0 },
    { axis: 'Jalan', value: jalan ?? 0 },
  ];

  return (
    <aside
      aria-hidden={!open}
      className={`sidebar-scroll absolute right-4 top-4 z-10 max-h-[calc(100dvh-8.5rem)] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl bg-black/60 p-7 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06] backdrop-blur-md transition-all duration-500 ease-out sm:right-6 sm:top-6 sm:w-[400px] ${
        open
          ? 'translate-x-0 opacity-100'
          : 'pointer-events-none translate-x-[110%] opacity-0'
      }`}
    >
      {shown && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">
                {AREA_LABEL}
                {kecamatan ? ` di Kecamatan ${kecamatan}` : ''}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-50">
                {getDistrictName(shown)}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup panel"
              className="-mr-2 -mt-1 rounded-full p-2 text-neutral-500 transition-all duration-300 hover:bg-white/10 hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-mono text-5xl font-medium tabular-nums text-emerald-300">
              {composite === null ? '–' : composite.toFixed(0)}
            </span>
            <span className="font-mono text-sm text-neutral-600">/ 100</span>
            {composite !== null && (
              <span className="ml-auto rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Skor komposit {levelOf(composite).toLowerCase()}
              </span>
            )}
          </div>

          <div className="mt-6 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="#34d399"
                  strokeWidth={1.5}
                  fill="#34d399"
                  fillOpacity={0.22}
                  dot={{ r: 3, fill: '#6ee7b7', strokeWidth: 0 }}
                  animationDuration={700}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-6">
            <ScoreBar
              icon={TreePine}
              label="Ruang terbuka hijau"
              value={rth}
              detail={formatRaw(shown, 'luas_rth', RAW_UNITS.rth)}
            />
            <ScoreBar
              icon={Droplets}
              label="Biopori"
              value={biopori}
              detail={formatRaw(shown, 'jumlah_lubang_biopori', RAW_UNITS.biopori)}
            />
            <ScoreBar
              icon={Route}
              label="Jalan terpelihara"
              value={jalan}
              detail={formatRaw(shown, 'panjang_jalan', RAW_UNITS.jalan)}
            />
          </div>
        </>
      )}
    </aside>
  );
}