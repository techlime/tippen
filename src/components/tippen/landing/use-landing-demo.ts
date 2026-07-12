"use client";

import * as React from "react";
import type { Scene, AnimationPresetId } from "@/lib/tippen/types";

/**
 * useLandingDemo — self-contained playback engine for the landing-page
 * interactive live demo. Intentionally does NOT touch the global editor
 * store so the landing page stays independent and never mutates project
 * state.
 *
 * Owns a tiny 3-scene cinematic sequence and a rAF-driven playhead that
 * loops. Exposes play/pause, seek, and a preset override for the active
 * scene so visitors can compare typewriter / terminal / apple-intro / fade
 * on the same canvas.
 */

const DEMO_SCENES: Scene[] = [
  {
    id: "demo-1",
    name: "Cold Open",
    background: "ink",
    startMs: 0,
    durationMs: 2600,
    camera: "push-in",
    lines: [
      {
        id: "demo-1-l1",
        content: "Every story begins with a single keystroke.",
        preset: "typewriter",
        cps: 22,
        fontSize: 44,
        align: "center",
        highlights: [{ start: 7, end: 13 }],
      },
    ],
  },
  {
    id: "demo-2",
    name: "The Premise",
    background: "midnight",
    startMs: 2600,
    durationMs: 2400,
    camera: "static",
    lines: [
      {
        id: "demo-2-l1",
        content: "Tippen turns text into cinema.",
        preset: "terminal",
        cps: 32,
        fontSize: 40,
        align: "center",
        highlights: [{ start: 0, end: 6 }],
      },
    ],
  },
  {
    id: "demo-3",
    name: "The Reveal",
    background: "ember",
    startMs: 5000,
    durationMs: 2600,
    camera: "pull-out",
    lines: [
      {
        id: "demo-3-l1",
        content: "Type. Sync. Render.",
        preset: "apple-intro",
        cps: 9,
        fontSize: 56,
        align: "center",
        highlights: [{ start: 6, end: 11 }],
      },
    ],
  },
];

const TOTAL_MS = 7600;

export interface LandingDemoApi {
  scenes: Scene[];
  playheadMs: number;
  isPlaying: boolean;
  togglePlay: () => void;
  seek: (ms: number) => void;
  setPreset: (preset: AnimationPresetId) => void;
  activeSceneIndex: number;
  activePreset: AnimationPresetId;
  totalMs: number;
}

export function useLandingDemo(): LandingDemoApi {
  const [scenes, setScenes] = React.useState(DEMO_SCENES);
  const [playheadMs, setPlayheadMs] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!isPlaying) return;
    lastRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      setPlayheadMs((prev) => {
        const next = prev + dt;
        return next >= TOTAL_MS ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const togglePlay = React.useCallback(() => setIsPlaying((p) => !p), []);
  const seek = React.useCallback(
    (ms: number) => setPlayheadMs(Math.max(0, Math.min(ms, TOTAL_MS))),
    [],
  );

  const activeSceneIndex = React.useMemo(() => {
    const i = scenes.findIndex(
      (s) => playheadMs >= s.startMs && playheadMs < s.startMs + s.durationMs,
    );
    return i === -1 ? 0 : i;
  }, [scenes, playheadMs]);

  const activePreset =
    scenes[activeSceneIndex]?.lines[0]?.preset ?? "typewriter";

  const setPreset = React.useCallback(
    (preset: AnimationPresetId) => {
      setScenes((prev) =>
        prev.map((s, i) =>
          i === activeSceneIndex
            ? { ...s, lines: s.lines.map((l) => ({ ...l, preset })) }
            : s,
        ),
      );
      // Rewind to scene start so the new preset is visible from t=0.
      const scene = scenes[activeSceneIndex];
      if (scene) setPlayheadMs(scene.startMs);
    },
    [activeSceneIndex, scenes],
  );

  return {
    scenes,
    playheadMs,
    isPlaying,
    togglePlay,
    seek,
    setPreset,
    activeSceneIndex,
    activePreset,
    totalMs: TOTAL_MS,
  };
}
