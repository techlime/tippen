import type { Scene, TimelineTrack, TrackKind } from "@/lib/tippen/types";

/**
 * TIPPEN editor utilities — pure helpers shared by the editor sub-components.
 */

/** Format ms as M:SS.d (e.g. 1:03.4). */
export function formatTime(ms: number, withTenths = true): string {
  const total = Math.max(0, ms);
  const totalSeconds = total / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds * 10) % 10);
  const mm = `${minutes}`;
  const ss = seconds.toString().padStart(2, "0");
  return withTenths ? `${mm}:${ss}.${tenths}` : `${mm}:${ss}`;
}

/** Format ms as M:SS for compact timeline ticks. */
export function formatTick(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Pick the scene that is active at the given playhead position. */
export function sceneAtPlayhead(scenes: Scene[], playheadMs: number): Scene | null {
  for (const s of scenes) {
    if (playheadMs >= s.startMs && playheadMs < s.startMs + s.durationMs) {
      return s;
    }
  }
  // If we're past everything, fall back to the last scene.
  if (scenes.length > 0 && playheadMs >= scenes[scenes.length - 1].startMs) {
    return scenes[scenes.length - 1];
  }
  return scenes[0] ?? null;
}

/** Total duration covered by all scenes (not necessarily the project duration). */
export function scenesDurationMs(scenes: Scene[]): number {
  return scenes.reduce((acc, s) => Math.max(acc, s.startMs + s.durationMs), 0);
}

/** Timeline px-per-second at a given zoom level (base = 50px/s at zoom=1). */
export const PX_PER_SEC_BASE = 50;
export function pxPerSecond(zoom: number): number {
  return PX_PER_SEC_BASE * zoom;
}

/** Convert ms → px given zoom. */
export function msToPx(ms: number, zoom: number): number {
  return (ms / 1000) * pxPerSecond(zoom);
}

/** Convert px → ms given zoom. */
export function pxToMs(px: number, zoom: number): number {
  return (px / pxPerSecond(zoom)) * 1000;
}

/** Map a track kind to a Tailwind background class for clips. */
export function trackClipClass(kind: TrackKind): string {
  switch (kind) {
    case "typing":
    case "highlights":
    case "cursor":
      return "bg-ember/80 hover:bg-ember text-ember-foreground";
    case "voice":
    case "music":
      return "bg-emerald-600/70 hover:bg-emerald-600 text-white";
    case "camera":
    case "background":
    case "sfx":
    case "transitions":
    default:
      return "bg-muted-foreground/30 hover:bg-muted-foreground/45 text-foreground";
  }
}

/** Map a track kind to a lucide icon name hint (resolved by caller). */
export function trackKindLabel(kind: TrackKind): string {
  switch (kind) {
    case "typing":
      return "Typing";
    case "cursor":
      return "Cursor";
    case "voice":
      return "Voice";
    case "music":
      return "Music";
    case "highlights":
      return "Highlights";
    case "camera":
      return "Camera";
    case "background":
      return "Background";
    case "sfx":
      return "Sound FX";
    case "transitions":
      return "Transitions";
    default:
      return kind;
  }
}

/** Pick the dominant clip overlapping the playhead for a given track. */
export function activeClip(
  track: TimelineTrack,
  playheadMs: number,
): TimelineTrack["clips"][number] | null {
  return (
    track.clips.find(
      (c) => playheadMs >= c.startMs && playheadMs < c.startMs + c.durationMs,
    ) ?? null
  );
}

/** Round to the nearest "snap" ms (e.g. 100ms grid). */
export function snapMs(ms: number, grid = 100): number {
  return Math.round(ms / grid) * grid;
}
