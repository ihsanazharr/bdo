'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Disclaimer from '@/components/overlay/Disclaimer';
import HeaderTitle from '@/components/overlay/HeaderTitle';
import LayerSwitcher from '@/components/overlay/LayerSwitcher';
import Sidebar from '@/components/panel/Sidebar';
import type { DistrictProps, Metric } from '@/lib/types';
import { getDistrictName } from '@/lib/scoring';

// Leaflet butuh `window`, jadi komponen peta hanya dirender di client.
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-black">
      <p className="font-mono text-xs text-neutral-600">Menyiapkan peta…</p>
    </div>
  ),
});

export default function Home() {
  const [selected, setSelected] = useState<DistrictProps | null>(null);
  const [metric, setMetric] = useState<Metric>('komposit');

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Peta full-screen; z-0 membuat stacking context sendiri */}
      <div className="absolute inset-0 z-0">
        <MapComponent
          metric={metric}
          selectedName={selected ? getDistrictName(selected) : null}
          onSelect={setSelected}
        />
      </div>

      <HeaderTitle />
      <Sidebar data={selected} onClose={() => setSelected(null)} />
      <LayerSwitcher metric={metric} onChange={setMetric} />
      <Disclaimer />
    </main>
  );
}