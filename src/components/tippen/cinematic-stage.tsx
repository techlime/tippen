"use client";

import * as React from "react";
import { useTypewriter } from "@/hooks/use-typewriter";
import {
  backgroundStyle,
  backgroundForeground,
} from "@/lib/tippen/seed";
import type { Scene, TextLine } from "@/lib/tippen/types";
import { cn } from "@/lib/utils";

/**
 * CinematicLine — renders a single line of text with its animation preset.
 * Used by both the landing-page live demo and the editor canvas so the
 * rendering pipeline is identical everywhere.
 */
export function CinematicLine({
  line,
  startMs,
  playhead,
  className,
}: {
  line: TextLine;
  startMs: number;
  playhead: number;
  className?: string;
}) {
  const { visible, cursor, opacity, transform, filter } = useTypewriter(
    line.content,
    line.preset,
    startMs,
    playhead,
    line.cps,
  );

  // Apply highlights by splitting visible text.
  const parts = renderHighlights(visible, line.highlights);

  return (
    <div
      className={cn(
        "whitespace-pre-wrap transition-none will-change-transform",
        line.preset === "terminal" && "font-mono",
        className,
      )}
      style={{
        fontSize: line.fontSize,
        lineHeight: 1.15,
        textAlign: line.align,
        opacity,
        transform,
        filter,
        fontWeight: 560,
        letterSpacing: "-0.02em",
      }}
    >
      {parts}
      {cursor && visible.length < line.content.length && (
        <span className="caret-blink ml-0.5 inline-block w-[0.06em]">
          &nbsp;
        </span>
      )}
      {cursor && visible.length >= line.content.length && (
        <span
          className="caret-blink ml-1 inline-block h-[0.9em] w-[0.05em] translate-y-[0.08em] bg-current align-baseline"
          aria-hidden
        />
      )}
    </div>
  );
}

/** Splits visible text into normal + highlighted (ember) spans. */
function renderHighlights(
  text: string,
  highlights: TextLine["highlights"],
): React.ReactNode {
  if (!highlights || highlights.length === 0) return text;
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((h, i) => {
    if (h.start > cursor) nodes.push(text.slice(cursor, h.start));
    const end = Math.min(h.end, text.length);
    if (end > h.start) {
      nodes.push(
        <span
          key={i}
          style={{ color: "var(--ember)" }}
        >
          {text.slice(h.start, end)}
        </span>,
      );
    }
    cursor = end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/**
 * CinematicStage — renders a full scene on the canvas.
 * Applies the background, camera transform, and stacks the scene's lines.
 */
export function CinematicStage({
  scene,
  playhead,
  className,
  letterboxed = true,
}: {
  scene: Scene;
  playhead: number;
  className?: string;
  letterboxed?: boolean;
}) {
  const fg = backgroundForeground(scene.background);
  const cameraTransform = useCameraTransform(scene, playhead);

  // Compute each line's absolute start based on cumulative duration within
  // scene. Precomputed before render so we never mutate render-scoped state.
  const lineStarts = scene.lines.reduce<number[]>((starts, line, i) => {
    if (i === 0) {
      starts.push(scene.startMs);
    } else {
      const prevLine = scene.lines[i - 1];
      const prevDur = prevLine.preset.startsWith("type") ? 2600 : 1200;
      starts.push(starts[i - 1] + prevDur);
    }
    return starts;
  }, []);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        className,
      )}
      style={{ ...backgroundStyle(scene.background), color: fg }}
    >
      {/* subtle grain for cinematic texture */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20" />

      <div
        className="relative flex h-full w-full items-center justify-center transition-transform"
        style={{ transform: cameraTransform }}
      >
        <div
          className={cn(
            "flex flex-col gap-4 px-[8%] text-center",
            letterboxed && "max-w-5xl",
          )}
        >
          {scene.lines.map((line, i) => (
            <CinematicLine
              key={line.id}
              line={line}
              startMs={lineStarts[i]}
              playhead={playhead}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Returns a CSS transform string for the camera move. */
function useCameraTransform(scene: Scene, playhead: number): string {
  return React.useMemo(() => {
    const elapsed = playhead - scene.startMs;
    const progress = Math.max(0, Math.min(1, elapsed / scene.durationMs));
    const eased = 1 - Math.pow(1 - progress, 2);
    switch (scene.camera) {
      case "push-in":
        return `scale(${1 + eased * 0.08})`;
      case "pull-out":
        return `scale(${1.08 - eased * 0.08})`;
      case "pan-left":
        return `translateX(${(1 - eased) * 3}%)`;
      case "pan-right":
        return `translateX(${-(1 - eased) * 3}%)`;
      case "tilt-up":
        return `translateY(${(1 - eased) * 3}%)`;
      default:
        return "scale(1)";
    }
  }, [scene, playhead]);
}
