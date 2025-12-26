import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: ['/admin/:path*', '/guru/:path*', '/walikelas/:path*', '/siswa/:path*'] };

export function middleware(req: NextRequest) {
  // Simple check: if no token, redirect to login
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Allow request to continue
  return NextResponse.next();
}
