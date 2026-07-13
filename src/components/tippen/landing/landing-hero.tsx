"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Github, Play, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CinematicStage } from "@/components/tippen/cinematic-stage";
import { useEditorStore } from "@/stores/editor-store";
import { useTheme } from "next-themes";
import type { Scene } from "@/lib/tippen/types";

const HERO_SCENE: Scene = {
  id: "hero-scene",
  name: "Hero",
  background: "ink",
  startMs: 0,
  durationMs: 3200,
  camera: "push-in",
  lines: [
    {
      id: "hero-line-1",
      content: "Once upon a time,",
      preset: "apple-intro",
      cps: 10,
      fontSize: 36,
      align: "center",
      highlights: [],
    },
    {
      id: "hero-line-2",
      content: "there was text that moved.",
      preset: "typewriter",
      cps: 20,
      fontSize: 36,
      align: "center",
      highlights: [{ start: 16, end: 22 }],
    },
  ],
};

const HERO_DURATION = 4200;

export function LandingHero() {
  const openEditor = useEditorStore((s) => s.openEditor);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [playhead, setPlayhead] = React.useState(0);
  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef<number>(0);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      setPlayhead((prev) => {
        const next = prev + dt;
        return next >= HERO_DURATION ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24"
    >
      {/* Backdrop — subtle ember glow + grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-grain opacity-70" />
        <div className="absolute left-1/2 top-[-10%] h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--ember), transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        {/* Background logo — large, semi-transparent, reveals on load */}
        {mounted && (
          <motion.img
            src={
              resolvedTheme === "dark"
                ? "/logo/tippen-colour.png"
                : "/logo/tippen-light.png"
            }
            alt=""
            aria-hidden
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.05, scale: 1.5 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block blur-sm pointer-events-none select-none"
          />
        )}
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left — copy */}
        <div className="flex flex-col items-start gap-6 text-left">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex"
          >
            <Badge
              variant="outline"
              className="gap-1.5 border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <Github className="size-3.5" />
              Open source
              <span className="text-foreground/30">·</span>
              MIT
            </Badge>
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-display text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.02] tracking-tight text-foreground"
          >
            Create cinematic
            <br />
            stories with{" "}
            <span className="text-gradient-ember">text.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Tippen is an AI-powered cinematic text storytelling editor. Type a
            script, pick how each line is revealed, arrange scenes on a
            multi-track timeline, and render a film — not a slideshow, not a
            typewriter toy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              onClick={openEditor}
              className="h-11 rounded-xl bg-ember px-6 text-ember-foreground shadow-sm hover:bg-ember/90"
            >
              <Sparkles className="size-4" />
              Start Creating
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="h-11 rounded-xl px-6"
            >
              <a href="#demo">
                <Play className="size-4" />
                Watch Demo
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 pt-2 text-xs text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                ⌘K
              </kbd>
              command palette
            </span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-3.5 text-ember" />
              No GPU required
            </span>
          </motion.div>
        </div>

        {/* Right — floating preview card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative"
        >
          <FloatingPreview playhead={playhead} />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingPreview({ playhead }: { playhead: number }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Glow behind */}
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, var(--ember), transparent 70%)",
        }}
      />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg"
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/50" />
            <span className="size-2.5 rounded-full bg-ember/60" />
            <span className="size-2.5 rounded-full bg-chart-4/50" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            tippen · scene 01
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            1080p
          </span>
        </div>

        {/* Stage */}
        <div className="relative aspect-video w-full">
          <CinematicStage
            scene={HERO_SCENE}
            playhead={playhead}
            letterboxed
          />
        </div>

        {/* Mini timeline */}
        <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-4 py-2.5">
          <span className="font-mono text-[10px] text-muted-foreground">
            {Math.floor(playhead / 1000)
              .toString()
              .padStart(2, "0")}
            :
            {Math.floor((playhead % 1000) / 10)
              .toString()
              .padStart(2, "0")}
          </span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-ember"
              style={{
                width: `${Math.min(100, (playhead / HERO_DURATION) * 100)}%`,
              }}
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            04:20
          </span>
        </div>
      </motion.div>

      {/* Floating chips */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute -left-3 top-1/3 hidden rounded-lg border border-border/60 bg-background/90 px-3 py-1.5 shadow-md backdrop-blur sm:block"
      >
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          preset
        </span>
        <p className="text-xs font-medium text-foreground">typewriter</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="absolute -right-3 bottom-1/4 hidden rounded-lg border border-border/60 bg-background/90 px-3 py-1.5 shadow-md backdrop-blur sm:block"
      >
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          cps
        </span>
        <p className="text-xs font-medium text-ember">22</p>
      </motion.div>
    </div>
  );
}
