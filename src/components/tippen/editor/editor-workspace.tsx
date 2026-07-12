"use client";

import * as React from "react";
import { usePlaybackClock } from "@/hooks/use-typewriter";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopNav } from "./top-nav";
import { ScenePanel } from "./scene-panel";
import { CanvasPanel } from "./canvas-panel";
import { InspectorPanel } from "./inspector-panel";
import { TimelinePanel } from "./timeline-panel";

/**
 * EditorWorkspace — the full editor surface.
 *
 * Layout (desktop-first, fills the viewport, no page scroll):
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │ TopNav (fixed ~48px)                                      │
 *  ├──────────────────────────────────────────────────────────┤
 *  │ ┌────────┬──────────────────────────┬───────────────┐    │
 *  │ │ Scenes │ Canvas (flex-1)          │ Inspector     │    │
 *  │ │ ~260px │                          │ ~320px        │    │
 *  │ └────────┴──────────────────────────┴───────────────┘    │
 *  │                                                          │
 *  ├──────────────────────────────────────────────────────────┤
 *  │ Timeline (~220px, resizable)                              │
 *  ├──────────────────────────────────────────────────────────┤
 *  │ StatusBar (~24px)                                         │
 *  └──────────────────────────────────────────────────────────┘
 *
 * The top section (scenes | canvas | inspector) and the bottom timeline
 * are split vertically (resizable). Inside the top section, the three
 * zones are split horizontally (resizable).
 *
 * Drives playback by calling usePlaybackClock() once here.
 */
export function EditorWorkspace() {
  // Single playback clock instance for the entire workspace.
  usePlaybackClock();

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground"
        role="application"
        aria-label="Tippen editor"
      >
        <TopNav />

        {/* Whole body: top region (split horizontally) + timeline (split vertically) */}
        <ResizablePanelGroup
          direction="vertical"
          className="min-h-0 flex-1"
          autoSaveId="tippen-body"
        >
          {/* Top region: scenes | canvas | inspector */}
          <ResizablePanel defaultSize={66} minSize={30}>
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full"
              autoSaveId="tippen-top"
            >
              <ResizablePanel
                defaultSize={18}
                minSize={14}
                maxSize={28}
                className="min-w-[180px]"
              >
                <ScenePanel />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={54} minSize={30}>
                <CanvasPanel />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel
                defaultSize={28}
                minSize={20}
                maxSize={40}
                className="min-w-[240px]"
              >
                <InspectorPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* Bottom region: timeline */}
          <ResizablePanel defaultSize={34} minSize={15} maxSize={70}>
            <TimelinePanel />
          </ResizablePanel>
        </ResizablePanelGroup>

        <StatusBar />
      </div>
    </TooltipProvider>
  );
}

/** Tiny bottom-of-window status strip with shortcuts hint. */
function StatusBar() {
  return (
    <div className="flex h-6 shrink-0 items-center justify-between border-t border-border/60 bg-background px-3 text-[10px] text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="font-mono">Tippen</span>
        <span className="text-muted-foreground/40">·</span>
        <Kbd>Space</Kbd>
        <span>play</span>
        <Kbd>⌘Z</Kbd>
        <span>undo</span>
        <Kbd>⌘K</Kbd>
        <span>palette</span>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="size-1.5 rounded-full bg-ember" />
        <span>auto-saved locally</span>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 font-mono text-[9px] text-foreground/80">
          {children}
        </kbd>
      </TooltipTrigger>
      <TooltipContent side="top">Keyboard shortcut</TooltipContent>
    </Tooltip>
  );
}
