'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [roleMode, setRoleMode] = useState<'EMAIL'|'SISWA_NISN'>('EMAIL');
  const [email, setEmail] = useState('admin@sekolah.local');
  const [nisn, setNisn] = useState('1234567890');
  const [password, setPassword] = useState('admin123');

  async function login() {
    const body = roleMode === 'SISWA_NISN' ? { mode: 'SISWA_NISN', nisn, password } : { mode: 'EMAIL', email, password };
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    localStorage.setItem('token', data.token);
    document.cookie = `token=${data.token}; path=/; max-age=${60*60*8}`;
    const role = data.user.role;
    const target = role === 'ADMIN' ? '/admin/dashboard' : role === 'GURU' ? '/guru/dashboard' : role === 'WALI_KELAS' ? '/walikelas/dashboard' : '/siswa/dashboard';
    location.href = target;
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fafafa' }}>
      <h2>Login Rapor Digital</h2>
      <div style={{ margin: '8px 0' }}>
        <label><input type="radio" checked={roleMode==='EMAIL'} onChange={()=>setRoleMode('EMAIL')}/> Admin/Guru/Wali via Email</label><br/>
        <label><input type="radio" checked={roleMode==='SISWA_NISN'} onChange={()=>setRoleMode('SISWA_NISN')}/> Siswa via NISN</label>
      </div>
      {roleMode==='EMAIL' ? (
        <>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ width:'100%', padding:8, margin:'8px 0' }}/>
          <input placeholder="Password" value={password} type="password" onChange={e=>setPassword(e.target.value)} style={{ width:'100%', padding:8, margin:'8px 0' }}/>
        </>
      ) : (
        <>
          <input placeholder="NISN" value={nisn} onChange={e=>setNisn(e.target.value)} style={{ width:'100%', padding:8, margin:'8px 0' }}/>
          <input placeholder="Password" value={password} type="password" onChange={e=>setPassword(e.target.value)} style={{ width:'100%', padding:8, margin:'8px 0' }}/>
        </>
      )}
      <button onClick={login} style={{ padding:'8px 12px', background:'#6c8', color:'#fff', border:0, borderRadius:6 }}>Login</button>
    </div>
  );
}
