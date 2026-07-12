# Changelog

All notable changes to Tippen are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open-source repository scaffolding: `LICENSE` (MIT), `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `ROADMAP.md`, and the full
  `docs/` set.
- GitHub community files: bug report + feature request issue templates,
  PR template, `config.yml` (links to Discussions + Security),
  `dependabot.yml` (npm weekly, github-actions monthly), `FUNDING.yml`
  (empty), and `workflows/ci.yml` (lint + typecheck, build optional).
- Root config: `.env.example`, `.editorconfig`, `.prettierrc`,
  `.gitattributes`, expanded `.gitignore`.

### Changed

- Nothing yet.

### Deprecated

- Nothing yet.

### Removed

- Nothing yet.

### Fixed

- Nothing yet.

### Security

- Nothing yet.

---

## [0.1.0] — Initial MVP

The first usable Tippen build. A focused single-page cinematic text
storytelling editor with a live demo, an animation engine, and the editor
surface for cinematic text.

### Added — Foundation

- OKLCH design system with `ember` (warm amber) + `ink` (neutral) palette
  in `src/app/globals.css`. Semantic tokens only — no hardcoded colors.
- Light + Dark + System themes via `next-themes` (class strategy,
  `defaultTheme="dark"`, no-flash inline script).
- Geist Sans / Geist Mono / Instrument Serif fonts via `next/font/google`.
- Root layout (`src/app/layout.tsx`) with full SEO metadata, OpenGraph,
  Twitter card, theme-color viewport, inline SVG favicon.
- Domain model in `src/lib/tippen/types.ts`: `AnimationPresetId`,
  `TextLine`, `Scene`, `BackgroundId`, `CameraMove`, `TrackKind`,
  `TrackClip`, `TimelineTrack`, `ProjectSettings`, `TippenProject`,
  `AiActionId`, `PromptHistoryEntry`.
- Animation preset registry (`src/lib/tippen/animation-presets.ts`) with
  11 presets: Typewriter, Terminal, Apple Intro, Fade, Slide, Zoom, Blur,
  Highlight, Cursor Blink, Elastic, Minimal. Split into typewriter family
  (char-by-char, `cps`-driven) and reveal family (transform / opacity /
  blur, `durationMs`-driven). Helpers: `getPreset`, `isTypewriterPreset`,
  `PRESET_ORDER`.
- Seed project (`src/lib/tippen/seed.ts`): 3 cinematic scenes (Cold Open,
  The Premise, The Reveal), 9 timeline tracks, 12 clips. Background
  helpers: `BACKGROUND_OPTIONS`, `backgroundStyle`, `backgroundForeground`.
- Zustand store (`src/stores/editor-store.ts`) with: view routing
  (landing/editor), project state, selection (scene / line / track),
  playback (isPlaying / playheadMs / zoom), inspector tab, command palette
  open, prompt history, full undo/redo (50 steps), all scene / line / track
  / settings actions, `applyAiResult()` for AI edits. Convenience
  selectors: `useSelectedScene`, `useSelectedLine`, `useTrackColor`.
- Deterministic typing engine (`src/hooks/use-typewriter.ts`):
  `useTypewriter()` is a pure function of `(content, preset, startMs,
  playhead)` — no per-character timers. Plus `usePlaybackClock()` rAF
  clock that advances `playheadMs` while `isPlaying`.
- Global keyboard shortcuts (`src/hooks/use-tippen-shortcuts.ts`): ⌘Z / ⌘⇧Z
  undo/redo, Space play/pause, ⌘K command palette, ⌘= / ⌘- / ⌘0 zoom, ← / →
  seek, N new scene, Esc deselect. Disabled while typing in inputs.
- Shared cinematic renderer (`src/components/tippen/cinematic-stage.tsx`):
  `CinematicStage` (background + grain + vignette + camera transform +
  lines) and `CinematicLine` (visible substring + highlight spans +
  blinking caret). Used by BOTH the landing demo and the editor canvas —
  single source of truth.
- Root shell (`src/components/tippen/tippen-app.tsx`): picks LandingPage vs
  EditorWorkspace from store; mounts global Command Palette.
- Theme provider + toggle (`src/components/tippen/theme-provider.tsx`,
  `theme-toggle.tsx`).
- Tippen logo wordmark + blinking caret glyph
  (`src/components/tippen/tippen-logo.tsx`).

### Added — Animation engine

- 11 presets, two families (see above).
- 6 backgrounds: Ink, Paper, Ember, Midnight, Studio, Noir. OKLCH flat
  colors for most; radial gradients for Ember and Midnight.
- 6 camera moves: static, push-in, pull-out, pan-left, pan-right, tilt-up.
  All curves `easeOutQuad` over the scene's duration.
- Highlight spans — ember-colored word ranges within a line.

### Added — Editor surface

- Top nav (logo, project title, ⌘K, transport, theme toggle, export).
- Left scene sidebar (list, reorder, add, duplicate, delete).
- Center canvas (`CinematicStage`).
- Right inspector with 5 tabs: Scene · Text · Animation · Audio · AI.
- Bottom timeline with 9 track kinds and clip dragging.
- Command palette (⌘K) powered by cmdk.
- Project settings dialog (title, dimensions, fps, duration, background).

### Added — Landing page

- Live cinematic hero demo using the same `CinematicStage` as the editor.
- Feature highlights, animation preset gallery, open-source CTA, footer.

### Added — AI panel (UI + minimal wiring)

- 7 AI actions: Generate Intro, Rewrite Script, Generate Typing Timing,
  Voice→Text, Word-Level Sync, Auto Highlight, Scene Suggestions.
- Prompt history (capped at 50 entries, client-side).
- Graceful degradation when no AI provider is configured — the rest of the
  editor works normally.

### Added — Persistence (placeholder)

- Prisma + SQLite schema (`prisma/schema.prisma`) with placeholder `User`
  and `Post` models. The editor's project state lives in the Zustand
  store, seeded by `createSeedProject()`. Real persistence is planned (see
  [ROADMAP.md](./ROADMAP.md)).

### Added — API

- `GET /api` health check (`src/app/api/route.ts`).
- `POST /api/tippen/ai` route (planned — interface only in MVP).

### Notes

- **Out of scope for 0.1** (see ROADMAP.md): collaboration, teams,
  marketplace, payments, plugins, mobile apps, realtime editing, cloud
  rendering, social features.
- **No tests yet.** The testing strategy is documented in
  [TESTING.md](./TESTING.md); the suite lands in 0.2+.
- **No real rendering yet.** Export UI exists; encoding is planned in 0.4
  via Remotion + FFmpeg.
- **No real audio yet.** Audio UI exists; the audio engine is planned in
  0.3 via WaveSurfer.js + Web Audio API.

[Unreleased]: https://github.com/tippen/tippen/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/tippen/tippen/releases/tag/v0.1.0
