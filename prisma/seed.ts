import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const guruPass  = await bcrypt.hash('guru123', 10);
  const waliPass  = await bcrypt.hash('wali123', 10);
  const siswaPass = await bcrypt.hash('siswa123', 10);
  const ortuPass  = await bcrypt.hash('ortu123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@sekolah.local' },
    update: {},
    create: { name: 'Admin', email: 'admin@sekolah.local', passwordHash: adminPass, role: 'ADMIN' },
  });

  const guruUser = await prisma.user.upsert({
    where: { email: 'guru@sekolah.local' },
    update: {},
    create: { name: 'Guru Matematika', email: 'guru@sekolah.local', passwordHash: guruPass, role: 'GURU' },
  });
  await prisma.teacher.upsert({ where: { userId: guruUser.id }, update: {}, create: { userId: guruUser.id } });

  const waliUser = await prisma.user.upsert({
    where: { email: 'wali@sekolah.local' },
    update: {},
    create: { name: 'Wali VII-A', email: 'wali@sekolah.local', passwordHash: waliPass, role: 'WALI_KELAS' },
  });

  const kelas = await prisma.class.upsert({ where: { id: 1 }, update: {}, create: { name: 'VII-A', homeroomId: waliUser.id } });

  const siswaUser = await prisma.user.upsert({
    where: { email: 'siswa@sekolah.local' },
    update: {},
    create: { name: 'Siswa Contoh', email: 'siswa@sekolah.local', passwordHash: siswaPass, role: 'SISWA' },
  });
  await prisma.student.upsert({ where: { userId: siswaUser.id }, update: {}, create: { userId: siswaUser.id, nisn: '1234567890', classId: kelas.id } });

  const ortuUser = await prisma.user.upsert({
    where: { email: 'ortu@sekolah.local' },
    update: {},
    create: { name: 'Orang Tua Siswa', email: 'ortu@sekolah.local', passwordHash: ortuPass, role: 'ORANG_TUA' },
  });
  const s = await prisma.student.findUnique({ where: { userId: siswaUser.id } });
  await prisma.parent.upsert({ where: { userId: ortuUser.id }, update: {}, create: { userId: ortuUser.id, studentId: s!.id } });

  await prisma.subject.createMany({ data: [ { code: 'MAT', name: 'Matematika' }, { code: 'BIN', name: 'Bahasa Indonesia' } ], skipDuplicates: true });
  await prisma.extracurricular.createMany({ data: [ { code: 'PRM', name: 'Pramuka' }, { code: 'PMR', name: 'PMR' } ], skipDuplicates: true });

  console.log('Seed selesai.');
}

main().catch(console.error).finally(()=>prisma.$disconnect());
