# Step-by-Step: Deploy Rapor Digital to Vercel

Follow these steps **in order** to deploy your app.

---

## Step 1: Create a Vercel Account (if you don't have one)

1. Go to **https://vercel.com/signup**
2. Sign up with GitHub, GitLab, Bitbucket, or email
3. Verify your email if prompted

---

## Step 2: Create a Production Database

You need a managed PostgreSQL database (Vercel doesn't host databases). Choose one:

### Option A: Use Neon (recommended, easiest)
1. Go to **https://neon.tech**
2. Click "Sign Up"
3. Sign in with GitHub or email
4. Click **"Create a project"**
5. Name it (e.g., "rapor-prod")
6. Choose region closest to you
7. Click **"Create project"**
8. On the dashboard, find your **Connection String** (looks like: `postgresql://user:password@host.neon.tech/rapor`)
9. **Copy this string** — you'll need it in Step 5

### Option B: Use Supabase
1. Go to **https://supabase.com**
2. Sign up with GitHub
3. Click **"New Project"**
4. Enter project name and password
5. Choose a region
6. Click **"Create new project"** (wait 2-3 minutes)
7. Go to **Settings → Database**
8. Copy the **Connection string** (URI tab)
9. **Copy this string** — you'll need it in Step 5

### Option C: Other options
- Render: https://render.com
- Railway: https://railway.app
- PlanetScale: https://planetscale.com

---

## Step 3: Connect Your GitHub Repository to Vercel

1. Go to **https://vercel.com/new**
2. Click **"Continue with GitHub"** (or your platform)
3. Authorize Vercel to access your repositories
4. Find your **rapor-digital** repo and click **"Import"**
5. Click **"Continue"** (no need to change framework settings)

---

## Step 4: Set Environment Variables in Vercel

1. You're now on the **"Configure Project"** page
2. Under **"Environment Variables"**, add two variables:

**First variable:**
- **Name:** `DATABASE_URL`
- **Value:** Paste the connection string from Step 2 (your Neon/Supabase URL)
- Click **"Add"**

**Second variable:**
- **Name:** `JWT_SECRET`
- **Value:** Enter a strong random string. You can generate one here: https://1password.com/password-generator/ or use this command in PowerShell:
  ```powershell
  -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```
- Click **"Add"**

3. Make sure **"Environment"** is set to **"Production"** for both variables
4. Click **"Deploy"** button at the bottom

---

## Step 5: Wait for Deployment (5-10 minutes)

1. Vercel will start building your project (you'll see logs)
2. Wait for the build to complete — you should see ✅ "Deployment successful"
3. You'll get a **deployment URL** (like `https://rapor-digital-xyz.vercel.app`)
4. Click the URL to visit your app

---

## Step 6: Run Database Migrations

Your database tables need to be created. Run this command **once**:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

You'll be prompted for your `DATABASE_URL`. Enter the same connection string from Step 2.

---

## Step 7: Test Your Deployment

1. Go to your Vercel URL (e.g., `https://rapor-digital-xyz.vercel.app`)
2. You should see the login page
3. Try logging in with a test account (you may need to seed data first)

---

## Step 8 (Optional): Seed Initial Data

If you have a `prisma/seed.ts` file, run:

```bash
npx prisma db seed --schema=prisma/schema.prisma
```

---

## Troubleshooting

**Build failed?**
- Check Vercel logs (Project → Deployments → click failed deploy → Logs tab)
- Common issues:
  - `DATABASE_URL` not set → add it in Settings → Environment Variables
  - `JWT_SECRET` not set → add it in Settings → Environment Variables

**Can't connect to database?**
- Verify the `DATABASE_URL` is correct (copy/paste from Neon/Supabase again)
- Check if your database provider allows connections from Vercel (some require IP allowlist — usually "Allow all" for development)

**Getting "Unauthorized" on login?**
- Database might not have data yet → run migrations (Step 6) and seed data (Step 8)

---

## Done! 🎉

Your app is now live on Vercel. Every time you push to GitHub, Vercel auto-deploys.

To update the app:
1. Make changes locally
2. `git commit` and `git push`
3. Vercel automatically rebuilds and deploys (watch at https://vercel.com/dashboard)

