import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import { parseNilaiRapor } from '@/lib/xlsx';
import { PrismaClient } from '@prisma/client';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.GURU], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file') as File | null; if (!file) return NextResponse.json({ message: 'File tidak ada' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  let rows; try { rows = parseNilaiRapor(buf); } catch (e:any) { return NextResponse.json({ message: e.message }, { status: 400 }); }
  const teacher = await prisma.teacher.findUnique({ where: { userId: auth.userId } });
  if (!teacher) return NextResponse.json({ message: 'Guru tidak ditemukan' }, { status: 404 });
  for (const r of rows) {
    const student = await prisma.student.findUnique({ where: { nisn: r.NISN } });
    const subject = await prisma.subject.findUnique({ where: { code: r.MAPEL_KODE } });
    if (!student || !subject) continue;
    await prisma.grade.create({ data: { studentId: student.id, subjectId: subject.id, teacherId: teacher.id, type: 'RAPOR', value: r.NILAI_RAPOR, semester: r.SEMESTER, year: r.TAHUN, desc: r.CAPAIAN_KOMPETENSI || null } });
  }
  return NextResponse.json({ message: 'Import Nilai Rapor selesai', count: rows.length });
}
