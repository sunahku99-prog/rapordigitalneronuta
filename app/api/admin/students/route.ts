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
  const students = await prisma.student.findMany({ include: { user: true, class: true } });
  return NextResponse.json({ students });
}
export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { name, nisn, classId, password } = await req.json();
  const hash = await bcrypt.hash(password || 'siswa123', 10);
  const user = await prisma.user.create({ data: { name, email: `${nisn}@siswa.local`, passwordHash: hash, role: 'SISWA' } });
  const student = await prisma.student.create({ data: { userId: user.id, nisn, classId } });
  return NextResponse.json({ student });
}
export async function PUT(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { studentId, name, nisn, classId, password } = await req.json();
  const student = await prisma.student.update({ where: { id: studentId }, data: { nisn, classId } });
  if (name || password) {
    const data: any = {}; if (name) data.name = name; if (password) data.passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: student.userId }, data });
  }
  return NextResponse.json({ student });
}
export async function DELETE(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { studentId } = await req.json();
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  await prisma.user.delete({ where: { id: student.userId } });
  return NextResponse.json({ ok: true });
}
