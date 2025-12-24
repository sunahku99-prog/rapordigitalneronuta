'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client';

type StudentRow = { id:number; nisn:string; user:{ id:number; name:string }; class?:{ id:number; name:string } };

export default function SiswaPage() {
  const [list, setList] = useState<StudentRow[]>([]);
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  async function load() {
    const res = await apiFetch('/api/admin/students');
    const data = await res.json();
    setList(data.students || []);
  }
  useEffect(()=>{ load(); }, []);
  async function save() {
    if (!nisn || !name) return alert('Isi NISN & Nama');
    if (editId) {
      const res = await apiFetch('/api/admin/students', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ studentId: editId, name, nisn, classId, password: password || undefined }) });
      if (!res.ok) return alert('Gagal update');
    } else {
      const res = await apiFetch('/api/admin/students', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, nisn, classId, password: password || 'siswa123' }) });
      if (!res.ok) return alert('Gagal tambah');
    }
    setName(''); setNisn(''); setClassId(undefined); setPassword(''); setEditId(null); load();
  }
  async function del(studentId:number) {
    if (!confirm('Hapus siswa beserta akun?')) return;
    const res = await apiFetch('/api/admin/students', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ studentId }) });
    if (!res.ok) return alert('Gagal hapus');
    load();
  }
  function edit(row: StudentRow) { setEditId(row.id); setName(row.user.name); setNisn(row.nisn); setClassId(row.class?.id); setPassword(''); }
  return (
    <div style={{ padding:24 }}>
      <h2>Pengelola Siswa</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, margin:'12px 0' }}>
        <input placeholder="Nama Siswa" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="NISN" value={nisn} onChange={e=>setNisn(e.target.value)} />
        <input placeholder="ClassId (opsional)" value={classId ?? ''} onChange={e=>setClassId(e.target.value?Number(e.target.value):undefined)} />
        <input placeholder="Password (opsional)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div>
          <button onClick={save}>{editId ? 'Update' : 'Tambah'}</button>
          {editId && <button onClick={()=>{setEditId(null); setName(''); setNisn(''); setClassId(undefined); setPassword('');}}>Batal</button>}
        </div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th style={{borderBottom:'1px solid #ddd'}}>Nama</th><th style={{borderBottom:'1px solid #ddd'}}>NISN</th><th style={{borderBottom:'1px solid #ddd'}}>Kelas</th><th style={{borderBottom:'1px solid #ddd'}}>Aksi</th></tr></thead>
        <tbody>
          {list.map(r=> (
            <tr key={r.id}>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>{r.user.name}</td>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>{r.nisn}</td>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>{r.class?.name || '-'}</td>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>
                <button onClick={()=>edit(r)}>Edit</button> <button onClick={()=>del(r.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
