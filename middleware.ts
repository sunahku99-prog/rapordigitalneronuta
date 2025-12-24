import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

function decode(req: NextRequest) {
  const header = req.headers.get('authorization') || req.cookies.get('token')?.value || '';
  const token = header.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload as { role: string };
  } catch { return null; }
}

export const config = { matcher: ['/admin/:path*', '/guru/:path*', '/walikelas/:path*', '/siswa/:path*'] };

export function middleware(req: NextRequest) {
  const payload = decode(req);
  const url = req.nextUrl;
  const path = url.pathname;
  if (!payload) return NextResponse.redirect(new URL('/login', req.url));
  const role = payload.role;
  const ok = (path.startsWith('/admin') && role === 'ADMIN') ||
             (path.startsWith('/guru') && role === 'GURU') ||
             (path.startsWith('/walikelas') && role === 'WALI_KELAS') ||
             (path.startsWith('/siswa') && (role === 'SISWA' || role === 'ORANG_TUA'));
  if (!ok) {
    const target = role === 'ADMIN' ? '/admin/dashboard' : role === 'GURU' ? '/guru/dashboard' : role === 'WALI_KELAS' ? '/walikelas/dashboard' : '/siswa/dashboard';
    return NextResponse.redirect(new URL(target, req.url));
  }
  return NextResponse.next();
}
