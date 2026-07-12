"use client";

import * as React from "react";
import {
  Film,
  Type,
  Sparkles,
  Music,
  Wand2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Upload,
  Keyboard,
  Volume2,
  Loader2,
  Clock,
  Camera,
  Layers,
  History,
  Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore, useSelectedScene, useSelectedLine } from "@/stores/editor-store";
import {
  ANIMATION_PRESETS,
  PRESET_ORDER,
  isTypewriterPreset,
} from "@/lib/tippen/animation-presets";
import { BACKGROUND_OPTIONS } from "@/lib/tippen/seed";
import { cn } from "@/lib/utils";
import { formatTime } from "./editor-utils";
import type {
  AnimationPresetId,
  BackgroundId,
  CameraMove,
  AiActionId,
} from "@/lib/tippen/types";

const CAMERA_MOVES: CameraMove[] = [
  "static",
  "push-in",
  "pull-out",
  "pan-left",
  "pan-right",
  "tilt-up",
];

/**
 * InspectorPanel — right sidebar with 5 tabs:
 * Scene, Text, Animation, Audio, AI.
 */
export function InspectorPanel() {
  const inspectorTab = useEditorStore((s) => s.inspectorTab);
  const setInspectorTab = useEditorStore((s) => s.setInspectorTab);

  return (
    <div className="flex h-full flex-col bg-background">
      <Tabs
        value={inspectorTab}
        onValueChange={(v) => setInspectorTab(v as typeof inspectorTab)}
        className="flex h-full flex-col gap-0"
      >
        <TabsList className="grid h-9 shrink-0 grid-cols-5 rounded-none border-b border-border/60 bg-background p-1">
          <TabsTrigger value="scene" className="gap-1 text-[11px]">
            <Film className="size-3.5" />
            Scene
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-1 text-[11px]">
            <Type className="size-3.5" />
            Text
          </TabsTrigger>
          <TabsTrigger value="animation" className="gap-1 text-[11px]">
            <Sparkles className="size-3.5" />
            Animate
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-1 text-[11px]">
            <Music className="size-3.5" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1 text-[11px]">
            <Wand2 className="size-3.5" />
            AI
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="min-h-0 flex-1">
          <TabsContent value="scene" className="m-0 p-3">
            <SceneTab />
          </TabsContent>
          <TabsContent value="text" className="m-0 p-3">
            <TextTab />
          </TabsContent>
          <TabsContent value="animation" className="m-0 p-3">
            <AnimationTab />
          </TabsContent>
          <TabsContent value="audio" className="m-0 p-3">
            <AudioTab />
          </TabsContent>
          <TabsContent value="ai" className="m-0 p-3">
            <AiTab />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared field primitives
   ───────────────────────────────────────────── */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        {hint && (
          <span className="text-[10px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCENE TAB
   ───────────────────────────────────────────── */

function SceneTab() {
  const scene = useSelectedScene();
  const updateScene = useEditorStore((s) => s.updateScene);

  if (!scene) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
        No scene selected.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Scene name">
        <Input
          value={scene.name}
          onChange={(e) => updateScene(scene.id, { name: e.target.value })}
          className="h-8 text-sm"
          placeholder="Scene name"
        />
      </Field>

      <Field label="Background">
        <div className="grid grid-cols-6 gap-1.5">
          {BACKGROUND_OPTIONS.map((b) => {
            const selected = scene.background === b.id;
            return (
              <Tooltip key={b.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      updateScene(scene.id, { background: b.id as BackgroundId })
                    }
                    className={cn(
                      "aspect-square rounded-md border transition-all",
                      selected
                        ? "border-ember ring-2 ring-ember/30"
                        : "border-border/60 hover:border-border",
                    )}
                    style={{ background: b.swatch }}
                    aria-label={b.name}
                    aria-pressed={selected}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">{b.name}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </Field>

      <Field label="Camera move">
        <Select
          value={scene.camera}
          onValueChange={(v) =>
            updateScene(scene.id, { camera: v as CameraMove })
          }
        >
          <SelectTrigger className="h-8 w-full text-sm" size="sm">
            <Camera className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CAMERA_MOVES.map((c) => (
              <SelectItem key={c} value={c} className="text-sm capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Duration"
        hint={`${formatTime(scene.durationMs, false)}`}
      >
        <Slider
          value={[scene.durationMs]}
          min={500}
          max={15000}
          step={100}
          onValueChange={(v) =>
            updateScene(scene.id, { durationMs: v[0] ?? 3000 })
          }
        />
      </Field>

      <Field
        label="Start time"
        hint="auto-aligned"
      >
        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="font-mono tabular-nums text-foreground">
            {formatTime(scene.startMs)}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            on timeline
          </span>
        </div>
      </Field>

      <SectionTitle>
        <Layers className="size-3" />
        Lines in scene
      </SectionTitle>
      <SceneLinesList />
    </div>
  );
}

function SceneLinesList() {
  const scene = useSelectedScene();
  const selectedLineId = useEditorStore((s) => s.selectedLineId);
  const selectLine = useEditorStore((s) => s.selectLine);
  const setInspectorTab = useEditorStore((s) => s.setInspectorTab);
  const addLine = useEditorStore((s) => s.addLine);
  const deleteLine = useEditorStore((s) => s.deleteLine);

  if (!scene) return null;

  return (
    <div className="flex flex-col gap-1">
      {scene.lines.map((l, i) => {
        const selected = l.id === selectedLineId;
        return (
          <div
            key={l.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              selectLine(l.id);
              setInspectorTab("text");
            }}
            className={cn(
              "group flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-all",
              "border-transparent hover:border-border/60 hover:bg-accent/60",
              selected &&
                "border-ember/40 bg-ember/10 ring-1 ring-ember/30",
            )}
          >
            <span className="font-mono text-[10px] text-muted-foreground">
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <span className="flex-1 truncate text-foreground">
              {l.content || "(empty)"}
            </span>
            <span className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
              {l.preset}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteLine(scene.id, l.id);
              }}
              className="size-5 rounded text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label="Delete line"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        className="mt-1 h-7 gap-1.5 rounded-md border-dashed text-xs"
        onClick={() => addLine(scene.id)}
      >
        <Plus className="size-3" />
        Add line
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TEXT TAB
   ───────────────────────────────────────────── */

function TextTab() {
  const scene = useSelectedScene();
  const line = useSelectedLine();
  const updateLine = useEditorStore((s) => s.updateLine);
  const addLine = useEditorStore((s) => s.addLine);
  const deleteLine = useEditorStore((s) => s.deleteLine);

  if (!scene) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
        Select a scene to edit its text.
      </div>
    );
  }

  if (!line) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
        No line selected.
        <Button
          variant="outline"
          size="sm"
          className="mx-auto h-7 gap-1.5 text-xs"
          onClick={() => addLine(scene.id)}
        >
          <Plus className="size-3" />
          Add line
        </Button>
      </div>
    );
  }

  const aligns: Array<{ value: "left" | "center" | "right"; icon: React.ReactNode }> = [
    { value: "left", icon: <AlignLeft className="size-3.5" /> },
    { value: "center", icon: <AlignCenter className="size-3.5" /> },
    { value: "right", icon: <AlignRight className="size-3.5" /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Field label="Content" hint={`${line.content.length} chars`}>
        <Textarea
          value={line.content}
          onChange={(e) =>
            updateLine(scene.id, line.id, { content: e.target.value })
          }
          rows={3}
          className="resize-none text-sm"
          placeholder="Type the cinematic line…"
        />
      </Field>

      <Field label="Font size" hint={`${line.fontSize}px`}>
        <Slider
          value={[line.fontSize]}
          min={20}
          max={120}
          step={1}
          onValueChange={(v) =>
            updateLine(scene.id, line.id, { fontSize: v[0] ?? 48 })
          }
        />
      </Field>

      <Field label="Alignment">
        <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5">
          {aligns.map((a) => {
            const selected = line.align === a.value;
            return (
              <button
                key={a.value}
                onClick={() =>
                  updateLine(scene.id, line.id, { align: a.value })
                }
                className={cn(
                  "flex flex-1 items-center justify-center rounded py-1 transition-colors",
                  selected
                    ? "bg-ember text-ember-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                aria-pressed={selected}
                aria-label={`Align ${a.value}`}
              >
                {a.icon}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 gap-1.5 text-xs"
          onClick={() => addLine(scene.id)}
        >
          <Plus className="size-3.5" />
          Add line
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => deleteLine(scene.id, line.id)}
          disabled={scene.lines.length <= 1}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>

      <SectionTitle>
        <Layers className="size-3" />
        All lines in scene
      </SectionTitle>
      <SceneLinesList />
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANIMATION TAB
   ───────────────────────────────────────────── */

function AnimationTab() {
  const scene = useSelectedScene();
  const line = useSelectedLine();
  const updateLine = useEditorStore((s) => s.updateLine);

  if (!scene || !line) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
        Select a line to edit its animation.
      </div>
    );
  }

  const preset = ANIMATION_PRESETS[line.preset];
  const isTypewriter = isTypewriterPreset(line.preset);
  const cursorOn = line.preset !== "minimal" && (preset.cursor ?? true);

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>
        <Sparkles className="size-3" />
        Preset
      </SectionTitle>
      <div className="grid grid-cols-2 gap-1.5">
        {PRESET_ORDER.map((id) => {
          const p = ANIMATION_PRESETS[id];
          const selected = line.preset === id;
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => updateLine(scene.id, line.id, { preset: id })}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-md border px-2 py-1.5 text-left transition-all",
                    selected
                      ? "border-ember bg-ember/10 ring-1 ring-ember/30"
                      : "border-border/60 hover:border-border hover:bg-accent/60",
                  )}
                  aria-pressed={selected}
                >
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      selected ? "text-ember" : "text-foreground",
                    )}
                  >
                    {p.name}
                  </span>
                  <span className="text-[9px] leading-tight text-muted-foreground line-clamp-2">
                    {p.description}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-48">
                {p.description}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {isTypewriter ? (
        <Field
          label="Characters / second"
          hint={`${line.cps ?? preset.cps ?? 18} cps`}
        >
          <Slider
            value={[line.cps ?? preset.cps ?? 18]}
            min={4}
            max={60}
            step={1}
            onValueChange={(v) =>
              updateLine(scene.id, line.id, { cps: v[0] ?? 18 })
            }
          />
        </Field>
      ) : (
        <Field
          label="Duration"
          hint={`${preset.durationMs ?? 600}ms`}
        >
          <Slider
            value={[preset.durationMs ?? 600]}
            min={0}
            max={2000}
            step={50}
            onValueChange={() => {
              /* Preset duration is not editable per line. */
            }}
            disabled
          />
          <p className="text-[10px] text-muted-foreground">
            Preset duration — not editable per line.
          </p>
        </Field>
      )}

      <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Type className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Cursor</span>
        </div>
        <Switch
          checked={cursorOn}
          onCheckedChange={(checked) => {
            // Cursor is bound to preset; switching to a preset variant.
            const next: AnimationPresetId = checked
              ? line.preset === "minimal"
                ? "typewriter"
                : line.preset
              : "minimal";
            updateLine(scene.id, line.id, { preset: next });
          }}
          aria-label="Toggle cursor"
        />
      </div>

      <div className="rounded-md border border-border/60 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
        <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
          <Sparkles className="size-3 text-ember" />
          {preset.name}
        </div>
        <p className="leading-relaxed">{preset.description}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AUDIO TAB
   ───────────────────────────────────────────── */

function AudioTab() {
  const [voiceName, setVoiceName] = React.useState<string | null>(null);
  const [musicName, setMusicName] = React.useState<string | null>(null);
  const [keyboardSounds, setKeyboardSounds] = React.useState(true);
  const [voiceGain, setVoiceGain] = React.useState(0.9);
  const [musicGain, setMusicGain] = React.useState(0.35);

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>
        <Volume2 className="size-3" />
        Voice
      </SectionTitle>
      <UploadRow
        label="Voiceover"
        fileName={voiceName}
        onPick={(name) => setVoiceName(name)}
        accept="audio/*"
      />
      <Field label="Voice gain" hint={`${Math.round(voiceGain * 100)}%`}>
        <Slider
          value={[voiceGain]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(v) => setVoiceGain(v[0] ?? 0.9)}
        />
      </Field>

      <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Waveform preview</span>
          <span className="text-[9px] text-muted-foreground/60">preview</span>
        </div>
        <Waveform seed="voice" />
      </div>

      <SectionTitle>
        <Music className="size-3" />
        Music
      </SectionTitle>
      <UploadRow
        label="Background music"
        fileName={musicName}
        onPick={(name) => setMusicName(name)}
        accept="audio/*"
      />
      <Field label="Music gain" hint={`${Math.round(musicGain * 100)}%`}>
        <Slider
          value={[musicGain]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(v) => setMusicGain(v[0] ?? 0.35)}
        />
      </Field>

      <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Waveform preview</span>
          <span className="text-[9px] text-muted-foreground/60">preview</span>
        </div>
        <Waveform seed="music" variant="muted" />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Keyboard className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Keyboard sounds</span>
        </div>
        <Switch
          checked={keyboardSounds}
          onCheckedChange={setKeyboardSounds}
          aria-label="Toggle keyboard sounds"
        />
      </div>
    </div>
  );
}

function UploadRow({
  label,
  fileName,
  onPick,
  accept,
}: {
  label: string;
  fileName: string | null;
  onPick: (name: string) => void;
  accept?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f.name);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Upload
        </Button>
        <div className="min-w-0 flex-1 truncate rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
          {fileName ?? "No file chosen"}
        </div>
      </div>
    </div>
  );
}

function Waveform({
  seed,
  variant = "ember",
}: {
  seed: string;
  variant?: "ember" | "muted";
}) {
  // Deterministic pseudo-random based on seed.
  const bars = React.useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return Array.from({ length: 48 }).map((_, i) => {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      const v = (h / 0x7fffffff) * 0.85 + 0.15;
      return v;
    });
  }, [seed]);

  return (
    <div className="flex h-10 items-center gap-px">
      {bars.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-sm",
            variant === "ember" ? "bg-ember/70" : "bg-muted-foreground/40",
          )}
          style={{ height: `${v * 100}%` }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AI TAB
   ───────────────────────────────────────────── */

const AI_ACTIONS: Array<{
  id: AiActionId;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "generate-intro",
    label: "Generate Intro",
    description: "Write a punchy intro line.",
    icon: <Wand2 className="size-3.5" />,
  },
  {
    id: "rewrite-script",
    label: "Rewrite Script",
    description: "Make a line more cinematic.",
    icon: <Sparkles className="size-3.5" />,
  },
  {
    id: "auto-highlight",
    label: "Auto Highlight",
    description: "Pick the most important word.",
    icon: <Eraser className="size-3.5" />,
  },
  {
    id: "scene-suggestions",
    label: "Scene Suggestions",
    description: "Suggest 3 scene names.",
    icon: <Film className="size-3.5" />,
  },
];

function AiTab() {
  const scene = useSelectedScene();
  const line = useSelectedLine();
  const aiBusy = useEditorStore((s) => s.aiBusy);
  const setAiBusy = useEditorStore((s) => s.setAiBusy);
  const pushPrompt = useEditorStore((s) => s.pushPrompt);
  const clearPromptHistory = useEditorStore((s) => s.clearPromptHistory);
  const applyAiResult = useEditorStore((s) => s.applyAiResult);
  const promptHistory = useEditorStore((s) => s.promptHistory);

  const [prompt, setPrompt] = React.useState("");
  const [lastResult, setLastResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const runAction = async (action: AiActionId) => {
    if (aiBusy) return;
    setError(null);
    setAiBusy(true);
    setLastResult(null);
    try {
      const context =
        action === "rewrite-script" || action === "auto-highlight"
          ? line?.content ?? scene?.name ?? ""
          : "";
      const res = await fetch("/api/tippen/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, prompt, context }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { result: string; fallback?: boolean };
      setLastResult(data.result);
      pushPrompt({
        id: `prompt-${Date.now()}`,
        action,
        prompt: prompt || context || action,
        result: data.result,
        createdAt: Date.now(),
      });
      applyAiResult(action, data.result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>
        <Wand2 className="size-3" />
        Quick actions
      </SectionTitle>
      <div className="grid grid-cols-2 gap-1.5">
        {AI_ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => runAction(a.id)}
            disabled={aiBusy}
            className={cn(
              "group flex flex-col gap-0.5 rounded-md border border-border/60 bg-card px-2 py-2 text-left transition-all",
              "hover:border-ember/40 hover:bg-ember/5 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground group-hover:text-ember">
              {a.icon}
              {a.label}
            </div>
            <span className="text-[9px] leading-tight text-muted-foreground">
              {a.description}
            </span>
          </button>
        ))}
      </div>

      <Field label="Prompt" hint="optional context">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="resize-none text-sm"
          placeholder="Describe the topic, mood, or tone…"
        />
      </Field>

      <Button
        size="sm"
        className="h-8 gap-1.5 bg-ink text-ember hover:bg-ink/90"
        onClick={() => runAction("generate-intro")}
        disabled={aiBusy}
      >
        {aiBusy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Wand2 className="size-3.5" />
        )}
        {aiBusy ? "Running…" : "Run AI"}
      </Button>

      {lastResult && (
        <div className="rounded-md border border-ember/40 bg-ember/10 p-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-ember">
            <Sparkles className="size-3" />
            Latest result
          </div>
          <p className="whitespace-pre-wrap text-xs text-foreground">
            {lastResult}
          </p>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Applied to the selected line.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between">
        <SectionTitle>
          <History className="size-3" />
          Prompt history
        </SectionTitle>
        {promptHistory.length > 0 && (
          <button
            onClick={clearPromptHistory}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {promptHistory.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/60 p-3 text-center text-[11px] text-muted-foreground">
          No prompts yet. Run an AI action to see history.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
          {promptHistory.map((h) => (
            <div
              key={h.id}
              className="rounded-md border border-border/60 bg-card p-2"
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-mono uppercase tracking-wider text-ember">
                  {h.action.replace(/-/g, " ")}
                </span>
                <span>{formatTime(Date.now() - h.createdAt, false)} ago</span>
              </div>
              <div className="mt-1 truncate text-[11px] text-foreground">
                <span className="text-muted-foreground">in: </span>
                {h.prompt}
              </div>
              <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                <span className="text-foreground/80">out: </span>
                {h.result}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
