# Roadmap

> What's done, what's planned, and what's **explicitly out of scope** for
> the Tippen MVP.

Tippen is an AI-powered cinematic text storytelling editor. The MVP focuses
on a fast, delightful **editing experience** in the browser. Everything
else — cloud rendering, collaboration, payments, mobile, plugins — is
deliberately deferred.

This document is the source of truth for scope decisions. If you're
contributing or filing a feature request, please check here first.

---

## Legend

| Tag | Meaning |
| --- | --- |
| ✅ **Done** | Shipped in the MVP |
| 🚧 **In progress** | Currently being built |
| 📅 **Planned** | On the roadmap, not started |
| 🚫 **Out of scope** | Explicitly **not** in the MVP — see "Out of scope" |

---

## 0.1 — MVP (✅ Done)

The MVP delivers a focused single-page editor with a live demo, an animation
engine, and the editor surface for cinematic text.

### Foundation

- ✅ OKLCH design system with `ember` (warm amber) + `ink` (neutral) palette
- ✅ Light + Dark + System themes via `next-themes` (class strategy, no-flash)
- ✅ Geist Sans / Geist Mono / Instrument Serif fonts
- ✅ Domain model: `TippenProject` → `Scene` → `TextLine` → `TimelineTrack` → `TrackClip`
- ✅ Zustand store with undo/redo (50 steps), selection, playback, UI state
- ✅ Deterministic typewriter engine (`useTypewriter`) — pure function of playhead
- ✅ rAF playback clock (`usePlaybackClock`)
- ✅ Global keyboard shortcuts (`useTippenShortcuts`)

### Animation engine

- ✅ 11 presets: Typewriter, Terminal, Apple Intro, Fade, Slide, Zoom, Blur,
  Highlight, Cursor Blink, Elastic, Minimal
- ✅ Two families: **typewriter** (char-by-char, `cps`-driven) and **reveal**
  (transform / opacity / blur, `durationMs`-driven)
- ✅ Camera moves: static, push-in, pull-out, pan-left, pan-right, tilt-up
- ✅ Six backgrounds: Ink, Paper, Ember, Midnight, Studio, Noir
- ✅ Highlight spans (ember-colored word ranges)

### Editor surface

- ✅ Top nav, left scene sidebar, center canvas, right inspector, bottom timeline
- ✅ Inspector tabs: Scene · Text · Animation · Audio · AI
- ✅ Timeline with 9 track kinds
- ✅ Command palette (⌘K)
- ✅ Theme toggle
- ✅ Project settings (title, dimensions, fps, duration, background)

### Landing page

- ✅ Live cinematic demo using the same `CinematicStage` as the editor
- ✅ Feature highlights, presets gallery, footer

### AI panel (UI + minimal wiring)

- ✅ Actions: Generate Intro, Rewrite Script, Generate Typing Timing,
  Voice→Text, Word-Level Sync, Auto Highlight, Scene Suggestions
- ✅ Prompt history
- ✅ Graceful degradation when no API keys are set

### Persistence (placeholder)

- ✅ Prisma + SQLite with placeholder `User` / `Post` models
- 🚧 Real project persistence (save/load to local DB) — UI exists, wiring in progress

---

## 0.2 — Real persistence + theme polish (📅 Planned)

- 📅 Replace Prisma SQLite with **Drizzle + Postgres (Neon)**
- 📅 Project CRUD API (Hono)
- 📅 Better Auth (email + magic link)
- 📅 Theme marketplace scaffolding (JSON theme files, no upload yet)
- 📅 More animation presets: Shake, Glitch, Reveal Up, Stagger, Scanline
- 📅 Reduced-motion variants for every preset
- 📅 Save/load project to local DB
- 📅 Deep-linking (per-scene URL)

## 0.3 — Audio engine (📅 Planned)

- 📅 WaveSurfer.js integration for voice tracks
- 📅 Web Audio API graph (gain, fade, ducking)
- 📅 Word-level sync (WhisperX) driving typewriter `cps` per word
- 📅 Keyboard sound packs (mechanical, membrane, typewriter, soft)
- 📅 Music ducking under voice

## 0.4 — Rendering (📅 Planned)

- 📅 Remotion `<Composition>` from `TippenProject`
- 📅 Server-side render with FFmpeg encode → MP4
- 📅 Cloudflare R2 upload of renders
- 📅 Render queue + progress UI
- 📅 GIF export (interface already exists in the editor)
- 📅 Frame-accurate scrubbing using Remotion's `<Player>`

## 0.5 — Realtime typing engine v2 (📅 Planned)

- 📅 Per-word timing model (not just `cps`)
- 📅 Variants: jitter, mistype, correction, emphasis
- 📅 Sync to voice timestamps with frame-accurate lookahead
- 📅 Multi-line composition (parallel / staggered)

## 0.6 — Plugin SDK (📅 Planned)

- 📅 `@tippen/renderer` package extracted
- 📅 Plugin manifest schema
- 📅 Custom preset plugin (registry + sandboxed eval)
- 📅 Custom background plugin

---

## 1.0 — Public stable release (📅 Planned)

When 0.2 → 0.6 land and the test suite (see [TESTING.md](./TESTING.md))
reaches the coverage targets, we'll cut 1.0 with:

- Stable project file format (`.tippen.json`) with migration tooling
- Comprehensive a11y audit
- Public docs site (this `docs/` folder as a static site)
- Semantic versioning guarantee

---

## Out of scope for the MVP (🚫)

These are explicitly **not** in the MVP or any near-term release. We may
revisit them post-1.0, but PRs adding them will be parked.

| Feature | Why deferred |
| --- | --- |
| **Collaboration** (multiplayer editing) | Requires operational-transform/CRDT infra and a realtime server. Out of scope until 1.0+ |
| **Teams & workspaces** | Tippen is a creator-first single-user tool for now |
| **Marketplace** (presets, themes, plugins) | Needs plugin SDK + moderation pipeline first |
| **Payments / subscriptions** | No business model yet. MIT-licensed open source |
| **Plugin system (runtime)** | Plugin *SDK* (0.6) is in scope; runtime *marketplace* is not |
| **Mobile apps (iOS/Android)** | Editor is desktop-first; mobile is read-only at best |
| **Realtime editing** (presence cursors) | Same as collaboration |
| **Cloud rendering** (Remotion Lambda) | Local render first; cloud is a 1.0+ optimization |
| **Social features** (comments, likes, profiles) | Tippen is a tool, not a network |
| **Generative video (text-to-video)** | Different product. Tippen composes text + motion, not pixels |

If you strongly believe one of these belongs in scope, open a Discussion
with a concrete use case. We're open to changing our minds with evidence.

---

## How we plan

The roadmap is reviewed monthly. Items move between "Planned" and "In
progress" based on contributor capacity and community interest. The best
signals we use:

1. **Issue reactions** — sort issues by 👍 to see demand.
2. **Discussions** — topics with the most engagement inform priorities.
3. **Contributor capacity** — a `good first issue` nobody picks up may
   stay parked.

## How to influence the roadmap

- 👍 an existing issue.
- Open a **Discussion** describing your use case (not just the feature).
- Pick up a `good first issue` or a `help wanted` issue.
- Sponsor development if you'd like to fund specific work (sponsorship
  accounts to be announced).

## Versioning

Tippen follows [Semantic Versioning](https://semver.org/):

- **0.x** — anything can change; minor versions may break.
- **1.0+** — backward-compatible changes per semver.

See [CHANGELOG.md](./CHANGELOG.md) for per-release history.
