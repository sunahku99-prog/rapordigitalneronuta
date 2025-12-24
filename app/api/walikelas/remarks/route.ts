import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import { PrismaClient } from '@prisma/client';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.WALI_KELAS], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { nisn, semester, tahun, note } = await req.json();
  const student = await prisma.student.findUnique({ where: { nisn } });
  if (!student) return NextResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
  await prisma.homeroomRemark.upsert({ where: { studentId_semester_year: { studentId: student.id, semester: Number(semester), year: String(tahun) } }, update: { note }, create: { studentId: student.id, semester: Number(semester), year: String(tahun), note } });
  return NextResponse.json({ message: 'Catatan wali kelas tersimpan' });
}
