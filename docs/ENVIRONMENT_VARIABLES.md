# Environment Variables

> Every env var Tippen uses, what it's for, and whether it's required.

## 1. Quick reference

| Variable | Required in MVP? | Required in production (planned)? | Where used |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | ✅ | Prisma / Drizzle |
| `NODE_ENV` | optional | ✅ | Next.js |
| `NEXT_PUBLIC_SITE_URL` | optional | ✅ | Metadata + OG tags |
| `OPENROUTER_API_KEY` | optional | optional | AI actions (text) |
| `GEMINI_API_KEY` | optional | optional | AI actions (text + JSON) |
| `NEXTAUTH_SECRET` | optional | ✅ | Auth (planned) |
| `NEXTAUTH_URL` | optional | ✅ | Auth (planned) |
| `R2_ACCOUNT_ID` | ❌ | ✅ | Storage (planned) |
| `R2_ACCESS_KEY_ID` | ❌ | ✅ | Storage (planned) |
| `R2_SECRET_ACCESS_KEY` | ❌ | ✅ | Storage (planned) |
| `R2_BUCKET` | ❌ | ✅ | Storage (planned) |
| `R2_PUBLIC_URL` | ❌ | ✅ | Storage (planned) |
| `HUGGINGFACE_TOKEN` | ❌ | optional | WhisperX (planned) |
| `KOKORO_TTS_ENDPOINT` | ❌ | optional | TTS preview (planned) |
| `REMOTION_LICENSE_KEY` | ❌ | ✅ | Rendering (planned) |

## 2. MVP variables

### `DATABASE_URL`

- **Required in MVP:** ✅
- **Default in `.env.example`:** `file:./db/custom.db`
- **Used by:** Prisma (`src/lib/db.ts`, `prisma/schema.prisma`)

A SQLite file path for the MVP. When the Drizzle/Postgres migration lands,
this becomes a Postgres connection string:

```dotenv
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### `NODE_ENV`

- **Required:** optional (Next.js sets it automatically based on the script)
- **Values:** `"development"` | `"production"` | `"test"`

### `NEXT_PUBLIC_SITE_URL`

- **Required:** optional
- **Default:** `http://localhost:3000`
- **Used by:** `src/app/layout.tsx` (planned) for `metadataBase` and OG tags

The public URL of the deployed site. Used to build absolute URLs for Open
Graph / Twitter cards.

### `OPENROUTER_API_KEY`

- **Required:** optional
- **Used by:** `/api/tippen/ai` route (planned)

An [OpenRouter](https://openrouter.ai) API key. Enables the text-based AI
actions (`generate-intro`, `rewrite-script`, `scene-suggestions`). Get one
at <https://openrouter.ai/keys>.

### `GEMINI_API_KEY`

- **Required:** optional
- **Used by:** `/api/tippen/ai` route (planned)

A [Google Gemini](https://ai.google.dev) API key. Enables text + structured
output AI actions (`auto-highlight`, `generate-timing`). Get one at
<https://aistudio.google.com/app/apikey>.

> **Note:** When neither `OPENROUTER_API_KEY` nor `GEMINI_API_KEY` is set,
> the AI panel shows a friendly "AI disabled" message and the rest of the
> editor works normally.

## 3. Planned variables (auth)

### `NEXTAUTH_SECRET`

- **Required in MVP:** optional
- **Required in production:** ✅
- **Used by:** Better Auth / NextAuth (planned)

A long random string used to sign session cookies. Generate with:

```bash
openssl rand -base64 32
```

### `NEXTAUTH_URL`

- **Required in MVP:** optional
- **Required in production:** ✅
- **Used by:** Better Auth / NextAuth (planned)

The canonical URL of the deployed app. e.g. `https://tippen.dev`.

## 4. Planned variables (storage — Cloudflare R2)

| Variable | Description |
| --- | --- |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key (create in R2 → Manage API tokens) |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET` | Bucket name (e.g. `tippen-renders`) |
| `R2_PUBLIC_URL` | Public URL for the bucket (e.g. `https://renders.tippen.dev`) |

These are used by the Hono API (planned) to upload renders, voice clips,
and music files. Never exposed to the browser.

## 5. Planned variables (AI providers)

| Variable | Used for |
| --- | --- |
| `HUGGINGFACE_TOKEN` | WhisperX word-level transcription (`voice-to-text`, `word-sync`) |
| `KOKORO_TTS_ENDPOINT` | Optional TTS preview endpoint for the script |
| `OPENAI_API_KEY` | Optional fallback for OpenRouter-routed models |

## 6. Planned variables (rendering)

### `REMOTION_LICENSE_KEY`

- **Required in production:** ✅ (for commercial Remotion usage)
- **Used by:** Render worker (planned)

A Remotion License key. Required for commercial use of Remotion Lambda /
`@remotion/renderer`. See <https://www.remotion.pro>.

## 7. Variable scoping

| Prefix | Scope |
| --- | --- |
| `NEXT_PUBLIC_*` | Exposed to the browser (bundled into client JS) |
| everything else | Server-only |

**Never** prefix a secret with `NEXT_PUBLIC_`. It will be visible to anyone
who opens devtools.

## 8. `.env` file conventions

- `.env.example` — committed. Placeholder values only. Never contains real
  secrets.
- `.env` — gitignored. Real values live here locally.
- `.env.local` — gitignored. Overrides `.env`. Used for personal overrides.
- `.env.production` — gitignored. Production-only values (deployed via
  Vercel / Railway env vars, not a file).

## 9. Rotating secrets

If a secret leaks:

1. **Revoke it immediately** at the provider's dashboard.
2. Generate a new one.
3. Update it in:
   - Local `.env`
   - Vercel project settings
   - Railway service variables
4. Force-logout all sessions (for auth secrets) by rotating the
   `NEXTAUTH_SECRET`.
5. Open a [SECURITY.md](./SECURITY.md) report if the leak was from the
   repo.

## 10. Verifying env vars

A planned `bun run check:env` script will validate required vars on boot:

```bash
# Planned: src/lib/env.ts (zod-validated)
❌ Missing required env var: DATABASE_URL
❌ R2_BUCKET is set but R2_PUBLIC_URL is missing
✅ All required env vars present
```

Until then, the dev server will fail loudly if `DATABASE_URL` is missing.

## 11. See also

- [`.env.example`](../.env.example) — the template
- [SETUP.md](./SETUP.md) — configuring env vars locally
- [DEPLOYMENT.md](./DEPLOYMENT.md) — configuring env vars on Vercel/Railway
- [API.md](./API.md) — which vars each route needs
- [AI.md](./AI.md) — AI provider details
