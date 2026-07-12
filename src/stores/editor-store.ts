"use client";

import { create } from "zustand";
import type {
  TippenProject,
  Scene,
  TextLine,
  AnimationPresetId,
  BackgroundId,
  CameraMove,
  TimelineTrack,
  PromptHistoryEntry,
  AiActionId,
} from "@/lib/tippen/types";
import { createSeedProject } from "@/lib/tippen/seed";

/* ─────────────────────────────────────────────
   HISTORY (undo / redo)
   ───────────────────────────────────────────── */

const HISTORY_LIMIT = 50;

interface History {
  past: TippenProject[];
  future: TippenProject[];
}

/* ─────────────────────────────────────────────
   STORE SHAPE
   ───────────────────────────────────────────── */

export type EditorView = "landing" | "editor";

export interface EditorState {
  /* top-level navigation (only `/` route is exposed) */
  view: EditorView;
  setView: (v: EditorView) => void;

  /* project */
  project: TippenProject;
  selectedSceneId: string | null;
  selectedLineId: string | null;
  selectedTrackId: string | null;

  /* playback */
  isPlaying: boolean;
  playheadMs: number;
  zoom: number; // 0.25 .. 4

  /* ui */
  inspectorTab: "scene" | "text" | "animation" | "audio" | "ai";
  commandOpen: boolean;

  /* ai */
  promptHistory: PromptHistoryEntry[];
  aiBusy: boolean;

  /* history */
  history: History;

  /* actions — navigation */
  openEditor: () => void;
  openLanding: () => void;

  /* actions — playback */
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (ms: number) => void;
  setZoom: (z: number) => void;

  /* actions — selection */
  selectScene: (id: string | null) => void;
  selectLine: (id: string | null) => void;
  selectTrack: (id: string | null) => void;
  setInspectorTab: (t: EditorState["inspectorTab"]) => void;
  setCommandOpen: (v: boolean) => void;

  /* actions — scenes */
  addScene: () => void;
  deleteScene: (id: string) => void;
  duplicateScene: (id: string) => void;
  reorderScenes: (fromId: string, toId: string) => void;
  updateScene: (id: string, patch: Partial<Scene>) => void;

  /* actions — lines */
  addLine: (sceneId: string) => void;
  updateLine: (sceneId: string, lineId: string, patch: Partial<TextLine>) => void;
  deleteLine: (sceneId: string, lineId: string) => void;

  /* actions — tracks */
  toggleMute: (trackId: string) => void;
  toggleLock: (trackId: string) => void;
  moveClip: (clipId: string, deltaMs: number) => void;

  /* actions — project */
  updateSettings: (patch: Partial<TippenProject["settings"]>) => void;
  resetProject: () => void;

  /* actions — ai */
  pushPrompt: (entry: PromptHistoryEntry) => void;
  clearPromptHistory: () => void;
  setAiBusy: (v: boolean) => void;
  applyAiResult: (action: AiActionId, result: string) => void;

  /* history */
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function withHistory(state: EditorState): Partial<EditorState> {
  const past = [...state.history.past, clone(state.project)].slice(
    -HISTORY_LIMIT,
  );
  return {
    history: { past, future: [] },
    project: { ...state.project, updatedAt: Date.now() },
  };
}

/* ─────────────────────────────────────────────
   STORE
   ───────────────────────────────────────────── */

export const useEditorStore = create<EditorState>((set, get) => ({
  view: "landing",
  setView: (v) => set({ view: v }),

  project: createSeedProject(),
  selectedSceneId: "scene-1",
  selectedLineId: "line-1-1",
  selectedTrackId: "track-typing",

  isPlaying: false,
  playheadMs: 0,
  zoom: 1,

  inspectorTab: "text",
  commandOpen: false,

  promptHistory: [],
  aiBusy: false,

  history: { past: [], future: [] },

  openEditor: () => set({ view: "editor" }),
  openLanding: () => set({ view: "landing" }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  seek: (ms) =>
    set((s) => ({
      playheadMs: Math.max(0, Math.min(ms, s.project.settings.durationMs)),
    })),
  setZoom: (z) => set({ zoom: Math.max(0.25, Math.min(4, z)) }),

  selectScene: (id) =>
    set({
      selectedSceneId: id,
      selectedLineId:
        id &&
        get().project.scenes.find((s) => s.id === id)?.lines[0]?.id
          ? get().project.scenes.find((s) => s.id === id)!.lines[0].id
          : null,
    }),
  selectLine: (id) => set({ selectedLineId: id }),
  selectTrack: (id) => set({ selectedTrackId: id }),
  setInspectorTab: (t) => set({ inspectorTab: t }),
  setCommandOpen: (v) => set({ commandOpen: v }),

  addScene: () => {
    const s = get();
    const newScene: Scene = {
      id: uid("scene"),
      name: `Scene ${s.project.scenes.length + 1}`,
      background: "ink",
      startMs: s.project.settings.durationMs,
      durationMs: 3000,
      camera: "static",
      lines: [
        {
          id: uid("line"),
          content: "New scene.",
          preset: "typewriter",
          cps: 16,
          fontSize: 52,
          align: "center",
          highlights: [],
        },
      ],
    };
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        scenes: [...s.project.scenes, newScene],
        settings: {
          ...s.project.settings,
          durationMs: s.project.settings.durationMs + 3000,
        },
      },
      selectedSceneId: newScene.id,
      selectedLineId: newScene.lines[0].id,
    });
  },

  deleteScene: (id) => {
    const s = get();
    if (s.project.scenes.length <= 1) return;
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        scenes: s.project.scenes.filter((sc) => sc.id !== id),
      },
      selectedSceneId:
        s.selectedSceneId === id
          ? s.project.scenes.find((sc) => sc.id !== id)?.id ?? null
          : s.selectedSceneId,
    });
  },

  duplicateScene: (id) => {
    const s = get();
    const scene = s.project.scenes.find((sc) => sc.id === id);
    if (!scene) return;
    const copy: Scene = {
      ...clone(scene),
      id: uid("scene"),
      name: `${scene.name} copy`,
      startMs: s.project.settings.durationMs,
      lines: scene.lines.map((l) => ({ ...clone(l), id: uid("line") })),
    };
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        scenes: [...s.project.scenes, copy],
        settings: {
          ...s.project.settings,
          durationMs: s.project.settings.durationMs + scene.durationMs,
        },
      },
    });
  },

  reorderScenes: (fromId, toId) => {
    const s = get();
    const scenes = [...s.project.scenes];
    const from = scenes.findIndex((sc) => sc.id === fromId);
    const to = scenes.findIndex((sc) => sc.id === toId);
    if (from === -1 || to === -1 || from === to) return;
    const [moved] = scenes.splice(from, 1);
    scenes.splice(to, 0, moved);
    set({ ...withHistory(s), project: { ...s.project, scenes } });
  },

  updateScene: (id, patch) => {
    const s = get();
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        scenes: s.project.scenes.map((sc) =>
          sc.id === id ? { ...sc, ...patch } : sc,
        ),
      },
    });
  },

  addLine: (sceneId) => {
    const s = get();
    const newLine: TextLine = {
      id: uid("line"),
      content: "New line.",
      preset: "typewriter",
      cps: 16,
      fontSize: 48,
      align: "center",
      highlights: [],
    };
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        scenes: s.project.scenes.map((sc) =>
          sc.id === sceneId ? { ...sc, lines: [...sc.lines, newLine] } : sc,
        ),
      },
      selectedLineId: newLine.id,
    });
  },

  updateLine: (sceneId, lineId, patch) => {
    const s = get();
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        scenes: s.project.scenes.map((sc) =>
          sc.id === sceneId
            ? {
                ...sc,
                lines: sc.lines.map((l) =>
                  l.id === lineId ? { ...l, ...patch } : l,
                ),
              }
            : sc,
        ),
      },
    });
  },

  deleteLine: (sceneId, lineId) => {
    const s = get();
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        scenes: s.project.scenes.map((sc) =>
          sc.id === sceneId
            ? { ...sc, lines: sc.lines.filter((l) => l.id !== lineId) }
            : sc,
        ),
      },
      selectedLineId: null,
    });
  },

  toggleMute: (trackId) => {
    const s = get();
    set({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, muted: !t.muted } : t,
        ),
      },
    });
  },

  toggleLock: (trackId) => {
    const s = get();
    set({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, locked: !t.locked } : t,
        ),
      },
    });
  },

  moveClip: (clipId, deltaMs) => {
    const s = get();
    set({
      ...withHistory(s),
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === clipId
              ? { ...c, startMs: Math.max(0, c.startMs + deltaMs) }
              : c,
          ),
        })),
      },
    });
  },

  updateSettings: (patch) => {
    const s = get();
    set({
      ...withHistory(s),
      project: { ...s.project, settings: { ...s.project.settings, ...patch } },
    });
  },

  resetProject: () => {
    const s = get();
    set({
      ...withHistory(s),
      project: createSeedProject(),
      selectedSceneId: "scene-1",
      selectedLineId: "line-1-1",
      playheadMs: 0,
      isPlaying: false,
    });
  },

  pushPrompt: (entry) =>
    set((s) => ({ promptHistory: [entry, ...s.promptHistory].slice(0, 50) })),
  clearPromptHistory: () => set({ promptHistory: [] }),
  setAiBusy: (v) => set({ aiBusy: v }),

  applyAiResult: (action, result) => {
    const s = get();
    // The AI "result" is applied contextually per action.
    if (action === "generate-intro" || action === "rewrite-script") {
      // Replace the currently selected line's content with the result.
      const { selectedSceneId, selectedLineId } = s;
      if (!selectedSceneId || !selectedLineId) return;
      set({
        ...withHistory(s),
        project: {
          ...s.project,
          scenes: s.project.scenes.map((sc) =>
            sc.id === selectedSceneId
              ? {
                  ...sc,
                  lines: sc.lines.map((l) =>
                    l.id === selectedLineId ? { ...l, content: result } : l,
                  ),
                }
              : sc,
          ),
        },
      });
    } else if (action === "auto-highlight") {
      // Naively highlight the most "important" long word in each line.
      set({
        ...withHistory(s),
        project: {
          ...s.project,
          scenes: s.project.scenes.map((sc) => ({
            ...sc,
            lines: sc.lines.map((l) => {
              const words = l.content.split(/\s+/);
              if (words.length === 0) return l;
              const longest = words.reduce((a, b) =>
                a.length >= b.length ? a : b,
              );
              const start = l.content.indexOf(longest);
              return {
                ...l,
                highlights:
                  start >= 0
                    ? [{ start, end: start + longest.length }]
                    : l.highlights,
              };
            }),
          })),
        },
      });
    }
  },

  undo: () => {
    const s = get();
    if (s.history.past.length === 0) return;
    const previous = s.history.past[s.history.past.length - 1];
    set({
      project: previous,
      history: {
        past: s.history.past.slice(0, -1),
        future: [clone(s.project), ...s.history.future].slice(0, HISTORY_LIMIT),
      },
    });
  },

  redo: () => {
    const s = get();
    if (s.history.future.length === 0) return;
    const next = s.history.future[0];
    set({
      project: next,
      history: {
        past: [...s.history.past, clone(s.project)].slice(-HISTORY_LIMIT),
        future: s.history.future.slice(1),
      },
    });
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
}));

/* Convenience selector hooks */
export const useSelectedScene = () =>
  useEditorStore((s) =>
    s.project.scenes.find((sc) => sc.id === s.selectedSceneId) ?? null,
  );

export const useSelectedLine = () =>
  useEditorStore((s) => {
    const scene = s.project.scenes.find(
      (sc) => sc.id === s.selectedSceneId,
    );
    return (
      scene?.lines.find((l) => l.id === s.selectedLineId) ?? null
    );
  });

export const useTrackColor = (color?: string): string => {
  if (!color) return "var(--muted-foreground)";
  switch (color) {
    case "ember":
      return "var(--ember)";
    case "muted":
      return "var(--muted-foreground)";
    default:
      return color;
  }
};

export type { AnimationPresetId, BackgroundId, CameraMove, TimelineTrack };
