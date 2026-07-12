# Audio Engine

> Tippen's planned audio engine: WaveSurfer.js + Web Audio API. Current
> MVP state is UI-only — no actual audio plays.

## 1. Current MVP state

The MVP ships the **interface** for audio but no audio engine:

- Timeline has `voice`, `music`, and `sfx` tracks with clips.
- The Inspector → **Audio** tab has placeholders for voice upload, music
  upload, keyboard sound pack, and per-track gain sliders.
- Clip `gain` and `startMs` are stored on the project.
- **Nothing actually plays.** The `toggleMute(trackId)` action flips a flag,
  but no audio graph exists.

This is the 0.3 milestone — see [ROADMAP.md](./ROADMAP.md).

## 2. Target architecture

```
┌────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Web Audio API graph                                      │  │
│  │                                                            │  │
│  │  voiceBuffer ──▶ GainNode (ducked) ──┐                    │  │
│  │  musicBuffer  ──▶ GainNode ──────────┼──▶ destination     │  │
│  │  sfxBuffer    ──▶ GainNode ──────────┘                    │  │
│  │                                                            │  │
│  │  + sidechain compressor (music ducks under voice)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▲                                     │
│                          │ drives buffer sources               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WaveSurfer.js                                            │  │
│  │  - waveform rendering on voice/music tracks               │  │
│  │  - regions = word-level sync markers                       │  │
│  │  - playhead synced to timeline rAF clock                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## 3. WaveSurfer.js integration

[WaveSurfer.js v7](https://wavesurfer.xyz/) renders waveforms on a canvas.
In Tippen it will:

1. Render the waveform inside each `voice` and `music` clip on the
   timeline.
2. Expose **regions** — one per word, from WhisperX word-level timestamps
   — used to drive the typing reveal.
3. Sync its cursor to the timeline's `playheadMs` (single source of truth).
4. Support click-to-scrub inside a waveform.

WaveSurfer only handles visualization + seeking. The actual playback goes
through the Web Audio API graph (below) so we can mix multiple sources.

## 4. Web Audio API graph

```ts
// packages/audio/src/engine.ts (planned)
const ctx = new AudioContext();

const voiceGain = ctx.createGain();
const musicGain = ctx.createGain();
const sfxGain   = ctx.createGain();

// Sidechain: music ducks when voice is active
const compressor = ctx.createDynamicsCompressor();
compressor.threshold.value = -24;
compressor.ratio.value = 4;

voiceGain.connect(ctx.destination);
musicGain.connect(compressor);
compressor.connect(ctx.destination);
sfxGain.connect(ctx.destination);

// Per-track gain is the slider in the inspector.
function setTrackGain(kind: TrackKind, gain: number) {
  const node = kind === "voice" ? voiceGain
             : kind === "music" ? musicGain
             : sfxGain;
  node.gain.setValueAtTime(gain, ctx.currentTime);
}
```

### 4.1 Playback scheduling

When the user presses play:

1. Look up every clip whose `[startMs, startMs+durationMs]` contains the
   current playhead or starts after it.
2. For each, schedule an `AudioBufferSourceNode.start(when = ctx.currentTime
   + (clip.startMs − playheadMs) / 1000)`.
3. On each rAF tick, re-check the schedule (clips may have been moved /
   muted / locked).
4. On pause, stop all sources. On seek, stop + reschedule.

This keeps audio sample-accurate while letting the UI update at 60 fps.

### 4.3 Keyboard sounds

Typing clips play one **keyboard sound** per character revealed. We bundle
four packs:

| Pack | Description |
| --- | --- |
| `mechanical` | Cherry MX blue, clicky |
| `membrane` | Soft membrane, low-key |
| `typewriter` | Vintage typewriter, sharp |
| `soft` | Padded, almost silent |

Each pack is a small set of WAV files (4 variations per character to avoid
machine-gunning). The audio engine picks a random variation per keystroke.
Keyboard sounds are gated by the `sfx` track's `muted` flag.

## 5. Word-level sync

The killer feature: typing reveal that **matches the voice track word by
word**.

```
voice clip (narration.wav)
   │
   │ 1. WhisperX transcription → word timestamps
   │    [{ word: "Every", start: 0.12, end: 0.34 },
   │     { word: "story",  start: 0.36, end: 0.61 },
   │     …]
   │
   ▼
2. AI action: word-sync
   - Aligns each word in the line content to its voice timestamp
   - Stores per-word timestamps on the clip (hidden metadata)
   │
   ▼
3. useTypewriter reads per-word timestamps instead of uniform cps
   - At playhead t, the visible substring = words whose end ≤ t
   - Caret blinks at the boundary of the current word
```

This is what makes Tippen feel cinematic: the typed words appear exactly
when the narrator says them. No more, no less.

## 6. Volume ducking

When voice is playing, music ducks under it (sidechain compression). The
amount of ducking is controlled by a slider in the Inspector → Audio tab:

- `0 dB` — no ducking
- `-6 dB` — default
- `-12 dB` — aggressive

The ducking envelope is short (~50 ms attack, ~300 ms release) so music
doesn't pump audibly.

## 7. File formats

| Use case | Format | Notes |
| --- | --- | --- |
| Voice upload | `.wav`, `.mp3`, `.m4a` | Decoded to `AudioBuffer` |
| Music upload | `.mp3`, `.m4a`, `.ogg` | Decoded to `AudioBuffer` |
| Keyboard sounds | `.wav` | Small (~10 KB each), bundled |
| Export | `.aac` (in MP4) / `.opus` (in WebM) | See [RENDERING.md](./RENDERING.md) |

## 8. Performance

- `AudioBuffer`s are decoded once per asset and cached.
- The Web Audio graph is built once; we only schedule sources per play.
- WaveSurfer canvases use `devicePixelRatio` for crispness but cap at 2× to
  limit GPU usage.
- Off-screen waveforms are virtualized when the project exceeds 50 audio
  clips.

## 9. Privacy & permissions

- Audio decoding is local. We never upload raw audio to the AI provider.
- For `voice-to-text` and `word-sync`, only the audio is sent to WhisperX
  (HuggingFace token server-side). The transcript is returned to the
  browser; the audio is never stored server-side.

## 10. Limitations (MVP)

- No audio playback — UI only.
- No waveform rendering.
- No keyboard sounds.
- No word-level sync.
- `gain` is stored but not applied.

## 11. See also

- [RENDERING.md](./RENDERING.md) — how audio mixes into the final MP4
- [TIMELINE.md](./TIMELINE.md) — track + clip model
- [AI.md](./AI.md) — `voice-to-text` and `word-sync` actions
- [ROADMAP.md](./ROADMAP.md) — 0.3 audio milestone
