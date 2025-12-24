# Rapor Digital Copilot Instructions

## Architecture Overview

This is a **Next.js 14 + PostgreSQL + Prisma** school report card management system (`rapor`) with role-based access control. Five user roles flow through unified auth: **ADMIN**, **GURU** (teachers), **WALI_KELAS** (homeroom), **SISWA** (students), **ORANG_TUA** (parents).

**Key boundaries:**
- `app/api/` → API routes handling CRUD via Prisma
- `app/{role}/dashboard/` → Role-specific UI entry points  
- `middleware.ts` → JWT-based route protection using Bearer token or cookie
- `lib/auth.ts` → Core authentication (bcrypt hashing, JWT issuance, role checks)
- `prisma/schema.prisma` → Source of truth for data model

## Authentication & Authorization Pattern

**Always use this pattern in new API routes:**

```typescript
import { verifyToken, authorize } from '@/lib/auth';
import { ROLES } from '@/lib/roles';

export async function POST(req: NextRequest) {
  const auth = verifyToken(req.headers.get('authorization') || undefined);
  if (!auth || !authorize([ROLES.ADMIN], auth.role)) 
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // ... handler code
}
```

**Token flow:** Login endpoint returns JWT → client stores in Bearer header or cookie → middleware validates on protected routes → API endpoints verify within handlers.

## Grade & Import System

Grades have **five types** (`GradeType` enum): `HARIAN`, `TUGAS`, `PTS`, `SAS`, `RAPOR` with semester/year tracking.

**XLSX import workflow** (teachers upload grade sheets):
1. Route receives FormData with file → `parseNilaiHarian()` in `lib/xlsx.ts` validates structure
2. Maps columns (NISN, MAPEL_KODE, H1-H5, NILAI_*, SEMESTER, TAHUN) → lookups student & subject
3. Creates individual Grade records (teacher-linked via `teacherId`)
4. Endpoints: `app/api/teacher/grades/harian/import`, `rapor/import`, `walikelas/absensi/import`, `walikelas/ekskul/import`

## Database Conventions

- **User model** is root entity; Teacher/Student/Parent extend via 1:1 relations (`userId`)
- **Cascade deletes:** Deleting User cascades to Student/Teacher/Parent but not Grades (historical audit)
- **Code fields:** Subject/Extracurricular use string `code` (e.g., MAPEL_KODE = "MTK") for XLSX matching
- **Denormalization:** Class has optional `homeroomId` (User.id), not a dedicated Homeroom model

## Build & Development

```bash
npm run dev              # Next.js dev server (localhost:3000)
npm run build            # Production build
npm run start            # Production start
npx prisma migrate dev   # Create/apply database migrations
npx prisma studio       # GUI for database inspection
npm run prisma:seed     # Run seed.ts (if seeding implemented)
```

**Environment:** Requires `DATABASE_URL` and `JWT_SECRET` in `.env.local`.

## Project-Specific Patterns

1. **Error messages in Indonesian:** Routes return error messages like `'Kredensi salah'`, `'File tidak ada'` for UI consistency
2. **All API handlers export `runtime = 'nodejs'`** — required for dynamic code (bcrypt, jwt, file I/O)
3. **verifyToken returns early:** Check `auth` existence before accessing `auth.userId` or `auth.role`
4. **File uploads via FormData:** Teachers import grades as Excel files; always validate MIME and parse via `lib/xlsx.ts`
5. **No ORM hooks for soft deletes:** Physical deletes are used; implement logical delete via status fields if audit needed

## File Locations of Patterns

- **Auth template:** [lib/auth.ts](lib/auth.ts), [app/api/auth/login/route.ts](app/api/auth/login/route.ts)
- **CRUD + auth example:** [app/api/admin/students/route.ts](app/api/admin/students/route.ts)
- **XLSX import:** [app/api/teacher/grades/harian/import/route.ts](app/api/teacher/grades/harian/import/route.ts)
- **Route protection:** [middleware.ts](middleware.ts)
- **Data schema:** [prisma/schema.prisma](prisma/schema.prisma)

## Deployment: Vercel

Quick checklist to deploy this app to Vercel:

- Build/runtime
  - Ensure `prisma generate` runs during build. `package.json` includes `postinstall` and `vercel-build` that run `prisma generate && next build`.
  - The project uses `runtime = 'nodejs'` in API routes (bcrypt, jwt, file I/O). Vercel supports Node runtimes for Server Functions — no additional config required.

- Production database
  - Vercel does not host Postgres; provision a managed Postgres (Neon, Supabase, Heroku, DigitalOcean).
  - Set the production `DATABASE_URL` in the Vercel dashboard (Project → Settings → Environment Variables). Example value:

```text
postgresql://<username>:<password>@<host>:5432/rapor
```

- Required environment variables (add these in Vercel for both Preview and Production):
  - `DATABASE_URL` — your Postgres connection string
  - `JWT_SECRET` — a strong secret used by `lib/auth.ts`

- Prisma Migrations
  - Run `npx prisma migrate deploy` against your production database **before** first deployment, or run migrations from a CI job using the same `DATABASE_URL`.

- File uploads and PDFs
  - XLSX parsing and `pdfkit` are executed in API routes — they work in Vercel Server Functions. If you need persistent file storage, use an external object store (S3-compatible) and set its env vars.

- Post-deploy verification
  - Visit `/api/auth/login` to verify token issuance.
  - Test a protected route like `/admin/students` with the `Authorization: Bearer <token>` header.

If you want, I can:
- Add a sample `vercel.json` (optional)
- Create a small `deploy.md` with step-by-step commands to run migrations and configure Vercel
- Run a local `npm run build` to verify the build step on this machine
