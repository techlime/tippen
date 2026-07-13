# Themes

> Tippen's theme system: `next-themes`, class strategy, light + dark +
> system, OKLCH tokens, and the Ember + Ink palette.

## 1. Overview

Tippen ships two themes — **light** (warm editorial ink on paper) and
**dark** (deep charcoal studio) — plus a **system** option that follows the
OS preference. Theme switching is powered by
[`next-themes`](https://github.com/pacocoursey/next-themes) with the
**class strategy** and a no-flash inline script.

The palette is built on **OKLCH** color tokens for perceptual consistency:
the same accent looks equally vivid in light and dark.

## 2. Architecture

```
src/app/layout.tsx
   │ wraps <body> in <TippenThemeProvider>
   ▼
src/components/tippen/theme-provider.tsx
   │ <ThemeProvider attribute="class" defaultTheme="dark"
   │                enableSystem disableTransitionOnChange>
   ▼
<html class="dark" suppressHydrationWarning>   (or no class = light)
   ▼
src/app/globals.css
   │ :root { --ember, --ink, --background, … }       (light defaults)
   │ .dark { --ember, --ink, --background, … }       (dark overrides)
   ▼
@theme inline { --color-ember: var(--ember); … }    (Tailwind binding)
   ▼
Tailwind classes:  bg-ember, text-ember, bg-ink, bg-canvas
CSS vars directly: var(--ember), var(--ink), var(--canvas)
```

The `<html>` element gets `class="dark"` when the user picks dark (or system
resolves to dark). The `suppressHydrationWarning` attribute allows
`next-themes` to set this class before React hydrates — preventing a flash.

## 3. The provider

```tsx
// src/components/tippen/theme-provider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function TippenThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

| Prop | Value | Why |
| --- | --- | --- |
| `attribute` | `"class"` | Toggles a class on `<html>` |
| `defaultTheme` | `"dark"` | Tippen opens in dark — it's a cinematic tool |
| `enableSystem` | `true` | Lets users follow OS preference |
| `disableTransitionOnChange` | `true` | Avoids slow color transitions on toggle |

## 4. The toggle

```tsx
// src/components/tippen/theme-toggle.tsx
<ThemeToggle />
```

A dropdown with three options: **Light**, **Dark**, **System**. The
current selection is shown via an icon (sun / moon / monitor). It uses
shadcn/ui's `DropdownMenu` and `next-themes`' `useTheme()` hook.

## 5. Palette — Ember + Ink

Tippen's brand is two colors:

| Token | Light | Dark | Meaning |
| --- | --- | --- | --- |
| `--ember` | `oklch(0.7 0.17 52)` | `oklch(0.76 0.17 55)` | Warm amber accent — cinema, film, warmth |
| `--ink` | `oklch(0.18 0.008 264)` | `oklch(0.96 0.004 95)` | The base neutral — slightly warm |

`--ember` is brighter and slightly more saturated in dark mode (so it pops
against the dark background). `--ink` flips: dark text on light in light
mode; light text on dark in dark mode.

### Why OKLCH?

OKLCH (Lightness / Chroma / Hue) is a perceptual color space. Two colors
with the same `L` look equally bright to the human eye. This means:

- Our `--muted-foreground` and `--accent-foreground` have predictable
  contrast in both themes.
- We can fine-tune chroma without surprising shifts in perceived brightness.
- The palette feels coherent — no random "this blue is too bright" bugs.

## 6. CSS variable reference

All variables live in `src/app/globals.css`. Below is the full table.

### Brand tokens

| Variable | Light | Dark | Tailwind class |
| --- | --- | --- | --- |
| `--ember` | `oklch(0.7 0.17 52)` | `oklch(0.76 0.17 55)` | `bg-ember`, `text-ember` |
| `--ember-foreground` | `oklch(0.99 0.003 95)` | `oklch(0.16 0.006 264)` | `text-ember-foreground` |
| `--ember-soft` | `oklch(0.95 0.04 60)` | `oklch(0.3 0.06 55)` | `bg-ember-soft` |
| `--ember-rgb` | `234 130 60` | `245 158 80` | (for `rgb(var(--ember-rgb) / 0.x)`) |
| `--ink` | `oklch(0.18 0.008 264)` | `oklch(0.96 0.004 95)` | `bg-ink`, `text-ink` |
| `--canvas` | `oklch(0.97 0.004 264)` | `oklch(0.13 0.006 264)` | `bg-canvas` |

### Surface tokens (shadcn/ui)

| Variable | Light | Dark | Tailwind class |
| --- | --- | --- | --- |
| `--background` | `oklch(0.992 0.003 95)` | `oklch(0.16 0.006 264)` | `bg-background` |
| `--foreground` | `oklch(0.18 0.008 264)` | `oklch(0.96 0.004 95)` | `text-foreground` |
| `--card` | `oklch(1 0 0)` | `oklch(0.2 0.007 264)` | `bg-card` |
| `--card-foreground` | `oklch(0.18 0.008 264)` | `oklch(0.96 0.004 95)` | `text-card-foreground` |
| `--popover` | `oklch(1 0 0)` | `oklch(0.2 0.007 264)` | `bg-popover` |
| `--popover-foreground` | `oklch(0.18 0.008 264)` | `oklch(0.96 0.004 95)` | `text-popover-foreground` |
| `--primary` | `oklch(0.22 0.01 264)` | `oklch(0.96 0.004 95)` | `bg-primary` |
| `--primary-foreground` | `oklch(0.985 0.003 95)` | `oklch(0.18 0.008 264)` | `text-primary-foreground` |
| `--secondary` | `oklch(0.965 0.004 95)` | `oklch(0.25 0.008 264)` | `bg-secondary` |
| `--secondary-foreground` | `oklch(0.22 0.01 264)` | `oklch(0.96 0.004 95)` | `text-secondary-foreground` |
| `--muted` | `oklch(0.965 0.004 95)` | `oklch(0.23 0.007 264)` | `bg-muted` |
| `--muted-foreground` | `oklch(0.52 0.01 264)` | `oklch(0.68 0.01 264)` | `text-muted-foreground` |
| `--accent` | `oklch(0.955 0.006 95)` | `oklch(0.27 0.008 264)` | `bg-accent` |
| `--accent-foreground` | `oklch(0.22 0.01 264)` | `oklch(0.96 0.004 95)` | `text-accent-foreground` |
| `--destructive` | `oklch(0.58 0.22 27)` | `oklch(0.7 0.19 22)` | `bg-destructive` |
| `--border` | `oklch(0.915 0.005 264)` | `oklch(1 0 0 / 9%)` | `border-border` |
| `--input` | `oklch(0.915 0.005 264)` | `oklch(1 0 0 / 13%)` | `bg-input` |
| `--ring` | `oklch(0.7 0.16 55)` | `oklch(0.74 0.16 55)` | `ring-ring` |

### Radius & elevation

| Variable | Value | Use |
| --- | --- | --- |
| `--radius` | `0.75rem` | Base radius; `--radius-sm/md/lg/xl/2xl` are derived |
| `--shadow-xs` | `0 1px 2px / 0.04` | Hairline |
| `--shadow-sm` | `0 1px 3px / 0.06` | Cards, inputs |
| `--shadow-md` | `0 4px 12px / 0.08` | Popovers |
| `--shadow-lg` | `0 12px 32px / 0.12` | Modals, command palette |
| `--shadow-glow` | `0 0 0 1px ember/0.12 + 0 8px 24px /0.25` | Hero CTAs |

## 7. Fonts

Fonts are loaded via `next/font/google` in `src/app/layout.tsx`:

| Family | Variable | Tailwind class | Use |
| --- | --- | --- | --- |
| Geist Sans | `--font-geist-sans` | (default sans) | Body, UI |
| Geist Mono | `--font-geist-mono` | `font-mono` | Terminal preset, code, timestamps |
| Instrument Serif | `--font-instrument-serif` | `font-display` | Cinematic headlines |

All fonts self-host at build time via `next/font/google`.

## 8. Utilities

Defined in `globals.css` under `@layer utilities`:

| Class | Effect |
| --- | --- |
| `.font-display` | Instrument Serif, `letter-spacing: -0.02em` |
| `.bg-grain` | 4×4px radial-gradient dots — cinematic grain |
| `.text-gradient-ember` | Editorial gradient text (subtle) |
| `.card-soft` | `rounded-xl border bg-card shadow-sm` |
| `.divide-hairline > * + *` | Hairline top borders between children |
| `.caret-blink` | 1s `steps(2, start)` infinite blink animation |
| `.ring-ember` | Ember focus ring (1px + 4px halo) |

## 9. Reduced motion

Tippen respects `prefers-reduced-motion`. The rule in `globals.css` forces
all animations and transitions to ~0 ms. This disables caret blink, camera
moves (they jump to the end state), and the marquee. See
[ACCESSIBILITY.md](./ACCESSIBILITY.md).

## 10. Adding a new theme

The MVP ships two themes. The 0.2 milestone adds a **theme marketplace**
scaffolding (JSON theme files). To add a theme today:

1. Define a new `.theme-<name>` class in `globals.css` (e.g.
   `.theme-sepia`) that overrides the same set of tokens.
2. Add the theme to the toggle dropdown in `theme-toggle.tsx`.
3. Update `next-themes` config in `theme-provider.tsx` to whitelist the new
   theme (or use `themes` prop).
4. Verify every surface (canvas, inspector, timeline, command palette)
   looks right with the new tokens.

Future: themes will be JSON files in `public/themes/<name>.json` loaded at
runtime via a `setTheme()` that injects CSS variables. The plugin SDK (0.6)
will allow third-party themes.

## 11. Hardcoded colors — don't

**Never** use a hex color, `rgb()`, or named color in a component. Always
use a token:

```tsx
// ❌ Bad
<div className="bg-[#181a1f]" />
<span style={{ color: "#e8a04a" }} />

// ✅ Good
<div className="bg-ink" />
<span style={{ color: "var(--ember)" }} />
```

Theme-responsive favicons use `prefers-color-scheme` media queries on
`<link rel="icon">` elements to serve the appropriate logo PNG for each
theme.

See [STYLE_GUIDE.md](./STYLE_GUIDE.md) §"No hardcoded colors".

## 12. See also

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — design principles behind these
  tokens
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) — how to use them in components
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) — contrast targets
