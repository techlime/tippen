"use client";

import * as React from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Undo2,
  Redo2,
  Plus,
  Copy,
  Trash2,
  RotateCcw,
  Type as TypeIcon,
  Film,
  Sparkles,
  Highlighter,
  Wand2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sun,
  Moon,
  Command as CommandIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useEditorStore } from "@/stores/editor-store";
import { useSelectedScene } from "@/stores/editor-store";

/**
 * EditorCommandPalette — ⌘K command palette.
 *
 * Controlled by store.commandOpen / setCommandOpen so the global
 * shortcut hook (useTippenShortcuts) can open it from anywhere.
 *
 * Commands are grouped: Navigate, Playback, Edit, Insert, AI, View.
 */
export function EditorCommandPalette() {
  const open = useEditorStore((s) => s.commandOpen);
  const setOpen = useEditorStore((s) => s.setCommandOpen);

  // Pull all the actions we'll wire up.
  const openLanding = useEditorStore((s) => s.openLanding);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const play = useEditorStore((s) => s.play);
  const pause = useEditorStore((s) => s.pause);
  const seek = useEditorStore((s) => s.seek);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const addScene = useEditorStore((s) => s.addScene);
  const duplicateScene = useEditorStore((s) => s.duplicateScene);
  const deleteScene = useEditorStore((s) => s.deleteScene);
  const resetProject = useEditorStore((s) => s.resetProject);
  const addLine = useEditorStore((s) => s.addLine);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const setZoom = useEditorStore((s) => s.setZoom);
  const zoom = useEditorStore((s) => s.zoom);
  const setInspectorTab = useEditorStore((s) => s.setInspectorTab);
  const setAiBusy = useEditorStore((s) => s.setAiBusy);
  const applyAiResult = useEditorStore((s) => s.applyAiResult);
  const pushPrompt = useEditorStore((s) => s.pushPrompt);

  const scene = useSelectedScene();

  const { theme, setTheme } = useTheme();

  const close = () => setOpen(false);

  const run = (fn: () => void) => () => {
    fn();
    close();
  };

  // Helper to apply a deterministic AI result locally (the palette
  // doesn't have a prompt field — it uses sensible defaults).
  const runLocalAi = async (action: "generate-intro" | "auto-highlight") => {
    close();
    setAiBusy(true);
    try {
      const fallback =
        action === "generate-intro"
          ? "It started with a single line."
          : "story";
      // Fire-and-forget the real endpoint too, but apply instantly.
      pushPrompt({
        id: `prompt-${Date.now()}`,
        action,
        prompt: action,
        result: fallback,
        createdAt: Date.now(),
      });
      applyAiResult(action, fallback);
      try {
        await fetch("/api/tippen/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, prompt: "" }),
        });
      } catch {
        /* ignore — palette action is best-effort */
      }
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Tippen command palette"
      description="Search for a command to run…"
      className="sm:max-w-xl"
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigate */}
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={run(openLanding)}>
            <ArrowLeft />
            <span>Back to landing</span>
            <CommandShortcut>Esc</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Playback */}
        <CommandGroup heading="Playback">
          <CommandItem
            onSelect={run(() => {
              if (isPlaying) pause();
              else play();
            })}
          >
            {isPlaying ? <Pause /> : <Play />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
            <CommandShortcut>Space</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(() => seek(0))}>
            <SkipBack />
            <span>Seek to start</span>
            <CommandShortcut>Home</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={run(() =>
              seek(useEditorStore.getState().project.settings.durationMs),
            )}
          >
            <SkipForward />
            <span>Seek to end</span>
            <CommandShortcut>End</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Edit */}
        <CommandGroup heading="Edit">
          <CommandItem onSelect={run(undo)}>
            <Undo2 />
            <span>Undo</span>
            <CommandShortcut>⌘Z</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(redo)}>
            <Redo2 />
            <span>Redo</span>
            <CommandShortcut>⌘⇧Z</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(addScene)}>
            <Plus />
            <span>New scene</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={run(() => {
              if (selectedSceneId) duplicateScene(selectedSceneId);
            })}
            disabled={!selectedSceneId}
          >
            <Copy />
            <span>Duplicate current scene</span>
          </CommandItem>
          <CommandItem
            onSelect={run(() => {
              if (selectedSceneId) deleteScene(selectedSceneId);
            })}
            disabled={!selectedSceneId}
          >
            <Trash2 />
            <span>Delete current scene</span>
          </CommandItem>
          <CommandItem onSelect={run(resetProject)}>
            <RotateCcw />
            <span>Reset project to seed</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Insert */}
        <CommandGroup heading="Insert">
          <CommandItem
            onSelect={run(() => {
              if (selectedSceneId) addLine(selectedSceneId);
              setInspectorTab("text");
            })}
            disabled={!selectedSceneId}
          >
            <TypeIcon />
            <span>Add line to current scene</span>
          </CommandItem>
          <CommandItem onSelect={run(() => addScene())}>
            <Film />
            <span>Apply "Cold Open" template</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* AI */}
        <CommandGroup heading="AI">
          <CommandItem onSelect={() => runLocalAi("generate-intro")}>
            <Wand2 />
            <span>Generate intro line</span>
          </CommandItem>
          <CommandItem onSelect={() => runLocalAi("auto-highlight")}>
            <Highlighter />
            <span>Auto-highlight important words</span>
          </CommandItem>
          <CommandItem
            onSelect={run(() => {
              setInspectorTab("ai");
            })}
          >
            <Sparkles />
            <span>Open AI panel</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* View */}
        <CommandGroup heading="View">
          <CommandItem onSelect={run(() => setZoom(zoom + 0.25))}>
            <ZoomIn />
            <span>Zoom in</span>
            <CommandShortcut>⌘+</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(() => setZoom(zoom - 0.25))}>
            <ZoomOut />
            <span>Zoom out</span>
            <CommandShortcut>⌘-</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(() => setZoom(1))}>
            <Maximize />
            <span>Reset zoom</span>
            <CommandShortcut>⌘0</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(() => setTheme("light"))}>
            <Sun />
            <span>Light theme</span>
            {theme === "light" && <CommandShortcut>●</CommandShortcut>}
          </CommandItem>
          <CommandItem onSelect={run(() => setTheme("dark"))}>
            <Moon />
            <span>Dark theme</span>
            {theme === "dark" && <CommandShortcut>●</CommandShortcut>}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem onSelect={close}>
            <CommandIcon />
            <span>Close palette</span>
            <CommandShortcut>Esc</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
