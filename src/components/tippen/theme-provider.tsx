"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Tippen theme provider.
 *
 * Wraps next-themes to provide instant light/dark switching with:
 * - `class` strategy (Tailwind dark mode)
 * - System preference detection
 * - Persistence across sessions
 * - No flash of incorrect theme (suppressHydrationWarning on <html>)
 */
export function TippenThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
