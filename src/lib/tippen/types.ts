/**
 * TIPPEN — Core domain types
 *
 * These types model the cinematic text storytelling editor.
 * They are framework-agnostic and live in `lib/tippen` so they can be
 * shared across the editor, the timeline, and the (future) renderer.
 */

/* ─────────────────────────────────────────────
   ANIMATION PRESETS
   ───────────────────────────────────────────── */

export type AnimationPresetId =
  | "fade"
  | "slide"
  | "typewriter"
  | "terminal"
  | "apple-intro"
  | "minimal"
  | "zoom"
  | "blur"
  | "highlight"
  | "cursor-blink"
  | "elastic";

export interface AnimationPreset {
  id: AnimationPresetId;
  name: string;
  description: string;
  /** characters per second for typewriter-style presets */
  cps?: number;
  /** duration in ms for non-typewriter presets */
  durationMs?: number;
  /** cursor visible during animation */
  cursor?: boolean;
}

/* ─────────────────────────────────────────────
   SCENES & TEXT
   ───────────────────────────────────────────── */

/** A single line/paragraph of cinematic text within a scene. */
export interface TextLine {
  id: string;
  content: string;
  /** preset used to reveal this line */
  preset: AnimationPresetId;
  /** per-line override of characters-per-second */
  cps?: number;
  /** font size in canvas px */
  fontSize: number;
  /** text alignment */
  align: "left" | "center" | "right";
  /** highlight tokens (word ranges that get ember accent) */
  highlights: Array<{ start: number; end: number }>;
}

/** A scene is a single "shot" in the cinematic sequence. */
export interface Scene {
  id: string;
  name: string;
  /** background style id */
  background: BackgroundId;
  /** lines of text rendered in this scene */
  lines: TextLine[];
  /** start time on the timeline (ms) */
  startMs: number;
  /** duration on the timeline (ms) */
  durationMs: number;
  /** camera movement preset */
  camera: CameraMove;
}

export type BackgroundId =
  | "ink"
  | "paper"
  | "ember"
  | "midnight"
  | "studio"
  | "noir";

export type CameraMove =
  | "static"
  | "push-in"
  | "pull-out"
  | "pan-left"
  | "pan-right"
  | "tilt-up";

/* ─────────────────────────────────────────────
   TIMELINE TRACKS
   ───────────────────────────────────────────── */

export type TrackKind =
  | "voice"
  | "music"
  | "typing"
  | "cursor"
  | "highlights"
  | "camera"
  | "background"
  | "sfx"
  | "transitions";

export interface TrackClip {
  id: string;
  trackId: string;
  /** display label */
  label: string;
  startMs: number;
  durationMs: number;
  /** 0..1 — how loud / how strong */
  gain?: number;
  color?: string;
}

export interface TimelineTrack {
  id: string;
  kind: TrackKind;
  label: string;
  muted: boolean;
  locked: boolean;
  clips: TrackClip[];
}

/* ─────────────────────────────────────────────
   PROJECT
   ───────────────────────────────────────────── */

export interface ProjectSettings {
  title: string;
  width: number;
  height: number;
  fps: number;
  /** total duration in ms */
  durationMs: number;
  background: BackgroundId;
}

export interface TippenProject {
  id: string;
  settings: ProjectSettings;
  scenes: Scene[];
  tracks: TimelineTrack[];
  createdAt: number;
  updatedAt: number;
}

/* ─────────────────────────────────────────────
   AI
   ───────────────────────────────────────────── */

export type AiActionId =
  | "generate-intro"
  | "rewrite-script"
  | "generate-timing"
  | "voice-to-text"
  | "word-sync"
  | "auto-highlight"
  | "scene-suggestions";

export interface PromptHistoryEntry {
  id: string;
  action: AiActionId;
  prompt: string;
  result: string;
  createdAt: number;
}
