"use client";

import * as React from "react";
import {
  PenLine,
  SlidersHorizontal,
  GalleryHorizontalEnd,
  Film,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { HOW_IT_WORKS } from "./landing-data";

const ICONS: Record<string, LucideIcon> = {
  PenLine,
  SlidersHorizontal,
  GalleryHorizontalEnd,
  Film,
};

export function LandingHowItWorks() {
  return (
    <SectionShell
      id="how"
      className="border-y border-border/40 bg-muted/20"
    >
      <SectionHeading
        eyebrow="How it works"
        title={
          <>
            From blank page to{" "}
            <span className="text-gradient-ember">rendered film</span> in four
            steps.
          </>
        }
        description="No render queues, no codec jargon. Write, style, arrange, export."
      />

      <div className="relative mt-14">
        {/* Connecting line — horizontal on desktop */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = ICONS[step.icon] ?? PenLine;
            return (
              <Reveal key={step.title} delay={i * 0.08} className="relative">
                <div className="flex h-full flex-col items-start gap-4">
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-card text-foreground shadow-sm">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-display text-4xl leading-none text-muted-foreground/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
