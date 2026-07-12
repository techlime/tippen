# Component Guide

> Inventory of Tippen's components, their props, and how to build a new
> feature component.

## 1. Inventory

Components live in `src/components/`. Two roots:

- `src/components/tippen/` — Tippen-specific feature components.
- `src/components/ui/` — shadcn/ui primitives (Radix-based). We don't
  document these here; see the [shadcn/ui docs](https://ui.shadcn.com/).

### 1.1 Tippen feature components

| Component | File | Purpose |
| --- | --- | --- |
| `TippenApp` | `tippen-app.tsx` | Root shell — picks Landing vs Editor, mounts shortcuts + command palette |
| `TippenThemeProvider` | `theme-provider.tsx` | `next-themes` wrapper |
| `ThemeToggle` | `theme-toggle.tsx` | Light / Dark / System dropdown |
| `TippenLogo` | `tippen-logo.tsx` | Wordmark + blinking caret glyph |
| `CinematicStage` | `cinematic-stage.tsx` | Renders a `Scene` (background, camera, grain, lines) |
| `CinematicLine` | `cinematic-stage.tsx` | Renders a single `TextLine` with its preset reveal |
| `LandingPage` | `landing/landing-page.tsx` | Marketing landing page |
| `EditorWorkspace` | `editor/editor-workspace.tsx` | The editor (top nav, sidebar, canvas, inspector, timeline) |
| `EditorCommandPalette` | `editor/command-palette.tsx` | ⌘K command palette (cmdk) |

Editor subpanels (planned location: `src/components/tippen/editor/`):

| Component (planned) | Purpose |
| --- | --- |
| `TopNav` | Project title, transport, theme toggle, export |
| `SceneSidebar` | Left sidebar — scene list, reorder, add |
| `InspectorPanel` | Right panel — tabbed (Scene / Text / Animation / Audio / AI) |
| `SceneTab` / `TextTab` / `AnimationTab` / `AudioTab` / `AiTab` | Inspector tabs |
| `TimelinePanel` | Bottom panel — tracks, clips, playhead |
| `ExportDialog` | Export MP4 / GIF (UI only in MVP) |

Landing subcomponents (planned location: `src/components/tippen/landing/`):

| Component (planned) | Purpose |
| --- | --- |
| `Hero` | Headline + live cinematic demo |
| `FeatureGrid` | Feature highlights |
| `PresetShowcase` | Gallery of animation presets |
| `OpenSourceBanner` | MIT license + GitHub CTA |
| `Footer` | Links + branding |

---

## 2. Shared components

### `TippenLogo`

```tsx
<TippenLogo className="h-6" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Height/width overrides |
| `withCaret` | `boolean` | `true` | Show the blinking caret glyph |

The logo is a wordmark + animated caret. The caret uses `.caret-blink`
(disabled under reduced-motion).

### `CinematicStage`

```tsx
<CinematicStage scene={scene} playhead={playheadMs} letterboxed />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scene` | `Scene` | — | The scene to render |
| `playhead` | `number` | — | Current playhead in ms |
| `className` | `string` | — | Extra classes on the root |
| `letterboxed` | `boolean` | `true` | Cap content width to `max-w-5xl` |

Renders the background, grain, vignette, camera transform layer, and stacks
the scene's lines via `CinematicLine`. Used by **both** the landing demo
and the editor canvas — this is the single source of truth for what a scene
looks like.

### `CinematicLine`

```tsx
<CinematicLine line={line} startMs={lineStart} playhead={playheadMs} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `line` | `TextLine` | — | The line to render |
| `startMs` | `number` | — | When this line begins (absolute ms) |
| `playhead` | `number` | — | Current playhead in ms |
| `className` | `string` | — | Extra classes |

Calls `useTypewriter(content, preset, startMs, playhead, cps)` internally
and renders the visible substring with highlight spans and a blinking
caret. Pure function of `playhead` — never has internal timers.

### `ThemeToggle`

```tsx
<ThemeToggle />
```

No props. A dropdown with Light / Dark / System. Uses `next-themes`'
`useTheme()` hook. Mounted in the editor's `TopNav` and on the landing
page's header.

### `TippenThemeProvider`

```tsx
<TippenThemeProvider>{children}</TippenThemeProvider>
```

Wraps the app in `next-themes`' `ThemeProvider` with `attribute="class"`,
`defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`. Mounted
once in `src/app/layout.tsx`. See [THEMES.md](./THEMES.md).

---

## 3. Hooks (companion to components)

These aren't components but are used everywhere:

| Hook | File | Purpose |
| --- | --- | --- |
| `useTypewriter` | `hooks/use-typewriter.ts` | Pure reveal engine — returns `{ visible, cursor, opacity, transform, filter, done }` |
| `usePlaybackClock` | `hooks/use-typewriter.ts` | rAF clock that advances `playheadMs` while `isPlaying` |
| `useTippenShortcuts` | `hooks/use-tippen-shortcuts.ts` | Global keyboard shortcuts (only when `enabled && view === "editor"`) |
| `useSelectedScene` | `stores/editor-store.ts` | Selector returning the currently-selected `Scene \| null` |
| `useSelectedLine` | `stores/editor-store.ts` | Selector returning the currently-selected `TextLine \| null` |

---

## 4. Store selectors

The Zustand store exposes a fine-grained selector API. Always pick a
slice — never subscribe to the whole store.

```tsx
// ✅ Pick a slice
const playhead = useEditorStore((s) => s.playheadMs);

// ✅ Pick an action
const seek = useEditorStore((s) => s.seek);

// ❌ Never do this — re-renders on every store change
const store = useEditorStore();
```

For multi-field selectors that return a new object each call, use
`useEditorStore.useShallow(...)` from Zustand 5 to avoid infinite re-renders.

---

## 5. Building a new feature component

Let's say you're adding a **"PresetPreview"** thumbnail to the Animation
tab. Here's the recipe:

### 5.1 Pick the folder

This is an editor inspector component →
`src/components/tippen/editor/preset-preview.tsx`.

### 5.2 Skeleton

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { CinematicStage } from "@/components/tippen/cinematic-stage";
import type { AnimationPresetId } from "@/lib/tippen/types";
import { getPreset } from "@/lib/tippen/animation-presets";

interface PresetPreviewProps {
  preset: AnimationPresetId;
  className?: string;
}

export function PresetPreview({ preset, className }: PresetPreviewProps) {
  const playhead = useEditorStore((s) => s.playheadMs);
  const meta = getPreset(preset);

  // Build a tiny demo scene for this preset
  const demoScene = React.useMemo(
    () => ({
      id: `preview-${preset}`,
      name: meta.name,
      background: "ink" as const,
      startMs: 0,
      durationMs: 2000,
      camera: "static" as const,
      lines: [
        {
          id: "preview-line",
          content: meta.name,
          preset,
          cps: meta.cps ?? 18,
          fontSize: 28,
          align: "center" as const,
          highlights: [],
        },
      ],
    }),
    [preset, meta],
  );

  return (
    <div className={cn("aspect-video overflow-hidden rounded-md", className)}>
      <CinematicStage scene={demoScene} playhead={playhead % 2000} letterboxed={false} />
    </div>
  );
}
```

### 5.3 Checklist

- [ ] `"use client";` if it uses hooks/state/event handlers.
- [ ] Imports ordered (React → third-party → `@/` → relative).
- [ ] Props interface named `<Component>Props`, with `className?: string`
      for reusable components.
- [ ] No hardcoded colors — only tokens.
- [ ] Works in light and dark themes.
- [ ] Respects `prefers-reduced-motion` (test by enabling it in DevTools).
- [ ] Keyboard-reachable — every interactive element responds to Tab +
      Enter / Space.
- [ ] No console errors in the dev console.
- [ ] File under 400 lines. Split if it grows.

### 5.4 Wire it up

Import it where you need it:

```tsx
// src/components/tippen/editor/animation-tab.tsx
import { PresetPreview } from "./preset-preview";

<PresetPreview preset="typewriter" />
```

### 5.5 Test it

For now, manual testing in the browser is the bar (see
[TESTING.md](./TESTING.md)). Once Vitest is set up, add a test next to the
component:

```
src/components/tippen/editor/preset-preview.test.tsx
```

---

## 6. Don't fork the cinematic stage

The single most important contract in Tippen: **the editor canvas and the
landing demo share `CinematicStage`**. Never make a "preview" version of
the stage that diverges. If you need a smaller / different stage, pass
props (`letterboxed={false}`, a smaller wrapper, etc.).

If you genuinely need different rendering, extend `CinematicStage` with a
prop rather than duplicating it. See [VIDEO_ENGINE.md](./VIDEO_ENGINE.md)
for why this matters for the Remotion pipeline.

## 7. See also

- [STYLE_GUIDE.md](./STYLE_GUIDE.md) — how to write the component code
- [EDITOR.md](./EDITOR.md) — where each component sits in the editor
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how components compose
