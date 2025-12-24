export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const go = (p: string) => () => location.href = p;
  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard Admin</h2>
      <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <button onClick={go('/admin/mapel')}>Pengelola Mapel</button>
        <button onClick={go('/admin/siswa')}>Pengelola Siswa</button>
        <button onClick={go('/admin/guru')}>Pengelola Guru</button>
        <button onClick={go('/admin/eskul')}>Pengelola Ekstrakurikuler</button>
        <button onClick={go('/walikelas/dashboard')}>Cetak Rapor & Leger</button>
      </div>
    </div>
  );
}
