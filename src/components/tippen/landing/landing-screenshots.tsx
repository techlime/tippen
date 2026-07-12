"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Undo2,
  Redo2,
  Plus,
  Layers,
  Sparkles,
  Film,
  Music,
  Mic,
  Volume2,
  Camera,
  Highlighter,
  Keyboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { cn } from "@/lib/utils";

export function LandingScreenshots() {
  return (
    <SectionShell id="screenshots">
      <SectionHeading
        eyebrow="The editor"
        title={
          <>
            A workspace built for{" "}
            <span className="text-gradient-ember">storytellers.</span>
          </>
        }
        description="Multi-track timeline, scene sidebar, cinematic canvas, and an AI inspector — all in one focused window."
      />

      <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible">
        <Reveal className="min-w-[88%] snap-center sm:min-w-[60%] lg:min-w-0">
          <EditorMockup variant="canvas" />
        </Reveal>
        <Reveal
          delay={0.08}
          className="min-w-[88%] snap-center sm:min-w-[60%] lg:min-w-0"
        >
          <EditorMockup variant="timeline" />
        </Reveal>
        <Reveal
          delay={0.16}
          className="min-w-[88%] snap-center sm:min-w-[60%] lg:min-w-0"
        >
          <EditorMockup variant="ai" />
        </Reveal>
      </div>
    </SectionShell>
  );
}

type MockupVariant = "canvas" | "timeline" | "ai";

function EditorMockup({ variant }: { variant: MockupVariant }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-destructive/40" />
          <span className="size-2 rounded-full bg-ember/60" />
          <span className="size-2 rounded-full bg-chart-4/40" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          untitled-cinematic.tippen
        </span>
        <div className="flex items-center gap-1">
          <Undo2 className="size-3.5 text-muted-foreground" />
          <Redo2 className="size-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="flex size-7 items-center justify-center rounded-md bg-ember text-ember-foreground">
            <Pause className="size-3.5" />
          </span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            00:02.40 / 00:12.80
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-border/60 px-1.5 py-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
          >
            1080p · 30fps
          </Badge>
          <Badge
            variant="outline"
            className="border-border/60 px-1.5 py-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
          >
            zoom 1.0×
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[120px_1fr_120px]">
        <Sidebar variant={variant} />
        <CanvasArea variant={variant} />
        <Inspector variant={variant} />
      </div>

      {/* Timeline strip */}
      <TimelineStrip variant={variant} />
    </motion.div>
  );
}

function Sidebar({ variant }: { variant: MockupVariant }) {
  const scenes = [
    { name: "Cold Open", active: variant === "canvas" },
    { name: "The Premise", active: false },
    { name: "The Reveal", active: variant === "timeline" },
  ];
  return (
    <div className="hidden flex-col gap-1 border-r border-border/60 bg-muted/20 p-2 sm:flex">
      <div className="flex items-center justify-between px-1.5 py-1">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          scenes
        </span>
        <Plus className="size-3 text-muted-foreground" />
      </div>
      {scenes.map((s, i) => (
        <div
          key={s.name}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-1.5 py-1.5",
            s.active
              ? "border-ember/30 bg-ember/10"
              : "border-transparent bg-card",
          )}
        >
          <span
            className={cn(
              "font-mono text-[9px] tabular-nums",
              s.active ? "text-ember" : "text-muted-foreground",
            )}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="truncate text-[10px] font-medium text-foreground">
            {s.name}
          </span>
        </div>
      ))}
      <div className="mt-auto flex items-center gap-1.5 rounded-md border border-dashed border-border/60 px-1.5 py-1.5 text-muted-foreground">
        <Layers className="size-3" />
        <span className="text-[10px]">3 scenes</span>
      </div>
    </div>
  );
}

function CanvasArea({ variant }: { variant: MockupVariant }) {
  return (
    <div className="relative aspect-[16/10] bg-black">
      {/* Background gradient — ink */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "ai"
              ? "radial-gradient(120% 120% at 50% 100%, oklch(0.22 0.06 290) 0%, oklch(0.14 0.03 264) 60%, oklch(0.09 0.01 264) 100%)"
              : "oklch(0.18 0.008 264)",
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-50" />

      {/* Centered "typing" text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-[10%] text-center">
        <p
          className="font-display text-foreground"
          style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.02em" }}
        >
          Every story begins
        </p>
        <p
          className="font-display text-foreground"
          style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.02em" }}
        >
          with a single keystroke
          <span className="caret-blink ml-0.5 inline-block h-[0.9em] w-[0.05em] translate-y-[0.08em] bg-ember align-baseline" />
        </p>
      </div>

      {/* Scene badge */}
      <div className="absolute left-2 top-2 flex items-center gap-1">
        <Badge
          variant="outline"
          className="border-white/15 bg-black/40 px-1.5 py-0 font-mono text-[8px] uppercase tracking-wider text-white/70 backdrop-blur"
        >
          scene 01 · cold open
        </Badge>
      </div>
    </div>
  );
}

function Inspector({ variant }: { variant: MockupVariant }) {
  return (
    <div className="hidden flex-col gap-2 border-l border-border/60 bg-muted/20 p-2 sm:flex">
      <div className="flex items-center justify-between px-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {variant === "ai" ? "ai" : "inspector"}
        </span>
        <Sparkles
          className={cn(
            "size-3",
            variant === "ai" ? "text-ember" : "text-muted-foreground",
          )}
        />
      </div>

      {variant === "ai" ? (
        <div className="flex flex-col gap-1.5">
          <div className="rounded-md border border-ember/30 bg-ember/5 px-1.5 py-1.5">
            <span className="font-mono text-[8px] uppercase tracking-wider text-ember">
              result
            </span>
            <p className="mt-0.5 text-[9px] leading-tight text-foreground">
              &ldquo;Every note you ever lost&rdquo;
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-card px-1.5 py-1.5">
            <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
              you
            </span>
            <p className="mt-0.5 text-[9px] leading-tight text-foreground">
              Write a noir cold open…
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Field label="preset" value="typewriter" />
          <Field label="cps" value="22" accent />
          <Field label="size" value="48px" />
          <Field label="align" value="center" />
          <Field label="cursor" value="on" />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-card px-1.5 py-1">
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[9px] font-medium",
          accent ? "text-ember" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function TimelineStrip({ variant }: { variant: MockupVariant }) {
  const tracks: Array<{
    icon: typeof Music;
    label: string;
    color: string;
    width: number;
    offset: number;
  }> = [
    { icon: Keyboard, label: "typing", color: "var(--ember)", width: 60, offset: 0 },
    { icon: Plus, label: "cursor", color: "var(--muted-foreground)", width: 90, offset: 5 },
    { icon: Mic, label: "voice", color: "oklch(0.7 0.13 184)", width: 70, offset: 10 },
    { icon: Music, label: "music", color: "oklch(0.72 0.15 290)", width: 95, offset: 0 },
    { icon: Highlighter, label: "highlights", color: "var(--ember)", width: 25, offset: 30 },
    { icon: Camera, label: "camera", color: "oklch(0.78 0.15 150)", width: 40, offset: 0 },
    { icon: Volume2, label: "sfx", color: "var(--muted-foreground)", width: 20, offset: 35 },
    { icon: Film, label: "transitions", color: "var(--muted-foreground)", width: 15, offset: 38 },
  ];

  return (
    <div
      className={cn(
        "border-t border-border/60 bg-muted/20 p-2",
        variant === "timeline" ? "block" : "hidden sm:block",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          timeline
        </span>
        <div className="flex items-center gap-1">
          <Play className="size-3 text-muted-foreground" />
          <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
            00:02.40
          </span>
        </div>
      </div>

      {/* Playhead line */}
      <div className="relative">
        <div
          className="absolute top-0 bottom-0 z-10 w-px bg-ember"
          style={{ left: "22%" }}
        />
        <div className="absolute top-0 z-10 size-2 -translate-x-1/2 rounded-full bg-ember" style={{ left: "22%" }} />

        <div className="flex flex-col gap-1">
          {tracks.map((t) => (
            <div key={t.label} className="flex items-center gap-1.5">
              <div className="flex w-14 shrink-0 items-center gap-1">
                <t.icon className="size-2.5 text-muted-foreground" />
                <span className="truncate font-mono text-[8px] lowercase text-muted-foreground">
                  {t.label}
                </span>
              </div>
              <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-border/40">
                <div
                  className="absolute top-0 bottom-0 rounded-sm opacity-80"
                  style={{
                    left: `${t.offset}%`,
                    width: `${t.width}%`,
                    background: t.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
