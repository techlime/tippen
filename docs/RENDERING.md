# Rendering

> How a Tippen project becomes an MP4 / GIF — the planned Remotion pipeline
> and the current MVP state.

## 1. Current MVP state

The MVP ships **UI only** for export:

- The top nav has an **Export** button that opens a menu with **MP4** and
  **GIF** options.
- Selecting either shows a dialog with: resolution, fps, format, and a
  "Render" button.
- Clicking "Render" shows a "coming in 0.4" message — no encoding happens.

This is intentional. The MVP focuses on the editing experience. The render
pipeline is a 0.4 milestone (see [ROADMAP.md](./ROADMAP.md)).

What **does** work today:

- The `CinematicStage` component renders frame-accurate to the playhead.
- The deterministic typing engine (`useTypewriter`) is a pure function of
  `(content, preset, startMs, playhead)`, which means **the same input
  always produces the same frame**. That's the contract Remotion needs.

## 2. Target architecture

```
TippenProject (browser)
   │
   │  1. POST /v1/renders { projectId, format, fps }
   ▼
Hono API (Railway)
   │  2. Validates + persists render row (status: pending)
   │  3. Uploads project JSON to R2
   │  4. Enqueues render job
   ▼
Render worker
   │  5. Pulls project JSON from R2
   │  6. Builds a Remotion <Composition> from it
   │  7. renderMedia() → frames → FFmpeg encode
   │  8. Uploads MP4/GIF to R2
   │  9. PATCHes render row (status: done, url: signed R2 URL)
   ▼
Browser polls /v1/renders/:id
   │ 10. Shows progress bar (Remotion reports frame N of M)
   │ 11. When done, shows download button → signed R2 URL
```

## 3. Remotion composition

The renderer maps a `TippenProject` to a Remotion `<Composition>`:

```tsx
// packages/renderer/src/TippenComposition.tsx (planned)
import { Composition, AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CinematicStage } from "@tippen/editor";  // reuse the same renderer

export const TippenComposition: React.FC<{ project: TippenProject }> = ({
  project,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const playheadMs = (frame / fps) * 1000;

  const activeScene =
    project.scenes.find(
      (s) =>
        s.startMs <= playheadMs && playheadMs < s.startMs + s.durationMs,
    ) ?? project.scenes[project.scenes.length - 1];

  return (
    <AbsoluteFill>
      <CinematicStage scene={activeScene} playhead={playheadMs} />
    </AbsoluteFill>
  );
};
```

Registering the composition:

```tsx
// packages/renderer/src/index.ts (planned)
import { registerRoot } from "remotion";
import { TippenComposition } from "./TippenComposition";

registerRoot(() => (
  <Composition
    id="TippenProject"
    component={TippenComposition}
    durationInFrames={Math.ceil((project.settings.durationMs / 1000) * project.settings.fps)}
    fps={project.settings.fps}
    width={project.settings.width}
    height={project.settings.height}
    defaultProps={{ project }}
  />
));
```

### 3.1 Why this works

Reusing `CinematicStage` is the key insight. The editor preview and the
final render share the exact same renderer, so:

- **What you see is what you get.** No "preview differs from export" bugs.
- **Determinism is free.** `useTypewriter` is pure, and Remotion drives it
  via `useCurrentFrame` — frame N always produces the same pixels.
- **Code reuse.** Bug fixes in `CinematicStage` flow to both surfaces.

## 4. FFmpeg encoding

Remotion's `renderMedia()` already wraps FFmpeg. We expose these knobs:

| Knob | Values | Default |
| --- | --- | --- |
| `format` | `mp4` / `gif` / `webm` | `mp4` |
| `codec` | `h264` / `h265` / `vp9` / `prores` | `h264` |
| `crf` | 0–51 (lower = better) | 18 |
| `fps` | 24 / 30 / 60 | 30 |
| `scale` | 0.5 / 1 / 2 | 1 |
| `audioCodec` | `aac` / `opus` | `aac` |
| `audioBitrate` | `128k` / `192k` / `320k` | `192k` |

GIFs are encoded via `gifski` (passed through FFmpeg's palettegen/paletteuse
for quality).

## 5. Audio mixing

The render worker combines three audio sources:

1. **Voice track** clips → concatenated at their `startMs`.
2. **Music track** clips → ducked 6 dB under voice regions (sidechain).
3. **SFX track** clips → mixed at their `startMs`.

This is done with FFmpeg's `amix` and `sidechaincompress` filters. The
voice waveform (from WhisperX word-level timestamps) is also used to drive
the typing `cps` for word-level sync — see [AUDIO_ENGINE.md](./AUDIO_ENGINE.md).

## 6. Render queue

Render jobs live in a `renders` table:

```sql
-- planned schema (see DATABASE.md)
CREATE TABLE renders (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id),
  format      TEXT NOT NULL,         -- 'mp4' | 'gif'
  fps         INTEGER NOT NULL,
  status      TEXT NOT NULL,         -- 'pending' | 'rendering' | 'done' | 'failed'
  progress    REAL DEFAULT 0,        -- 0..1
  r2_key      TEXT,                  -- output object key
  error       TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

The worker polls for `pending` rows, transitions them to `rendering`, runs
Remotion, and PATCHes back to `done` / `failed`.

## 7. Cloud rendering (planned post-1.0)

For long videos (10 min+), we'll add **Remotion Lambda** as an alternative
backend. The Hono API enqueues by invoking the Lambda with the project JSON
from R2; output MP4 goes back to R2. This is explicitly a 1.0+ optimization
(see [ROADMAP.md](./ROADMAP.md)).

## 8. Browser-side preview rendering (planned 0.4)

For short clips (≤ 10s), we'll also offer an in-browser render via
`MediaRecorder` capturing a `<canvas>` at the project's fps. This avoids a
server round-trip for quick previews and works offline. Quality is lower
than the server render.

## 9. Export dialog state

The MVP export dialog state (resolution, fps, format) is local component
state — not in the Zustand store. We'll move it to the store when real
rendering lands, so the dialog can show progress across page refreshes.

## 10. File formats

| Format | Container | Codec | Use case |
| --- | --- | --- | --- |
| **MP4** | `.mp4` | H.264 + AAC | Default. Universal playback |
| **GIF** | `.gif` | — | Short loops for socials / docs |
| **WebM** | `.webm` | VP9 + Opus | Small files, modern browsers |
| **ProRes** | `.mov` | ProRes 422 HQ | Editing / archival |

## 11. Limitations (MVP)

- No actual encoding — UI only.
- No progress bar — there's nothing to track.
- No render history — no DB schema for it yet.
- No audio mixing — the audio engine is itself planned.

## 12. See also

- [AUDIO_ENGINE.md](./AUDIO_ENGINE.md) — audio mixing details
- [VIDEO_ENGINE.md](./VIDEO_ENGINE.md) — the canvas / Konva layer
- [DATABASE.md](./DATABASE.md) — the `renders` table
- [ROADMAP.md](./ROADMAP.md) — when each piece ships
