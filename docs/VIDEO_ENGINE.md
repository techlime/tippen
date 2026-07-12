# Video Engine

> The canvas layer that renders a `Scene` to pixels — today (DOM-based
> `CinematicStage`) and tomorrow (Konva.js accelerated canvas).

## 1. Current MVP state

Tippen's video engine today is **DOM-based**. The `CinematicStage`
component (`src/components/tippen/cinematic-stage.tsx`) renders a `<div>`
tree:

- A background div with `backgroundStyle(scene.background)`.
- A grain overlay div (`.bg-grain`).
- A camera-transform div (CSS `transform`).
- A vertical stack of `CinematicLine` components — each a `<div>` with
  highlight spans, a cursor span, and inline styles for `fontSize`,
  `opacity`, `transform`, `filter`.

This is fast enough for the editor preview at 60 fps on a modern laptop
because:

- The typing reveal is a pure function of the playhead — no per-character
  timers, no React state for individual characters.
- The store uses fine-grained selectors so unrelated state changes don't
  re-render the canvas.
- All animation is done with `transform` and `opacity` (GPU-accelerated).

It is **not** fast enough for headless rendering at scale, nor does it
support pixel-precise compositing (e.g. layered videos, particles, complex
gradients). That's where Konva.js comes in.

## 2. Why DOM today?

Three reasons:

1. **Same renderer as Remotion.** Remotion renders React to a DOM via
   `@remotion/renderer`. By keeping the canvas DOM-based, the editor
   preview and the final render share `CinematicStage` exactly. See
   [RENDERING.md](./RENDERING.md).
2. **Accessibility.** DOM text is selectable, screen-reader-friendly, and
   searchable. A `<canvas>` requires manual a11y mirroring.
3. **Velocity.** The MVP was built in days. Konva would have added weeks.

## 3. Target: Konva.js (planned 0.5+)

When the editor needs:

- Layered video backgrounds.
- Particle / shader effects.
- Multi-line composition with parallel / staggered animation.
- 100+ lines per scene without dropping frames.

…we'll add an optional Konva.js renderer. The contract:

```ts
// packages/renderer/src/konva-stage.ts (planned)
interface StageRenderer {
  mount(container: HTMLDivElement, scene: Scene, playheadMs: number): void;
  update(playheadMs: number): void;
  unmount(): void;
}
```

The store will pick the renderer based on scene complexity:

```ts
const useKonva = scene.lines.length > 20 || scene.background === "video";
```

Konva and DOM renderers will produce visually identical output for the
scenes they both support — verified by Playwright snapshot tests.

## 4. Scene composition

A `Scene` is composed in this order (back to front):

1. **Background** — flat OKLCH color or radial gradient (Ink, Paper, Ember,
   Midnight, Studio, Noir). See `backgroundStyle()` in `seed.ts`.
2. **Grain overlay** — radial-gradient dots at 4×4 px, opacity 60%. Adds
   cinematic texture.
3. **Bottom vignette** — `bg-gradient-to-b from-black/0 via-black/0 to-black/20`.
4. **Camera transform layer** — applies `scene.camera` (static / push-in /
   pull-out / pan-left / pan-right / tilt-up) as a CSS `transform` on the
   content wrapper. Easing is `easeOutQuad` over the scene's duration.
5. **Lines** — vertical stack, centered, with `gap-4` and `px-[8%]` padding.
   Letterboxed to `max-w-5xl` when `letterboxed` is true (default).

## 5. Camera moves

`useCameraTransform(scene, playhead)` returns a CSS `transform` string:

| Camera | Transform | Notes |
| --- | --- | --- |
| `static` | `scale(1)` | No motion |
| `push-in` | `scale(1 → 1.08)` | Subtle zoom in over scene duration |
| `pull-out` | `scale(1.08 → 1)` | Reverse of push-in |
| `pan-left` | `translateX(0 → +3%)` | Camera pans left, content shifts right |
| `pan-right` | `translateX(0 → −3%)` | Camera pans right, content shifts left |
| `tilt-up` | `translateY(0 → +3%)` | Camera tilts up, content shifts down |

All curves are `easeOutQuad`: `1 − (1 − progress)²`. Camera progress is
clamped to `[0, 1]` so before the scene starts and after it ends, the
transform stays at its endpoints.

## 6. Backgrounds

| ID | Style | Foreground |
| --- | --- | --- |
| `ink` | Flat `oklch(0.18 0.008 264)` | `oklch(0.97 0.004 95)` |
| `paper` | Flat `oklch(0.97 0.004 95)` | `oklch(0.18 0.008 264)` |
| `ember` | Radial gradient, warm amber → ink | `oklch(0.97 0.004 95)` |
| `midnight` | Radial gradient, purple → ink | `oklch(0.97 0.004 95)` |
| `studio` | Flat `oklch(0.3 0.02 264)` | `oklch(0.97 0.004 95)` |
| `noir` | Flat `oklch(0.08 0 0)` | `oklch(0.97 0.004 95)` |

All backgrounds use OKLCH for perceptual consistency across light/dark
themes. See [THEMES.md](./THEMES.md).

## 7. Lines

Each `CinematicLine` renders:

1. A wrapper `<div>` with inline `fontSize`, `lineHeight: 1.15`, `textAlign`,
   `opacity`, `transform`, `filter`, `fontWeight: 560`,
   `letterSpacing: -0.02em`. The `terminal` preset adds `font-mono`.
2. **Highlight spans** — `renderHighlights()` splits the visible substring
   by `line.highlights` ranges and wraps each in a `<span style={{ color:
   'var(--ember)' }}>`.
3. **Cursor** — a blinking caret span (`.caret-blink`), shown when the
   preset's `cursor` flag is true and the line is still being typed.

Line timing is **derived**: each line's `startMs` is computed cumulatively
from the scene's `startMs` plus the previous line's per-preset default
duration (typewriter ≈ 2.6 s, reveal ≈ 1.2 s). Per-line explicit timing is
planned for 0.5.

## 8. Export

The DOM canvas can't be directly exported. Two paths:

1. **Headless render (planned 0.4)** — Remotion renders `CinematicStage`
   server-side, frame by frame. This is the primary export path.
2. **In-browser capture (planned 0.4)** — A `<canvas>` is mounted on top of
   the stage, `html2canvas`-style, and `MediaRecorder` captures it. Lower
   fidelity, but no server round-trip. Used for quick ≤10s previews.

For Konva-based scenes, export is direct: `stage.toCanvas()` per frame,
encoded by FFmpeg.

## 9. Pixel ratio

The stage renders at the project's `settings.width × settings.height`
(typically 1920×1080) but is scaled down via CSS to fit the editor canvas
area. The scaling is `transform: scale()` so the rendered DOM is always at
"full res" — important for Remotion to capture crisp frames.

## 10. Limitations (MVP)

- No video backgrounds (planned — needs Konva).
- No particles or shader effects.
- No multi-line parallel / staggered composition (lines stack
  sequentially).
- No pixel-precise text wrapping — long lines may overflow on small
  canvases. Use shorter lines or smaller `fontSize`.

## 11. See also

- [RENDERING.md](./RENDERING.md) — how the stage becomes an MP4
- [THEMES.md](./THEMES.md) — background color tokens
- [PERFORMANCE.md](./PERFORMANCE.md) — why this stays 60 fps
- [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) — `CinematicStage` props
