"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});
type EmailForm = z.infer<typeof emailSchema>;

const TIERS = [
  {
    name: "Free",
    tagline: "For trying things out.",
    features: [
      "Unlimited projects",
      "All 11 animation presets",
      "9-track timeline",
      "Light & dark themes",
      "Local-first storage",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    tagline: "For serious storytellers.",
    features: [
      "Everything in Free",
      "MP4 export (1080p / 4K)",
      "AI assistant (all actions)",
      "Cloud project sync",
      "Custom branding & watermark",
      "Priority support",
    ],
    cta: "Get notified",
    highlight: true,
  },
] as const;

export function LandingPricing() {
  const openEditor = useEditorStore((s) => s.openEditor);

  const form = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: EmailForm) => {
    toast.success("You're on the list.", {
      description: `We'll email ${values.email} when Pro launches.`,
    });
    form.reset();
  };

  return (
    <SectionShell id="pricing">
      <SectionHeading
        eyebrow="Pricing · Coming soon"
        title={
          <>
            Simple pricing,{" "}
            <span className="text-gradient-ember">when it ships.</span>
          </>
        }
        description="Tippen is free and open source today. A hosted Pro tier is on the roadmap — leave your email and we'll ping you when it launches."
      />

      {/* Coming soon banner */}
      <Reveal delay={0.05} className="mx-auto mt-10 max-w-2xl">
        <div className="flex items-center justify-center gap-2 rounded-full border border-ember/30 bg-ember/5 px-4 py-2 text-center">
          <Sparkles className="size-3.5 text-ember" />
          <span className="text-sm font-medium text-foreground">
            Pro tier is coming soon
          </span>
          <span className="text-sm text-muted-foreground">
            — meanwhile, everything is free + open source.
          </span>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {TIERS.map((tier, i) => (
          <Reveal key={tier.name} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative flex h-full flex-col gap-5 rounded-2xl border p-6 shadow-sm",
                tier.highlight
                  ? "border-ember/40 bg-card shadow-glow"
                  : "border-border/60 bg-card",
              )}
            >
              {tier.highlight && (
                <Badge
                  className="absolute -top-3 left-6 bg-ember text-ember-foreground shadow-sm"
                >
                  <Sparkles className="size-3" />
                  Coming soon
                </Badge>
              )}

              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-2xl text-foreground">
                  {tier.name}
                </h3>
                {!tier.highlight && (
                  <Badge
                    variant="outline"
                    className="border-border/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    Available
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{tier.tagline}</p>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl text-foreground">
                  {tier.highlight ? "Pro" : "Free"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.highlight ? "/month" : "forever"}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                        tier.highlight
                          ? "bg-ember text-ember-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                    <span className="text-sm text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2">
                {tier.highlight ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Get a launch ping
                    </p>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="flex gap-2"
                      noValidate
                    >
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        aria-label="Email address"
                        {...form.register("email")}
                        className={cn(
                          "h-10 flex-1",
                          form.formState.errors.email &&
                            "border-destructive/60",
                        )}
                      />
                      <Button
                        type="submit"
                        size="lg"
                        className="h-10 shrink-0 bg-ember px-4 text-ember-foreground hover:bg-ember/90"
                      >
                        <ArrowRight className="size-4" />
                      </Button>
                    </form>
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button
                    size="lg"
                    onClick={openEditor}
                    className="w-full"
                    variant="outline"
                  >
                    {tier.cta}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
