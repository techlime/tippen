"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CinematicStage } from "@/components/tippen/cinematic-stage";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { useLandingDemo } from "./use-landing-demo";
import type { AnimationPresetId } from "@/lib/tippen/types";
import { useEditorStore } from "@/stores/editor-store";

const PRESET_OPTIONS: Array<{ id: AnimationPresetId; label: string }> = [
  { id: "typewriter", label: "Typewriter" },
  { id: "terminal", label: "Terminal" },
  { id: "apple-intro", label: "Apple Intro" },
  { id: "fade", label: "Fade" },
];

function fmt(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  const cs = Math.floor((ms % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}.${cs}`;
}

export function LandingDemo() {
  const demo = useLandingDemo();
  const openEditor = useEditorStore((s) => s.openEditor);
  const activeScene = demo.scenes[demo.activeSceneIndex];

  return (
    <SectionShell
      id="demo"
      className="border-y border-border/40 bg-muted/20"
    >
      <SectionHeading
        eyebrow="See it in motion"
        title={
          <>
            A real cinematic stage,{" "}
            <span className="text-gradient-ember">playing live.</span>
          </>
        }
        description="This is the exact rendering engine the editor uses. Hit play, scrub the timeline, and switch presets to compare reveals on the same canvas."
      />

      <Reveal delay={0.1} className="mt-12">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
          {/* Stage */}
          <div className="relative aspect-video w-full bg-black">
            <CinematicStage
              scene={activeScene}
              playhead={demo.playheadMs}
              letterboxed
            />

            {/* Scene chip — top-left */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/15 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur"
              >
                scene {demo.activeSceneIndex + 1} / {demo.scenes.length}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/15 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur"
              >
                {activeScene?.name}
              </Badge>
            </div>

            {/* Big play overlay when paused */}
            {!demo.isPlaying && (
              <button
                onClick={demo.togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
                aria-label="Play"
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-ember text-ember-foreground shadow-lg ring-4 ring-ember/20">
                  <Play className="size-6 translate-x-0.5" />
                </span>
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 border-t border-border/60 bg-muted/30 p-4 sm:p-5">
            {/* Transport row */}
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                onClick={demo.togglePlay}
                className="size-10 shrink-0 rounded-full bg-ember text-ember-foreground shadow-sm hover:bg-ember/90"
                aria-label={demo.isPlaying ? "Pause" : "Play"}
              >
                {demo.isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4 translate-x-0.5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => demo.seek(0)}
                className="size-9 shrink-0 rounded-full"
                aria-label="Rewind to start"
              >
                <RotateCcw className="size-4" />
              </Button>

              {/* Scrubber */}
              <div className="flex flex-1 items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {fmt(demo.playheadMs)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={demo.totalMs}
                  step={16}
                  value={demo.playheadMs}
                  onChange={(e) => demo.seek(Number(e.target.value))}
                  className="tippen-range h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border"
                  aria-label="Scrub timeline"
                />
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {fmt(demo.totalMs)}
                </span>
              </div>
            </div>

            {/* Preset selector */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Preset
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESET_OPTIONS.map((opt) => {
                    const active = demo.activePreset === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => demo.setPreset(opt.id)}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                          active
                            ? "border-ember/40 bg-ember text-ember-foreground shadow-sm"
                            : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                size="sm"
                onClick={openEditor}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="size-4" />
                Open in editor
              </Button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Scene strip */}
      <Reveal delay={0.15} className="mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {demo.scenes.map((s, i) => {
            const active = i === demo.activeSceneIndex;
            return (
              <button
                key={s.id}
                onClick={() => demo.seek(s.startMs + 100)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",
                  active
                    ? "border-ember/40 bg-ember/10"
                    : "border-border/60 bg-card hover:border-border",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums",
                    active ? "text-ember" : "text-muted-foreground",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {s.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.lines[0]?.preset}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Range input styling */}
      <style>{`
        .tippen-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 9999px;
          background: var(--ember);
          border: 2px solid var(--background);
          box-shadow: 0 0 0 1px var(--ember);
          cursor: pointer;
        }
        .tippen-range::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 9999px;
          background: var(--ember);
          border: 2px solid var(--background);
          box-shadow: 0 0 0 1px var(--ember);
          cursor: pointer;
        }
        .tippen-range:focus-visible {
          outline: none;
        }
      `}</style>
    </SectionShell>
  );
}
