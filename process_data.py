import pandas as pd
import geopandas as gpd
import requests
import os
from pathlib import Path
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
PETA_PATH = BASE_DIR / 'rawdata' / 'peta_bandung.geojson'

print("Memulai proses ETL Spasial dari Open Data API...")

# Ganti BASE_URL ini dengan domain Open Data yang Anda gunakan
BASE_URL = "https://opendata.bandung.go.id/api/bigdata" # Ubah jika path base-nya berbeda

# Menggunakan set() untuk otomatis membuang duplikat endpoint dari catatan Anda
ENDPOINTS_RTH = list({
    "kecamatan_babakan_ciparay/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_32",
    "kecamatan_coblong/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_28",
    "kecamatan_regol/jmlh-ls-rng-trbk-hj-rth-brdsrkn-klrhn-d-kcmtn-rgl-kt-bndng",
    "kecamatan_bandung_wetan/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_bndng_wtn_kt_bndng",
    "kecamatan_astanaanyar/rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_stnnyr_kt_bndng",
    "kecamatan_antapani/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_ntpn_kt_bndng",
    "kecamatan_cibeunying_kaler/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_cbnyng_klr_kt_bndng",
    "kecamatan_cidadap/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_cddp_kt_bndng",
    "kecamatan_sumur_bandung/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_smr_bndng_kt_bndng",
    "kecamatan_cibiru/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_cbr_kt_bndng_2",
    "kecamatan_andir/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_ndr_kt_bndng",
    "kecamatan_batununggal/rng_trbk_hj_brdsrkn_klrhn_d_kcmtn_btnnggl_d_kt_bndng",
    "kecamatan_arcamanik/ls_rng_trbk_hj_rth_brdsrkn_klrhn_d_kcmtn_rcmnk_kt_bndng",
    "kecamatan_sukasari/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan__3",
    "kecamatan_mandalajati/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan__5",
    "kecamatan_panyileukan/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_10",
    "kecamatan_sukajadi/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_19",
    "kecamatan_cinambo/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_20",
    "kecamatan_cicendo/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_22",
    "kecamatan_lengkong/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_13",
    "kecamatan_kiaracondong/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_26",
    "kecamatan_bojongloa_kidul/ruang_terbuka_hijau_rth_berdasarkan_kelurahan_di_keca",
    "kecamatan_rancasari/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_27",
    "kecamatan_buahbatu/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_17",
    "kecamatan_gedebage/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_12",
    "kecamatan_bojongloa_kaler/ruang_terbuka_hijau_berdasarkan_kelurahan_di_kecamata",
    "kecamatan_bandung_kulon/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_30",
    "kecamatan_cibeunying_kidul/luas_ruang_terbuka_hijau_rth_berdasarkan_kelurahan_31"
})

ENDPOINTS_BIOPORI = list({
    "kecamatan_babakan_ciparay/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_24",
    "kecamatan_coblong/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_22",
    "kecamatan_astanaanyar/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_21",
    "kecamatan_kiaracondong/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_20",
    "kecamatan_bojongloa_kaler/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_18",
    "kecamatan_bojongloa_kidul/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_17",
    "kecamatan_bandung_kulon/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_16",
    "kecamatan_cicendo/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_13",
    "kecamatan_sukajadi/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_15",
    "kecamatan_cinambo/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_12",
    "kecamatan_cibeunying_kidul/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_11",
    "kecamatan_buahbatu/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kec_10",
    "kecamatan_lengkong/jumlah_lubang_biopori_berdasarkan_kelurahan_di_keca_9",
    "kecamatan_gedebage/jumlah_lubang_biopori_berdasarkan_kelurahan_di_keca_8",
    "kecamatan_rancasari/jumlah_lubang_biopori_di_kecamatan_rancasari_kota_ban",
    "kecamatan_mandalajati/jumlah_lubang_biopori_berdasarkan_kelurahan_di_keca_4",
    "kecamatan_cibiru/jumlah_lubang_biopori_berdasarkan_kelurahan_di_keca_6",
    "kecamatan_bandung_kidul/jumlah_lubang_biopori_berdasarkan_kelurahan_di_keca_2",
    "kecamatan_ujungberung/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_jngbrng_kt_bndng",
    "kecamatan_regol/jumlah_lubang_biopori_berdasarkan_kelurahan_di_kecamatan_regol",
    "kecamatan_sukasari/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_sksr_kt_bndng",
    "kecamatan_panyileukan/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_pnylkn_kt_bndng",
    "kecamatan_arcamanik/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_rcmnk_kt_bndng",
    "kecamatan_cibeunying_kaler/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_cbnyng_klr_kt_bndng",
    "kecamatan_cidadap/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_cddp_kt_bndng",
    "kecamatan_andir/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_ndr_kt_bndng",
    "kecamatan_bandung_wetan/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_bndng_wtn_kt_bndng",
    "kecamatan_sumur_bandung/jmlh_lbng_bpr_brdsrkn_klrhn_d_kcmtn_smr_bndng_kt_bndng",
    "kecamatan_antapani/jumlah_lubang_biopori_di_kecamatan_antapani_kota_bandung",
})

ENDPOINTS_JALAN = list({
    "kecamatan_panyileukan/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_25",
    "kecamatan_gedebage/panjang_jalan_terpelihara_berdasarkan_kelurahan_di__9",
    "kecamatan_rancasari/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_24",
    "kecamatan_coblong/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_22",
    "kecamatan_kiaracondong/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_23",
    "kecamatan_bojongloa_kaler/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_21",
    "kecamatan_bandung_kulon/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_19",
    "kecamatan_lengkong/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_10",
    "kecamatan_cinambo/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_17",
    "kecamatan_cicendo/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_18",
    "kecamatan_cibeunying_kidul/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_16",
    "kecamatan_sukajadi/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_15",
    "kecamatan_buahbatu/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_14",
    "kecamatan_mandalajati/panjang_jalan_terpelihara_berdasarkan_kelurahan_di__5",
    "kecamatan_cibiru/panjang_jalan_terpelihara_berdasarkan_kelurahan_di__3",
    "kecamatan_sukasari/panjang_jalan_terpelihara_berdasarkan_kelurahan_di__2",
    "kecamatan_arcamanik/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_rcmnk_kt_bndng",
    "kecamatan_ujungberung/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_jngbrng_kt_bndng",
    "kecamatan_andir/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_ndr_kt_bndng",
    "kecamatan_batununggal/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_btnnggl_kt_bndng",
    "kecamatan_sumur_bandung/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_smr_bndng_kt_bndng",
    "kecamatan_astanaanyar/panjang_jalan_terpelihara_berdasarkan_kelurahan_di_28",
    "kecamatan_cibeunying_kaler/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_cbnyng_klr_kt_bndng",
    "kecamatan_antapani/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_ntpn_kt_bndng",
    "kecamatan_bojongloa_kidul/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_bjngl_kdl_kt_bndng",
    "kecamatan_bandung_wetan/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_bndng_wtn_kt_bndng",
    "kecamatan_cidadap/pnjng_jln_trplhr_brdsrkn_klrhn_d_kcmtn_cddp_kt_bndng",
    "kecamatan_regol/pnjng-jln-trplhr-brdsrkn-klrhn-d-kcmtn-rgl-kt-bndng"
})

def fetch_and_aggregate(endpoints, target_column, is_text=False):
    all_data = []
    
    for ep in endpoints:
        # Hapus slash berlebih di awal jika BASE_URL sudah diakhiri slash
        clean_ep = ep.lstrip('/')
        url = f"{BASE_URL.rstrip('/')}/{clean_ep}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                raw_data = response.json()
                
                # Menangani berbagai kemungkinan wrapper JSON dari Open Data
                if isinstance(raw_data, dict) and 'data' in raw_data:
                    json_data = raw_data['data']
                elif isinstance(raw_data, list):
                    json_data = raw_data
                else:
                    json_data = []

                df_temp = pd.DataFrame(json_data)
                
                if not df_temp.empty and 'bps_desa_kelurahan' in df_temp.columns and target_column in df_temp.columns:
                    all_data.append(df_temp[['bps_desa_kelurahan', target_column]])
            else:
                print(f"[-] Gagal fetch: {url} (Status: {response.status_code})")
        except Exception as e:
            print(f"[-] Error pada {url}: {e}")

    if not all_data:
        print(f"Peringatan: Tidak ada data yang berhasil diambil untuk kolom {target_column}.")
        return pd.DataFrame(columns=['bps_desa_kelurahan', target_column])

    df_combined = pd.concat(all_data, ignore_index=True)
    df_combined['bps_desa_kelurahan'] = df_combined['bps_desa_kelurahan'].astype(str).str.strip().str.upper()
    
    if is_text:
        df_combined[target_column] = df_combined[target_column].astype(str)\
                                        .str.replace(r'[^0-9\.,]', '', regex=True)\
                                        .str.replace(',', '.')
        df_combined[target_column] = pd.to_numeric(df_combined[target_column], errors='coerce').fillna(0)
    else:
        df_combined[target_column] = pd.to_numeric(df_combined[target_column], errors='coerce').fillna(0)
        
    df_grouped = df_combined.groupby('bps_desa_kelurahan')[target_column].sum().reset_index()
    return df_grouped

# --- 1. PROSES AMBIL DATA API ---
print("[1/4] Mengambil data RTH...")
df_rth = fetch_and_aggregate(ENDPOINTS_RTH, 'luas_rth', is_text=True)

print("[2/4] Mengambil data Biopori...")
df_biopori = fetch_and_aggregate(ENDPOINTS_BIOPORI, 'jumlah_lubang_biopori', is_text=False)

print("[3/4] Mengambil data Jalan Terpelihara...")
df_jalan = fetch_and_aggregate(ENDPOINTS_JALAN, 'panjang_jalan', is_text=False)

# --- 2. BACA & SIAPKAN GEOJSON ---
print("[4/4] Memproses GeoJSON dan Menghitung Skor...")
gdf_peta = gpd.read_file(PETA_PATH).to_crs(epsg=4326)  # Leaflet butuh WGS84
gdf_peta['NAMOBJ_UPPER'] = gdf_peta['NAMOBJ'].astype(str).str.strip().str.upper()
print(f"Jumlah poligon di peta sumber: {len(gdf_peta)}")
assert len(gdf_peta) > 100, "peta_bandung.geojson belum berisi 151 kelurahan"

jumlah_duplikat = gdf_peta['NAMOBJ_UPPER'].duplicated().sum()
if jumlah_duplikat:
    print(f"[!] {jumlah_duplikat} nama kelurahan kembar di peta; datanya bisa tercampur saat merge.")

# --- 3. MERGE DATA (satu kunci yang sama, tanpa kolom _x/_y) ---
for d in (df_rth, df_biopori, df_jalan):
    d.rename(columns={'bps_desa_kelurahan': 'NAMOBJ_UPPER'}, inplace=True)

gdf_merged = (
    gdf_peta
    .merge(df_rth, on='NAMOBJ_UPPER', how='left')
    .merge(df_biopori, on='NAMOBJ_UPPER', how='left')
    .merge(df_jalan, on='NAMOBJ_UPPER', how='left')
)

# JANGAN fillna(0): wilayah tanpa data harus tetap kosong (null di GeoJSON)
for col, label in [('luas_rth', 'RTH'), ('jumlah_lubang_biopori', 'Biopori'), ('panjang_jalan', 'Jalan')]:
    kosong = gdf_merged.loc[gdf_merged[col].isna(), 'NAMOBJ'].tolist()
    print(f"[!] {label}: {len(kosong)} wilayah tanpa data -> {kosong}")

# --- 4. HITUNG SKOR NORMALISASI (0 - 100) ---
# True = bagi dengan luas wilayah (kolom LUAS) agar adil antar wilayah besar dan kecil
USE_DENSITY = False

def calculate_score(series):
    lo, hi = series.min(), series.max()
    if pd.isna(lo) or hi == lo:
        return pd.Series(0.0, index=series.index).where(series.notna())
    return ((series - lo) / (hi - lo)) * 100

def base_value(df, col):
    if USE_DENSITY:
        return df[col] / df['LUAS_KM2'].replace(0, np.nan)
    return df[col]

gdf_merged['rth_score'] = calculate_score(base_value(gdf_merged, 'luas_rth')).round(1)
gdf_merged['biopori_score'] = calculate_score(base_value(gdf_merged, 'jumlah_lubang_biopori')).round(1)
gdf_merged['jalan_score'] = calculate_score(base_value(gdf_merged, 'panjang_jalan')).round(1)

# gdf_merged = gdf_merged.drop(columns=['NAMOBJ_UPPER'])

# Hapus kolom bantuan
gdf_merged = gdf_merged.drop(columns=['NAMOBJ_UPPER', 'bps_desa_kelurahan_x', 'bps_desa_kelurahan_y', 'bps_desa_kelurahan'], errors='ignore')

# --- 5. EXPORT FINAL DATA KE FOLDER NEXT.JS ---
# Tentukan path menuju folder public/data di Next.js Anda
# Gunakan relative path (mundur 1 folder, lalu masuk ke nextjs-app)
# Sesuaikan 'nextjs-app' dengan nama folder proyek Next.js Anda yang sebenarnya
output_dir = '/Users/mac/Documents/Project/bdo-geospatial/bdo/public/data'  # Ganti dengan path folder public/data Next.js Anda

# Buat foldernya secara otomatis jika belum ada (mencegah error)
os.makedirs(output_dir, exist_ok=True)

# Path lengkap untuk file final
output_path = os.path.join(output_dir, 'bdo_data_final.geojson')

# Simpan file
gdf_merged.to_file(output_path, driver='GeoJSON')
print(f"Jumlah fitur yang diekspor: {len(gdf_merged)}")

print(f"✅ ETL Sukses! File otomatis disimpan ke Next.js: {output_path}")