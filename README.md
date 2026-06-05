# CodeXa Apply

CodeXa Agency free developer internship application portal built with Next.js, React, TypeScript, Tailwind CSS, MySQL, `mysql2/promise`, and jsPDF.

## Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
ADMIN_PASSKEY="Ashu×Luger"
ADMIN_SESSION_SECRET="replace-with-random-long-secret"
```

Do not use `NEXT_PUBLIC_DATABASE_URL`. Database access must stay server-side only.

## Vercel Setup

In Vercel:

1. Open your project.
2. Go to `Settings` -> `Environment Variables`.
3. Add these variables for `Production`, `Preview`, and `Development`:

```env
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
ADMIN_PASSKEY=Ashu×Luger
ADMIN_SESSION_SECRET=any-long-random-secret-here
```

4. Go to `Deployments` -> latest deployment -> `Redeploy`.

If the database password has special characters, URL encode them:

```text
@ = %40
# = %23
& = %26
% = %25
/ = %2F
: = %3A
```

Example:

```text
Ashu@123# -> Ashu%40123%23
```

## Database

Import the schema before accepting applications:

```bash
mysql -u USER -p DATABASE_NAME < database/schema.sql
```

Application records are saved permanently in MySQL through `DATABASE_URL`. The app does not fake-save submitted records, use JSON-file storage, or store admin records in localStorage.

## Missing Database Behavior

If `DATABASE_URL` is missing:

- Homepage opens.
- Start gate, intro, pre-application screen, and application form open.
- Submit/admin database APIs return JSON errors.
- Applicant submit shows: `Database connection is not configured yet. Please contact CodeXa support.`
- Form data stays on screen and autosave draft remains available.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

On Windows/OneDrive, `.next` can occasionally be locked by a running dev server. Stop `next dev`, delete the generated `.next` folder, then run the build again.

## Troubleshooting

`DATABASE_URL is missing`: add `DATABASE_URL` in Vercel Environment Variables and redeploy.

`Unexpected end of JSON input`: APIs should return JSON, and the submit form safely handles empty/non-JSON responses. Check Vercel function logs for the original server error.

`Data disappeared`: submitted/admin records require a real MySQL database. Browser localStorage is only for incomplete applicant drafts.

`Admin shows database error`: configure `DATABASE_URL`, import `database/schema.sql`, then redeploy.
