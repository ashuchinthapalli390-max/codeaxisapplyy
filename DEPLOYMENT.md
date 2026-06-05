# CodeXa Apply - Deployment Guide

This guide details how to set up the MySQL database, configure variables, and deploy the **CodeXa Apply** application to Vercel.

---

## 1. Database Setup (MySQL)

This portal requires a permanent MySQL database. Since Vercel serverless functions do not host a local database, you must configure a cloud database:

1. **Get a MySQL Database**:
   - Register for a free instance on cloud providers like **Aiven** (aiven.io), **Railway** (railway.app), or **TiDB Cloud** (pingcap.com).
2. **Retrieve Connection String**:
   - Copy the connection string provided by the database platform. It must match the following format:
     `mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`
3. **URL Encode Password Symbols**:
   - If your database password contains special characters, they **must** be URL-encoded before adding them to the connection string:
     - `@` = `%40`
     - `#` = `%23`
     - `&` = `%26`
     - `%` = `%25`
     - `/` = `%2F`
     - `:` = `%3A`
     
     *Example:* `Ashu@123#` becomes `Ashu%40123%23` in the URL.

---

## 2. Environment Variables

Create a `.env.local` file in the project root for local development.

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
ADMIN_PASSKEY="Ashu×Luger"
ADMIN_SESSION_SECRET="any-long-random-secret-here"
```

> [!WARNING]
> Database operations are handled strictly on the server-side. Do **not** expose your credentials using `NEXT_PUBLIC_DATABASE_URL`.

---

## 3. Database Initialisation

To initialize the applications registry and logs structure, run the schema migration script:

```bash
# Verify database connection state
npm run db:check

# Run schema migrations and build tables
npm run db:init
```

The migration runner reads the statements in `database/schema.sql` and builds the necessary tables.

---

## 4. Deploying to Vercel

When deploying to Vercel, ensure you configure the environment variables:

1. In your **Vercel Dashboard**, open your project.
2. Go to **Settings** -> **Environment Variables**.
3. Add these variables (selecting `Production`, `Preview`, and `Development` environments):
   - `DATABASE_URL` = `mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`
   - `ADMIN_PASSKEY` = `Ashu×Luger`
   - `ADMIN_SESSION_SECRET` = `your-secure-random-secret`
4. Deploy the project using the **Vercel CLI** or by triggering a Git hook.
5. If redeploying a failed deployment, go to **Deployments** -> **Latest Deployment** -> click the three dots (`...`) -> **Redeploy**.

---

## 5. Troubleshooting

- **`Database connection is not configured yet. Please contact CodeXa support.`**:
  This means `DATABASE_URL` is empty, missing, or incorrect. Add it to Vercel variables, redeploy the site, and verify the connection.
- **Unexpected end of JSON input**:
  Our API wrappers are protected to return valid JSON error shapes even if query operations fail. Check your runtime functions console log in Vercel to inspect the raw database error.
- **Port 3000 is in use**:
  Next.js will automatically fall back to port `3001`. If you need to force port `3000`, run a command to terminate the old Node.js process (`Stop-Process -Id <PID> -Force` on Windows or `kill -9 <PID>` on Unix/macOS) and run `npm run dev` again.
