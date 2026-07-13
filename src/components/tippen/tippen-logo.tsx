"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LOGO_DARK = "/logo/tippen-colour.png";
const LOGO_LIGHT = "/logo/tippen-light.png";

/**
 * TippenLogo — renders the correct logo image based on active theme.
 *
 * Theme-switching logic:
 * - `useTheme()` provides the current theme ("light" | "dark" | "system").
 * - A `mounted` guard prevents hydration mismatches between server render
 *   and client-side theme detection.
 * - `tippen-colour.png` is used in dark mode (its lighter colours pop on dark bg).
 * - `tippen-light.png` is used in light mode (its darker colours read well on paper).
 * - `disableTransitionOnChange` is set on the ThemeProvider so logo swaps
 *   instantly with no flash.
 */
export function TippenLogo({
  className,
  showWordmark = true,
  size = 28,
  animate = false,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  /** When true, the logo fades in with a subtle scale-up */
  animate?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);

  // Avoid hydration mismatch — only read theme after mount
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const logoSrc = isDark ? LOGO_DARK : LOGO_LIGHT;

  const imageEl = (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label="Tippen logo"
    >
      <span
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {/* Loading skeleton */}
        {!loaded && !errored && (
          <span className="absolute inset-0 rounded-lg bg-muted animate-pulse" />
        )}

        {/* Fallback SVG glyph on error */}
        {errored ? (
          <svg
            width={size * 0.62}
            height={size * 0.62}
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect
              x="6"
              y="12"
              width="16"
              height="2.6"
              rx="1.3"
              fill="currentColor"
            />
            <rect
              x="6"
              y="17.4"
              width="10"
              height="2.6"
              rx="1.3"
              fill="currentColor"
            />
            <rect
              x="24"
              y="13"
              width="2.4"
              height="6"
              rx="1.2"
              fill="currentColor"
              className="caret-blink"
            />
          </svg>
        ) : (
          <img
            src={logoSrc}
            alt=""
            width={size}
            height={size}
            className={cn(
              "object-contain transition-opacity duration-150",
              loaded ? "opacity-100" : "opacity-0 absolute inset-0",
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
      </span>

      {showWordmark && (
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-foreground">
          Tippen
        </span>
      )}
    </span>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {imageEl}
      </motion.div>
    );
  }

  return imageEl;
}
