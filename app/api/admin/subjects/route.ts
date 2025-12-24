import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const subjects = await prisma.subject.findMany();
  return NextResponse.json({ subjects });
}
export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { code, name } = await req.json();
  const subject = await prisma.subject.create({ data: { code, name } });
  return NextResponse.json({ subject });
}
export async function PUT(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id, code, name } = await req.json();
  const subject = await prisma.subject.update({ where: { id }, data: { code, name } });
  return NextResponse.json({ subject });
}
export async function DELETE(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await prisma.subject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
