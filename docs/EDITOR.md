# Editor

> Tippen's editor workspace: layout, panels, selection model, keyboard
> shortcuts, and the command palette.

The editor is the heart of Tippen. It opens when the user clicks any CTA on
the landing page (the Zustand store switches `view` from `"landing"` to
`"editor"`). For the MVP it lives at the same `/` URL — deep-linking comes
in 0.2 (see [ROADMAP.md](./ROADMAP.md)).

---

## 1. Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP NAV                                                                 │
│  TippenLogo │ Untitled Cinematic ▾   │ ⌘K   │ ◀ ▶ 00:12 / 00:38 │ ☀ │ ⬇ │
├────────┬────────────────────────────────────────────┬──────────────────┤
│ LEFT   │                                            │  INSPECTOR       │
│ SIDEBAR│                CANVAS                      │                  │
│        │           (CinematicStage)                 │  Scene           │
│ Scenes │                                            │  Text            │
│  • 1   │                                            │  Animation       │
│  • 2   │                                            │  Audio           │
│  • 3   │                                            │  AI              │
│  + new │                                            │                  │
│        │                                            │                  │
├────────┴────────────────────────────────────────────┴──────────────────┤
│ TIMELINE                                                                │
│  voice ▐─────────────────▐                                              │
│  music ▐──────────────────────────▐                                    │
│  typing ▐────▐▐──────▐▐────▐                                          │
│  cursor  ▐──────────────────────────────────────────▐                  │
│  …                                                                       │
│  ▬▬▬▬●▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  playhead                      │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Top nav

| Slot | What it does |
| --- | --- |
| **Logo** | Returns to the landing page (`openLanding()`) |
| **Project title** | Inline-editable project name |
| **⌘K** | Opens the command palette |
| **Transport** | Play/pause + current time / total duration |
| **Theme toggle** | Light / Dark / System |
| **Export** | Opens the export menu (MP4 / GIF) — UI only in MVP |

### 1.2 Left sidebar — Scenes

Lists every scene in the project. Click a scene to select it (and its first
line). Reorder via drag (dnd-kit). Each scene shows: index, name, duration,
background swatch. `+ new` adds a scene at the end.

### 1.3 Canvas

The `CinematicStage` component. It renders the currently-active scene
(whichever scene's `startMs` ≤ `playheadMs` < `startMs + durationMs`). It
applies the background, camera transform, and grain texture. Lines stack
vertically and reveal based on each line's preset and the playhead.

### 1.4 Right inspector

Five tabs:

| Tab | Controls |
| --- | --- |
| **Scene** | Scene name, background, start, duration, camera move |
| **Text** | Line content, font size, alignment, + / − line, line list |
| **Animation** | Preset picker, `cps` slider (for typewriter family), `durationMs` (for reveal family), cursor toggle |
| **Audio** | Voice upload (planned), music upload (planned), keyboard sound pack (planned), per-track gain |
| **AI** | Action buttons, prompt input, prompt history |

### 1.5 Bottom timeline

See [TIMELINE.md](./TIMELINE.md) for the full breakdown. TL;DR: 9 track
kinds, draggable clips, mute / lock per track, playhead with rAF clock,
zoom 0.25×–4×.

---

## 2. Selection model

The store tracks three selection IDs:

```ts
selectedSceneId: string | null;
selectedLineId:  string | null;
selectedTrackId: string | null;
```

Selection rules:

- Selecting a scene auto-selects its first line.
- Selecting a line implies its scene is also selected.
- Selecting a clip in the timeline selects its track and the scene that
  overlaps the clip's `startMs`.
- `Esc` clears all selections.

Selection is purely UI state — it does **not** push a history snapshot, so
you can't undo "I clicked a different scene". Only project mutations
(`addScene`, `updateLine`, `moveClip`, `applyAiResult`, etc.) push to
history.

---

## 3. Undo / redo

The store keeps `history.past` and `history.future` arrays of `TippenProject`
snapshots, capped at 50 entries each.

- **`⌘Z`** — `undo()` pops the most recent snapshot from `past`, pushes the
  current project onto `future`.
- **`⌘⇧Z`** / **`⌘Y`** — `redo()` reverses the above.
- Every mutating action calls `withHistory(state)` first, which clones the
  current project onto `past` and clears `future`.
- `canUndo()` / `canRedo()` are exposed as selectors for button states.

Undo is intentionally **project-scoped**. UI state (selection, zoom,
playhead, inspector tab) is never reverted — only the project itself.

---

## 4. Keyboard shortcuts

| Shortcut | Action | Notes |
| --- | --- | --- |
| `⌘Z` / `Ctrl+Z` | Undo | |
| `⌘⇧Z` / `Ctrl+Y` | Redo | `⌘Y` also works |
| `Space` | Play / pause | Ignored while typing in a text field |
| `⌘K` / `Ctrl+K` | Open command palette | Works even while typing |
| `⌘=` / `⌘+` | Zoom in (timeline) | Caps at 4× |
| `⌘-` | Zoom out (timeline) | Floors at 0.25× |
| `⌘0` | Reset zoom to 1× | |
| `←` | Seek −100ms | |
| `→` | Seek +100ms | |
| `N` | New scene | Added at the end; auto-selected |
| `Esc` | Deselect | Clears scene + line selection |

### Modifier notes

- `⌘` = `Cmd` on macOS, `Ctrl` on Windows/Linux.
- Shortcuts are **disabled while typing in an input / textarea / contenteditable
  / combobox**, except `⌘K` which always works.
- Shortcuts only fire while the editor view is mounted
  (`view === "editor"`).

### Where they're implemented

`src/hooks/use-tippen-shortcuts.ts` — a single `keydown` listener on
`window`. Mounted from `TippenApp` with `useTippenShortcuts(true)`.

---

## 5. Command palette (⌘K)

The command palette is a `cmdk`-powered overlay that exposes:

- **Navigation** — go to scene 1, 2, 3…; switch inspector tab; toggle theme.
- **Scenes** — add / duplicate / delete current scene.
- **Playback** — play, pause, seek to start / end.
- **Animation** — apply a preset to the selected line.
- **AI** — run any AI action against the current selection.
- **Help** — open docs (this folder).

The palette is mounted globally by `TippenApp` so it works from both the
landing page and the editor. While on the landing page, only navigation
commands are available.

---

## 6. Canvas behavior

### Playhead → active scene

The active scene is the first scene where
`scene.startMs ≤ playheadMs < scene.startMs + scene.durationMs`. If the
playhead is past the last scene's end, the last scene stays active (frozen
at its final frame).

### Line timing within a scene

Each scene stacks its lines vertically. The first line starts at
`scene.startMs`. Subsequent lines start after a per-preset default
(typewriter family ≈ 2.6 s, reveal family ≈ 1.2 s). This is currently
approximate — per-line explicit timing is a 0.5 roadmap item.

### Camera transform

`useCameraTransform(scene, playhead)` returns a CSS transform string based
on `scene.camera` and the elapsed progress through the scene. Curves are
`easeOutQuad` for cinematic feel.

### Backgrounds

Six backgrounds (Ink, Paper, Ember, Midnight, Studio, Noir). The stage
swaps background style and foreground color via `backgroundStyle()` /
`backgroundForeground()` in `src/lib/tippen/seed.ts`. The "Ember" and
"Midnight" backgrounds use radial gradients; the rest are flat OKLCH.

---

## 7. Performance notes

The editor is built to feel instant. Key choices:

- The typing reveal is **pure** — `useTypewriter(content, preset, startMs,
  playhead)` has no internal timers. State changes happen via the rAF
  clock, which only updates `playheadMs`.
- The store uses fine-grained selectors (`useEditorStore(s => s.x)`) so a
  selection change doesn't re-render the canvas.
- The canvas is `React.memo`'d where useful and never re-renders on zoom
  changes — zoom only affects the timeline.

See [PERFORMANCE.md](./PERFORMANCE.md) for the full write-up.

---

## 8. Accessibility

The editor is keyboard-first. See [ACCESSIBILITY.md](./ACCESSIBILITY.md)
for the full WCAG targets. Highlights:

- All panels are reachable via Tab.
- The command palette is a `combobox` with proper `aria-activedescendant`.
- The canvas exposes `role="img"` with an `aria-label` describing the
  active scene.
- `prefers-reduced-motion` disables camera moves and reduces caret blink.

---

## 9. See also

- [TIMELINE.md](./TIMELINE.md) — timeline internals
- [AI.md](./AI.md) — AI panel internals
- [THEMES.md](./THEMES.md) — theme toggle internals
- [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) — component inventory
