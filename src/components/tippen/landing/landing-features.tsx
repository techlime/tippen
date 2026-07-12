"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Keyboard,
  MousePointer2,
  Mic,
  Music,
  Volume2,
  Layers,
  GalleryHorizontalEnd,
  Sparkles,
  SunMoon,
  Film,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { FEATURES, type FeatureItem } from "./landing-data";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Keyboard,
  MousePointer2,
  Mic,
  Music,
  Volume2,
  Layers,
  GalleryHorizontalEnd,
  Sparkles,
  SunMoon,
  Film,
};

export function LandingFeatures() {
  return (
    <SectionShell id="features">
      <SectionHeading
        eyebrow="Features"
        title={
          <>
            Everything you need to turn{" "}
            <span className="text-gradient-ember">text into film.</span>
          </>
        }
        description="Ten tightly-integrated tools — from character-by-character typing to a nine-track timeline. No plugins, no rendering farm."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </SectionShell>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: FeatureItem;
  index: number;
}) {
  const Icon = ICONS[feature.icon] ?? Sparkles;
  return (
    <Reveal delay={(index % 3) * 0.06} className="h-full">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors",
          "hover:border-ember/30 hover:shadow-md",
        )}
      >
        {/* Hover glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, color-mix(in oklch, var(--ember) 8%, transparent), transparent 60%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground transition-colors group-hover:border-ember/30 group-hover:text-ember">
            <Icon className="size-5" />
          </span>
          <h3 className="text-base font-semibold text-foreground">
            {feature.title}
          </h3>
        </div>
        <p className="relative text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </motion.div>
    </Reveal>
  );
}
