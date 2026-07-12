# Accessibility

> Tippen's accessibility commitments and the editor-specific patterns that
> make a creative tool usable with assistive tech.

Accessibility is non-negotiable. Tippen is a creative tool — creators use
all kinds of input devices and assistive tech. This document is the
authoritative a11y reference.

---

## 1. WCAG targets

Tippen targets **WCAG 2.2 Level AA** for all user-facing surfaces, with
select Level AAA targets noted.

| Criterion | Target | Notes |
| --- | --- | --- |
| 1.1.1 Non-text Content (A) | AA | All icons have `aria-label`s or are decorative (`aria-hidden`) |
| 1.3.1 Info and Relationships (A) | AA | Semantic HTML: `<nav>`, `<main>`, `<aside>`, headings |
| 1.4.3 Contrast (Minimum) (AA) | AA | ≥ 4.5:1 body text, ≥ 3:1 large text. OKLCH tokens are tuned for this |
| 1.4.11 Non-text Contrast (AA) | AA | ≥ 3:1 for UI components, focus indicators, selection |
| 1.4.10 Reflow (AA) | AA | Functional at 320 px width (though editor is desktop-first) |
| 1.4.12 Text Spacing (AA) | AA | No fixed pixel heights on text containers |
| 2.1.1 Keyboard (A) | AA | Every interaction reachable via keyboard |
| 2.1.2 No Keyboard Trap (A) | AA | Modals cycle focus and close on Esc |
| 2.4.3 Focus Order (A) | AA | DOM order = visual order |
| 2.4.7 Focus Visible (AA) | AA | `outline-ring/50` on every focusable element |
| 2.5.8 Target Size (Minimum) (AA) | AA | ≥ 24×24 px hit targets |
| 3.2.1 On Focus (A) | AA | No context change on focus alone |
| 3.3.1 Error Identification (A) | AA | Form errors are described in text, not color alone |
| 3.3.2 Labels or Instructions (A) | AA | All inputs have visible `<label>`s |
| 4.1.2 Name, Role, Value (A) | AA | All custom widgets expose role + name + state |
| 4.1.3 Status Messages (AA) | AA | Toasts use `role="status"` or `aria-live="polite"` |

### Level AAA targets we aim for

- **1.4.6 Contrast (Enhanced)** — body text ≥ 7:1 where practical.
- **2.1.3 Keyboard (No Exception)** — nothing is mouse-only.
- **2.4.9 Link Purpose (Link Only)** — link text makes sense out of context.

## 2. Semantic HTML

Use the right element. Don't `<div onClick>`:

- Click → `<button>` (or `<a>` if it navigates).
- Toggle → `<button aria-pressed>`.
- Group of toggles → `<div role="group">` with `<button>`s, or a Radix
  `ToggleGroup`.
- Tab list → `<div role="tablist">` with `<button role="tab">`. (shadcn/ui
  `Tabs` does this for us.)
- List → `<ul>` / `<ol>`.
- Form → `<form>` with `<label>` + `<input>`.

## 3. Keyboard navigation

### 3.1 Tab order

- DOM order = visual order. Don't fight it with CSS order.
- Every interactive element is reachable via Tab.
- Off-screen elements are removed from the DOM (not just `display: none`),
  so they don't get focus.

### 3.2 Shortcuts

The editor's global shortcuts (`⌘Z`, `Space`, `⌘K`, `⌘=`, `←`, `→`, `N`,
`Esc`) are listed in [EDITOR.md](./EDITOR.md) §4.

Important rules:

- Shortcuts that overlap with browser or screen-reader commands must use a
  modifier (e.g. `⌘K`, not just `K`).
- Single-key shortcuts (`Space`, `←`, `→`, `N`, `Esc`) are **disabled
  while typing in an input / textarea / contenteditable / combobox** —
  except `⌘K` which always works.
- Every shortcut must have a visible, clickable alternative (the play
  button, the zoom controls, the `+ new scene` button, etc.).

### 3.3 Skip links

- The landing page has a "Skip to content" link as the first focusable
  element.
- The editor has a "Skip to canvas" link (planned) that jumps focus into
  the canvas region.

## 4. ARIA patterns

### 4.1 Command palette

The command palette is a `combobox` per the [WAI-ARIA Authoring
Practices](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/):

- Input has `role="combobox"`, `aria-expanded`, `aria-controls`,
  `aria-activedescendant`.
- List has `role="listbox"`.
- Items have `role="option"`, `aria-selected`.

shadcn/ui's `command` (cmdk) handles this for us.

### 4.2 Timeline

The timeline is a complex widget. Planned a11y:

- The track header is a `group` with `aria-label` "Track: <label>".
- Each clip is a `slider` with `aria-label` "<label>, start <time>,
  duration <time>", `aria-valuemin="0"`, `aria-valuemax="<duration>"`,
  `aria-valuenow="<start>"`.
- The playhead is a `slider` with `aria-label="Playhead"`.
- Mute / lock toggles are `button`s with `aria-pressed`.

### 4.3 Canvas

The canvas is `role="img"` with a dynamic `aria-label`:

```
Scene 2 of 3, "The Premise". Background: midnight. Camera: static.
Visible text: "Tippen turns text into cinema."
```

This updates as the playhead moves — but throttled to once per second to
avoid flooding screen readers (planned).

### 4.4 Toasts

Sonner toasts use `role="status"` and `aria-live="polite"` by default.
Errors use `role="alert"`.

## 5. Focus management

- **Modal opens** → focus moves to the first interactive element inside.
- **Modal closes** → focus returns to the trigger.
- **Tab cycles** within a modal (no escape until Esc or click-out).
- **Scene selected** → focus moves to the scene in the sidebar (planned —
  currently just visual selection).
- **`Esc`** deselects + closes any open popover.

## 6. Reduced motion

Tippen respects `prefers-reduced-motion`. The global rule in
`globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Effects:

- The caret stops blinking (jumps to on).
- Camera moves jump to their end state.
- Fade-up entrances become instant.
- The marquee stops.
- Timeline clip drags still work (they're user-initiated, not motion).

We never rely on motion to communicate state. A `fade-in` is decorative —
the content is present in the DOM either way.

## 7. Color contrast

OKLCH tokens are tuned for contrast:

| Token pair (dark) | Ratio | Pass? |
| --- | --- | --- |
| `--foreground` on `--background` | 14.3:1 | AAA |
| `--muted-foreground` on `--background` | 5.2:1 | AA |
| `--ember` on `--background` | 5.8:1 | AA |
| `--primary` on `--primary-foreground` | 13.9:1 | AAA |
| `--destructive` on `--background` | 5.4:1 | AA |

| Token pair (light) | Ratio | Pass? |
| --- | --- | --- |
| `--foreground` on `--background` | 14.5:1 | AAA |
| `--muted-foreground` on `--background` | 4.7:1 | AA |
| `--ember` on `--background` | 3.8:1 | AA (large only) — used for accents on large text, not body |
| `--primary` on `--primary-foreground` | 13.9:1 | AAA |

**Never use color alone** to convey state. A muted track shows a slash icon
+ dimmed label, not just a color change. An error shows an icon + text, not
just red.

## 8. Forms

- Every `<input>` has a `<label>` (via shadcn/ui `Label`).
- Required fields are marked with `aria-required="true"` and a visible
  asterisk.
- Errors are described via `aria-describedby` pointing to an error message
  with `role="alert"`.
- Inline validation only fires after the first blur (don't yell at users
  while they type).

## 9. Screen reader notes for the editor

The editor is dense. Here's how a screen reader user navigates it:

1. **Skip link** jumps to the canvas. The canvas region announces the
   active scene.
2. **Tab** moves through the top nav (logo, title, ⌘K, transport, theme,
   export).
3. **Tab** moves into the scene sidebar — a list with `<button>`s per
   scene. Arrow keys move between scenes (planned).
4. **Tab** moves into the inspector. The tab list is a `tablist`; arrow
   keys switch tabs.
5. **Tab** moves through the active tab's controls.
6. **Tab** moves into the timeline. The playhead slider is reachable;
   arrow keys scrub.
7. **⌘K** opens the command palette from anywhere — this is the fastest
   way for a screen reader user to navigate.

Things that are *not* in the tab order (because they'd be noise):

- Individual timeline clips (reached via the playhead slider + a "jump to
  next clip" command in the palette — planned).
- Inspector sub-controls for non-active tabs.

## 10. Testing accessibility

- **Manual:** Tab through every page. Verify focus is visible and order is
  correct. Run with `prefers-reduced-motion: reduce`.
- **Automated:** `axe-core` in CI (planned — see [TESTING.md](./TESTING.md)).
- **Screen reader:** NVDA + Firefox on Windows, VoiceOver on macOS, at
  least once per major release.
- **Contrast:** Lighthouse audit on every PR (planned).

## 11. Limitations (MVP)

- Canvas `aria-label` is static ("Cinematic scene") — does not yet narrate
  the active scene.
- Timeline clips are not yet keyboard-reachable (planned).
- Scene sidebar uses Tab, not arrow keys (planned).
- No "skip to canvas" link in the editor yet (planned).

## 12. Reporting a11y issues

Open a **🐛 Bug Report** with the **Area** set to "Accessibility". Tag it
`accessibility`. We treat these as P1 unless there's a workaround.

## 13. See also

- [STYLE_GUIDE.md](./STYLE_GUIDE.md) §8 — a11y rules in code
- [EDITOR.md](./EDITOR.md) §4 — keyboard shortcuts
- [THEMES.md](./THEMES.md) — contrast-friendly tokens
- [PERFORMANCE.md](./PERFORMANCE.md) §10 — DOM depth budget
