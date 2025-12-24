'use client';
import { useEffect, useState } from 'react';

export default function SiswaDashboard() {
  const [data, setData] = useState<any>(null);
  const [semester, setSemester] = useState(1);
  const [tahun, setTahun] = useState('2024/2025');

  useEffect(() => {
    const token = localStorage.getItem('token');
    (async () => {
      const res = await fetch(`/api/student/grades?semester=${semester}&tahun=${encodeURIComponent(tahun)}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setData(d);
    })();
  }, [semester, tahun]);

  async function cetakRapor() {
    const token = localStorage.getItem('token');
    if (!data?.grades?.length) return alert('Data nilai belum ada');
    const studentId = data.grades[0].studentId; // ambil dari daftar nilai
    const url = `/api/report/${studentId}/pdf?semester=${semester}&tahun=${encodeURIComponent(tahun)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `rapor_${semester}.pdf`; a.click();
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard Siswa/Orang Tua</h2>
      <div>
        <input type="number" value={semester} onChange={e=>setSemester(Number(e.target.value))} />
        <input value={tahun} onChange={e=>setTahun(e.target.value)} />
        <button onClick={cetakRapor}>Cetak Rapor (PDF)</button>
      </div>
      <pre style={{ background:'#f8f8f8', padding:12 }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
