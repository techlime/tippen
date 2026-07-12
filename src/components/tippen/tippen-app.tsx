"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useTippenShortcuts } from "@/hooks/use-tippen-shortcuts";
import { LandingPage } from "@/components/tippen/landing/landing-page";
import { EditorWorkspace } from "@/components/tippen/editor/editor-workspace";
import { EditorCommandPalette } from "@/components/tippen/editor/command-palette";

/**
 * TippenApp — root application shell.
 *
 * Tippen exposes a single `/` route. Navigation between the marketing
 * landing page and the editor workspace is handled via Zustand view state,
 * so deep-linking is intentionally avoided for the MVP (see ROADMAP.md).
 *
 * The shell also mounts the global Command Palette (⌘K) which is available
 * across both views.
 */
export function TippenApp() {
  const view = useEditorStore((s) => s.view);
  useTippenShortcuts(true);

  return (
    <>
      {view === "landing" ? <LandingPage /> : <EditorWorkspace />}
      <EditorCommandPalette />
    </>
  );
}
