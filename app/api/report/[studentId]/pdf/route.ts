import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import { PrismaClient } from '@prisma/client';
import { createStreamedPDF } from '@/lib/pdf';
export const runtime = 'nodejs';
const prisma = new PrismaClient();
function drawTable(doc: any, x: number, y: number, headers: string[], rows: string[][], colWidths: number[]) {
  const rowHeight = 18; doc.fontSize(9);
  let cursorX = x, cursorY = y;
  headers.forEach((h, i) => { doc.rect(cursorX, cursorY, colWidths[i], rowHeight).stroke(); doc.text(h, cursorX + 4, cursorY + 4, { width: colWidths[i] - 8 }); cursorX += colWidths[i]; });
  cursorY += rowHeight; rows.forEach(r => { cursorX = x; r.forEach((cell, i) => { doc.rect(cursorX, cursorY, colWidths[i], rowHeight).stroke(); doc.text(cell ?? '-', cursorX + 4, cursorY + 4, { width: colWidths[i] - 8 }); cursorX += colWidths[i]; }); cursorY += rowHeight; });
}
export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN, ROLES.WALI_KELAS, ROLES.SISWA, ROLES.ORANG_TUA], auth.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url); const semester = Number(searchParams.get('semester') || 1); const tahun = String(searchParams.get('tahun') || '2024/2025');
  const student = await prisma.student.findUnique({ where: { id: Number(params.studentId) }, include: { user: true, class: true } });
  if (!student) return NextResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
  const grades = await prisma.grade.findMany({ where: { studentId: student.id, semester, year: tahun }, include: { subject: true }, orderBy: [{ subject: { name: 'asc' } }] });
  const attend = await prisma.attendance.findUnique({ where: { studentId_semester_year: { studentId: student.id, semester, year: tahun } } });
  const eskul = await prisma.eskulScore.findMany({ where: { studentId: student.id, semester, year: tahun }, include: { extracurricular: true } });
  const remark = await prisma.homeroomRemark.findUnique({ where: { studentId_semester_year: { studentId: student.id, semester, year: tahun } } });
  const schoolName = process.env.SCHOOL_NAME || 'SMP Negeri 2 Ngunut';
  const stream = createStreamedPDF((doc) => {
    doc.fontSize(14).text(schoolName, { align: 'center' }); doc.fontSize(12).text('RAPOR SEMESTER', { align: 'center' }); doc.moveDown();
    doc.fontSize(10); doc.text(`Nama   : ${student.user.name}`); doc.text(`NISN   : ${student.nisn}`); doc.text(`Kelas  : ${student.class?.name || '-'}`); doc.text(`Tahun/Semester : ${tahun} / ${semester}`); doc.moveDown();
    const headers = ['Mapel','Harian','Tugas','PTS','SAS','Rapor']; const subjects = Array.from(new Set(grades.map(g => g.subject.name)));
    const rows = subjects.map(m => { const find = (t: string) => grades.find(g => g.subject.name === m && g.type === t)?.value; return [ m, String(find('HARIAN') ?? '-'), String(find('TUGAS') ?? '-'), String(find('PTS') ?? '-'), String(find('SAS') ?? '-'), String(find('RAPOR') ?? '-') ]; });
    drawTable(doc, 36, doc.y, headers, rows as any, [140,60,60,60,60,60]);
    doc.moveDown(); doc.fontSize(11).text('Capaian Kompetensi:', { underline: true }); subjects.forEach(m => { const desc = grades.find(g => g.subject.name === m && g.type === 'RAPOR')?.desc; if (desc) doc.fontSize(9).text(`• ${m}: ${desc}`); });
    doc.moveDown(); doc.fontSize(11).text('Absensi:', { underline: true }); doc.fontSize(10).text(`Sakit: ${attend?.sakit ?? 0}  |  Izin: ${attend?.izin ?? 0}  |  Alfa: ${attend?.alfa ?? 0}`);
    doc.moveDown(); doc.fontSize(11).text('Ekstrakurikuler:', { underline: true }); eskul.forEach(e => { doc.fontSize(10).text(`${e.extracurricular.name}: ${e.nilai}${e.catatan ? ` (${e.catatan})` : ''}`); });
    doc.moveDown(); doc.fontSize(11).text('Catatan Wali Kelas:', { underline: true }); doc.fontSize(10).text(remark?.note ?? '-');
    doc.moveDown(2); const yStart = doc.y; doc.fontSize(10).text('Orang Tua/Wali', 36, yStart); doc.fontSize(10).text('Wali Kelas', 420, yStart); doc.text('__________________', 36, yStart + 60); doc.text('__________________', 420, yStart + 60);
  });
  return new NextResponse(stream as any, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="rapor_${student.nisn}_${semester}.pdf"` } });
}
