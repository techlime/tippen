# Setup

> Get Tippen running locally in under 5 minutes.

## Prerequisites

| Tool | Version | Why |
| --- | --- | --- |
| **Node.js** | 20 or newer | Required by Next.js 16 |
| **Bun** | 1.1+ | Recommended runtime + package manager |
| **Git** | any recent | Clone the repo |
| **FFmpeg** *(optional)* | 6+ | Only needed once export lands (see ROADMAP.md) |

You can use `npm`, `pnpm`, or `yarn` instead of Bun — but the lockfile in the
repo is `bun.lock`, so Bun is the path of least resistance.

### Install Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1|iex"
```

Verify:

```bash
bun --version    # 1.1.x or newer
node --version   # v20.x or newer
```

## 1. Clone

```bash
git clone https://github.com/tippen/tippen.git
cd tippen
```

## 2. Install dependencies

```bash
bun install
```

If you're using npm:

```bash
npm install
```

## 3. Configure environment

```bash
cp .env.example .env
```

The MVP only needs one variable:

```dotenv
DATABASE_URL="file:./db/custom.db"
```

AI providers (`OPENROUTER_API_KEY`, `GEMINI_API_KEY`) are **optional** — the
AI panel degrades gracefully when keys are missing. See
[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for the full list.

## 4. Initialize the database

The MVP uses Prisma + SQLite. Push the schema to create the local DB file:

```bash
bun run db:push
```

This creates `db/custom.db`. You don't need a running database server.

## 5. Run the dev server

```bash
bun run dev
```

Open <http://localhost:3000>. You should see the Tippen landing page.

Click **Open the editor** to enter the workspace. Try:

- `Space` — play / pause
- `⌘K` / `Ctrl+K` — command palette
- `N` — new scene
- `⌘=` / `⌘-` — zoom in / out
- `⌘Z` / `⌘⇧Z` — undo / redo

See [EDITOR.md](./EDITOR.md) for the full keyboard map.

## Troubleshooting

### `EADDRINUSE: address already in use :::3000`

Another process is on port 3000. Either kill it or run on a different port:

```bash
PORT=3001 bun run dev
```

### `PrismaClientInitializationError`

The SQLite file or folder is missing. Re-run:

```bash
bun run db:push
```

If it persists, delete `db/custom.db` and re-push — the seed project is
generated in-memory, so no data is lost.

### Theme flash on first paint

Tippen uses `next-themes` with `suppressHydrationWarning` on `<html>` to
avoid a flash. If you see a flash, make sure you haven't removed the
`<TippenThemeProvider>` wrapper from `src/app/layout.tsx`. See
[THEMES.md](./THEMES.md).

### Fonts don't load offline

Tippen uses `next/font/google` for Geist Sans, Geist Mono, and Instrument
Serif. They are self-hosted at build time, so the dev server needs internet
on first run. Subsequent runs use the cached font files.

### `bun install` fails on `sharp`

`sharp` is an optional native dependency used by Next.js for image
optimization. On rare systems it fails to build. You can skip it without
breaking the editor — Tippen does not use `next/image` for the canvas.

### The dev log is noisy

`bun run dev` pipes output to `dev.log` (see `package.json` scripts). If you
don't want that file, run `next dev` directly:

```bash
bunx next dev -p 3000
```

## Next steps

- [EDITOR.md](./EDITOR.md) — editor layout and shortcuts
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the pieces fit
- [CONTRIBUTING.md](./CONTRIBUTING.md) — if you plan to contribute
