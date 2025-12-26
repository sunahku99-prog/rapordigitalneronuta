import { NextRequest, NextResponse } from 'next/server';

// Temporarily disabled to debug 404 issue
// export const config = { matcher: ['/admin/:path*', '/guru/:path*', '/walikelas/:path*', '/siswa/:path*'] };

export function middleware(req: NextRequest) {
  return NextResponse.next();
}
