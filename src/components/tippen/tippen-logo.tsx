"use client";

import { cn } from "@/lib/utils";

/**
 * TippenLogo — the wordmark + glyph.
 *
 * The glyph is a stylized typing caret between two text strokes,
 * evoking a blinking cursor on a cinematic title card.
 */
export function TippenLogo({
  className,
  showWordmark = true,
  size = 28,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="inline-flex items-center justify-center rounded-lg bg-ink text-ember"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg
          width={size * 0.62}
          height={size * 0.62}
          viewBox="0 0 32 32"
          fill="none"
        >
          <rect x="6" y="12" width="16" height="2.6" rx="1.3" fill="currentColor" />
          <rect x="6" y="17.4" width="10" height="2.6" rx="1.3" fill="currentColor" />
          <rect x="24" y="13" width="2.4" height="6" rx="1.2" fill="currentColor" className="caret-blink" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-foreground">
          Tippen
        </span>
      )}
    </span>
  );
}
