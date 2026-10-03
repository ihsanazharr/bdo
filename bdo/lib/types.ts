import type { Feature, FeatureCollection, Geometry } from 'geojson';

export type Metric = 'komposit' | 'rth' | 'biopori' | 'jalan';

export interface DistrictProps {
  rth_score: number | null;
  biopori_score: number | null;
  jalan_score: number | null;
  luas_rth?: number | null;
  jumlah_lubang_biopori?: number | null;
  panjang_jalan?: number | null;
  [key: string]: unknown;
}

export type DistrictFeature = Feature<Geometry, DistrictProps>;
export type DistrictCollection = FeatureCollection<Geometry, DistrictProps>;