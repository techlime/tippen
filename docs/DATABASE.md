# Database

> Tippen's data layer: the MVP Prisma + SQLite placeholder, and the
> planned Drizzle + Postgres schema.

## 1. Current MVP state

The MVP ships a **placeholder Prisma schema** (`prisma/schema.prisma`) with
two models that have nothing to do with cinematic editing:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

The `DATABASE_URL` is `file:./db/custom.db` (a local SQLite file). The
editor itself **does not read or write the database** — the project state
lives in the Zustand store, seeded by `src/lib/tippen/seed.ts`.

These models exist so that:

- `prisma generate` works on `bun install`.
- The dev server starts without errors.
- The CI build can run.

They will be **replaced** when the real schema lands (see §2).

## 2. Target schema (Drizzle + Postgres)

When the Hono API lands, Tippen will move to **Drizzle ORM** on
**Postgres** (Neon). The schema below is the target. Tables map directly to
the `TippenProject` domain model in `src/lib/tippen/types.ts`, plus
auth, renders, and AI history.

### 2.1 ER overview

```
users 1───∞ projects 1───∞ scenes 1───∞ lines
                       1───∞ tracks 1───∞ clips
                       1───∞ renders
                       1───∞ prompt_history
                       1───∞ assets
```

### 2.2 Tables

#### `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | CUID |
| `email` | `text` unique | |
| `name` | `text`? | |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | updated on change |

#### `projects`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | CUID |
| `user_id` | `text` FK → users | |
| `title` | `text` | |
| `width` | `int` | default 1920 |
| `height` | `int` | default 1080 |
| `fps` | `int` | default 30 |
| `duration_ms` | `int` | |
| `background` | `text` | default "ink" |
| `thumbnail_url` | `text`? | signed R2 URL |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

The project root. Settings columns are flattened from `ProjectSettings` for
query efficiency. The `scenes`, `tracks`, and their children are stored in
related tables (next).

#### `scenes`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | |
| `project_id` | `text` FK → projects ON DELETE CASCADE | |
| `name` | `text` | |
| `background` | `text` | per-scene override |
| `start_ms` | `int` | |
| `duration_ms` | `int` | |
| `camera` | `text` | one of CameraMove |
| `order` | `int` | position in the project |

#### `lines`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | |
| `scene_id` | `text` FK → scenes ON DELETE CASCADE | |
| `content` | `text` | |
| `preset` | `text` | one of AnimationPresetId |
| `cps` | `int`? | for typewriter family |
| `duration_ms` | `int`? | for reveal family |
| `font_size` | `int` | canvas px |
| `align` | `text` | left / center / right |
| `highlights` | `jsonb` | `[{ start, end }]` |
| `order` | `int` | position in the scene |

#### `tracks`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | |
| `project_id` | `text` FK → projects ON DELETE CASCADE | |
| `kind` | `text` | one of TrackKind |
| `label` | `text` | |
| `muted` | `boolean` | default false |
| `locked` | `boolean` | default false |
| `order` | `int` | |

#### `clips`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | |
| `track_id` | `text` FK → tracks ON DELETE CASCADE | |
| `label` | `text` | |
| `start_ms` | `int` | |
| `duration_ms` | `int` | |
| `gain` | `real`? | 0..1, for audio tracks |
| `color` | `text`? | "ember" / "muted" / CSS color |
| `keyframes` | `jsonb`? | planned — see [TIMELINE.md](./TIMELINE.md) |

#### `prompt_history`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | |
| `user_id` | `text` FK → users | |
| `project_id` | `text`? FK → projects | nullable — some actions are project-less |
| `action` | `text` | one of AiActionId |
| `prompt` | `text` | |
| `result` | `text` | |
| `tokens_in` | `int`? | |
| `tokens_out` | `int`? | |
| `model` | `text`? | |
| `created_at` | `timestamptz` | |

#### `renders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | |
| `project_id` | `text` FK → projects ON DELETE CASCADE | |
| `user_id` | `text` FK → users | |
| `format` | `text` | mp4 / gif / webm / prores |
| `fps` | `int` | |
| `resolution` | `text` | e.g. "1920x1080" |
| `status` | `text` | pending / rendering / done / failed |
| `progress` | `real` | 0..1 |
| `r2_key` | `text`? | output object key |
| `error` | `text`? | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

#### `assets`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK | |
| `user_id` | `text` FK → users | |
| `kind` | `text` | voice / music / sfx |
| `filename` | `text` | original filename |
| `mime_type` | `text` | |
| `size_bytes` | `int` | |
| `r2_key` | `text` | |
| `duration_ms` | `int`? | for audio |
| `transcript` | `jsonb`? | WhisperX output (word-level) |
| `created_at` | `timestamptz` | |

## 3. Migrations

With Drizzle, migrations live in `server/api/drizzle/`:

```bash
# Generate a migration from schema changes
bunx drizzle-kit generate

# Apply migrations
bunx drizzle-kit push       # dev
bunx drizzle-kit migrate    # prod (CI/pre-deploy)
```

The Hono API runs `drizzle-kit migrate` as a pre-deploy hook on Railway.

## 4. Why Drizzle over Prisma?

| Concern | Prisma | Drizzle |
| --- | --- | --- |
| Bundle size (serverless) | Heavy | Light |
| Edge runtime support | Limited | First-class |
| SQL control | Abstracted | Direct |
| Types | Generated | Inferred |

Tippen's API will run on Hono, possibly at the edge. Drizzle's lighter
footprint and edge-friendliness win for our deployment target.

## 5. Why Postgres over SQLite?

- **Concurrent writes.** Vercel + Railway functions are stateless — a file
  DB doesn't work.
- **JSONB.** We use JSONB for `highlights`, `keyframes`, and `transcript`.
  SQLite's JSON support is weaker.
- **Neon branching.** We can branch the DB for previews / tests instantly.

## 6. Indexing strategy

Planned indexes (added when query patterns justify them):

- `projects(user_id, updated_at desc)` — list user's projects by recency.
- `scenes(project_id, order)` — fetch scenes in order.
- `clips(track_id, start_ms)` — render timeline.
- `prompt_history(user_id, created_at desc)` — AI history panel.
- `renders(project_id, status)` — render queue polling.

## 7. Backup & restore

- **Neon** — automatic continuous protection; point-in-time restore up to
  7 days on the free tier.
- **Logical backups** — nightly `pg_dump` to R2 (planned post-1.0).
- **Restore drills** — quarterly test of the restore process
  (planned post-1.0).

## 8. Data retention

- Projects: kept forever unless the user deletes them.
- Renders: 30 days, then auto-deleted from R2 (DB row kept for history).
- Prompt history: 90 days.
- Assets (voice/music): kept until the project that references them is
  deleted.

## 9. See also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — where the DB sits in the system
- [API.md](./API.md) — Hono routes that read/write these tables
- [ROADMAP.md](./ROADMAP.md) — when the migration happens
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) — `DATABASE_URL`
