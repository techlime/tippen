"use client";

import * as React from "react";
import {
  Grid3x3,
  Maximize,
  ZoomIn,
  ZoomOut,
  Camera,
} from "lucide-react";
import { CinematicStage } from "@/components/tippen/cinematic-stage";
import { useEditorStore } from "@/stores/editor-store";
import { sceneAtPlayhead, formatTime } from "./editor-utils";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * CanvasPanel — the center stage.
 * Renders the currently-active scene (selected or the one at playhead)
 * inside a 16:9 letterbox with overlays:
 *  - top-left scene badge (name + camera move)
 *  - top-right zoom controls overlay (fit / 100%)
 *  - bottom scrubber with playhead position
 *  - ruler ticks
 *  - optional grid overlay
 */
export function CanvasPanel() {
  const scenes = useEditorStore((s) => s.project.scenes);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const durationMs = useEditorStore((s) => s.project.settings.durationMs);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const seek = useEditorStore((s) => s.seek);

  const [showGrid, setShowGrid] = React.useState(false);

  // Resolve the scene to render: prefer selected, fall back to playhead.
  const selectedScene =
    scenes.find((s) => s.id === selectedSceneId) ?? null;
  const playheadScene = sceneAtPlayhead(scenes, playheadMs);
  const scene = selectedScene ?? playheadScene ?? scenes[0] ?? null;

  const sceneProgress = scene
    ? Math.max(
        0,
        Math.min(1, (playheadMs - scene.startMs) / scene.durationMs),
      )
    : 0;

  const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, ratio)) * durationMs);
  };

  return (
    <div className="flex h-full flex-col bg-canvas/30">
      {/* Canvas area */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
        <div
          className="relative aspect-video w-full max-h-full max-w-full overflow-hidden rounded-xl border border-border/60 bg-black shadow-md ring-1 ring-black/5"
          style={{ maxHeight: "calc(100% - 0px)" }}
        >
          {scene ? (
            <CinematicStage
              scene={scene}
              playhead={playheadMs}
              letterboxed
              className="aspect-video"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No scene to display
            </div>
          )}

          {/* Letterbox bars */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[6%] bg-black/80" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[6%] bg-black/80" />

          {/* Top-left scene badge */}
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-ember" />
            <span className="max-w-[180px] truncate">
              {scene?.name ?? "—"}
            </span>
            <span className="text-white/40">·</span>
            <Camera className="size-3 text-white/60" />
            <span className="text-white/70">{scene?.camera ?? "static"}</span>
          </div>

          {/* Top-right zoom controls overlay */}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/55 p-0.5 backdrop-blur-sm">
            <OverlayIcon
              label="Zoom out"
              onClick={() => setZoom(zoom - 0.25)}
            >
              <ZoomOut className="size-3.5" />
            </OverlayIcon>
            <button
              onClick={() => setZoom(1)}
              className="rounded px-1.5 py-0.5 font-mono text-[10px] text-white/80 hover:bg-white/10"
              aria-label="Reset zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <OverlayIcon label="Zoom in" onClick={() => setZoom(zoom + 0.25)}>
              <ZoomIn className="size-3.5" />
            </OverlayIcon>
            <span className="mx-0.5 h-3 w-px bg-white/15" />
            <OverlayIcon
              label="Fit"
              onClick={() => setZoom(1)}
            >
              <Maximize className="size-3.5" />
            </OverlayIcon>
            <OverlayIcon
              label={showGrid ? "Hide grid" : "Show grid"}
              active={showGrid}
              onClick={() => setShowGrid((v) => !v)}
            >
              <Grid3x3 className="size-3.5" />
            </OverlayIcon>
          </div>

          {/* Grid overlay */}
          {showGrid && (
            <div
              className="pointer-events-none absolute inset-[6%] grid opacity-50"
              style={{
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
              }}
              aria-hidden
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-ember/30"
                />
              ))}
            </div>
          )}

          {/* Bottom progress + scene bar */}
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-white/70">
              {formatTime(playheadMs)}
            </span>
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              {/* Scene segments */}
              {scenes.map((s) => {
                const startRatio = s.startMs / durationMs;
                const widthRatio = s.durationMs / durationMs;
                const isSelected = s.id === scene?.id;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "absolute top-0 h-full",
                      isSelected ? "bg-ember/50" : "bg-white/15",
                    )}
                    style={{
                      left: `${startRatio * 100}%`,
                      width: `${widthRatio * 100}%`,
                    }}
                  />
                );
              })}
              {/* Playhead */}
              <div
                className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow"
                style={{ left: `${(playheadMs / durationMs) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-white/70">
              {formatTime(durationMs, false)}
            </span>
          </div>
        </div>
      </div>

      {/* Ruler ticks (scene progress) */}
      <div className="shrink-0 border-t border-border/60 bg-background/60 px-4 py-2">
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-muted px-1.5 py-0.5 tabular-nums">
              {scene?.name ?? "—"}
            </span>
            <span className="tabular-nums">
              scene {formatTime(sceneProgress * (scene?.durationMs ?? 0), false)}
              {" / "}
              {formatTime(scene?.durationMs ?? 0, false)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {TIMELINE_TICKS.map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && (
                  <span className="text-muted-foreground/30">·</span>
                )}
                <span className="font-mono tabular-nums text-muted-foreground/60">
                  {t}s
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div
          className="mt-1.5 h-4 cursor-pointer"
          onClick={onScrub}
          role="slider"
          aria-label="Canvas scrubber"
          aria-valuemin={0}
          aria-valuemax={durationMs}
          aria-valuenow={playheadMs}
          tabIndex={0}
        >
          <div className="relative h-full w-full">
            {/* Ruler ticks */}
            {Array.from({ length: 13 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-border/50"
                style={{ left: `${(i / 12) * 100}%` }}
              />
            ))}
            {/* Playhead triangle */}
            <div
              className="absolute -top-0.5 h-4 w-0.5 bg-ember"
              style={{ left: `${(playheadMs / durationMs) * 100}%` }}
            />
            <div
              className="absolute -top-1 size-2 -translate-x-1/2 rotate-45 bg-ember"
              style={{ left: `${(playheadMs / durationMs) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const TIMELINE_TICKS = [0, 2, 4, 6, 8, 10];

function OverlayIcon({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "rounded p-1 text-white/80 transition-colors hover:bg-white/10",
            active && "bg-ember/80 text-white hover:bg-ember",
          )}
          aria-label={label}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
