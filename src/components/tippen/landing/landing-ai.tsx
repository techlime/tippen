"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Wand2,
  PenLine,
  Gauge,
  AudioLines,
  AlignCenter,
  Highlighter,
  Lightbulb,
  History,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { AI_FEATURES, type AiFeatureItem } from "./landing-data";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Wand2,
  PenLine,
  Gauge,
  AudioLines,
  AlignCenter,
  Highlighter,
  Lightbulb,
  History,
};

export function LandingAI() {
  const openEditor = useEditorStore((s) => s.openEditor);

  return (
    <SectionShell id="ai">
      <SectionHeading
        eyebrow="AI assistant"
        title={
          <>
            A writing partner that thinks in{" "}
            <span className="text-gradient-ember">scenes.</span>
          </>
        }
        description="Tippen's AI works on your selection, not in a separate chat. Generate, rewrite, time, sync, and highlight — all without leaving the canvas."
      />

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        {/* Left — feature list */}
        <div className="flex flex-col">
          <Reveal>
            <h3 className="mb-4 font-display text-2xl text-foreground">
              Eight AI actions, one canvas.
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AI_FEATURES.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 0.05}>
                <AiFeatureRow item={item} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1} className="mt-6">
            <Button
              onClick={openEditor}
              className="bg-ember text-ember-foreground shadow-sm hover:bg-ember/90"
            >
              <Sparkles className="size-4" />
              Try the AI panel
              <ArrowRight className="size-4" />
            </Button>
          </Reveal>
        </div>

        {/* Right — mock AI panel */}
        <Reveal delay={0.1}>
          <MockAiPanel />
        </Reveal>
      </div>
    </SectionShell>
  );
}

function AiFeatureRow({ item }: { item: AiFeatureItem }) {
  const Icon = ICONS[item.icon] ?? Sparkles;
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-colors hover:border-ember/30">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground transition-colors group-hover:border-ember/30 group-hover:text-ember">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>
    </div>
  );
}

function MockAiPanel() {
  return (
    <div className="sticky top-24 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-ember text-ember-foreground">
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            AI panel
          </span>
        </div>
        <Badge
          variant="outline"
          className="border-border/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          inspector
        </Badge>
      </div>

      {/* Conversation */}
      <div className="flex flex-col gap-4 p-4">
        {/* User prompt */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            You · generate-intro
          </span>
          <div className="rounded-xl rounded-tl-sm border border-border/60 bg-muted/40 px-3.5 py-2.5 text-sm text-foreground">
            Write a cold open for a launch video about a new note app. Make it
            feel like a noir film.
          </div>
        </div>

        {/* AI result */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-1.5"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-ember">
            Tippen · result
          </span>
          <div className="rounded-xl rounded-tl-sm border border-ember/30 bg-ember/5 px-3.5 py-3 text-sm leading-relaxed text-foreground">
            <p>
              &ldquo;Every note you ever lost&rdquo; —
              <span className="text-ember"> a single keystroke </span>
              away. Built for the ones who think faster than they can type.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="border-ember/30 bg-ember/10 font-mono text-[10px] uppercase tracking-wider text-ember"
              >
                preset: apple-intro
              </Badge>
              <Badge
                variant="outline"
                className="border-border/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                cps: 9
              </Badge>
              <Badge
                variant="outline"
                className="border-border/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                3 scenes
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Prompt history preview */}
        <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Prompt history
          </span>
          {[
            { action: "auto-highlight", text: "Highlight longest word", time: "2m ago" },
            { action: "rewrite-script", text: "Make it shorter", time: "5m ago" },
            { action: "generate-timing", text: "Match spoken pace", time: "12m ago" },
          ].map((h) => (
            <div
              key={h.action}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <History className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs text-foreground">
                  {h.text}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {h.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt input */}
      <div className="border-t border-border/60 bg-muted/30 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2">
          <Sparkles className="size-4 shrink-0 text-ember" />
          <input
            type="text"
            disabled
            placeholder="Ask Tippen to write, rewrite, or time…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="flex size-6 items-center justify-center rounded border border-border/60 bg-muted font-mono text-[10px] text-muted-foreground">
            <CornerDownLeft className="size-3" />
          </kbd>
        </div>
      </div>
    </div>
  );
}
