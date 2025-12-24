import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const teachers = await prisma.teacher.findMany({ include: { user: true } });
  return NextResponse.json({ teachers });
}
export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { name, email, password } = await req.json();
  const hash = await bcrypt.hash(password || 'guru123', 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash: hash, role: 'GURU' } });
  const teacher = await prisma.teacher.create({ data: { userId: user.id } });
  return NextResponse.json({ teacher });
}
export async function PUT(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { teacherId, name, email, password } = await req.json();
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } });
  if (!teacher) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const data: any = {}; if (name) data.name = name; if (email) data.email = email; if (password) data.passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: teacher.userId }, data });
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { teacherId } = await req.json();
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  await prisma.user.delete({ where: { id: teacher.userId } });
  return NextResponse.json({ ok: true });
}
