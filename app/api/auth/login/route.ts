import { NextRequest, NextResponse } from 'next/server';
import { authenticateByEmail, authenticateStudentByNISN, issueToken } from '@/lib/auth';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { mode, email, nisn, password } = await req.json();
  let user: any = null;
  if (mode === 'SISWA_NISN') {
    if (!nisn || !password) return NextResponse.json({ message: 'NISN & password wajib' }, { status: 400 });
    user = await authenticateStudentByNISN(nisn, password);
  } else {
    if (!email || !password) return NextResponse.json({ message: 'Email & password wajib' }, { status: 400 });
    user = await authenticateByEmail(email, password);
  }
  if (!user) return NextResponse.json({ message: 'Kredensial salah' }, { status: 401 });
  const token = issueToken({ id: user.id, role: user.role, name: user.name, email: user.email || null });
  return NextResponse.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}
