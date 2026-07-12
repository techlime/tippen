# Testing

> Tippen's testing strategy — what to test, with what, and to what coverage.
> No tests are written in the MVP; this is the target once 0.2 lands.

## 1. Current state

The MVP ships **without tests**. This is intentional — the foundation was
built to be testable (pure functions, deterministic engines, fine-grained
store selectors) but writing tests now would slow the design iteration
loop. The strategy below is the target for 0.2+.

## 2. Tooling

| Layer | Tool | Why |
| --- | --- | --- |
| **Unit** | [Vitest](https://vitest.dev) | Vite-fast, Jest-compatible, first-class TypeScript |
| **Component** | [React Testing Library](https://testing-library.com/react) | Test behavior, not implementation |
| **E2E** | [Playwright](https://playwright.dev) | Cross-browser, reliable, great DX |
| **Visual regression** | Playwright snapshots | Catch canvas / theme regressions |
| **A11y** | `@axe-core/playwright` | Run axe in E2E |
| **Mutation** | [Stryker](https://stryker-mutator.io) (optional) | Verify test quality |

All tests run in CI (`.github/workflows/ci.yml`) on every PR.

## 3. What to test per layer

### 3.1 Pure domain logic (`src/lib/tippen/`)

These are the easiest and highest-value tests. **100% coverage target.**

- `animation-presets.ts`:
  - `getPreset(id)` returns the right preset, falls back to `typewriter`.
  - `isTypewriterPreset(id)` returns true for `typewriter`, `terminal`,
    `apple-intro`, `highlight`; false for the rest.
  - `PRESET_ORDER` contains all 11 preset IDs.
- `seed.ts`:
  - `createSeedProject()` returns a valid `TippenProject` (no missing IDs,
    scenes have unique IDs, tracks have unique `kind`s).
  - `backgroundStyle(bg)` returns a CSSProperties for every `BackgroundId`.
  - `backgroundForeground(bg)` returns `"oklch(0.18…)"` for `paper` and
    `"oklch(0.97…)"` for everything else.

### 3.2 Hooks (`src/hooks/`)

Test with `@testing-library/react`'s `renderHook`.

- `useTypewriter(content, preset, startMs, playhead, cps)`:
  - Returns `visible: ""` when `playhead < startMs`.
  - Reveals the right number of characters for typewriter presets at a
    given playhead.
  - Returns `done: true` when fully revealed.
  - Returns the right `opacity` / `transform` / `filter` for each reveal
    preset.
  - Is deterministic: same inputs → same output (call twice, compare).
- `useTippenShortcuts(enabled)`:
  - `⌘Z` calls `undo()`.
  - `Space` calls `togglePlay()`.
  - Shortcuts are ignored while typing in an `<input>`.
  - `⌘K` opens the command palette even while typing.

### 3.3 Store (`src/stores/editor-store.ts`)

- `addScene()` adds a scene and pushes history.
- `undo()` / `redo()` round-trip the project.
- `canUndo()` is false on a fresh store, true after `addScene()`.
- `applyAiResult("generate-intro", "new text")` updates the selected line.
- `applyAiResult("auto-highlight", "")` adds a highlight to each line.
- `moveClip(clipId, delta)` clamps to ≥ 0.
- `setZoom(z)` clamps to `[0.25, 4]`.
- `seek(ms)` clamps to `[0, durationMs]`.

### 3.4 Components (`src/components/`)

Test behavior, not implementation details.

- `CinematicLine`:
  - Renders nothing visible before `startMs`.
  - Renders the right substring at a given playhead.
  - Renders highlight spans with `color: var(--ember)`.
  - Renders a `.caret-blink` cursor when the preset's `cursor` flag is true
    and the line isn't done.
- `CinematicStage`:
  - Renders the scene's background style.
  - Applies the camera transform for `push-in` at `playhead = midpoint`.
  - Renders all lines.
- `ThemeToggle`:
  - Has three options: Light, Dark, System.
  - Clicking "Dark" adds `class="dark"` to `<html>`.
- `TippenApp`:
  - Renders `LandingPage` when `view === "landing"`.
  - Renders `EditorWorkspace` when `view === "editor"`.

### 3.5 API routes (`src/app/api/`)

- `POST /api/tippen/ai` with a valid action returns a 200 and a result.
- `POST /api/tippen/ai` with an unknown action returns a 400 with
  `INVALID_ACTION`.
- `POST /api/tippen/ai` when no provider is configured returns a 503 with
  `NO_PROVIDER`.

Use `next-test-api-route-handler` or a similar helper for Next.js route
handler tests.

### 3.6 E2E (Playwright)

The smallest set that proves the user journey works:

1. **Landing → Editor → Play**
   - Visit `/`.
   - Click "Open the editor".
   - Press `Space`.
   - Verify the playhead advances (canvas content changes).
2. **Add a scene**
   - In the editor, press `N`.
   - Verify a new scene appears in the sidebar.
3. **Undo**
   - Press `N` to add a scene.
   - Press `⌘Z`.
   - Verify the scene is gone.
4. **Theme toggle**
   - Click the theme toggle.
   - Select "Light".
   - Verify `<html>` no longer has `class="dark"`.
5. **Command palette**
   - Press `⌘K`.
   - Type "play".
   - Press Enter.
   - Verify the playhead advances.
6. **AI panel (graceful degrade)**
   - Open the AI tab.
   - Verify the "no provider configured" message shows when no env vars
     are set.

### 3.7 Visual regression

For every animation preset, snapshot `CinematicStage` at the midpoint of
the scene. Run in both light and dark themes. Snapshots live in
`tests/visual/__snapshots__/`. Update with `bunx playwright test --update-snapshots`.

### 3.8 Accessibility

`@axe-core/playwright` runs on every page in the E2E suite. Zero
violations is the bar (warnings are reviewed case-by-case).

## 4. Coverage goals

| Layer | Target |
| --- | --- |
| `src/lib/tippen/` | 100% lines |
| `src/stores/` | 95% lines |
| `src/hooks/` | 90% lines |
| `src/components/tippen/` | 80% lines |
| `src/app/api/` | 90% lines |
| Overall | 85% lines |

Coverage is enforced in CI via `vitest --coverage`. PRs that drop coverage
by more than 2% fail.

## 5. Test file location

Co-locate tests with source:

```
src/lib/tippen/animation-presets.test.ts
src/lib/tippen/seed.test.ts
src/stores/editor-store.test.ts
src/hooks/use-typewriter.test.ts
src/components/tippen/cinematic-stage.test.tsx
```

E2E tests live in `tests/e2e/`. Visual snapshots in `tests/visual/`.

## 6. Running tests

```bash
# Unit + component
bunx vitest

# Watch
bunx vitest --watch

# Coverage
bunx vitest --coverage

# E2E
bunx playwright test

# Visual snapshots (update)
bunx playwright test --update-snapshots
```

## 7. CI integration

`.github/workflows/ci.yml` will add a `test` job:

```yaml
test:
  name: Test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: oven-sh/setup-bun@v2
    - run: bun install --frozen-lockfile
    - run: bunx vitest --coverage
    - uses: actions/upload-artifact@v4
      with:
        name: coverage
        path: coverage/
    - run: bunx playwright install --with-deps
    - run: bunx playwright test
```

## 8. What not to test

- **Third-party libraries.** Don't test shadcn/ui or Radix internals.
- **CSS variables.** Visual snapshots cover this.
- **Snapshot spam.** Don't snapshot huge component trees — snapshot small,
  meaningful units.
- **Implementation details.** Don't test "calls setState 3 times". Test
  "the playhead advances after pressing Space".

## 9. Test data

Use the seed project (`createSeedProject()`) as the canonical test fixture.
For specific scenarios, build a minimal `TippenProject` inline in the test
— don't load JSON fixtures from disk.

## 10. See also

- [STYLE_GUIDE.md](./STYLE_GUIDE.md) — what the code should look like
- [PERFORMANCE.md](./PERFORMANCE.md) — performance budgets (also tested)
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) — a11y tests
- [ROADMAP.md](./ROADMAP.md) — when the test suite lands
