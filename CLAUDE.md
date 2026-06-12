# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

IoT Lab Registration Portal for DTU — a Next.js 14 (App Router, JavaScript) app with a public student registration form at `/` and a password-gated admin dashboard at `/admin`. Data is stored in PostgreSQL via Prisma; deployment target is Vercel with Supabase or Neon for the database.

## Commands

```bash
npm run dev          # Next dev server (http://localhost:3000)
npm run build        # runs `prisma generate && next build`
npm start            # production server
npm run db:push      # apply schema to DATABASE_URL (no migration files)
npm run db:seed      # node prisma/seed.mjs — inserts 24 sample students
npm run db:studio    # Prisma Studio GUI on the configured DB
```

There is no test suite, lint script, or typecheck script (this is plain JS, not TypeScript).

`postinstall` runs `prisma generate` automatically, so the client stays in sync after `npm install`. The schema is managed with `prisma db push` (no `migrations/` folder) — schema changes go straight to the DB.

## Required env (`.env`)

- `DATABASE_URL` — Postgres connection string. For Supabase/Neon use the **pooled** connection (port 6543) with `?pgbouncer=true` appended; the unpooled URL will fail on Vercel serverless functions.
- `ADMIN_PASSWORD` — single shared password for `/admin`. **Required** — if unset, `POST /api/auth` returns 500 and login is impossible (see `app/api/auth/route.js`).

## Architecture

**Single resource, two surfaces.** The whole app revolves around one Prisma model (`Student` in `prisma/schema.prisma`) with `email` and `rollNumber` as unique fields and a `status` string (`pending` / `approved` / `rejected`, defaulted to `pending`). Everything else is a view over that table.

**Auth model.** Cookie-based, deliberately minimal:
- `POST /api/auth` with `{ password }` sets an `httpOnly` `admin_auth=1` cookie with an 8-hour `maxAge`. `DELETE /api/auth` clears it.
- `middleware.js` matches `/admin/:path*` and redirects to `/admin/login` if the cookie isn't `"1"`, except for `/admin/login` itself.
- There is no per-user identity. If you need real auth, the README points to swapping `/api/auth` + middleware for NextAuth or Supabase Auth.

**Admin page split (server → client).** `app/admin/page.js` is a Server Component with `export const dynamic = "force-dynamic"` — it queries Prisma directly, serializes `createdAt`/`updatedAt` to ISO strings, and passes the array as the `initial` prop to `app/admin/Dashboard.js`, which is the client component owning all interactivity (filters, charts, edit modal, CSV export, status mutations). Mutations from the client call the REST routes below, then re-fetch.

**API routes (REST over the Student model).**
- `GET /api/students` — list, newest first.
- `POST /api/students` — create. Validates the same 12 required fields the form collects (everything except `previousScore`, `status`, `notes`). Catches Prisma `P2002` (unique constraint) and returns 409 with the conflicting field name.
- `PATCH /api/students/[id]` — partial update. Uses an explicit `allowed` allowlist; unknown keys in the body are silently dropped. Same `P2002` → 409 handling; `P2025` → 404.
- `DELETE /api/students/[id]` — delete. `P2025` → 404.

**Prisma client singleton.** `lib/prisma.js` caches the client on `globalThis` in non-production to survive Next.js hot reloads. Always import via `@/lib/prisma` (path alias from `jsconfig.json`).

**Branding.** `components/BrandHeader.js` renders the DTU header; it falls back to a "DTU" monogram if `public/dtu-logo.png` is missing. Dropping a PNG at that path is enough — no code change.

## Conventions worth knowing

- **JavaScript only**, not TypeScript. `jsconfig.json` only defines the `@/*` path alias.
- **Dates as strings.** `dateOfBirth` and `yearOfStudy` are `String` in the schema, not `DateTime`. Don't "fix" this — the form stores raw input.
- **No migration files.** `prisma db push` is the workflow; never expect `prisma/migrations/`.
- **Status changes go through PATCH**, not a dedicated endpoint. The admin UI just sends `{ status: "approved" | "rejected" | "pending" }` to `/api/students/[id]`.
