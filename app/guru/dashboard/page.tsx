'use client';
import { useState } from 'react';

export default function GuruDashboard() {
  const [fileHarian, setFileHarian] = useState<File | null>(null);
  const [fileRapor, setFileRapor] = useState<File | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  async function uploadHarian() {
    if (!fileHarian || !token) return alert('Pilih file Nilai Harian');
    const fd = new FormData(); fd.append('file', fileHarian);
    const res = await fetch('/api/teacher/grades/harian/import', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json(); alert(res.ok ? `Import Harian OK (${data.count})` : data.message);
  }
  async function uploadRapor() {
    if (!fileRapor || !token) return alert('Pilih file Nilai Rapor');
    const fd = new FormData(); fd.append('file', fileRapor);
    const res = await fetch('/api/teacher/grades/rapor/import', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json(); alert(res.ok ? `Import Rapor OK (${data.count})` : data.message);
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard Guru</h2>
      <div style={{ margin: '12px 0' }}>
        <a href="/templates/TEMPLATE_NILAI_HARIAN.xlsx" download>Unduh Template Nilai Harian</a> &nbsp;|&nbsp;
        <a href="/templates/TEMPLATE_NILAI_RAPOR.xlsx" download>Unduh Template Nilai Rapor</a>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h4>Upload Nilai Harian (H1..H5, TUGAS, PTS, SAS)</h4>
        <input type="file" accept=".xlsx,.xls" onChange={e=>setFileHarian(e.target.files?.[0] || null)} />
        <button onClick={uploadHarian}>Upload</button>
      </div>
      <div>
        <h4>Upload Nilai Rapor (Nilai + Capaian Kompetensi)</h4>
        <input type="file" accept=".xlsx,.xls" onChange={e=>setFileRapor(e.target.files?.[0] || null)} />
        <button onClick={uploadRapor}>Upload</button>
      </div>
    </div>
  );
}
