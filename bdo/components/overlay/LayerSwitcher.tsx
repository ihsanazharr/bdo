'use client';

import type { Metric } from '@/lib/types';
import { GRADIENT_CSS, METRICS } from '@/lib/scoring';

interface Props {
  metric: Metric;
  onChange: (m: Metric) => void;
}

export default function LayerSwitcher({ metric, onChange }: Props) {
  return (
    <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-2xl bg-black/60 p-2 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06] backdrop-blur-md sm:bottom-6">
      <div className="flex gap-1">
        {METRICS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            aria-pressed={metric === m.id}
            className={`rounded-xl px-4 py-2 text-sm transition-all duration-300 ${
              metric === m.id
                ? 'bg-emerald-400/15 text-emerald-300'
                : 'text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-100'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mx-3 mb-2 mt-3 flex items-center gap-3">
        <span className="text-[11px] text-neutral-500">Rendah</span>
        <div className="h-1 flex-1 rounded-full" style={{ background: GRADIENT_CSS }} />
        <span className="text-[11px] text-neutral-500">Tinggi</span>
      </div>
    </div>
  );
}