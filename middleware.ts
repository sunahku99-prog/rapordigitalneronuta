import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: ['/admin/:path*', '/guru/:path*', '/walikelas/:path*', '/siswa/:path*'] };

export function middleware(req: NextRequest) {
  // Edge Runtime: just check if token exists, don't verify it
  // Actual JWT verification happens in API routes (runtime = 'nodejs')
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}
