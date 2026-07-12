import type {
  TippenProject,
  TimelineTrack,
  Scene,
  BackgroundId,
} from "./types";

/**
 * Default factory + seed content for a new Tippen project.
 * Seed content is intentionally high-quality (not lorem) so the editor
 * opens to a genuinely cinematic demo sequence.
 */

export function createTrack(
  kind: TimelineTrack["kind"],
  label: string,
  clips: TimelineTrack["clips"] = [],
): TimelineTrack {
  return {
    id: `track-${kind}`,
    kind,
    label,
    muted: false,
    locked: false,
    clips,
  };
}

export function createSeedProject(): TippenProject {
  const now = Date.now();

  const scenes: Scene[] = [
    {
      id: "scene-1",
      name: "Cold Open",
      background: "ink",
      startMs: 0,
      durationMs: 4200,
      camera: "push-in",
      lines: [
        {
          id: "line-1-1",
          content: "Every story begins",
          preset: "apple-intro",
          cps: 9,
          fontSize: 64,
          align: "center",
          highlights: [],
        },
        {
          id: "line-1-2",
          content: "with a single keystroke.",
          preset: "typewriter",
          cps: 16,
          fontSize: 64,
          align: "center",
          highlights: [{ start: 7, end: 14 }],
        },
      ],
    },
    {
      id: "scene-2",
      name: "The Premise",
      background: "midnight",
      startMs: 4200,
      durationMs: 5000,
      camera: "static",
      lines: [
        {
          id: "line-2-1",
          content: "Tippen turns text into cinema.",
          preset: "terminal",
          cps: 30,
          fontSize: 44,
          align: "left",
          highlights: [{ start: 0, end: 6 }],
        },
      ],
    },
    {
      id: "scene-3",
      name: "The Reveal",
      background: "ember",
      startMs: 9200,
      durationMs: 3600,
      camera: "pull-out",
      lines: [
        {
          id: "line-3-1",
          content: "Type. Sync. Render.",
          preset: "fade",
          durationMs: 800,
          fontSize: 72,
          align: "center",
          highlights: [{ start: 6, end: 10 }],
        },
      ],
    },
  ];

  const tracks: TimelineTrack[] = [
    createTrack("typing", "Typing", [
      {
        id: "clip-typing-1",
        trackId: "track-typing",
        label: "Cold Open",
        startMs: 0,
        durationMs: 4200,
        color: "ember",
      },
      {
        id: "clip-typing-2",
        trackId: "track-typing",
        label: "The Premise",
        startMs: 4200,
        durationMs: 5000,
        color: "ember",
      },
      {
        id: "clip-typing-3",
        trackId: "track-typing",
        label: "The Reveal",
        startMs: 9200,
        durationMs: 3600,
        color: "ember",
      },
    ]),
    createTrack("cursor", "Cursor", [
      {
        id: "clip-cursor-1",
        trackId: "track-cursor",
        label: "Caret",
        startMs: 200,
        durationMs: 38000,
        color: "muted",
      },
    ]),
    createTrack("voice", "Voice", [
      {
        id: "clip-voice-1",
        trackId: "track-voice",
        label: "narration.wav",
        startMs: 400,
        durationMs: 12000,
        gain: 0.9,
      },
    ]),
    createTrack("music", "Music", [
      {
        id: "clip-music-1",
        trackId: "track-music",
        label: "ambient-pad.mp3",
        startMs: 0,
        durationMs: 12800,
        gain: 0.35,
      },
    ]),
    createTrack("highlights", "Highlights", [
      {
        id: "clip-hl-1",
        trackId: "track-highlights",
        label: "keystroke",
        startMs: 1200,
        durationMs: 1800,
        color: "ember",
      },
      {
        id: "clip-hl-2",
        trackId: "track-highlights",
        label: "cinema",
        startMs: 5000,
        durationMs: 1600,
        color: "ember",
      },
    ]),
    createTrack("camera", "Camera", [
      {
        id: "clip-cam-1",
        trackId: "track-camera",
        label: "Push In",
        startMs: 0,
        durationMs: 4200,
      },
      {
        id: "clip-cam-2",
        trackId: "track-camera",
        label: "Pull Out",
        startMs: 9200,
        durationMs: 3600,
      },
    ]),
    createTrack("background", "Background", [
      {
        id: "clip-bg-1",
        trackId: "track-background",
        label: "Ink",
        startMs: 0,
        durationMs: 4200,
      },
      {
        id: "clip-bg-2",
        trackId: "track-background",
        label: "Midnight",
        startMs: 4200,
        durationMs: 5000,
      },
      {
        id: "clip-bg-3",
        trackId: "track-background",
        label: "Ember",
        startMs: 9200,
        durationMs: 3600,
      },
    ]),
    createTrack("sfx", "Sound FX", [
      {
        id: "clip-sfx-1",
        trackId: "track-sfx",
        label: "keystroke ×12",
        startMs: 300,
        durationMs: 3000,
      },
      {
        id: "clip-sfx-2",
        trackId: "track-sfx",
        label: "whoosh",
        startMs: 9100,
        durationMs: 600,
      },
    ]),
    createTrack("transitions", "Transitions", [
      {
        id: "clip-tr-1",
        trackId: "track-transitions",
        label: "Cross Dissolve",
        startMs: 4100,
        durationMs: 400,
      },
      {
        id: "clip-tr-2",
        trackId: "track-transitions",
        label: "Cross Dissolve",
        startMs: 9100,
        durationMs: 400,
      },
    ]),
  ];

  return {
    id: "project-demo",
    settings: {
      title: "Untitled Cinematic",
      width: 1920,
      height: 1080,
      fps: 30,
      durationMs: 12800,
      background: "ink",
    },
    scenes,
    tracks,
    createdAt: now,
    updatedAt: now,
  };
}

export const BACKGROUND_OPTIONS: Array<{
  id: BackgroundId;
  name: string;
  swatch: string;
}> = [
  { id: "ink", name: "Ink", swatch: "oklch(0.18 0.008 264)" },
  { id: "paper", name: "Paper", swatch: "oklch(0.97 0.004 95)" },
  { id: "ember", name: "Ember", swatch: "oklch(0.5 0.16 50)" },
  { id: "midnight", name: "Midnight", swatch: "oklch(0.13 0.03 264)" },
  { id: "studio", name: "Studio", swatch: "oklch(0.3 0.02 264)" },
  { id: "noir", name: "Noir", swatch: "oklch(0.08 0 0)" },
];

export function backgroundStyle(bg: BackgroundId): React.CSSProperties {
  switch (bg) {
    case "ink":
      return { background: "oklch(0.18 0.008 264)" };
    case "paper":
      return { background: "oklch(0.97 0.004 95)" };
    case "ember":
      return {
        background:
          "radial-gradient(120% 120% at 50% 0%, oklch(0.4 0.16 50) 0%, oklch(0.22 0.06 40) 55%, oklch(0.16 0.02 264) 100%)",
      };
    case "midnight":
      return {
        background:
          "radial-gradient(120% 120% at 50% 100%, oklch(0.22 0.06 290) 0%, oklch(0.14 0.03 264) 60%, oklch(0.09 0.01 264) 100%)",
      };
    case "studio":
      return { background: "oklch(0.3 0.02 264)" };
    case "noir":
      return { background: "oklch(0.08 0 0)" };
    default:
      return { background: "oklch(0.18 0.008 264)" };
  }
}

export function backgroundForeground(bg: BackgroundId): string {
  return bg === "paper" ? "oklch(0.18 0.008 264)" : "oklch(0.97 0.004 95)";
}
