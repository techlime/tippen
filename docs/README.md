# Tippen

```
  ┌──────────────────────────────────────────────┐
  │   tippen_  ·  create cinematic stories with  │
  │   text ─ typing · voice · AI · camera · music │
  └──────────────────────────────────────────────┘
```

> **Create cinematic stories with text.**

Tippen is an AI-powered cinematic text storytelling editor. It turns typed
words into filmic sequences — typewriter reveals, voice sync, camera moves,
ambient music, sound design, and beautiful typography — all in a single
focused canvas inspired by **Linear × Raycast × Arc × Vercel × Notion × Figma**.

Tippen is **not** Canva, PowerPoint, a generic video editor, or a typewriter
GIF generator. It is a focused tool for one job: making text feel like cinema.

| | |
| --- | --- |
| **License** | [![License: MIT](https://img.shields.io/badge/License-MIT-ember.svg)](./LICENSE) |
| **Stack** | [![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)](https://tailwindcss.com) [![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev) |
| **State** | [![Zustand](https://img.shields.io/badge/Zustand-5-orange.svg)](https://github.com/pmndrs/zustand) [![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5-ff4154.svg)](https://tanstack.com/query) |
| **DB (MVP)** | [![Prisma](https://img.shields.io/badge/Prisma-6-5a67d8.svg)](https://www.prisma.io) [![SQLite](https://img.shields.io/badge/SQLite-3-003b57.svg)](https://www.sqlite.org) |
| **PRs** | [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ember.svg)](./docs/CONTRIBUTING.md) |

---

## ✨ Features

**Editor & canvas**
- Cinematic stage with backgrounds (Ink, Paper, Ember, Midnight, Studio, Noir)
- Camera moves: static, push-in, pull-out, pan-left, pan-right, tilt-up
- Scene manager with reorder / duplicate / delete
- Timeline with 9 track kinds (voice, music, typing, cursor, highlights, camera, background, sfx, transitions)
- Inspector with Scene / Text / Animation / Audio / AI tabs
- Command palette (⌘K)
- Undo / redo (50 steps)
- Light / Dark / System theme

**Animation presets**
Typewriter · Terminal · Apple Intro · Fade · Slide · Zoom · Blur · Highlight ·
Cursor Blink · Elastic · Minimal — split into a *typewriter family*
(char-by-char reveal driven by `cps`) and a *reveal family* (transform /
opacity / blur driven by `durationMs`).

**AI actions**
Generate Intro · Rewrite Script · Generate Typing Timing · Voice→Text ·
Word-Level Sync · Auto Highlight · Scene Suggestions · Prompt History.

**Saving & export** *(UI in MVP — see ROADMAP.md)*
Save/load project, project settings, export MP4 (Remotion pipeline planned),
export GIF (interface planned).

## 🧱 Tech stack

### Implemented in MVP
- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS 4** with OKLCH semantic tokens
- **shadcn/ui** (Radix primitives)
- **Zustand 5** for editor state (`src/stores/editor-store.ts`)
- **TanStack Query 5** for server cache
- **Prisma 6** + **SQLite** (local file DB)
- **next-themes** for theme switching (class strategy, no-flash)
- **framer-motion** + **lucide-react**
- **Geist Sans / Geist Mono / Instrument Serif** fonts

### Planned (see ROADMAP.md)
- **Turborepo** monorepo (`apps/web`, `packages/*`, `server/`)
- **Hono** API server
- **Drizzle ORM** + **Postgres** (Neon)
- **Better Auth** (replacing the current Prisma SQLite placeholder)
- **Cloudflare R2** for asset + render storage
- **Remotion** + **FFmpeg** for MP4/GIF rendering
- **WaveSurfer.js** + Web Audio API for the audio engine
- **Konva.js** for an accelerated canvas renderer
- OpenRouter / Gemini / WhisperX / HuggingFace / Kokoro TTS providers

## 🚀 Quick start

```bash
# 1. Clone
git clone https://github.com/tippen/tippen.git
cd tippen

# 2. Install (Bun recommended; npm/pnpm also work)
bun install

# 3. Configure env
cp .env.example .env

# 4. Push the local SQLite schema
bun run db:push

# 5. Run the dev server
bun run dev
# → http://localhost:3000
```

The app opens on the **landing page**. Click **Open the editor** (or any CTA)
to switch to the cinematic editor workspace. Both share a single `/` route —
navigation is driven by Zustand view state for the MVP.

> **Prerequisites:** Node 20+ and Bun 1.1+. See [SETUP.md](./SETUP.md) and
> [INSTALLATION.md](./INSTALLATION.md) for full instructions, including
> optional dependencies like FFmpeg for export.

## 📁 Project structure

```
tippen/
├── docs/                      # ← you are here
├── prisma/
│   └── schema.prisma          # MVP schema (User, Post placeholders)
├── public/                    # static assets, logo.svg, robots.txt
├── src/
│   ├── app/                   # Next.js App Router (layout, page, globals.css)
│   │   └── api/               # route handlers (planned /api/tippen/ai)
│   ├── components/
│   │   ├── tippen/            # ← feature folder
│   │   │   ├── cinematic-stage.tsx   # shared renderer (landing + editor)
│   │   │   ├── tippen-logo.tsx
│   │   │   ├── tippen-app.tsx        # root shell (view routing)
│   │   │   ├── theme-provider.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   ├── editor/               # EditorWorkspace, panels, command palette
│   │   │   └── landing/              # LandingPage + sections
│   │   └── ui/                # shadcn/ui primitives
│   ├── hooks/
│   │   ├── use-typewriter.ts         # deterministic reveal engine + rAF clock
│   │   └── use-tippen-shortcuts.ts   # global keyboard shortcuts
│   ├── lib/
│   │   ├── tippen/
│   │   │   ├── types.ts              # domain model (Scene, TextLine, Track…)
│   │   │   ├── animation-presets.ts  # 11 presets + helpers
│   │   │   └── seed.ts               # seed project + backgrounds
│   │   ├── db.ts                     # Prisma client
│   │   └── utils.ts                  # cn() helper
│   └── stores/
│       └── editor-store.ts           # Zustand store (project, history, UI)
├── .env.example
├── .github/                   # issue templates, PR template, CI, dependabot
├── package.json
└── LICENSE                    # MIT
```

## 📚 Documentation

| Doc | What's inside |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flow, target monorepo |
| [SETUP.md](./SETUP.md) | Local prerequisites, clone, install, troubleshooting |
| [INSTALLATION.md](./INSTALLATION.md) | Detailed install steps + system requirements |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel (MVP), Railway/Neon/R2 (planned) |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Fork, branch, commit convention, PR process |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Contributor Covenant 2.1 |
| [SECURITY.md](./SECURITY.md) | Vulnerability reporting |
| [ROADMAP.md](./ROADMAP.md) | What's done vs. planned (and explicitly **not** in MVP) |
| [API.md](./API.md) | `/api/tippen/ai` + future Hono routes |
| [AI.md](./AI.md) | AI actions, providers, how to add an action |
| [EDITOR.md](./EDITOR.md) | Editor layout + keyboard shortcuts |
| [TIMELINE.md](./TIMELINE.md) | Tracks, clips, playhead, zoom |
| [RENDERING.md](./RENDERING.md) | Remotion pipeline (planned) |
| [AUDIO_ENGINE.md](./AUDIO_ENGINE.md) | WaveSurfer + Web Audio (planned) |
| [VIDEO_ENGINE.md](./VIDEO_ENGINE.md) | Canvas / Konva / scene composition |
| [THEMES.md](./THEMES.md) | next-themes, OKLCH tokens, ember/ink palette |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Design language + principles |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | TypeScript, imports, Tailwind order, a11y |
| [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) | Component inventory + props |
| [DATABASE.md](./DATABASE.md) | Prisma (MVP) → Drizzle/Postgres (planned) |
| [PERFORMANCE.md](./PERFORMANCE.md) | Lazy loading, rAF, memoization |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | WCAG targets, ARIA, reduced motion |
| [TESTING.md](./TESTING.md) | Vitest / RTL / Playwright (planned) |
| [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) | All env vars |
| [OPEN_SOURCE_GUIDE.md](./OPEN_SOURCE_GUIDE.md) | Maintainer guide |
| [CHANGELOG.md](./CHANGELOG.md) | Keep a Changelog |

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)
and our [Code of Conduct](./CODE_OF_CONDUCT.md) before opening a PR.
Look for issues labeled [`good first issue`](https://github.com/tippen/tippen/labels/good%20first%20issue)
if you're new to the codebase.

## 📄 License

Tippen is released under the [MIT License](./LICENSE).
Copyright © 2025 Tippen Contributors.
