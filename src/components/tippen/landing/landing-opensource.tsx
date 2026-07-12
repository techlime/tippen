"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Github, Star, GitFork, BookOpen, ArrowUpRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./landing-motion";

export function LandingOpenSource() {
  return (
    <section className="relative w-full px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl border border-ember/30 bg-card p-8 shadow-lg sm:p-12"
            style={{
              background:
                "radial-gradient(120% 120% at 0% 0%, color-mix(in oklch, var(--ember) 14%, var(--card)), var(--card) 55%)",
            }}
          >
            {/* Decorative grain */}
            <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" />

            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              {/* Left — copy */}
              <div className="flex flex-col items-start gap-5">
                <Badge
                  variant="outline"
                  className="border-ember/40 bg-ember/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ember"
                >
                  <span className="size-1.5 rounded-full bg-ember" />
                  Open source · MIT
                </Badge>

                <h2 className="font-display text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Built in the{" "}
                  <span className="text-gradient-ember">open.</span>
                </h2>

                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Tippen is MIT-licensed and developed on GitHub. Read the
                  architecture, run it locally, file issues, or ship your first
                  PR. The roadmap is public and contributor-friendly.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 rounded-xl bg-ember px-6 text-ember-foreground shadow-sm hover:bg-ember/90"
                  >
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Github className="size-4" />
                      Star on GitHub
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-11 rounded-xl px-6"
                  >
                    <a href="#faq">
                      <BookOpen className="size-4" />
                      Read the roadmap
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right — repo card */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Github className="size-4 text-muted-foreground" />
                    <span className="font-mono text-xs text-foreground">
                      tippen / tippen
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-border/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    public
                  </Badge>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <Stat icon={Star} label="Stars" value="0" hint="be the first" />
                  <Stat icon={GitFork} label="Forks" value="0" />
                </div>

                <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    License
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    MIT — do anything, just keep the notice.
                  </span>
                </div>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground transition-colors hover:border-ember/30 hover:bg-ember/5"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 text-muted-foreground" />
                    CONTRIBUTING.md
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </a>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Heart className="size-3 text-ember" />
                  Made for storytellers, by storytellers.
                </p>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <Icon className="size-4 text-ember" />
        <span className="font-display text-2xl text-foreground">{value}</span>
      </div>
      {hint && (
        <span className="font-mono text-[10px] text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}
