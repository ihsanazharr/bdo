import type { DistrictProps, Metric } from '@/lib/types';

// Ubah ke 'Kecamatan' jika poligon Anda memang level kecamatan.
export const AREA_LABEL = 'Kelurahan';

// Sesuaikan satuan dengan metadata dataset Open Data Bandung.
export const RAW_UNITS = { rth: 'm²', biopori: 'lubang', jalan: 'm' };

export const METRICS: { id: Metric; label: string }[] = [
  { id: 'komposit', label: 'Komposit' },
  { id: 'rth', label: 'Ruang hijau' },
  { id: 'biopori', label: 'Biopori' },
  { id: 'jalan', label: 'Jalan' },
];

const NAME_KEYS = ['NAMOBJ', 'nama_kelurahan', 'nama_kecamatan', 'kecamatan', 'KECAMATAN', 'WADMKC', 'nama', 'name', 'NAME_3'];

export function getDistrictName(p: DistrictProps): string {
  for (const k of NAME_KEYS) {
    const v = p[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return AREA_LABEL;
}

// Nama kecamatan induk (poligon level kelurahan dengan properti WADMKC)
export function getKecamatan(p: DistrictProps): string | null {
  const k = p.WADMKC;
  if (typeof k !== 'string' || !k.trim()) return null;
  return k.trim().toLowerCase() === getDistrictName(p).toLowerCase() ? null : k.trim();
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Mengembalikan null jika wilayah tidak punya data
export function getScore(p: DistrictProps, metric: Metric): number | null {
  const rth = toNum(p.rth_score);
  const biopori = toNum(p.biopori_score);
  const jalan = toNum(p.jalan_score);

  switch (metric) {
    case 'rth':
      return rth;
    case 'biopori':
      return biopori;
    case 'jalan':
      return jalan;
    default: {
      const vals = [rth, biopori, jalan].filter((v): v is number => v !== null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
  }
}

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

export function formatRaw(
  p: DistrictProps,
  key: 'luas_rth' | 'jumlah_lubang_biopori' | 'panjang_jalan',
  unit: string,
): string {
  const v = toNum(p[key]);
  return v === null ? 'Data belum tersedia' : `${nf.format(v)} ${unit}`;
}

export function levelOf(score: number): 'Rendah' | 'Sedang' | 'Tinggi' {
  if (score < 34) return 'Rendah';
  if (score < 67) return 'Sedang';
  return 'Tinggi';
}

// Mengubah skor menjadi peringkat 0-100 di antara semua wilayah,
// supaya warna peta tersebar merata walau skornya menumpuk di angka rendah.
export function buildRanker(values: (number | null)[]) {
  const sorted = values.filter((v): v is number => v !== null).sort((a, b) => a - b);
  return (v: number | null): number | null => {
    if (v === null) return null;
    if (sorted.length < 2) return 50;
    const below = sorted.filter((x) => x < v).length;
    const equal = sorted.filter((x) => x === v).length;
    return ((below + (equal - 1) / 2) / (sorted.length - 1)) * 100;
  };
}

const STOPS = ['#1b3a31', '#0f6b4f', '#12a276', '#3ee6ad', '#d1ffec'];
export const GRADIENT_CSS = `linear-gradient(to right, ${STOPS.join(', ')})`;
const NO_DATA_COLOR = '#2a2f2d';

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

function mix(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${c.join(',')})`;
}

export function scoreColor(score: number | null): string {
  if (score === null || !Number.isFinite(score)) return NO_DATA_COLOR;
  const t = Math.max(0, Math.min(1, score / 100));
  const x = t * (STOPS.length - 1);
  const i = Math.min(Math.floor(x), STOPS.length - 2);
  return mix(STOPS[i], STOPS[i + 1], x - i);
}