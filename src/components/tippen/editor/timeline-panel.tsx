"use client";

import * as React from "react";
import {
  Mic,
  Music2,
  Type,
  MousePointer2,
  Highlighter,
  Camera,
  Image as ImageIcon,
  Volume2,
  Scissors,
  ArrowLeftRight,
  Lock,
  LockOpen,
  VolumeX,
  GripVertical,
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import {
  formatTick,
  msToPx,
  pxToMs,
  trackClipClass,
  snapMs,
} from "./editor-utils";
import { cn } from "@/lib/utils";
import type { TrackKind, TimelineTrack, TrackClip } from "@/lib/tippen/types";

const TRACK_ICONS: Record<TrackKind, React.ReactNode> = {
  voice: <Mic className="size-3.5" />,
  music: <Music2 className="size-3.5" />,
  typing: <Type className="size-3.5" />,
  cursor: <MousePointer2 className="size-3.5" />,
  highlights: <Highlighter className="size-3.5" />,
  camera: <Camera className="size-3.5" />,
  background: <ImageIcon className="size-3.5" />,
  sfx: <Volume2 className="size-3.5" />,
  transitions: <ArrowLeftRight className="size-3.5" />,
};

const TRACK_ORDER: TrackKind[] = [
  "voice",
  "music",
  "typing",
  "cursor",
  "highlights",
  "camera",
  "background",
  "sfx",
  "transitions",
];

/**
 * TimelinePanel — bottom panel.
 * Track header column (left, ~140px) + scrollable track area.
 * Clips are colored bars positioned by startMs/durationMs scaled by zoom.
 * A movable playhead line spans all tracks; drag to seek.
 */
export function TimelinePanel() {
  const tracks = useEditorStore((s) => s.project.tracks);
  const zoom = useEditorStore((s) => s.zoom);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const durationMs = useEditorStore((s) => s.project.settings.durationMs);
  const seek = useEditorStore((s) => s.seek);
  const selectedTrackId = useEditorStore((s) => s.selectedTrackId);
  const selectTrack = useEditorStore((s) => s.selectTrack);

  // Sort tracks by canonical order.
  const orderedTracks = React.useMemo(() => {
    const byKind = new Map<string, TimelineTrack>();
    for (const t of tracks) byKind.set(t.id, t);
    const result: TimelineTrack[] = [];
    for (const kind of TRACK_ORDER) {
      const id = `track-${kind}`;
      const t = byKind.get(id);
      if (t) result.push(t);
    }
    // Include any unexpected tracks too.
    for (const t of tracks) {
      if (!result.find((r) => r.id === t.id)) result.push(t);
    }
    return result;
  }, [tracks]);

  const trackAreaRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);

  // Compute ms from a pointer X relative to the track area.
  const msFromEvent = React.useCallback(
    (clientX: number) => {
      const el = trackAreaRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const scrollLeft = el.scrollLeft;
      const x = clientX - rect.left + scrollLeft;
      return Math.max(0, Math.min(durationMs, pxToMs(x, zoom)));
    },
    [durationMs, zoom],
  );

  const onPointerDownTrack = (e: React.PointerEvent<HTMLDivElement>) => {
    // Clicking anywhere on the track area (incl. ruler, empty rows) seeks.
    // Clip drags stop propagation so they don't bubble here.
    const ms = snapMs(msFromEvent(e.clientX), 50);
    seek(ms);
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMoveTrack = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const ms = snapMs(msFromEvent(e.clientX), 50);
    seek(ms);
  };

  const onPointerUpTrack = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) {
      setDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
  };

  // The total width of the timeline track area (px) based on zoom & duration.
  const totalWidthPx = Math.max(msToPx(durationMs, zoom), 800);

  // Ruler ticks: every 1s (or 2s if very zoomed out).
  const tickStepMs = zoom < 0.6 ? 2000 : 1000;
  const tickCount = Math.ceil(durationMs / tickStepMs) + 1;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/60 px-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Scissors className="size-3.5" />
          Timeline
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="tabular-nums">
            {tracks.length} tracks · {formatTick(durationMs)} total
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Body: track headers + scrollable area */}
      <div className="flex min-h-0 flex-1">
        {/* Track headers (sticky left) */}
        <div className="flex w-[140px] shrink-0 flex-col border-r border-border/60 bg-background">
          <div className="flex h-7 shrink-0 items-center border-b border-border/60 px-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Tracks
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            {orderedTracks.map((t) => (
              <TrackHeader
                key={t.id}
                track={t}
                selected={t.id === selectedTrackId}
                onSelect={() => selectTrack(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Track area */}
        <div
          ref={trackAreaRef}
          className="relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden"
          onPointerDown={onPointerDownTrack}
          onPointerMove={onPointerMoveTrack}
          onPointerUp={onPointerUpTrack}
          onPointerCancel={onPointerUpTrack}
        >
          <div
            className="relative"
            style={{ width: `${totalWidthPx}px`, height: "100%" }}
          >
            {/* Ruler */}
            <div className="sticky top-0 z-10 flex h-7 shrink-0 items-end border-b border-border/60 bg-background/95 backdrop-blur">
              {Array.from({ length: tickCount }).map((_, i) => {
                const ms = i * tickStepMs;
                if (ms > durationMs) return null;
                const left = msToPx(ms, zoom);
                return (
                  <div
                    key={i}
                    className="absolute bottom-0 flex h-full flex-col items-start"
                    style={{ left: `${left}px` }}
                  >
                    <span className="ml-1 font-mono text-[9px] tabular-nums text-muted-foreground">
                      {formatTick(ms)}
                    </span>
                    <div className="h-2 w-px bg-border" />
                  </div>
                );
              })}
            </div>

            {/* Track rows */}
            <div className="flex flex-col">
              {orderedTracks.map((t, idx) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  widthPx={totalWidthPx}
                  isLast={idx === orderedTracks.length - 1}
                  playheadMs={playheadMs}
                  zoom={zoom}
                  selected={t.id === selectedTrackId}
                />
              ))}
            </div>

            {/* Playhead line (spans all tracks) */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-ember"
              style={{ left: `${msToPx(playheadMs, zoom)}px` }}
              aria-hidden
            >
              <div className="absolute -top-0.5 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-ember" />
            </div>

            {/* Drag handle (visible when dragging) */}
            {dragging && (
              <div
                className="pointer-events-none absolute top-0 bottom-0 z-30 w-0.5 bg-ember/40"
                style={{ left: `${msToPx(playheadMs, zoom)}px` }}
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Track header
   ───────────────────────────────────────────── */

function TrackHeader({
  track,
  selected,
  onSelect,
}: {
  track: TimelineTrack;
  selected: boolean;
  onSelect: () => void;
}) {
  const toggleMute = useEditorStore((s) => s.toggleMute);
  const toggleLock = useEditorStore((s) => s.toggleLock);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 border-b border-border/40 px-2 transition-colors",
        selected ? "bg-ember/10" : "hover:bg-accent/50",
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "text-muted-foreground",
          selected && "text-ember",
        )}
      >
        {TRACK_ICONS[track.kind]}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[11px] font-medium",
          selected ? "text-ember" : "text-foreground",
        )}
      >
        {track.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute(track.id);
        }}
        className={cn(
          "size-5 rounded text-muted-foreground hover:bg-accent hover:text-foreground",
          track.muted && "text-destructive hover:text-destructive",
        )}
        aria-label={track.muted ? "Unmute" : "Mute"}
      >
        {track.muted ? (
          <VolumeX className="size-3" />
        ) : (
          <Volume2 className="size-3" />
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLock(track.id);
        }}
        className={cn(
          "size-5 rounded text-muted-foreground hover:bg-accent hover:text-foreground",
          track.locked && "text-ember hover:text-ember",
        )}
        aria-label={track.locked ? "Unlock" : "Lock"}
      >
        {track.locked ? (
          <Lock className="size-3" />
        ) : (
          <LockOpen className="size-3" />
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Track row + clip
   ───────────────────────────────────────────── */

function TrackRow({
  track,
  widthPx,
  isLast,
  playheadMs,
  zoom,
  selected,
}: {
  track: TimelineTrack;
  widthPx: number;
  isLast: boolean;
  playheadMs: number;
  zoom: number;
  selected: boolean;
}) {
  const moveClip = useEditorStore((s) => s.moveClip);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const dragStartXRef = React.useRef(0);
  const dragStartMsRef = React.useRef(0);

  const onClipPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    clip: TrackClip,
  ) => {
    if (track.locked) return;
    e.stopPropagation();
    setDragId(clip.id);
    dragStartXRef.current = e.clientX;
    dragStartMsRef.current = clip.startMs;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onClipPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragId) return;
    const dx = e.clientX - dragStartXRef.current;
    const deltaMs = snapMs(pxToMs(dx, zoom), 50) - 0;
    const startMs = dragStartMsRef.current;
    const clip = track.clips.find((c) => c.id === dragId);
    if (!clip) return;
    const targetDelta = snapMs(startMs + deltaMs, 50) - clip.startMs;
    if (targetDelta !== 0) {
      moveClip(clip.id, targetDelta);
      // After moveClip, the store updates clip.startMs; reset our reference.
      dragStartMsRef.current = clip.startMs + targetDelta;
    }
  };

  const onClipPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragId) {
      setDragId(null);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
  };

  const hasActiveClip = track.clips.some(
    (c) => playheadMs >= c.startMs && playheadMs < c.startMs + c.durationMs,
  );

  return (
    <div
      className={cn(
        "relative flex h-9 shrink-0 items-center border-b border-border/40",
        selected && "bg-ember/5",
        isLast && "border-b-0",
      )}
      style={{ width: `${widthPx}px` }}
      data-track-row={track.id}
    >
      {/* Clip(s) */}
      {track.clips.map((clip) => {
        const left = msToPx(clip.startMs, zoom);
        const width = Math.max(2, msToPx(clip.durationMs, zoom));
        const isActiveClip =
          playheadMs >= clip.startMs && playheadMs < clip.startMs + clip.durationMs;
        return (
          <div
            key={clip.id}
            data-clip="true"
            onPointerDown={(e) => onClipPointerDown(e, clip)}
            onPointerMove={onClipPointerMove}
            onPointerUp={onClipPointerUp}
            onPointerCancel={onClipPointerUp}
            className={cn(
              "group absolute top-1 bottom-1 flex cursor-grab items-center gap-1 overflow-hidden rounded-md px-1.5 text-[10px] font-medium shadow-sm transition-shadow",
              "select-none active:cursor-grabbing",
              trackClipClass(track.kind),
              isActiveClip && "ring-2 ring-ember/40",
              dragId === clip.id && "cursor-grabbing shadow-md",
              track.muted && "opacity-50",
            )}
            style={{ left: `${left}px`, width: `${width}px` }}
            title={clip.label}
          >
            {width > 18 && <GripVertical className="size-2.5 opacity-60" />}
            {width > 30 && (
              <span className="truncate">{clip.label}</span>
            )}
            {/* Active indicator */}
            {isActiveClip && (
              <span
                className="absolute right-1 top-1 size-1.5 rounded-full bg-white shadow"
                aria-hidden
              />
            )}
          </div>
        );
      })}

      {/* Empty track placeholder */}
      {track.clips.length === 0 && (
        <div className="absolute inset-0 flex items-center px-2 text-[10px] text-muted-foreground/40">
          empty
        </div>
      )}

      {/* Subtle active-clip highlight bar */}
      {hasActiveClip && (
        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-ember/30" />
      )}
    </div>
  );
}
