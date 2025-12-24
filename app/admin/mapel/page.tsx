'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client';

type Subject = { id: number; code: string; name: string };

export default function MapelPage() {
  const [list, setList] = useState<Subject[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  async function load() {
    const res = await apiFetch('/api/admin/subjects');
    const data = await res.json();
    setList(data.subjects || []);
  }
  useEffect(()=>{ load(); }, []);
  async function save() {
    if (!code || !name) return alert('Isi kode & nama');
    if (editId) {
      const res = await apiFetch('/api/admin/subjects', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: editId, code, name }) });
      if (!res.ok) return alert('Gagal update');
    } else {
      const res = await apiFetch('/api/admin/subjects', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code, name }) });
      if (!res.ok) return alert('Gagal tambah');
    }
    setCode(''); setName(''); setEditId(null); load();
  }
  async function del(id:number) {
    if (!confirm('Hapus mapel?')) return;
    const res = await apiFetch('/api/admin/subjects', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    if (!res.ok) return alert('Gagal hapus');
    load();
  }
  function edit(s: Subject) { setEditId(s.id); setCode(s.code); setName(s.name); }
  return (
    <div style={{ padding:24 }}>
      <h2>Pengelola Mapel</h2>
      <div style={{ display:'flex', gap:8, margin:'12px 0' }}>
        <input placeholder="Kode (ex: MAT)" value={code} onChange={e=>setCode(e.target.value)} />
        <input placeholder="Nama Mapel" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={save}>{editId ? 'Update' : 'Tambah'}</button>
        {editId && <button onClick={()=>{setEditId(null); setCode(''); setName('');}}>Batal</button>}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th style={{borderBottom:'1px solid #ddd'}}>Kode</th><th style={{borderBottom:'1px solid #ddd'}}>Nama</th><th style={{borderBottom:'1px solid #ddd'}}>Aksi</th></tr></thead>
        <tbody>
          {list.map(s=> (
            <tr key={s.id}>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>{s.code}</td>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>{s.name}</td>
              <td style={{borderBottom:'1px solid #f0f0f0'}}>
                <button onClick={()=>edit(s)}>Edit</button> <button onClick={()=>del(s.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
