# Installation

> Detailed install guide for Tippen — system requirements, optional
> dependencies, and first-run experience.

This is the long version of [SETUP.md](./SETUP.md). Read that first if you
just want to get running.

## System requirements

### Minimum

- **OS:** macOS 12 Monterey, Windows 10 21H2, or Ubuntu 20.04
- **RAM:** 4 GB free
- **Disk:** 1 GB for the repo + `node_modules`
- **Browser (if running the web app):** Chrome 110+, Safari 16+, Firefox 110+
- **Node.js:** 20 LTS or newer
- **Bun:** 1.1+ (recommended) or any npm-compatible package manager

### Recommended

- **OS:** Latest macOS / Windows 11 / Ubuntu 24.04
- **RAM:** 8 GB+ (matters once Remotion rendering lands)
- **CPU:** Apple Silicon or modern x86_64
- **Browser:** Latest Chrome or Arc for the best editor experience

### Why these versions

- **Node 20+** — Next.js 16 requires Node 18.18+, but Tippen uses
  platform features stable from Node 20.
- **Bun 1.1+** — Bun is faster than npm and runs the dev server in a single
  process. The repo includes `bun.lock` for reproducible installs.
- **Modern browser** — Tippen uses OKLCH colors, CSS container queries, and
  `requestAnimationFrame`. Older browsers may render but lose fidelity.

## Optional dependencies

### FFmpeg (for export — planned)

Once the Remotion pipeline lands (see [RENDERING.md](./RENDERING.md)),
Tippen will shell out to FFmpeg for MP4 encoding.

```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt update && sudo apt install -y ffmpeg

# Windows (scoop)
scoop install ffmpeg
```

Verify:

```bash
ffmpeg -version
```

You do **not** need FFmpeg for the MVP — export is UI-only.

### Bun (recommended package manager)

```bash
curl -fsSL https://bun.sh/install | bash
exec $SHELL
bun --version
```

### Git LFS (only if you commit large binary assets)

```bash
git lfs install
```

The repo does not currently use LFS, but contributors adding video/audio
fixtures may want it.

## Step-by-step install

### 1. Clone

```bash
git clone https://github.com/tippen/tippen.git
cd tippen
```

### 2. Install dependencies

```bash
# Recommended
bun install

# Or with npm
npm install

# Or with pnpm
pnpm install
```

The install script:

1. Resolves dependencies from `package.json`.
2. Runs Prisma's `postinstall` to generate the client.
3. Builds `sharp` (may take a few seconds on first run).

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`. For the MVP, the only required value is:

```dotenv
DATABASE_URL="file:./db/custom.db"
```

Optional AI keys (only if you want live AI responses — the panel works
without them):

```dotenv
OPENROUTER_API_KEY="sk-or-v1-..."
GEMINI_API_KEY="..."
```

### 4. Initialize the database

```bash
bun run db:push
```

This creates `db/custom.db` with the current Prisma schema. Re-run this
command whenever you pull a change to `prisma/schema.prisma`.

### 5. (Optional) Generate the Prisma client manually

```bash
bun run db:generate
```

Usually unnecessary — `bun install` already runs this. Use it if you see
`PrismaClientInitializationError` after switching branches.

### 6. Start the dev server

```bash
bun run dev
```

The script is `next dev -p 3000 | tee dev.log` (see `package.json`). Open
<http://localhost:3000>.

## First-run experience

When you open Tippen for the first time:

1. You land on the **marketing page**. It shows a live cinematic demo that
   uses the same `CinematicStage` component as the editor — so what you see
   is what you'll get.
2. Click **Open the editor** (or any CTA). The Zustand store switches
   `view` from `"landing"` to `"editor"`. The URL does not change in the
   MVP — see [ROADMAP.md](./ROADMAP.md) for deep-linking plans.
3. The editor opens with a **seed project** (`src/lib/tippen/seed.ts`):
   three cinematic scenes, nine timeline tracks, and a typewriter demo.
   Press `Space` to play it.
4. Click any line in the canvas (or in the inspector) to select it. The
   inspector shows the Scene / Text / Animation / Audio / AI tabs.
5. Press `⌘K` to open the command palette.

You're now editing. See [EDITOR.md](./EDITOR.md) for the full keyboard map.

## Verifying the install

A few quick checks:

```bash
# Lint passes
bun run lint

# Types compile
bunx tsc --noEmit

# Dev server responds
curl -sI http://localhost:3000 | head -1
# → HTTP/1.1 200 OK
```

## Uninstall

To remove Tippen from your machine:

```bash
rm -rf tippen/             # the repo
rm -rf ~/.bun/install/cache  # optional: Bun's global cache
```

The MVP stores nothing outside the repo (the SQLite DB is a local file).

## Updating

```bash
git pull
bun install
bun run db:push   # in case the schema changed
bun run dev
```

Check [CHANGELOG.md](./CHANGELOG.md) for breaking changes.
