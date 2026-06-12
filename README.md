# IoT Lab Registration Portal — DTU

Student registration form + admin dashboard for the **IoT Lab, Department of Software Engineering, Delhi Technological University**.

Built with Next.js 14 (App Router), Prisma, and PostgreSQL (Supabase or Neon — both work, the code is identical).

## What's inside

- **Public form** (`/`) — sectioned student registration with inline validation
- **Admin dashboard** (`/admin`) — password-protected, with:
  - Stat cards (total / pending / approved / rejected)
  - Charts (registrations by branch, by program)
  - Searchable + filterable table
  - Inline status changes, edit modal, delete
  - CSV export

---

## Quick start (local)

```bash
npm install
cp .env.example .env        # then paste your real DATABASE_URL + ADMIN_PASSWORD
npx prisma db push          # creates the tables in your database
npm run db:seed             # OPTIONAL: adds 24 sample students
npm run dev                 # http://localhost:3000
```

Admin: visit `/admin`, log in with the `ADMIN_PASSWORD` you set.

---

## Step 1 — Create the database (Supabase)

1. Go to https://supabase.com → New project.
2. Once created: **Project Settings → Database → Connection string → URI**.
3. Choose the **Transaction pooler** option (port **6543**) — this is the one that works on Vercel's serverless functions.
4. Copy the string. It looks like:
   `postgresql://postgres.abcd:[email protected]:6543/postgres`
5. Add `?pgbouncer=true` to the end.

> Using **Neon** instead? Same thing — copy the pooled connection string from the Neon dashboard. No code changes.

## Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "IoT Lab registration portal"
git branch -M main
git remote add origin https://github.com/beingglitch/iot-lab-portal.git
git push -u origin main
```

## Step 3 — Deploy on Vercel

1. https://vercel.com → **Add New → Project** → import your GitHub repo.
2. Under **Environment Variables**, add:
   - `DATABASE_URL` = your Supabase/Neon pooled connection string
   - `ADMIN_PASSWORD` = a strong password of your choice
3. Click **Deploy**.

The `build` script runs `prisma generate` automatically. The first deploy builds the client; your tables already exist from Step 1's `prisma db push`.

> **Tip:** to create the tables against the production DB without seeding, run `npx prisma db push` locally with the production `DATABASE_URL` in your `.env` once. You only need to do this a single time.

---

## Adding the DTU logo

The header shows a "DTU" monogram badge by default. To use the official crest:

1. Download the DTU logo as a PNG.
2. Save it as `public/dtu-logo.png`.
3. It appears automatically — no code change needed. (If the file is missing, the monogram fallback shows instead.)

---

## Switching auth to something stronger

This uses a single shared admin password stored in an httpOnly cookie (8-hour session) — fine for a small department tool. If you later need per-user logins, swap the `/api/auth` route + middleware for NextAuth or Supabase Auth.

## Project structure

```
app/
  page.js                  public registration form
  admin/page.js            dashboard (server: fetches data)
  admin/Dashboard.js       dashboard (client: UI + actions)
  admin/login/page.js      admin login
  api/students/route.js    GET list / POST create
  api/students/[id]/route.js  PATCH update / DELETE
  api/auth/route.js        login / logout
components/BrandHeader.js  DTU branded header + logo fallback
lib/prisma.js              Prisma client singleton
prisma/schema.prisma       Student model
prisma/seed.mjs            sample data
middleware.js              gates /admin behind auth cookie
```
# dtuiotlabrecruitmentportal
