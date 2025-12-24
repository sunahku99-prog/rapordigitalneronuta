import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function authenticateByEmail(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export async function authenticateStudentByNISN(nisn: string, password: string) {
  const student = await prisma.student.findUnique({ where: { nisn }, include: { user: true } });
  if (!student || student.user.role !== 'SISWA') return null;
  const ok = await bcrypt.compare(password, student.user.passwordHash);
  if (!ok) return null;
  return student.user;
}

export function issueToken(user: { id: number; role: Role; name: string; email: string | null }) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(authHeader?: string): { userId: number; role: Role } | null {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return { userId: Number(payload.sub), role: payload.role as Role };
  } catch { return null; }
}

export function authorize(required: Role[], current?: Role) {
  return current && required.includes(current);
}
