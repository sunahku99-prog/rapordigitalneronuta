'use client';
import { useState } from 'react';

export default function WaliKelasDashboard() {
  const [absensiFile, setAbsensiFile] = useState<File | null>(null);
  const [eskulFile, setEskulFile] = useState<File | null>(null);
  const [nisn, setNisn] = useState('');
  const [note, setNote] = useState('');
  const [semester, setSemester] = useState(1);
  const [tahun, setTahun] = useState('2024/2025');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  async function uploadAbsensi() {
    if (!absensiFile || !token) return;
    const fd = new FormData(); fd.append('file', absensiFile);
    const res = await fetch('/api/walikelas/absensi/import', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json(); alert(res.ok ? 'OK' : data.message);
  }
  async function uploadEskul() {
    if (!eskulFile || !token) return;
    const fd = new FormData(); fd.append('file', eskulFile);
    const res = await fetch('/api/walikelas/eskul/import', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json(); alert(res.ok ? 'OK' : data.message);
  }
  async function simpanCatatan() {
    if (!token) return;
    const res = await fetch('/api/walikelas/remarks', { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ nisn, semester, tahun, note }) });
    const data = await res.json(); alert(res.ok ? 'OK' : data.message);
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard Wali Kelas</h2>
      <div style={{ margin: '12px 0' }}>
        <a href="/templates/TEMPLATE_ABSENSI.xlsx" download>Unduh Template Absensi</a> &nbsp;|&nbsp;
        <a href="/templates/TEMPLATE_ESKUL.xlsx" download>Unduh Template Eskul</a>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h4>Import Absensi (Sheet: Absensi)</h4>
        <input type="file" accept=".xlsx,.xls" onChange={e=>setAbsensiFile(e.target.files?.[0] || null)} />
        <button onClick={uploadAbsensi}>Upload</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h4>Import Ekstrakurikuler (Sheet: Eskul)</h4>
        <input type="file" accept=".xlsx,.xls" onChange={e=>setEskulFile(e.target.files?.[0] || null)} />
        <button onClick={uploadEskul}>Upload</button>
      </div>
      <div>
        <h4>Catatan Wali Kelas</h4>
        <input placeholder="NISN" value={nisn} onChange={e=>setNisn(e.target.value)} />
        <input placeholder="Semester" type="number" value={semester} onChange={e=>setSemester(Number(e.target.value))} />
        <input placeholder="Tahun (2024/2025)" value={tahun} onChange={e=>setTahun(e.target.value)} />
        <textarea placeholder="Catatan" value={note} onChange={e=>setNote(e.target.value)} />
        <button onClick={simpanCatatan}>Simpan</button>
      </div>
    </div>
  );
}
