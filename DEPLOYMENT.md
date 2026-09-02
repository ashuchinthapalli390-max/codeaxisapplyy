# CodeXa Apply - Production Deployment Guide

This guide details how to configure Supabase, AI Text-to-Speech (TTS) providers, environment variables, and deploy **CodeXa Apply** to Vercel.

---

## 1. Supabase Database Setup

CodeXa Apply uses Supabase PostgreSQL as its canonical production database for:
- Internship application timing & active batch synchronization (`internship_rounds`)
- 8-Round candidate screening records (`applications`)
- Persistent & revocable multi-device admin sessions (`admin_sessions`)
- Multi-platform interview schedules (`interviews`) and official offer appointments (`offers`)
- Team leadership & curriculum CMS (`team_profiles`, `site_modules`, `site_settings`)

### Setup Steps:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. In Supabase SQL Editor, execute `database/supabase_schema.sql`.
3. Obtain your **Project URL** and **Service Role Secret Key** from `Project Settings -> API`.

---

## 2. Environment Variables Configuration

Set these environment variables in your `.env.local` for local development and in **Vercel Dashboard (`Settings -> Environment Variables`)** across **Production**, **Preview**, and **Development** environments:

### Core Database (Server Only)
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SECRET_KEY="your-supabase-service-role-secret-key"
```

### Admin Security & Sessions (HMAC-SHA256 Signed & Revocable)
```env
ADMIN_PASSKEY="your-admin-master-key"
ADMIN_SESSION_SECRET="64-character-hex-secret-generated-via-openssl-rand-hex-32"
ADMIN_SESSION_COOKIE="codexa_admin_session"
```

> [!TIP]
> Generate a secure `ADMIN_SESSION_SECRET` using terminal command: `openssl rand -hex 32`.
> If omitted in development, a deterministic secret is derived from `ADMIN_PASSKEY` so serverless restarts never invalidate active sessions.

> [!CAUTION]
> Never prefix database secrets or admin keys with `NEXT_PUBLIC_*`. All database and admin security operations are executed strictly server-side.

---

## 3. Deploying to Vercel

1. Push your changes to the Git repository.
2. In **Vercel Dashboard**, verify that `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `ADMIN_SESSION_SECRET` are configured in `Settings -> Environment Variables`.
3. Redeploy the latest commit (**Deployments -> Latest -> Redeploy**).
4. Verify deployment health at `/api/db/health`.

