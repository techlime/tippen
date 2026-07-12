"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";

/**
 * useTippenShortcuts — global keyboard shortcuts for the editor.
 *
 * - ⌘/Ctrl + Z       undo
 * - ⌘/Ctrl + ⇧ + Z   redo  (also ⌘/Ctrl + Y)
 * - Space            play / pause
 * - ⌘/Ctrl + K       command palette
 * - ⌘/Ctrl + =       zoom in
 * - ⌘/Ctrl + -       zoom out
 * - ⌘/Ctrl + 0       reset zoom
 * - ← / →            seek -100ms / +100ms
 * - N                new scene
 * - Esc              deselect
 *
 * Active only while the editor view is mounted. Ignores inputs while the
 * user is typing in a text field.
 */
export function useTippenShortcuts(enabled: boolean) {
  const {
    undo,
    redo,
    togglePlay,
    setCommandOpen,
    setZoom,
    seek,
    playheadMs,
    addScene,
    selectLine,
    selectScene,
    view,
  } = useEditorStore();

  React.useEffect(() => {
    if (!enabled || view !== "editor") return;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "combobox");

      const mod = e.metaKey || e.ctrlKey;

      // Command palette works even when typing.
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      if (typing) return;

      // Undo / redo
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Zoom
      if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoom(useEditorStore.getState().zoom + 0.25);
        return;
      }
      if (mod && e.key === "-") {
        e.preventDefault();
        setZoom(useEditorStore.getState().zoom - 0.25);
        return;
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        setZoom(1);
        return;
      }

      // Playback
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Seek
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        seek(playheadMs - 100);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        seek(playheadMs + 100);
        return;
      }

      // New scene
      if (e.key.toLowerCase() === "n" && !mod) {
        e.preventDefault();
        addScene();
        return;
      }

      // Escape deselects
      if (e.key === "Escape") {
        selectLine(null);
        selectScene(null);
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    enabled,
    view,
    undo,
    redo,
    togglePlay,
    setCommandOpen,
    setZoom,
    seek,
    playheadMs,
    addScene,
    selectLine,
    selectScene,
  ]);
}
