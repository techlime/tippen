# Architecture

> How Tippen is built today (MVP) and how it will evolve (target monorepo).

This document describes two architectures:

1. **MVP (implemented)** — a single Next.js app with a Zustand store, a
   `lib/tippen` domain layer, and feature-folder components.
2. **Target (planned)** — a Turborepo monorepo with a Hono backend,
   Drizzle/Postgres, Better Auth, Cloudflare R2, and a Remotion renderer.

See [ROADMAP.md](./ROADMAP.md) for what ships when.

---

## 1. MVP architecture (what exists today)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App Router                        │
│                       (single route: src/app/page.tsx)               │
└───────────┬──────────────────────────────────────────────────────────┘
            │ renders <TippenApp/>
            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                src/components/tippen/tippen-app.tsx                   │
│  ┌─────────────────┐   view="landing"|"editor"  ┌──────────────────┐ │
│  │  LandingPage    │ ◀──────────────────────── │  EditorWorkspace │ │
│  └─────────────────┘    Zustand view state      └──────────────────┘ │
│                          useTippenShortcuts()      EditorCommandPalette│
└───────────┬──────────────────────────────────────────────────────────┘
            │ both views render through
            ▼
┌──────────────────────────────────────────────────────────────────────┐
│             src/components/tippen/cinematic-stage.tsx                │
│         CinematicStage  ·  CinematicLine  (shared renderer)          │
└───────────┬──────────────────────────────────────────────────────────┘
            │ uses
            ▼
┌──────────────────────────┐      ┌──────────────────────────────────┐
│  useTypewriter()         │      │  src/stores/editor-store.ts      │
│  usePlaybackClock()      │ ◀─── │  (Zustand)                       │
│  useTippenShortcuts()    │      │  • project state                 │
└──────────┬───────────────┘      │  • selection                     │
           │ pure functions        │  • playback (isPlaying,          │
           ▼                       │     playheadMs, zoom)            │
┌──────────────────────────┐      │  • inspector tab                 │
│  src/lib/tippen/         │      │  • command palette               │
│   • types.ts             │ ◀─── │  • prompt history (AI)           │
│   • animation-presets.ts │      │  • undo/redo (50 steps)          │
│   • seed.ts              │      │  • actions (scene/line/track/    │
└──────────────────────────┘      │     settings/ai)                 │
                                  └──────────────────────────────────┘
                                                ▲
                                                │ reads/writes
┌──────────────────────────────────────────────────────────────────────┐
│  Persistence (MVP): Prisma + SQLite (file:./db/custom.db)            │
│  Schema today: User, Post  (placeholder — see DATABASE.md)           │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.1 Layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| **App shell** | `src/app/` | Next.js layout, fonts, metadata, single `/` route |
| **App component** | `src/components/tippen/tippen-app.tsx` | Picks Landing vs Editor from store; mounts global shortcuts + command palette |
| **Feature components** | `src/components/tippen/{landing,editor}/` | UI panels per view (sidebar, canvas, inspector, timeline, AI) |
| **Shared renderers** | `src/components/tippen/cinematic-stage.tsx` | `CinematicStage` + `CinematicLine` — used by BOTH landing demo and editor canvas |
| **Brand chrome** | `src/components/tippen/{tippen-logo,theme-toggle,theme-provider}.tsx` | Logo, theme toggle, next-themes wrapper |
| **Hooks** | `src/hooks/` | `useTypewriter`, `usePlaybackClock`, `useTippenShortcuts` |
| **Domain (pure)** | `src/lib/tippen/` | Framework-agnostic types, preset registry, seed factory, background helpers |
| **Store** | `src/stores/editor-store.ts` | Zustand store: project, selection, playback, UI, history, AI |
| **UI primitives** | `src/components/ui/` | shadcn/ui components (Radix-based) |
| **Persistence** | `src/lib/db.ts` + `prisma/schema.prisma` | Prisma client + SQLite schema (placeholder User/Post) |
| **API** | `src/app/api/` | Route handlers (planned `/api/tippen/ai`) |

### 1.2 Data flow (MVP)

```
user action (click, key, drag)
   │
   ▼
useTippenShortcuts / component event handler
   │
   ▼
useEditorStore actions (addScene, updateLine, moveClip, applyAiResult, …)
   │   ── withHistory(state) pushes a snapshot to history.past
   ▼
Zustand store updates `project`
   │
   ▼
subscribed selectors re-render components
   │
   ▼
CinematicStage reads scene + playhead
   │
   ▼
CinematicLine calls useTypewriter(content, preset, startMs, playhead)
   │
   ▼
deterministic reveal (no rAF re-renders — purely derived from playhead)
```

Key invariant: **the typing reveal is a pure function of `(content, preset,
startMs, playhead)`**. There are no per-character timers — the entire
animation is re-derived from the playhead on every render. This makes
scrubbing, undo/redo, and (eventually) server-side rendering trivial.

### 1.3 Playback clock

`usePlaybackClock()` (in `use-typewriter.ts`) advances `playheadMs` via
`requestAnimationFrame` while `isPlaying === true`. It stops at
`project.settings.durationMs`. All other state (zoom, selection, inspector
tab) is independent of the clock and never causes canvas re-renders.

---

## 2. Target architecture (planned)

The MVP is intentionally a single app. When we outgrow it, Tippen will move
to a Turborepo monorepo so the renderer, audio engine, and AI client can be
shared between web and (eventually) cloud workers.

```
tippen/
├── apps/
│   └── web/                  # Next.js 16 app (current src/ moves here)
├── packages/
│   ├── ui/                   # shadcn/ui primitives (current components/ui)
│   ├── editor/               # EditorWorkspace + panels (current components/tippen/editor)
│   ├── timeline/             # Timeline, tracks, clips, keyframes
│   ├── renderer/             # Remotion composition → frames
│   ├── animation/            # current lib/tippen (presets, types, seed)
│   ├── audio/                # WaveSurfer + Web Audio wrapper
│   ├── ai/                   # AI action registry + provider clients
│   ├── hooks/                # current hooks/
│   └── config/               # shared tsconfig, eslint, tailwind presets
└── server/
    └── api/                  # Hono API (auth, projects, renders, AI proxy)
```

| Package | Owns | Notes |
| --- | --- | --- |
| `apps/web` | Next.js entry, layout, routing | Remains the only user-facing surface |
| `packages/ui` | shadcn/ui components | Re-exported from `@tippen/ui` |
| `packages/editor` | EditorWorkspace + panels | Pulls from `@tippen/animation`, `@tippen/timeline` |
| `packages/timeline` | Track/clip model, interactions, keyframes | Adds keyframes + snapping |
| `packages/renderer` | Remotion `<Composition>` from `TippenProject` | Server render via Remotion Lambda (planned) |
| `packages/animation` | Pure preset registry | Same file as today |
| `packages/audio` | WaveSurfer regions, gain, word sync | Replaces the planned-in-MVP stubs |
| `packages/ai` | Action registry + provider clients | OpenRouter, Gemini, WhisperX, Kokoro, HF |
| `packages/hooks` | `useTypewriter`, `usePlaybackClock`, `useTippenShortcuts` | Shared across web + future Electron app |
| `packages/config` | Shared TS / ESLint / Tailwind presets | DRY tooling |
| `server/api` | Hono routes: `/auth`, `/projects`, `/renders`, `/ai` | Replaces Next.js route handlers |

### 2.1 Planned data flow (cloud-render path)

```
Editor (browser)
   │
   │  1. POST /api/projects/:id     ── Hono ──▶  Postgres (Drizzle)
   │  2. POST /api/renders          ── Hono ──▶  R2 (project JSON upload)
   │                                          └─▶ Render queue
   │
   ▼
Render worker (Remotion Lambda or self-hosted FFmpeg)
   │  3. Reads project JSON from R2
   │  4. Renders frames → encodes MP4 → uploads to R2
   │
   ▼
Webhook / polling → Editor shows progress → signed R2 URL for download
```

### 2.2 Why the split?

- **Performance** — the editor bundle shouldn't ship the Remotion runtime.
- **Reuse** — the same `packages/animation` powers the editor, the renderer,
  and (eventually) a CLI.
- **Scaling** — rendering is CPU-bound and belongs on a worker, not on the
  Next.js edge.
- **Openness** — a clean `@tippen/renderer` package makes a future plugin
  SDK and theme marketplace possible.

See [ROADMAP.md](./ROADMAP.md) for milestones and what is explicitly **not**
in scope (collaboration, teams, payments, plugins, mobile apps, realtime,
cloud rendering, social features).
