# Timeline

> Tippen's timeline: track kinds, clips, playhead, zoom, and (planned)
> keyframes, snapping, and audio waveforms.

The timeline is the bottom panel of the editor. It shows every track in the
project, with clips positioned at their absolute `startMs`. The playhead
scrubs across all tracks in sync.

---

## 1. Track kinds

Tippen defines 9 track kinds in `TrackKind` (`src/lib/tippen/types.ts`):

| Kind | Color | Description |
| --- | --- | --- |
| `voice` | muted | Voiceover narration |
| `music` | muted | Background music |
| `typing` | ember | Typing reveal events (one clip per line) |
| `cursor` | muted | Cursor blink events |
| `highlights` | ember | Word-highlight events |
| `camera` | muted | Camera move keyframes |
| `background` | muted | Background change events |
| `sfx` | muted | Sound effects (whoosh, click, etc.) |
| `transitions` | muted | Scene-to-scene transitions |

Each `TimelineTrack` has:

```ts
interface TimelineTrack {
  id: string;
  kind: TrackKind;
  label: string;
  muted: boolean;
  locked: boolean;
  clips: TrackClip[];
}
```

Tracks are **fixed** in the MVP — you can't add or remove track kinds, only
operate on the clips inside them. Custom tracks are a 0.6 / plugin-SDK item.

## 2. Clips

```ts
interface TrackClip {
  id: string;
  trackId: string;
  label: string;
  startMs: number;
  durationMs: number;
  gain?: number;     // 0..1, used by voice/music tracks
  color?: string;    // "ember" | "muted" | CSS color
}
```

A clip is a discrete event on a track: a line being typed, a music segment
playing, a camera move happening. Clips render as colored bars. The seed
project ships with 12 clips spread across the 9 tracks (see
`src/lib/tippen/seed.ts`).

### Clip operations (MVP)

- **Move** — `moveClip(clipId, deltaMs)` shifts a clip in time (clamped to ≥ 0).
- **Select** — clicking a clip selects it and selects the scene that
  overlaps the clip's `startMs`.
- **Mute track** — `toggleMute(trackId)` silences all clips on the track
  (audio playback is planned; for now it's a UI flag).
- **Lock track** — `toggleLock(trackId)` prevents clip edits on that track.

### Clip operations (planned, see [ROADMAP.md](./ROADMAP.md))

- Resize (drag edges) — changes `durationMs`.
- Split at playhead.
- Ripple delete.
- Cross-fade between adjacent clips.
- Snap to scene boundaries + other clips.

## 3. Playhead

```ts
playheadMs: number;
isPlaying: boolean;
```

- **`playheadMs`** is the timeline cursor, in milliseconds. Range: `0`…
`project.settings.durationMs`.
- **`isPlaying`** is whether the rAF clock is advancing the playhead.

The clock lives in `usePlaybackClock()` (`src/hooks/use-typewriter.ts`). On
each `requestAnimationFrame`, it computes `dt = now - last`, adds it to
`playheadMs`, and calls `seek(next)`. It stops at `durationMs` and pauses.

`seek(ms)` clamps to `[0, durationMs]` so external callers (keyboard
arrows, click-to-scrub) can't go out of range.

## 4. Zoom

```ts
zoom: number; // 0.25 .. 4
```

The timeline supports 4× zoom-in (down to per-frame at 30fps) and 0.25×
zoom-out (overview). `setZoom(z)` clamps. Keyboard shortcuts: `⌘=`, `⌘-`,
`⌘0`. Zoom only affects the timeline pixels-per-millisecond scale — it
does **not** re-render the canvas.

## 5. Visual layout

```
        ┌───── zoom = 1.0 ─────┐
track   0s     4s     8s     12s
voice   ▐──────────────▐
music   ▐─────────────────────▐
typing  ▐────▐▐─────▐▐────▐
cursor  ▐────────────────────────┐
…
        ▬▬▬●▬▬▬▬▬▬▬▬▬▬▬  ← playhead at ~6s
```

The track header column on the left shows: label, mute toggle, lock toggle.
The clip area on the right shows bars positioned by `startMs` and sized by
`durationMs`, colored by `color` (or by track kind if unset).

## 6. Snapping (planned)

When dragging a clip, the timeline will snap its edges to:

- The playhead.
- Other clip edges on the same track.
- Scene boundaries.
- A configurable grid (e.g. 100ms).

Snapping will be toggleable with a magnet icon and a `⌘` modifier to
temporarily disable it.

## 7. Keyframes (planned)

Some track kinds (camera, gain, opacity) will support keyframes inside a
clip. A keyframe is `(timeMs, value)` on a named curve. The renderer
interpolates between keyframes using the clip's easing.

Planned keyframe kinds:

| Track kind | Keyframable property |
| --- | --- |
| `camera` | scale, panX, panY, tilt |
| `voice` / `music` | gain |
| `background` | opacity (for cross-fades) |
| `transitions` | progress |

Keyframes are stored on the clip:

```ts
// Planned extension to TrackClip
interface TrackClip {
  // …existing fields…
  keyframes?: Array<{
    id: string;
    timeMs: number;        // relative to clip start
    property: string;
    value: number;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  }>;
}
```

## 8. Selection vs. focus

- **Selected clip** — outlined with `ring-ember`. Drives the inspector
  context for camera / sfx / transition clips.
- **Selected track** — the track whose header is highlighted. Drives the
  track-level actions in the toolbar (mute, lock, delete).
- Both clear on `Esc` (along with scene / line selection).

## 9. Audio waveforms (planned)

When the audio engine lands (see [AUDIO_ENGINE.md](./AUDIO_ENGINE.md)),
voice and music clips will render a WaveSurfer.js waveform inside the
clip bar, with the playhead synced to the timeline clock. Clicking a
waveform seeks the playhead.

## 10. Performance

The timeline can show hundreds of clips. To keep it smooth:

- Clips are absolutely positioned divs — no layout reflow on scrub.
- The playhead is a single transform-X div, updated via `rAF` directly
  (no React state for the visual position — only `playheadMs` is in the
  store).
- Off-screen clips (outside the visible zoom window) are virtualized when
  the project exceeds 200 clips.

See [PERFORMANCE.md](./PERFORMANCE.md) for the full strategy.

## 11. See also

- [EDITOR.md](./EDITOR.md) — where the timeline sits in the layout
- [AUDIO_ENGINE.md](./AUDIO_ENGINE.md) — planned audio integration
- [RENDERING.md](./RENDERING.md) — how clips become frames
