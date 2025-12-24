import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import { parseNilaiHarian } from '@/lib/xlsx';
import { PrismaClient } from '@prisma/client';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.GURU], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file') as File | null; if (!file) return NextResponse.json({ message: 'File tidak ada' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  let rows; try { rows = parseNilaiHarian(buf); } catch (e:any) { return NextResponse.json({ message: e.message }, { status: 400 }); }
  const teacher = await prisma.teacher.findUnique({ where: { userId: auth.userId } });
  if (!teacher) return NextResponse.json({ message: 'Guru tidak ditemukan' }, { status: 404 });
  for (const r of rows) {
    const student = await prisma.student.findUnique({ where: { nisn: r.NISN } });
    const subject = await prisma.subject.findUnique({ where: { code: r.MAPEL_KODE } });
    if (!student || !subject) continue;
    const harianKeys: (keyof typeof r)[] = ['H1','H2','H3','H4','H5'];
    for (const k of harianKeys) {
      const val = r[k as keyof typeof r] as number | undefined;
      if (val != null) {
        await prisma.grade.create({ data: { studentId: student.id, subjectId: subject.id, teacherId: teacher.id, type: 'HARIAN', value: val, semester: r.SEMESTER, year: r.TAHUN } });
      }
    }
    if (r.NILAI_HARIAN_DAN_TUGAS != null) {
      await prisma.grade.create({ data: { studentId: student.id, subjectId: subject.id, teacherId: teacher.id, type: 'TUGAS', value: r.NILAI_HARIAN_DAN_TUGAS, semester: r.SEMESTER, year: r.TAHUN } });
    }
    if (r.NILAI_PTS != null) {
      await prisma.grade.create({ data: { studentId: student.id, subjectId: subject.id, teacherId: teacher.id, type: 'PTS', value: r.NILAI_PTS, semester: r.SEMESTER, year: r.TAHUN } });
    }
    if (r.NILAI_SAS != null) {
      await prisma.grade.create({ data: { studentId: student.id, subjectId: subject.id, teacherId: teacher.id, type: 'SAS', value: r.NILAI_SAS, semester: r.SEMESTER, year: r.TAHUN } });
    }
  }
  return NextResponse.json({ message: 'Import Nilai Harian/Tugas/PTS/SAS selesai', count: rows.length });
}
