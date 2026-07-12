# Performance

> How Tippen stays at 60 fps in the editor and loads fast on the landing
> page.

Performance is a feature. Tippen targets:

- **60 fps** editor canvas on a 2020-era laptop.
- **< 2 s** landing page first contentful paint on a cable connection.
- **< 200 KB** initial JS bundle for the landing page (gzip).
- **< 50 ms** input-to-paint latency for keyboard shortcuts.

---

## 1. The core invariant: deterministic typing

The single biggest performance decision in Tippen:

> **`useTypewriter(content, preset, startMs, playhead)` is a pure function
> of `(content, preset, startMs, playhead)`. It has no internal timers, no
> per-character state, and no side effects.**

This means:

- There are no `setTimeout` chains creating typewriter characters.
- The visible substring is **re-derived** from the playhead on every
  render.
- Scrubbing, undo/redo, and (future) server rendering all "just work".
- React's reconciler sees the same component tree on every frame; only the
  `slice(0, n)` text content changes.

The playhead itself moves via a single `requestAnimationFrame` loop in
`usePlaybackClock()`. Only `playheadMs` updates per frame — selection,
zoom, and UI state are independent.

## 2. Zustand selectors

The store is large (project, selection, playback, UI, history, AI). To
avoid re-rendering the whole editor on every playhead tick:

```tsx
// ✅ Pick a slice — only re-renders when playheadMs changes
const playhead = useEditorStore((s) => s.playheadMs);

// ✅ Pick an action — never changes, so never re-renders
const seek = useEditorStore((s) => s.seek);

// ❌ Don't subscribe to the whole store
const store = useEditorStore();
```

For derived multi-field slices that return a new object, use
`useEditorStore.useShallow(...)` (Zustand 5) to avoid infinite re-renders.

## 3. Memoization

- `CinematicStage` and `CinematicLine` are `React.memo`'d where measured
  to help.
- Expensive derivations (e.g. `renderHighlights`) live inside
  `useMemo` keyed on their inputs.
- `useCameraTransform(scene, playhead)` is `useMemo`'d on `[scene, playhead]`.

## 4. requestAnimationFrame for the playhead

`usePlaybackClock()` advances `playheadMs` via rAF:

```ts
const tick = (now: number) => {
  const dt = now - lastRef.current;
  lastRef.current = now;
  const next = playheadMs + dt;
  if (next >= durationMs) {
    seek(durationMs);
    pause();
    return;
  }
  seek(next);
  rafRef.current = requestAnimationFrame(tick);
};
```

This is ~16 ms cadence on a 60 Hz display, frame-accurate to the display
refresh. There's no `setInterval` involved.

## 5. Lazy loading & code splitting

- The **landing page** is the default view. The editor bundle is loaded on
  first user click via `next/dynamic` (planned — currently loaded eagerly
  for the MVP).
- Heavy shadcn/ui components (e.g. `command` for cmdk) are dynamically
  imported only when opened.
- Fonts load via `next/font/google` with `display: swap` — text renders
  immediately, font swaps in without layout shift.

Planned: dynamic import of:

- `EditorWorkspace` (only when entering editor)
- `EditorCommandPalette` (only when ⌘K is pressed)
- `ExportDialog` (only when export is clicked)
- `AiPanel` (could be deferred to inspector tab switch)

## 6. Virtualization

The timeline virtualizes clips when a project exceeds **200 clips**
(planned). The scene sidebar virtualizes when a project exceeds **100
scenes** (planned — very unlikely in practice). The prompt history list
virtualizes after **50 entries** (planned).

For the MVP's seed project (12 clips, 3 scenes, 0 prompts), no
virtualization is needed.

## 7. CSS performance

- All canvas animations use `transform` and `opacity` only — these are
  GPU-accelerated and don't trigger layout.
- The grain overlay is a single `radial-gradient` on a 4×4 px tile —
  effectively free.
- The bottom vignette is a single linear gradient.
- `will-change-transform` is set on the camera layer and on `CinematicLine`
  to hint the compositor.

Avoid triggering layout:

- ❌ Changing `width`, `height`, `top`, `left`, `padding`, `margin` during
  animation.
- ✅ Changing `transform`, `opacity`, `filter`.

## 8. Bundle size

- **shadcn/ui** is already tree-shakeable (per-component imports).
- **Radix primitives** are tree-shakeable.
- **framer-motion** is imported only where used (planned: dynamic import).
- **lucide-react** icons are imported individually, not via barrel.
- **Prisma** is server-only (it ships in the Next.js server bundle, not
  the client).

Watch the bundle with:

```bash
ANALYZE=true bun run build
```

(Requires `@next/bundle-analyzer` to be added — planned.)

## 9. SEO for the landing page

The landing page is server-rendered (RSC). Key choices:

- **Metadata** in `layout.tsx` — title template, description, OpenGraph,
  Twitter card, icons, robots.
- **Semantic HTML** — `<main>`, `<section>`, `<h1>`, `<h2>`.
- **Static demo content** — the hero shows a live cinematic demo, but the
  text is in the server-rendered HTML (the demo just animates what's
  already there).
- **`robots.txt`** in `public/`.
- **`sitemap.xml`** — planned post-1.0.

## 10. Accessibility is performance

A screen reader navigating a 10,000-node DOM is slow. We keep the editor
DOM shallow:

- Inspector tabs are conditionally rendered (only the active tab is in the
  DOM).
- The command palette is mounted once globally, not per panel.
- Off-screen scenes are not rendered (only the active scene is in the
  canvas).

## 11. Network performance (planned)

When the API lands:

- **HTTP/2** everywhere (Vercel + Railway default).
- **Brotli compression** for text assets (Vercel default).
- **Long-term caching** for static assets (Next.js content hashing).
- **Edge caching** for public assets (R2 behind Cloudflare CDN).
- **Query batching** via TanStack Query's `staleTime` + deduplication.

## 12. Measured targets

| Metric | Target | How we measure |
| --- | --- | --- |
| Editor canvas fps | ≥ 60 fps | DevTools Performance tab |
| Playhead scrubbing latency | ≤ 16 ms | rAF budget |
| Landing FCP | < 2 s | Lighthouse |
| Landing LCP | < 2.5 s | Lighthouse |
| Landing CLS | < 0.1 | Lighthouse |
| Landing TTI | < 3 s | Lighthouse |
| Initial JS (gzip) | < 200 KB | `@next/bundle-analyzer` |

## 13. Anti-patterns

- ❌ `setTimeout` for animations — use rAF or CSS animations.
- ❌ `setInterval` for the playhead — drifts and stacks in background tabs.
- ❌ Subscribing to the whole Zustand store.
- ❌ Laying out per-frame (changing `width`/`height` on animation).
- ❌ Inline functions passed to memoized children (re-creates every render).
- ❌ Loading the editor bundle on the landing page (defeats code splitting).
- ❌ Rendering all scenes at once (only the active scene is in the canvas).

## 14. See also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — where the bottlenecks live
- [VIDEO_ENGINE.md](./VIDEO_ENGINE.md) — canvas-specific performance
- [TIMELINE.md](./TIMELINE.md) — timeline-specific performance
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) — DOM depth budget
