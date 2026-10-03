'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

export default function Disclaimer() {
  const [open, setOpen] = useState(true);

  return (
    <div className="absolute bottom-4 left-4 z-10 w-72 rounded-2xl bg-black/60 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06] backdrop-blur-md sm:bottom-6 sm:left-6">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm text-neutral-400 transition-all duration-300 hover:text-neutral-100"
      >
        <Info className="h-4 w-4 text-emerald-400/80" strokeWidth={1.75} />
        Tentang data
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
        <p className="px-5 pb-5 text-xs leading-relaxed text-neutral-500">
        Warna peta menunjukkan peringkat relatif antar kelurahan, sedangkan angka di panel adalah
        skor 0 sampai 100 (0 untuk nilai terendah, 100 untuk tertinggi). Keduanya bersifat
        perbandingan, bukan target atau standar. Data bersumber dari Open Data Kota Bandung.
        Wilayah abu-abu belum memiliki data.
        </p>
        </div>
      </div>
    </div>
  );
}