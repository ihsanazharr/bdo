export default function HeaderTitle() {
  return (
    <header className="absolute left-4 top-4 z-10 max-w-sm rounded-2xl bg-black/60 px-6 py-5 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06] backdrop-blur-md sm:left-6 sm:top-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">BDO</h1>
      <p className="mt-0.5 text-sm text-emerald-300/90">Beyond Distribution &amp; Opportunity</p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-500">
        Jelajahi sebaran ruang hijau, biopori, dan jalan terpelihara di Kota Bandung. Klik
        sebuah wilayah untuk melihat profilnya.
        </p>
    </header>
  );
}