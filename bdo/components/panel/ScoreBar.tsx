'use client';

import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | null;
  detail?: string;
}

export default function ScoreBar({ icon: Icon, label, value, detail }: Props) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Math.min(100, value ?? 0));
    const id = requestAnimationFrame(() => setWidth(target));
    return () => {
      cancelAnimationFrame(id);
      setWidth(0);
    };
  }, [value]);

  return (
    <div className="group">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-sm text-neutral-400 transition-all duration-300 group-hover:text-neutral-100">
          <Icon className="h-4 w-4 text-emerald-400/80" strokeWidth={1.75} />
          {label}
        </div>
        <span className="font-mono text-sm tabular-nums text-neutral-100">
          {value === null ? '–' : value.toFixed(1)}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)] transition-[width] duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      {detail && <p className="mt-2 font-mono text-xs text-neutral-600">{detail}</p>}
    </div>
  );
}