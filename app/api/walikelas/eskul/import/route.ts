import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.WALI_KELAS], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file') as File | null; if (!file) return NextResponse.json({ message: 'File tidak ada' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets['Eskul'] || wb.Sheets['Sheet1'];
  if (!sheet) return NextResponse.json({ message: 'Sheet "Eskul" tidak ada' }, { status: 400 });
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });
  for (const r of rows) {
    const student = await prisma.student.findUnique({ where: { nisn: String(r.NISN) } });
    const eskul = await prisma.extracurricular.findUnique({ where: { code: String(r.ESKUL_KODE) } });
    if (!student || !eskul) continue;
    await prisma.eskulScore.upsert({
      where: { studentId_extracurricularId_semester_year: { studentId: student.id, extracurricularId: eskul.id, semester: Number(r.SEMESTER), year: String(r.TAHUN) } },
      update: { nilai: String(r.NILAI || ''), catatan: r.CATATAN ? String(r.CATATAN) : null },
      create: { studentId: student.id, extracurricularId: eskul.id, semester: Number(r.SEMESTER), year: String(r.TAHUN), nilai: String(r.NILAI || ''), catatan: r.CATATAN ? String(r.CATATAN) : null },
    });
  }
  return NextResponse.json({ message: 'Import eskul selesai', count: rows.length });
}
