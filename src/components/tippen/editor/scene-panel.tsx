"use client";

import * as React from "react";
import {
  Plus,
  Copy,
  Trash2,
  GripVertical,
  Film,
  MoreVertical,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/stores/editor-store";
import { BACKGROUND_OPTIONS } from "@/lib/tippen/seed";
import { formatTime, scenesDurationMs } from "./editor-utils";
import { cn } from "@/lib/utils";
import type { BackgroundId } from "@/lib/tippen/types";

/**
 * ScenePanel — left sidebar.
 * Lists scenes, lets you select/add/duplicate/delete, includes a
 * quick-insert templates strip and project stats at the bottom.
 */
export function ScenePanel() {
  const scenes = useEditorStore((s) => s.project.scenes);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const playheadMs = useEditorStore((s) => s.playheadMs);
  const selectScene = useEditorStore((s) => s.selectScene);
  const addScene = useEditorStore((s) => s.addScene);
  const deleteScene = useEditorStore((s) => s.deleteScene);
  const duplicateScene = useEditorStore((s) => s.duplicateScene);
  const updateScene = useEditorStore((s) => s.updateScene);
  const selectLine = useEditorStore((s) => s.selectLine);
  const setInspectorTab = useEditorStore((s) => s.setInspectorTab);

  const onAddScene = () => {
    addScene();
    setInspectorTab("scene");
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/60 px-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Film className="size-3.5" />
          Scenes
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
            {scenes.length}
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 rounded-md"
              onClick={onAddScene}
              aria-label="Add scene"
            >
              <Plus className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">New scene (N)</TooltipContent>
        </Tooltip>
      </div>

      {/* Scenes list */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 p-2">
          {scenes.map((scene, idx) => {
            const selected = scene.id === selectedSceneId;
            const isActive =
              playheadMs >= scene.startMs &&
              playheadMs < scene.startMs + scene.durationMs;
            const bg =
              BACKGROUND_OPTIONS.find((b) => b.id === scene.background) ??
              BACKGROUND_OPTIONS[0];

            return (
              <div
                key={scene.id}
                role="button"
                tabIndex={0}
                onClick={() => selectScene(scene.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectScene(scene.id);
                  }
                }}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 transition-all",
                  "border-transparent hover:border-border/60 hover:bg-accent/60",
                  selected &&
                    "border-ember/40 bg-ember/10 ring-1 ring-ember/30 hover:border-ember/40 hover:bg-ember/10",
                )}
                aria-pressed={selected}
              >
                <GripVertical
                  className="size-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground"
                  aria-hidden
                />

                {/* Background swatch */}
                <span
                  className="size-7 shrink-0 rounded-md border border-border/60"
                  style={{ background: bg.swatch }}
                  aria-hidden
                />

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium text-foreground">
                      {scene.name}
                    </span>
                    {isActive && (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-ember"
                        aria-label="Active at playhead"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="tabular-nums">
                      #{idx + 1} · {formatTime(scene.durationMs, false)}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="truncate">{scene.camera}</span>
                  </div>
                </div>

                {/* Per-row menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "size-6 shrink-0 rounded-md opacity-0 transition-opacity group-hover:opacity-100",
                        selected && "opacity-100",
                      )}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Scene options"
                    >
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-36">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateScene(scene.id);
                      }}
                    >
                      <Copy className="mr-2 size-3.5" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        selectScene(scene.id);
                        selectLine(scene.lines[0]?.id ?? null);
                        setInspectorTab("scene");
                      }}
                    >
                      <Layers className="mr-2 size-3.5" />
                      Edit scene
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={scenes.length <= 1}
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(scene.id);
                      }}
                    >
                      <Trash2 className="mr-2 size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          <button
            onClick={onAddScene}
            className={cn(
              "mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 px-2 py-2 text-xs text-muted-foreground",
              "transition-colors hover:border-ember/40 hover:bg-ember/5 hover:text-ember",
            )}
          >
            <Plus className="size-3.5" />
            Add scene
          </button>
        </div>
      </ScrollArea>

      {/* Templates quick insert */}
      <div className="shrink-0 border-t border-border/60 px-3 py-2.5">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3" />
          Templates
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t, addScene, updateScene)}
              className={cn(
                "group flex flex-col gap-1 rounded-md border border-border/60 bg-card px-2 py-1.5 text-left transition-colors",
                "hover:border-ember/40 hover:bg-ember/5",
              )}
            >
              <span className="text-[11px] font-medium text-foreground group-hover:text-ember">
                {t.name}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {t.duration / 1000}s · {t.bg}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Project stats */}
      <ProjectStats />
    </div>
  );
}

const TEMPLATES: Array<{
  id: string;
  name: string;
  bg: BackgroundId;
  duration: number;
  camera: "static" | "push-in" | "pull-out" | "pan-left" | "pan-right" | "tilt-up";
  text: string;
}> = [
  {
    id: "tpl-cold",
    name: "Cold Open",
    bg: "ink",
    duration: 3200,
    camera: "push-in",
    text: "It started with a single line.",
  },
  {
    id: "tpl-premise",
    name: "Premise",
    bg: "midnight",
    duration: 4000,
    camera: "static",
    text: "Here is the premise.",
  },
  {
    id: "tpl-reveal",
    name: "Reveal",
    bg: "ember",
    duration: 2800,
    camera: "pull-out",
    text: "The reveal.",
  },
  {
    id: "tpl-noir",
    name: "Noir",
    bg: "noir",
    duration: 3600,
    camera: "pan-right",
    text: "A shadow falls.",
  },
];

function applyTemplate(
  t: (typeof TEMPLATES)[number],
  addScene: () => void,
  updateScene: (id: string, patch: Partial<import("@/lib/tippen/types").Scene>) => void,
) {
  addScene();
  // The new scene is the last one in the store; grab it via the store API.
  const state = useEditorStore.getState();
  const newScene = state.project.scenes[state.project.scenes.length - 1];
  if (!newScene) return;
  updateScene(newScene.id, {
    name: t.name,
    background: t.bg,
    durationMs: t.duration,
    camera: t.camera,
    lines: newScene.lines.map((l) => ({ ...l, content: t.text })),
  });
}

function ProjectStats() {
  const scenes = useEditorStore((s) => s.project.scenes);
  const durationMs = useEditorStore((s) => s.project.settings.durationMs);
  const totalDur = Math.max(durationMs, scenesDurationMs(scenes));
  const lineCount = scenes.reduce((acc, s) => acc + s.lines.length, 0);

  return (
    <div className="grid shrink-0 grid-cols-3 gap-px border-t border-border/60 bg-border/60">
      <Stat label="Scenes" value={`${scenes.length}`} icon={<Film className="size-3" />} />
      <Stat label="Lines" value={`${lineCount}`} icon={<Layers className="size-3" />} />
      <Stat
        label="Length"
        value={formatTime(totalDur, false)}
        icon={<Clock className="size-3" />}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-background px-2.5 py-2">
      <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono text-xs tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}
