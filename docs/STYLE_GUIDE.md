# Style Guide

> Coding standards for Tippen. Following these keeps the codebase
> consistent, reviewable, and accessible.

This is the **how**. For the **why** (design language), see
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). For the **what** (tokens), see
[THEMES.md](./THEMES.md).

---

## 1. TypeScript

- **Strict mode** is on (`tsconfig.json` → `"strict": true`). Don't disable
  it.
- **No `any`.** Use `unknown` and narrow, or define a proper type. If you
  genuinely need `any`, add a `// eslint-disable-next-line` with a comment
  explaining why.
- **No non-null assertion (`!`)** unless you've just checked. Prefer
  optional chaining (`?.`) and nullish coalescing (`??`).
- **Prefer `type` for unions and aliases; `interface` for object shapes
  that may be extended.** Both are fine in `src/lib/tippen/types.ts` —
  consistency matters more than the choice.
- **Always type function parameters and return types** for public APIs
  (exported functions). Internal helpers may infer.
- **Use `as const`** for literal arrays/objects to get narrower types.
- **Zod for runtime validation** at API boundaries. Don't validate in
  components.

## 2. Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Components / classes | `PascalCase` | `CinematicStage`, `EditorWorkspace` |
| Hooks | `camelCase`, prefix `use` | `useTypewriter`, `useTippenShortcuts` |
| Functions / variables | `camelCase` | `applyAiResult`, `playheadMs` |
| Constants | `SCREAMING_SNAKE_CASE` | `HISTORY_LIMIT`, `PRESET_ORDER` |
| Types / interfaces | `PascalCase` | `TippenProject`, `TrackClip` |
| Enums | `PascalCase` member names | (we prefer union types over enums) |
| Files (components) | `kebab-case.tsx` | `cinematic-stage.tsx` |
| Files (hooks, libs) | `kebab-case.ts` | `use-typewriter.ts` |
| CSS variables | `--kebab-case` | `--ember`, `--muted-foreground` |
| Tailwind classes | lowercase | `bg-ember`, `text-muted-foreground` |

## 3. Imports

Order:

1. React / Next.js (`react`, `next/*`)
2. Third-party (`zustand`, `lucide-react`, `framer-motion`, …)
3. `@/` alias imports (`@/components/…`, `@/lib/…`, `@/stores/…`)
4. Relative imports (`./foo`, `../bar`)

Use `import type { … }` for type-only imports.

```tsx
// ✅ Good
"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";
import type { Scene } from "@/lib/tippen/types";
import { Foo } from "./foo";
```

Avoid deep relative paths (`../../../`). Use the `@/` alias.

## 4. Component structure

```tsx
"use client";                                  // 1. directive (if client)

import * as React from "react";                // 2. imports (see §3)
import { cn } from "@/lib/utils";
import type { Scene } from "@/lib/tippen/types";

// 3. Local types / constants
interface MyComponentProps {
  scene: Scene;
  className?: string;
}

// 4. Sub-components (if any), defined above the main export
function SubThing() { /* … */ }

// 5. Main component — named export, no default
export function MyComponent({ scene, className }: MyComponentProps) {
  // 5a. hooks first (state, effects, memo)
  const [open, setOpen] = React.useState(false);

  // 5b. derived state
  const isActive = scene.startMs <= Date.now();

  // 5c. handlers
  const handleClick = React.useCallback(() => setOpen((v) => !v), []);

  // 5d. early returns (guards) — keep simple
  if (!scene) return null;

  // 5e. render
  return (
    <div className={cn("rounded-xl bg-card p-4", className)}>
      {/* … */}
    </div>
  );
}
```

### Rules

- **Named exports.** Default exports only for Next.js pages (`page.tsx`,
  `layout.tsx`) and `error.tsx` / `loading.tsx`.
- **One component per file** unless sub-components are tightly coupled.
- **`"use client";`** on any file that uses hooks, state, browser APIs, or
  event handlers. Place it on the very first line, above imports.
- **Props interface named `<ComponentName>Props`** and placed above the
  component.
- **`className` prop** on every reusable component, merged with `cn()`.

## 5. shadcn/ui usage

- Use shadcn/ui primitives from `src/components/ui/*` for buttons, inputs,
  dialogs, dropdowns, etc.
- **Don't fork a primitive.** If it doesn't fit, compose it inside a
  Tippen-specific component.
- Custom variants go in `class-variance-authority` (`cva`) — see
  `button.tsx` for the pattern.
- Always pass `className` through `cn(...)` so callers can override.

```tsx
import { Button, type ButtonProps } from "@/components/ui/button";

interface EmberButtonProps extends ButtonProps {
  glow?: boolean;
}

export function EmberButton({ glow, className, ...rest }: EmberButtonProps) {
  return (
    <Button
      className={cn(glow && "shadow-glow", className)}
      {...rest}
    />
  );
}
```

## 6. Tailwind class ordering

Order classes in this rough sequence so diffs are readable:

1. Layout: `flex`, `grid`, `relative`, `absolute`, `block`
2. Box: `w-*`, `h-*`, `p-*`, `m-*`, `gap-*`
3. Typography: `text-*`, `font-*`, `leading-*`, `tracking-*`
4. Color: `bg-*`, `text-*`, `border-*`
5. Radius / shadow: `rounded-*`, `shadow-*`
6. State: `hover:*`, `focus:*`, `disabled:*`
7. Responsive: `sm:*`, `md:*`, `lg:*`

Use `cn()` for conditional classes; never interpolate strings.

```tsx
// ❌ Bad
<div className={`p-4 ${isActive ? "bg-ember" : "bg-card"}`} />

// ✅ Good
<div className={cn("p-4", isActive ? "bg-ember" : "bg-card")} />
```

## 7. No hardcoded colors

**Never** use hex, `rgb()`, `hsl()`, or named colors in className or inline
style. Always use a token.

```tsx
// ❌ Bad
<div className="bg-[#181a1f]" />
<span style={{ color: "#e8a04a" }} />
<div className="bg-zinc-900" />

// ✅ Good
<div className="bg-ink" />
<span style={{ color: "var(--ember)" }} />
<div className="bg-background" />
```

Exceptions:

- The favicon uses `prefers-color-scheme` media queries in `<link rel="icon">`
  to serve theme-specific PNG logos.
- The `BACKGROUND_OPTIONS` swatches in `seed.ts` (these mirror the
  `backgroundStyle()` colors — keep them in sync).
- Test fixtures (rare).

If you need a color that doesn't have a token, **add a token** in
`globals.css` rather than hardcoding.

## 8. Accessibility

- **Semantic HTML.** `<button>` for clicks, `<a>` for navigation, `<nav>`,
  `<main>`, `<aside>`, `<section>`.
- **Every interactive element is keyboard-reachable.** Test with Tab.
- **Visible focus ring.** Use `outline-ring/50` (set globally in
  `globals.css`). Don't remove it without an alternative.
- **`aria-label`** on icon-only buttons. **`aria-describedby`** for inputs
  with hints.
- **`role` + `aria-*`** for non-semantic widgets (the command palette is a
  `combobox`, the timeline is a `slider` group).
- **`prefers-reduced-motion`.** Never animate something that the user can't
  turn off. The global CSS rule disables most motion; verify your component
  still works with motion off.
- **Color contrast.** Aim for WCAG AA (4.5:1 for body text, 3:1 for large
  text). Use `--muted-foreground` for secondary text, never `--border`.

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for the full WCAG targets.

## 9. State management

- **Zustand** for editor state (`src/stores/editor-store.ts`).
- **TanStack Query** for server cache (planned — once the API exists).
- **`useState`** for component-local UI state (open/close, hover, etc.).
- **No React Context** for app-wide state — Zustand is simpler and faster.
  Context is fine for truly local concerns (e.g. a `TooltipProvider`).
- **Selectors.** Always pass a selector to `useEditorStore` — never
  subscribe to the whole store.

```tsx
// ❌ Bad — re-renders on every store change
const store = useEditorStore();

// ✅ Good
const playhead = useEditorStore((s) => s.playheadMs);
const seek     = useEditorStore((s) => s.seek);
```

## 10. Effects

- **Effects are a last resort.** Prefer derived state, event handlers, or
  Zustand actions.
- **Always return a cleanup** if you subscribe to anything.
- **`useEffect` deps must be exhaustive.** Don't lie to the linter.
- **Don't fetch in effects.** Use TanStack Query or a route handler.

## 11. Files & folders

- Keep files under ~400 lines. Split when they grow.
- Feature folders: `src/components/tippen/<feature>/<component>.tsx`.
- Pure logic: `src/lib/tippen/<thing>.ts`.
- Hooks: `src/hooks/use-<thing>.ts`.
- Stores: `src/stores/<thing>-store.ts`.

See [ARCHITECTURE.md](./ARCHITECTURE.md) §1.1 for the full map.

## 12. Linting & formatting

The repo ships with:

- **ESLint** (`eslint.config.mjs`, Next.js config).
- **Prettier** (`.prettierrc`): no semicolons, double quotes, trailing
  commas, 80-col print width, 2-space indent.
- **EditorConfig** (`.editorconfig`): UTF-8, LF, 2-space indent, final
  newline.

Run before committing:

```bash
bun run lint
bunx tsc --noEmit
```

CI runs the same on every PR (see `.github/workflows/ci.yml`).

## 13. Comments

- **Why, not what.** Code already says what it does.
- **JSDoc** on exported functions that aren't obvious.
- **Section dividers** in long files: `/* ─── Section Name ─── */` (see
  `editor-store.ts` for the style).
- **TODOs** must include an issue link: `// TODO(#42): …`.

## 14. Commit hygiene

See [CONTRIBUTING.md](./CONTRIBUTING.md) §4 — Conventional Commits, scoped,
imperative mood, ≤72-char subject.

## 15. See also

- [CONTRIBUTING.md](./CONTRIBUTING.md) — PR process
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — design principles
- [THEMES.md](./THEMES.md) — token reference
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) — WCAG targets
