# Deployment

> Where Tippen runs today (MVP) and where it will run when the full
> stack lands.

## TL;DR

| Component | MVP (today) | Target |
| --- | --- | --- |
| **Frontend** | Vercel — single Next.js app | Vercel (still Next.js) |
| **Backend API** | None (no server state) | Railway — Hono API |
| **Database** | Local SQLite file | Neon — Postgres (Drizzle) |
| **Auth** | None | Better Auth (in Hono API) |
| **Object storage** | None | Cloudflare R2 |
| **Rendering** | None (UI only) | Self-hosted worker or Remotion Lambda |

For the MVP sandbox: **deploy as a single Next.js app to Vercel.**

---

## 1. MVP deploy — Vercel (single app)

The MVP has no server-side state outside the local SQLite file (which is a
placeholder). Everything the editor needs lives in the browser via Zustand.
That means the MVP deploys as a static-friendly Next.js app.

### 1.1 One-click via Vercel dashboard

1. Push your fork of Tippen to GitHub.
2. Go to <https://vercel.com/new> and import the repo.
3. Vercel auto-detects Next.js. Accept the defaults:
   - **Build command:** `bun run build` (or `next build`)
   - **Output directory:** `.next` (auto)
   - **Install command:** `bun install` (or `npm install`)
4. Add environment variables (see below).
5. Click **Deploy**.

### 1.2 Via Vercel CLI

```bash
npm i -g vercel
vercel link            # link this folder to a Vercel project
vercel env add DATABASE_URL production
# paste: file:./db/custom.db  (or a Postgres URL on Neon)

vercel --prod
```

### 1.3 Environment variables for the MVP

Only `DATABASE_URL` is required. AI keys are optional.

| Variable | Required | Example |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | `file:./db/custom.db` (or a Neon Postgres URL) |
| `OPENROUTER_API_KEY` | optional | `sk-or-v1-...` |
| `GEMINI_API_KEY` | optional | `AIza...` |
| `NEXT_PUBLIC_SITE_URL` | optional | `https://tippen.vercel.app` |
| `NEXTAUTH_SECRET` | optional (MVP) | random 32-char string |

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for the full list.

### 1.4 Caveats

- The MVP uses **Prisma + SQLite**. SQLite files do **not** persist on
  Vercel's serverless functions — but the editor never reads the DB at
  runtime in the MVP, so this is fine. Once you wire real persistence, switch
  to Postgres (see §3 below).
- The Next.js build is currently **optional** in CI (see
  `.github/workflows/ci.yml`). Flip `continue-on-error: false` once green.
- `next/font/google` self-hosts fonts at build time — your Vercel build needs
  internet access, which is the default.

---

## 2. Target deploy — full stack (planned)

When the Hono API, Drizzle/Postgres, Better Auth, R2, and Remotion land,
Tippen will deploy as four pieces:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Vercel          │     │  Railway         │     │  Neon            │
│  (Next.js web)   │────▶│  (Hono API)      │────▶│  (Postgres)      │
└──────────────────┘     └────────┬─────────┘     └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐     ┌──────────────────┐
                         │  Cloudflare R2   │◀───▶│  Render worker   │
                         │  (assets + MP4)  │     │  (Remotion +     │
                         └──────────────────┘     │   FFmpeg)        │
                                                  └──────────────────┘
```

### 2.1 Frontend → Vercel

Same as the MVP — Vercel hosts the Next.js app. Add:

```dotenv
NEXT_PUBLIC_API_URL="https://api.tippen.dev"
NEXT_PUBLIC_R2_PUBLIC_URL="https://renders.tippen.dev"
```

### 2.2 Backend → Railway (Hono)

Deploy `server/api` to Railway. Expose it at `https://api.tippen.dev`.

Required env vars:

```dotenv
DATABASE_URL="postgresql://..."      # Neon connection string
BETTER_AUTH_SECRET="..."             # long random string
BETTER_AUTH_URL="https://api.tippen.dev"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="tippen-renders"
R2_PUBLIC_URL="https://renders.tippen.dev"
OPENROUTER_API_KEY="..."
GEMINI_API_KEY="..."
REMOTION_LICENSE_KEY="..."
```

### 2.3 Database → Neon (Postgres)

1. Create a project at <https://neon.tech>.
2. Copy the connection string into `DATABASE_URL`.
3. Run Drizzle migrations:

   ```bash
   bunx drizzle-kit push
   ```

### 2.4 Storage → Cloudflare R2

1. Create an R2 bucket named `tippen-renders`.
2. Create an API token with read+write on the bucket.
3. Set the bucket's public URL (e.g. via a custom domain or R2 public access).
4. Add the four `R2_*` env vars to Railway.

### 2.5 Render worker

Either:

- **Remotion Lambda** — deploy via `remotion lambda functions deploy`. The
  Hono API enqueues a render by invoking the Lambda with the project JSON
  from R2. Output MP4 goes back to R2.
- **Self-hosted worker** — a long-running Node/Bun process that polls a
  `renders` table for `pending` rows and shells out to Remotion's
  `renderMedia` + FFmpeg. Deploy on Railway or Fly.io.

See [RENDERING.md](./RENDERING.md) for the composition design.

---

## 3. Domains & SSL

| Host | Target |
| --- | --- |
| `tippen.dev` | Vercel (web) |
| `api.tippen.dev` | Railway (Hono) |
| `renders.tippen.dev` | Cloudflare R2 public URL |

Vercel and Railway issue TLS automatically. R2 uses Cloudflare's edge TLS.

## 4. CI/CD

- **Frontend:** Vercel auto-deploys on push to `main` (production) and on
  every PR (preview).
- **Backend:** Railway auto-deploys on push to `main` once `server/api`
  exists.
- **Migrations:** Drizzle migrations run as a Railway pre-deploy hook.

See `.github/workflows/ci.yml` for the lint + typecheck gate.

## 5. Rollback

- **Vercel:** Instant rollback from the dashboard.
- **Railway:** Automatic redeploy of the previous image.
- **Neon:** Time-travel restore (Neon supports branching).
- **R2:** Bucket versioning — enable on day one.

## 6. Observability (planned)

- **Logs:** Vercel + Railway native dashboards. Optionally forward to Logflare.
- **Errors:** Sentry (to be wired).
- **Uptime:** Better Stack or UptimeRobot.
- **DB:** Neon's built-in query insights.

Until these land, monitor `dev.log` and `server.log` locally.
