'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client';

type TeacherRow = { id:number; user:{ id:number; name:string; email:string } };

export default function GuruPage() {
  const [list, setList] = useState<TeacherRow[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  async function load() { const res = await apiFetch('/api/admin/teachers'); const data = await res.json(); setList(data.teachers || []); }
  useEffect(()=>{ load(); }, []);
  async function save() {
    if (!name || !email) return alert('Isi nama & email');
    if (editId) {
      const res = await apiFetch('/api/admin/teachers', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ teacherId: editId, name, email, password: password || undefined }) });
      if (!res.ok) return alert('Gagal update');
    } else {
      const res = await apiFetch('/api/admin/teachers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password: password || 'guru123' }) });
      if (!res.ok) return alert('Gagal tambah');
    }
    setName(''); setEmail(''); setPassword(''); setEditId(null); load();
  }
  async function del(id:number) {
    if (!confirm('Hapus guru beserta akun?')) return;
    const res = await apiFetch('/api/admin/teachers', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ teacherId: id }) });
    if (!res.ok) return alert('Gagal hapus');
    load();
  }
  function edit(row: TeacherRow) { setEditId(row.id); setName(row.user.name); setEmail(row.user.email); setPassword(''); }
  return (
    <div style={{ padding: 24 }}>
      <h2>Pengelola Guru</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, margin:'12px 0' }}>
        <input placeholder="Nama Guru" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password (opsional)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div>
          <button onClick={save}>{editId ? 'Update' : 'Tambah'}</button>
          {editId && <button onClick={()=>{setEditId(null); setName(''); setEmail(''); setPassword('');}}>Batal</button>}
        </div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th style={{borderBottom:'1px solid #ddd'}}>Nama</th><th style={{borderBottom:'1px solid #ddd'}}>Email</th><th style={{borderBottom:'1px solid #ddd'}}>Aksi</th></tr></thead>
        <tbody>
          {list.map(r=> (
            <tr key={r.id}>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>{r.user.name}</td>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>{r.user.email}</td>
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
