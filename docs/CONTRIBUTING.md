# Contributing to Tippen

First of all — **thank you** for taking the time to contribute. 🧡
Tippen is built by volunteers and every PR, issue, and discussion helps.

This document is the source of truth for how to contribute. Please also read
our [Code of Conduct](./CODE_OF_CONDUCT.md) — it applies to everyone in the
Tippen community.

> Looking for a small task to start? Browse issues labeled
> [`good first issue`](https://github.com/tippen/tippen/labels/good%20first%20issue).

---

## 1. Before you start

1. **Search existing issues and PRs.** Someone may already be on it.
2. **Open a discussion** in <https://github.com/tippen/tippen/discussions> for
   large ideas before writing code. We'll happily help scope it.
3. **Check the roadmap.** [ROADMAP.md](./ROADMAP.md) lists what is in scope
   and what is explicitly **not** in scope (collaboration, teams, payments,
   plugins, mobile, realtime editing, cloud rendering, social features).
   Feature requests for those will be politely parked.

## 2. Development setup

See [SETUP.md](./SETUP.md). Short version:

```bash
git clone https://github.com/<your-username>/tippen.git
cd tippen
bun install
cp .env.example .env
bun run db:push
bun run dev
```

## 3. Forking & branching

1. Fork the repo on GitHub.
2. Clone your fork locally.
3. Add the upstream remote:

   ```bash
   git remote add upstream https://github.com/tippen/tippen.git
   ```

4. Create a branch from `main`:

   ```bash
   git checkout -b feat/my-cool-thing main
   ```

### Branch naming

Use a prefix that matches the type of change:

| Prefix | Use for |
| --- | --- |
| `feat/` | New features or presets |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code restructure with no behavior change |
| `chore/` | Tooling, deps, CI |
| `perf/` | Performance improvements |
| `test/` | Test additions |

Example: `feat/preset-shake`, `fix/timeline-zoom-clamp`, `docs/ai-providers`.

## 4. Commit convention (Conventional Commits)

Tippen follows [Conventional Commits](https://www.conventionalcommits.org/).
Each commit message should look like:

```
<type>(<scope>): <subject>

<body>
```

### Types

| Type | When |
| --- | --- |
| `feat` | New user-facing capability (new preset, new AI action) |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | No behavior change |
| `perf` | Performance |
| `test` | Tests |
| `chore` | Tooling, deps, CI |
| `style` | Whitespace, formatting only |
| `ci` | CI / build config |
| `revert` | Reverting a previous commit |

### Scopes (optional but encouraged)

`editor`, `timeline`, `canvas`, `animation`, `theme`, `ai`, `store`,
`landing`, `docs`, `deps`, `ci`.

### Examples

```
feat(animation): add "shake" preset
fix(timeline): clamp zoom to [0.25, 4]
docs(ai): document WhisperX provider
chore(deps): bump next to 16.1.2
```

### Subject rules

- Imperative mood: "add", not "added" or "adds".
- Lowercase first letter, no trailing period.
- ≤ 72 characters.

## 5. Coding standards

Read the [Style Guide](./STYLE_GUIDE.md). The highlights:

- TypeScript strict mode. No `any` without a comment.
- Use the OKLCH tokens from `globals.css` — **never hardcode hex colors**.
- Every component that uses hooks/state must start with `"use client";`.
- Use the `cn()` helper for conditional classes.
- Keep files under ~400 lines. Split when they grow.
- Prefer named exports. Default exports only for pages.
- Order imports: React → third-party → `@/` aliases → relative.

Run before pushing:

```bash
bun run lint       # eslint
bunx tsc --noEmit  # typecheck
```

## 6. Pull request process

1. **Rebase** on `main` before opening the PR:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push** to your fork and open a PR against `tippen/main`.
3. Fill in the [PR template](../.github/PULL_REQUEST_TEMPLATE.md):
   - Summary
   - Type of change
   - Affected area
   - How to test
   - Screenshots (for visual changes)
   - Checklist
4. Make sure CI is green.
5. Request review from a maintainer (we'll auto-assign).
6. Address review feedback with new commits (don't force-push mid-review
   unless asked — it makes the diff hard to follow).

### What reviewers look for

- ✅ The change is **on roadmap** (or a justified, scoped exception).
- ✅ No hardcoded colors — uses OKLCH tokens.
- ✅ Works in **light and dark** themes.
- ✅ Respects `prefers-reduced-motion`.
- ✅ Adds a [CHANGELOG.md](./CHANGELOG.md) entry under `[Unreleased]`.
- ✅ Updates docs for user-facing changes.
- ✅ No unrelated reformatting — keep diffs reviewable.

### Visual changes

If your change touches the canvas, the timeline, or any panel:

- Attach a **before/after** screenshot at the same playhead (ms).
- For animation changes, attach a short GIF.
- Confirm the change looks right in both themes.

## 7. Folder guidelines

| You're adding… | Put it in… |
| --- | --- |
| A new animation preset | `src/lib/tippen/animation-presets.ts` (+ add to `PRESET_ORDER`) |
| A new background | `src/lib/tippen/seed.ts` (`BACKGROUND_OPTIONS`, `backgroundStyle`, `backgroundForeground`) |
| A new editor panel | `src/components/tippen/editor/<panel-name>.tsx` |
| A new landing section | `src/components/tippen/landing/<section-name>.tsx` |
| A new store action | `src/stores/editor-store.ts` (and remember `withHistory()` if it mutates the project) |
| A new hook | `src/hooks/use-<thing>.ts` |
| A new shared cinematic renderer | `src/components/tippen/cinematic-stage.tsx` (extend, don't fork) |
| A new AI action | `src/lib/tippen/ai/` (planned — see [AI.md](./AI.md)) |

## 8. Good first issues

Issues labeled `good first issue` are intentionally small and self-contained.
They're perfect for your first contribution. They usually:

- Touch one file.
- Don't require deep knowledge of the store or the animation engine.
- Include acceptance criteria and a hint at where to look.

If you start one, comment on the issue so we can assign it to you.

## 9. Reporting bugs

Use the **🐛 Bug Report** issue template. Include:

- What happened vs. what you expected
- The smallest reproducible example
- OS, browser, Node/Bun version
- Console logs

See [SECURITY.md](./SECURITY.md) for security issues — those go through a
private disclosure process, **not** a public issue.

## 10. License

By contributing, you agree that your contributions are licensed under the
[MIT License](../LICENSE) and that you have the right to license them as
such.

## 11. Recognition

All contributors are listed in the repo's **Contributors** page on GitHub.
Significant contributions (new presets, new AI actions, major features) get
a shout-out in [CHANGELOG.md](./CHANGELOG.md).

Thanks again — and welcome aboard. 🧡
