import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import { PrismaClient } from '@prisma/client';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.SISWA, ROLES.ORANG_TUA], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const semester = Number(searchParams.get('semester') || 1);
  const tahun = String(searchParams.get('tahun') || '2024/2025');
  let studentId: number | null = null;
  if (auth.role === ROLES.SISWA) {
    const s = await prisma.student.findUnique({ where: { userId: auth.userId } });
    studentId = s?.id || null;
  } else {
    const p = await prisma.parent.findUnique({ where: { userId: auth.userId }, include: { student: true } });
    studentId = p?.student.id || null;
  }
  if (!studentId) return NextResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
  const grades = await prisma.grade.findMany({ where: { studentId, semester, year: tahun }, include: { subject: true } });
  const attend = await prisma.attendance.findUnique({ where: { studentId_semester_year: { studentId, semester, year: tahun } } });
  const eskul = await prisma.eskulScore.findMany({ where: { studentId, semester, year: tahun }, include: { extracurricular: true } });
  const remark = await prisma.homeroomRemark.findUnique({ where: { studentId_semester_year: { studentId, semester, year: tahun } } });
  return NextResponse.json({ grades, attend, eskul, remark });
}
