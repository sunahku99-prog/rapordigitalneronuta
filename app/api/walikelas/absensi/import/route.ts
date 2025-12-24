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
  const sheet = wb.Sheets['Absensi'] || wb.Sheets['Sheet1'];
  if (!sheet) return NextResponse.json({ message: 'Sheet "Absensi" tidak ada' }, { status: 400 });
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });
  for (const r of rows) {
    const student = await prisma.student.findUnique({ where: { nisn: String(r.NISN) } });
    if (!student) continue;
    await prisma.attendance.upsert({
      where: { studentId_semester_year: { studentId: student.id, semester: Number(r.SEMESTER), year: String(r.TAHUN) } },
      update: { sakit: Number(r.SAKIT || 0), izin: Number(r.IZIN || 0), alfa: Number(r.ALFA || 0) },
      create: { studentId: student.id, semester: Number(r.SEMESTER), year: String(r.TAHUN), sakit: Number(r.SAKIT || 0), izin: Number(r.IZIN || 0), alfa: Number(r.ALFA || 0) },
    });
  }
  return NextResponse.json({ message: 'Import absensi selesai', count: rows.length });
}
