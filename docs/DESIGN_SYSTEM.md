# Design System

> Tippen's design language: Linear × Raycast × Arc × Vercel × Notion × Figma.
> Whitespace, rounded corners, minimal borders, subtle shadows, premium
> typography, soft animations.

This document captures the **why** behind the design tokens. For the **what**
(token values, Tailwind classes, CSS variables), see [THEMES.md](./THEMES.md).
For **how to write components**, see [STYLE_GUIDE.md](./STYLE_GUIDE.md).

---

## 1. Design language

Tippen draws from six products we admire:

| Product | What we take |
| --- | --- |
| **Linear** | Density without crowding; keyboard-first; crisp typography; subtle motion |
| **Raycast** | Command palette as a first-class surface; tasteful gradients; quick actions |
| **Arc** | Playful but restrained color; soft, glassy surfaces; delightful micro-interactions |
| **Vercel** | Editorial whitespace; monospaced accents; high-contrast type; minimal borders |
| **Notion** | Calm, content-first layout; neutral palette that recedes |
| **Figma** | Panel-based editing; direct manipulation; never modal when avoidable |

What we explicitly **don't** take:

- Linear's blue/indigo accent (we use Ember — see §3).
- Vercel's pure black/white (we use warm Ink).
- Canva's saturated templates (we're an editor, not a template gallery).
- PowerPoint's chrome (we have no ribbon, no menus).

## 2. Principles

### 2.1 Whitespace is a feature

Tippen uses generous whitespace to make content the protagonist. The canvas
in the editor is centered with `px-[8%]` padding and capped at `max-w-5xl`
when letterboxed. Panels use `gap-*` and `p-*` rather than borders to
separate content.

### 2.2 Rounded corners, not borders

We prefer `rounded-xl` surfaces over `border` lines. Borders exist but are
subtle (`border-border/60`), used only where a panel needs to read as a
distinct container. Hairline dividers (`border-border/50`) are used inside
lists.

### 2.3 Minimal borders, subtle shadows

Three elevation levels (`--shadow-sm`, `--shadow-md`, `--shadow-lg`) cover
95% of cases. We use `--shadow-glow` only for hero CTAs. Shadows are always
soft, never hard-edged.

### 2.4 Premium typography

- Geist Sans for body and UI — neutral, modern, slightly humanist.
- Instrument Serif for cinematic display — high-contrast, editorial.
- Geist Mono for code, timestamps, terminal preset — fixed-width.

Body text is set with `font-feature-settings: "cv11", "ss01"` and
`font-variation-settings: "opsz" 32` for premium optical sizing. Letter
spacing is tight on display text (`-0.02em`) and default on body.

### 2.5 Soft animations

Tippen motion is *editorial* — present but never distracting:

- Caret blink: `1s steps(2, start) infinite` — a hard blink, not a fade.
- Camera moves: `easeOutQuad` over the scene's duration.
- Fade-up entrance: `0.5s cubic-bezier(0.16, 1, 0.3, 1)`.
- Marquee: `40s linear infinite` (only on the landing logos strip).

All animations are killed by `prefers-reduced-motion`.

### 2.6 Cinematic, not corporate

The dark theme is the default — Tippen is a cinematic tool. Backgrounds use
warm OKLCH neutrals (slight yellow shift), not pure gray. Accents are
amber, not blue. The grain texture on the canvas is intentional: it evokes
film, not a UI mockup.

---

## 3. Color philosophy

Two colors define Tippen:

- **Ember** — warm amber (`oklch(0.7 0.17 52)` light / `oklch(0.76 0.17 55)`
  dark). Used for: accents, highlights, the blinking caret, primary CTAs,
  selection rings. Evokes cinema, film, warmth, storytelling.
- **Ink** — slightly warm neutral (`oklch(0.18 0.008 264)` light /
  `oklch(0.96 0.004 95)` dark). Used for: body text, primary surfaces. The
  slight chroma (0.008) keeps it from feeling sterile.

### Why not blue?

Every editor (Linear, Notion, Figma, Slack, Arc) defaults to blue/indigo.
Tippen uses amber to feel cinematic and to avoid blending into the sea of
blue SaaS apps. Amber also reads warmer on a dark canvas, which fits the
"film studio" metaphor.

### Semantic tokens only

There are no hex values in components — only OKLCH tokens. This means:

- The same component looks right in light and dark.
- Future themes (sepia, high-contrast, etc.) work without touching
  components.
- Accessibility audits can check contrast at the token level.

## 4. Typography scale

| Token | Size (rem) | Use |
| --- | --- | --- |
| `text-xs` | 0.75 | Labels, captions, keyboard hints |
| `text-sm` | 0.875 | Body in dense panels, inspector labels |
| `text-base` | 1.0 | Default body |
| `text-lg` | 1.125 | Section headings in panels |
| `text-xl` | 1.25 | Sub-headers |
| `text-2xl` | 1.5 | Page-level headers |
| `text-display` | 4+ | Cinematic canvas lines (set per-line, not via token) |

Canvas line `fontSize` is set explicitly per `TextLine` (default 48–64 px)
because it maps to actual video pixels.

## 5. Spacing

We use Tailwind's default 4-px base scale. Common values:

| Use | Class |
| --- | --- |
| Tight icon+text | `gap-1.5`, `px-1.5` |
| Default control padding | `px-3 py-1.5`, `gap-2` |
| Panel padding | `p-4` |
| Section spacing | `gap-6`, `py-8` |
| Hero spacing | `py-20`, `gap-12` |

## 6. Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | `calc(0.75rem - 4px)` | Badges, chips |
| `--radius-md` | `calc(0.75rem - 2px)` | Inputs, buttons |
| `--radius-lg` | `0.75rem` | Cards, popovers |
| `--radius-xl` | `calc(0.75rem + 4px)` | Hero CTAs |
| `--radius-2xl` | `calc(0.75rem + 8px)` | Modal dialogs, command palette |

The base `--radius` is `0.75rem` (12 px). All other radii are derived from
it so the system scales together.

## 7. Elevation

| Token | Use |
| --- | --- |
| `--shadow-xs` | Hairline lift on sticky rows |
| `--shadow-sm` | Cards, inputs (default) |
| `--shadow-md` | Popovers, dropdown menus |
| `--shadow-lg` | Modals, command palette |
| `--shadow-glow` | Hero CTAs only — ember halo |

Shadows never use color other than black with low alpha — the ember accent
comes from `--shadow-glow` only.

## 8. Iconography

Tippen uses [`lucide-react`](https://lucide.dev/) for all icons. Defaults:

- Stroke width: `1.5` (default)
- Size: `16` (in dense UI), `20` (in panels), `24` (in headers)
- Color: `currentColor` — inherits text color, so `text-muted-foreground`
  etc. work.

Never bundle a different icon library without discussion.

## 9. Motion tokens

| Class / variable | Duration | Easing | Use |
| --- | --- | --- | --- |
| `.animate-fade-up` | 0.5s | `cubic-bezier(0.16, 1, 0.3, 1)` | Section entrances |
| `.caret-blink` | 1s `steps(2, start)` infinite | — | Typewriter caret |
| `.animate-marquee` | 40s linear infinite | — | Landing logos |
| `transition-transform` | Tailwind default (150ms) | `ease-out` | Camera, hover scale |
| `transition-colors` | Tailwind default (150ms) | `ease-out` | Hover states |

All durations collapse to ~0 ms under `prefers-reduced-motion`.

## 10. Anti-patterns

Things we deliberately **don't** do:

- ❌ Heavy gradients on UI surfaces (only on the cinematic canvas backgrounds
  like `ember` and `midnight`).
- ❌ Drop shadows with color (other than `--shadow-glow` for hero CTAs).
- ❌ Rounded-full panels (only used on small chips, avatars).
- ❌ Animations longer than 0.6s on UI (canvas animations are exempt —
  they're cinematic, not UI).
- ❌ Pure black (`#000`) backgrounds. Use `--background` (warm ink).
- ❌ Pure white (`#fff`) backgrounds. Use `--card` (warm paper).
- ❌ Glassmorphism (`backdrop-blur` on colored fills). We use it sparingly
  on the command palette, never on body surfaces.
- ❌ Border thickness > 1px in UI (canvas letterboxing excepted).

## 11. References

- [THEMES.md](./THEMES.md) — token reference
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) — how to write components with these
  tokens
- [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) — component inventory
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) — contrast and motion commitments
