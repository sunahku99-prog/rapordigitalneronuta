import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import { PrismaClient } from '@prisma/client';
import { createStreamedPDF } from '@/lib/pdf';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
function drawTable(doc: any, x: number, y: number, headers: string[], rows: (string|number)[][], colWidths: number[]) {
  const rowH = 18; doc.fontSize(9); let cx = x, cy = y;
  headers.forEach((h, i) => { doc.rect(cx, cy, colWidths[i], rowH).stroke(); doc.text(h, cx + 4, cy + 4, { width: colWidths[i] - 8 }); cx += colWidths[i]; });
  cy += rowH; rows.forEach(r => { cx = x; r.forEach((cell, i) => { doc.rect(cx, cy, colWidths[i], rowH).stroke(); doc.text(String(cell ?? '-'), cx + 4, cy + 4, { width: colWidths[i] - 8 }); cx += colWidths[i]; }); cy += rowH; });
}
export async function GET(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN, ROLES.WALI_KELAS], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const classId = Number(searchParams.get('classId')); const semester = Number(searchParams.get('semester') || 1); const tahun = String(searchParams.get('tahun') || '2024/2025');
  const kelas = await prisma.class.findUnique({ where: { id: classId } }); if (!kelas) return NextResponse.json({ message: 'Kelas tidak ditemukan' }, { status: 404 });
  const students = await prisma.student.findMany({ where: { classId }, include: { user: true } });
  const raporGrades = await prisma.grade.findMany({ where: { semester, year: tahun, type: 'RAPOR', studentId: { in: students.map(s => s.id) } }, include: { subject: true } });
  const subjectNames = Array.from(new Set(raporGrades.map(g => g.subject.name))).sort();
  const raporMap = new Map<string, number>(); raporGrades.forEach(g => { raporMap.set(`${g.studentId}|${g.subject.name}`, g.value); });
  const schoolName = process.env.SCHOOL_NAME || 'SMP Negeri 2 Ngunut';
  const stream = createStreamedPDF((doc) => {
    doc.fontSize(14).text(`Leger Nilai - ${kelas.name}`, { align: 'center' });
    doc.fontSize(10).text(`Sekolah: ${schoolName}`, { align: 'center' });
    doc.fontSize(10).text(`Tahun/Semester: ${tahun} / ${semester}`, { align: 'center' });
    doc.moveDown();
    const headers = ['No', 'Nama Siswa', 'NISN', ...subjectNames];
    const baseWidths = [30, 150, 80];
    const remaining = 540 - baseWidths.reduce((a,b)=>a+b,0);
    const perSubj = subjectNames.length ? Math.max(50, Math.floor(remaining / subjectNames.length)) : 60;
    const colWidths = [...baseWidths, ...subjectNames.map(()=>perSubj)];
    const rows = students.map((s, idx) => { const perMapel = subjectNames.map(m => raporMap.get(`${s.id}|${m}`) ?? '-'); return [idx+1, s.user.name, s.nisn, ...perMapel]; });
    drawTable(doc, 36, doc.y, headers, rows, colWidths);
    doc.moveDown(2); const yStart = doc.y; doc.fontSize(10).text('Wali Kelas', 36, yStart); doc.fontSize(10).text('Kepala Sekolah', 420, yStart); doc.text('__________________', 36, yStart + 60); doc.text('__________________', 420, yStart + 60);
  });
  return new NextResponse(stream as any, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="leger_${kelas.name}_${semester}.pdf"` } });
}
