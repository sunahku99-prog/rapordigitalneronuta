import * as XLSX from 'xlsx';

export type NilaiHarianRow = {
  NO?: number;
  NISN: string;
  NAMA_SISWA?: string;
  MAPEL_KODE: string;
  SEMESTER: number;
  TAHUN: string;
  NILAI_HARIAN_DAN_TUGAS?: number;
  NILAI_PTS?: number;
  NILAI_SAS?: number;
  H1?: number; H2?: number; H3?: number; H4?: number; H5?: number;
};

export type NilaiRaporRow = {
  NO?: number;
  NISN: string;
  NAMA_SISWA?: string;
  MAPEL_KODE: string;
  SEMESTER: number;
  TAHUN: string;
  NILAI_RAPOR: number;
  CAPAIAN_KOMPETENSI?: string;
};

export function parseNilaiHarian(buffer: Buffer): NilaiHarianRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheet = wb.Sheets['NilaiHarian'] || wb.Sheets['Sheet1'];
  if (!sheet) throw new Error('Sheet "NilaiHarian" tidak ditemukan');
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });
  return rows.map((r: any) => ({
    NO: r.NO ?? null,
    NISN: String(r.NISN),
    NAMA_SISWA: r['NAMA SISWA'] ?? null,
    MAPEL_KODE: String(r.MAPEL_KODE),
    SEMESTER: Number(r.SEMESTER),
    TAHUN: String(r.TAHUN),
    NILAI_HARIAN_DAN_TUGAS: r['NILAI HARIAN DAN TUGAS'] != null ? Number(r['NILAI HARIAN DAN TUGAS']) : undefined,
    NILAI_PTS: r['NILAI PTS'] != null ? Number(r['NILAI PTS']) : undefined,
    NILAI_SAS: r['NILAI SAS'] != null ? Number(r['NILAI SAS']) : undefined,
    H1: r.H1 != null ? Number(r.H1) : undefined,
    H2: r.H2 != null ? Number(r.H2) : undefined,
    H3: r.H3 != null ? Number(r.H3) : undefined,
    H4: r.H4 != null ? Number(r.H4) : undefined,
    H5: r.H5 != null ? Number(r.H5) : undefined,
  }));
}

export function parseNilaiRapor(buffer: Buffer): NilaiRaporRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheet = wb.Sheets['NilaiRapor'] || wb.Sheets['Sheet1'];
  if (!sheet) throw new Error('Sheet "NilaiRapor" tidak ditemukan');
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });
  return rows.map((r: any) => ({
    NO: r.NO ?? null,
    NISN: String(r.NISN),
    NAMA_SISWA: r['NAMA SISWA'] ?? null,
    MAPEL_KODE: String(r.MAPEL_KODE),
    SEMESTER: Number(r.SEMESTER),
    TAHUN: String(r.TAHUN),
    NILAI_RAPOR: Number(r['NILAI RAPOR']),
    CAPAIAN_KOMPETENSI: r['CAPAIAN KOMPETENSI'] != null ? String(r['CAPAIAN KOMPETENSI']) : undefined,
  }));
}
