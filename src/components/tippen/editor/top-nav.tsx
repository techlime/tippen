"use client";

import * as React from "react";
import {
  ChevronLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Command as CommandIcon,
  Film,
  Download,
  Share2,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { TippenLogo } from "@/components/tippen/tippen-logo";
import { ThemeToggle } from "@/components/tippen/theme-toggle";
import { useEditorStore } from "@/stores/editor-store";
import { formatTime } from "./editor-utils";
import { cn } from "@/lib/utils";

/**
 * TopNav — fixed-height (~48px) editor top bar.
 * Left: back-to-landing + logo + editable project title.
 * Center: transport controls + time display.
 * Right: zoom slider, undo/redo, theme toggle, ⌘K, export menu, share/save.
 */
export function TopNav() {
  const openLanding = useEditorStore((s) => s.openLanding);
  const title = useEditorStore((s) => s.project.settings.title);
  const updateSettings = useEditorStore((s) => s.updateSettings);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const togglePlay = useEditorStore((s) => s.togglePlay);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const durationMs = useEditorStore((s) => s.project.settings.durationMs);
  const seek = useEditorStore((s) => s.seek);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.history.past.length > 0);
  const canRedo = useEditorStore((s) => s.history.future.length > 0);
  const setCommandOpen = useEditorStore((s) => s.setCommandOpen);

  const [exporting, setExporting] = React.useState<"mp4" | "gif" | null>(null);

  const onExport = (kind: "mp4" | "gif") => {
    if (kind === "gif") return; // disabled
    setExporting(kind);
    // UI-only: simulate export then reset.
    setTimeout(() => setExporting(null), 1400);
  };

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur"
      role="banner"
    >
      {/* Left: back + logo + title */}
      <div className="flex min-w-0 items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md"
              onClick={openLanding}
              aria-label="Back to landing"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Back to landing</TooltipContent>
        </Tooltip>
        <TippenLogo showWordmark={false} size={24} className="mr-0.5" />
        <span className="hidden font-display text-base leading-none text-foreground sm:inline">
          Tippen
        </span>
        <span className="mx-2 hidden text-muted-foreground/40 sm:inline">/</span>
        <input
          aria-label="Project title"
          value={title}
          onChange={(e) => updateSettings({ title: e.target.value })}
          className={cn(
            "min-w-0 max-w-[220px] truncate rounded-md bg-transparent px-1.5 py-1 text-sm font-medium",
            "outline-none transition-colors hover:bg-accent focus:bg-accent focus:ring-1 focus:ring-ember/40",
          )}
          placeholder="Untitled project"
        />
      </div>

      {/* Center: transport */}
      <div className="mx-auto flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md"
              onClick={() => seek(0)}
              aria-label="Skip to start"
            >
              <SkipBack className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Skip to start (Home)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-9 rounded-full bg-ember text-ember-foreground hover:bg-ember/90"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 translate-x-[1px]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Play / pause (Space)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md"
              onClick={() => seek(durationMs)}
              aria-label="Skip to end"
            >
              <SkipForward className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Skip to end (End)</TooltipContent>
        </Tooltip>

        <div
          className="ml-1.5 flex items-baseline gap-1 font-mono text-xs tabular-nums text-muted-foreground"
          aria-live="off"
        >
          <span className="text-foreground">{formatTime(playheadMs)}</span>
          <span className="text-muted-foreground/50">/</span>
          <span>{formatTime(durationMs, false)}</span>
        </div>
      </div>

      {/* Right: zoom, undo/redo, theme, ⌘K, export, share */}
      <div className="flex items-center gap-1.5">
        <div className="hidden items-center gap-1.5 rounded-md border border-border/60 px-2 py-1 md:flex">
          <ZoomOut
            className="size-3.5 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => setZoom(zoom - 0.25)}
            aria-label="Zoom out"
          />
          <Slider
            value={[zoom]}
            min={0.25}
            max={4}
            step={0.05}
            onValueChange={(v) => setZoom(v[0] ?? 1)}
            className="w-24"
            aria-label="Zoom"
          />
          <ZoomIn
            className="size-3.5 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => setZoom(zoom + 0.25)}
            aria-label="Zoom in"
          />
          <button
            onClick={() => setZoom(1)}
            className="ml-0.5 rounded px-1 font-mono text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md disabled:opacity-40"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Undo (⌘Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-md disabled:opacity-40"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden h-8 gap-1.5 rounded-md px-2 text-xs lg:flex"
              onClick={() => setCommandOpen(true)}
            >
              <CommandIcon className="size-3.5" />
              <span className="text-muted-foreground">⌘K</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Command palette (⌘K)</TooltipContent>
        </Tooltip>

        <ThemeToggle className="size-8" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-md px-2.5 text-xs"
            >
              {exporting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuLabel className="text-xs">
              Export project
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport("mp4")}>
              <Film className="mr-2 size-4" />
              MP4 video
              <span className="ml-auto text-[10px] text-ember">active</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Download className="mr-2 size-4 opacity-50" />
              GIF
              <span className="ml-auto text-[10px] text-muted-foreground">
                planned
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-8 gap-1.5 rounded-md px-2.5 text-xs sm:flex"
              aria-label="Share"
            >
              <Share2 className="size-3.5" />
              <span>Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Share read-only link</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-md bg-ink px-2.5 text-xs text-ember hover:bg-ink/90"
              aria-label="Save project"
            >
              <Save className="size-3.5" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Save (⌘S)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
