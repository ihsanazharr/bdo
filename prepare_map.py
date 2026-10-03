import geopandas as gpd
import requests
from pathlib import Path
from shapely import force_2d

BASE_DIR = Path(__file__).resolve().parent
OUT_PATH = BASE_DIR / 'rawdata' / 'peta_bandung.geojson'
SRC_URL = 'https://raw.githubusercontent.com/RC3ID-Data-Science/Maps/main/Bandung_Kelurahan.geojson'

print('Mengunduh batas kelurahan Kota Bandung...')
resp = requests.get(SRC_URL, timeout=60)
resp.raise_for_status()

tmp = BASE_DIR / 'rawdata' / '_sumber_kelurahan.geojson'
tmp.parent.mkdir(exist_ok=True)
tmp.write_bytes(resp.content)

g = gpd.read_file(tmp).to_crs(epsg=4326)
g['geometry'] = g.geometry.apply(force_2d)               # buang koordinat Z
g['LUAS_KM2'] = (g.to_crs(epsg=32748).area / 1e6).round(4)  # UTM 48S, akurat untuk Bandung
g['WADMKK'] = 'Kota Bandung'

out = g.rename(columns={'nama_kelurahan': 'NAMOBJ', 'nama_kecamatan': 'WADMKC'})
out = out[['NAMOBJ', 'WADMKC', 'WADMKK', 'LUAS_KM2', 'geometry']]
out.to_file(OUT_PATH, driver='GeoJSON')
tmp.unlink()

print(f'Selesai: {len(out)} kelurahan -> {OUT_PATH}')
assert len(out) == 151, 'Jumlah kelurahan tidak sesuai harapan'