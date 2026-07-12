"use client";

import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { LandingNavbar } from "./landing-navbar";
import { LandingHero } from "./landing-hero";
import { LandingDemo } from "./landing-demo";
import { LandingFeatures } from "./landing-features";
import { LandingTemplates } from "./landing-templates";
import { LandingAI } from "./landing-ai";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingScreenshots } from "./landing-screenshots";
import { LandingFAQ } from "./landing-faq";
import { LandingPricing } from "./landing-pricing";
import { LandingOpenSource } from "./landing-opensource";
import { LandingFooter } from "./landing-footer";

/**
 * LandingPage — the Tippen marketing landing page.
 *
 * Layout contract:
 *  - Root wrapper uses `min-h-screen flex flex-col` so the footer sticks to
 *    the viewport bottom when content is short, and is pushed down
 *    naturally when content overflows.
 *  - Footer carries `mt-auto`.
 *
 * Sections, top to bottom:
 *   1. Navbar (sticky, blurred)
 *   2. Hero (font-display headline + floating preview)
 *   3. Interactive Live Demo (real CinematicStage + scrubber + presets)
 *   4. Features (10-card grid)
 *   5. Templates (CinematicStage thumbnails)
 *   6. AI features (2-col + mock AI panel)
 *   7. How It Works (4 steps)
 *   8. Screenshots (editor mockups)
 *   9. FAQ (accordion)
 *  10. Pricing (coming soon + email form)
 *  11. Open Source band (ember accent)
 *  12. Footer (sticky)
 *
 * The page is a client component because it uses framer-motion,
 * the editor store, and local rAF hooks.
 */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingDemo />
        <LandingFeatures />
        <LandingTemplates />
        <LandingAI />
        <LandingHowItWorks />
        <LandingScreenshots />
        <LandingFAQ />
        <LandingPricing />
        <LandingOpenSource />
      </main>
      <LandingFooter />
      <Toaster position="bottom-right" />
    </div>
  );
}
