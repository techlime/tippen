"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CinematicStage } from "@/components/tippen/cinematic-stage";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { TEMPLATES, type TemplateItem } from "./landing-data";
import { useEditorStore } from "@/stores/editor-store";
import type { Scene } from "@/lib/tippen/types";

const LOOP_MS = 2600;

export function LandingTemplates() {
  return (
    <SectionShell
      id="templates"
      className="border-y border-border/40 bg-muted/20"
    >
      <SectionHeading
        eyebrow="Templates"
        title={
          <>
            Start from a{" "}
            <span className="text-gradient-ember">cinematic shape.</span>
          </>
        }
        description="Hand-tuned scene templates. Each thumbnail is a real CinematicStage — hover to see the reveal, then open it in the editor."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((tpl, i) => (
          <Reveal key={tpl.id} delay={(i % 3) * 0.06} className="h-full">
            <TemplateCard template={tpl} />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

function TemplateCard({ template }: { template: TemplateItem }) {
  const openEditor = useEditorStore((s) => s.openEditor);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-colors hover:border-ember/30 hover:shadow-md"
    >
      <TemplateThumbnail scene={template.scene} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {template.name}
            </h3>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
              {template.description}
            </p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ember" />
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-border/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {template.scene.lines[0]?.preset}
            </Badge>
            <Badge
              variant="outline"
              className="border-border/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {template.scene.background}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={openEditor}
            className="text-muted-foreground hover:text-foreground"
          >
            Use template
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * TemplateThumbnail — auto-plays a tiny scene in a loop.
 * Pauses on hover-off, restarts on hover-on for a tactile feel.
 */
function TemplateThumbnail({ scene }: { scene: Scene }) {
  const [playhead, setPlayhead] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!hovered) {
      // When not hovered, show the fully-revealed state.
      setPlayhead(LOOP_MS);
      return;
    }
    lastRef.current = performance.now();
    setPlayhead(0);
    const tick = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      setPlayhead((prev) => {
        const next = prev + dt;
        return next >= LOOP_MS ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hovered]);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden border-b border-border/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CinematicStage scene={scene} playhead={playhead} letterboxed={false} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
