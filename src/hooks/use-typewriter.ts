"use client";

import * as React from "react";
import { isTypewriterPreset, getPreset } from "@/lib/tippen/animation-presets";
import type { AnimationPresetId } from "@/lib/tippen/types";
import { useEditorStore } from "@/stores/editor-store";

/**
 * useTypewriter — the core cinematic reveal engine.
 *
 * Given a preset and a playhead position, returns the visible substring,
 * whether the cursor should blink, and the entrance style for non-typing
 * presets. Designed to be deterministic given a start time so it stays
 * perfectly in sync with the timeline playhead.
 *
 * @param content   full line text
 * @param preset    animation preset id
 * @param startMs   when this line begins (timeline ms)
 * @param playhead  current playhead (timeline ms)
 * @param cpsOverride optional per-line cps override
 */
export function useTypewriter(
  content: string,
  preset: AnimationPresetId,
  startMs: number,
  playhead: number,
  cpsOverride?: number,
) {
  return React.useMemo(() => {
    const p = getPreset(preset);
    const elapsed = playhead - startMs;

    // Before the line starts — render nothing, hide cursor.
    if (elapsed < 0) {
      return {
        visible: "",
        cursor: false,
        opacity: 0,
        transform: "translateY(0)",
        filter: "blur(0px)",
        done: false,
      };
    }

    // Typewriter family — reveal character by character.
    if (isTypewriterPreset(preset)) {
      const cps = cpsOverride ?? p.cps ?? 18;
      const charsToShow = Math.floor((elapsed / 1000) * cps);
      const done = charsToShow >= content.length;
      return {
        visible: content.slice(0, Math.max(0, charsToShow)),
        cursor: p.cursor ?? true,
        opacity: 1,
        transform: "translateY(0)",
        filter: "blur(0px)",
        done,
      };
    }

    // Reveal family — animate the whole line over durationMs.
    const duration = p.durationMs ?? 600;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(progress);

    let transform = "translateY(0)";
    let opacity = 1;
    let filter = "blur(0px)";

    switch (preset) {
      case "slide":
        transform = `translateY(${(1 - eased) * 12}px)`;
        opacity = eased;
        break;
      case "zoom":
        transform = `scale(${0.96 + eased * 0.04})`;
        opacity = eased;
        break;
      case "blur":
        opacity = eased;
        filter = `blur(${(1 - eased) * 8}px)`;
        break;
      case "fade":
        opacity = eased;
        break;
      case "elastic":
        opacity = Math.min(1, progress * 2);
        transform = `scale(${elastic(progress)})`;
        break;
      case "cursor-blink":
        opacity = 1;
        break;
      case "minimal":
      default:
        opacity = 1;
        break;
    }

    return {
      visible: content,
      cursor: p.cursor ?? false,
      opacity,
      transform,
      filter,
      done: progress >= 1,
    };
  }, [content, preset, startMs, playhead, cpsOverride]);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Elastic spring curve for the "elastic" preset. */
function elastic(t: number): number {
  if (t === 0 || t === 1) return 1;
  const p = 0.4;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
}

/**
 * usePlaybackClock — advances the playhead while playing.
 * Uses requestAnimationFrame for smooth 60fps scrubbing.
 *
 * Driven entirely by store state; re-subscribes when playback toggles or the
 * playhead lands on a new integer frame boundary.
 */
export function usePlaybackClock() {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const seek = useEditorStore((s) => s.seek);
  const pause = useEditorStore((s) => s.pause);
  const durationMs = useEditorStore((s) => s.project.settings.durationMs);

  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef<number>(0);
  const playheadRef = React.useRef(0);

  // Keep a ref of the latest playhead without re-subscribing the effect.
  React.useEffect(() => {
    const unsub = useEditorStore.subscribe((s) => {
      playheadRef.current = s.playheadMs;
    });
    return unsub;
  }, []);

  React.useEffect(() => {
    if (!isPlaying) return;
    lastRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      const next = playheadRef.current + dt;
      if (next >= durationMs) {
        seek(durationMs);
        pause();
        return;
      }
      seek(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, seek, pause, durationMs]);
}
