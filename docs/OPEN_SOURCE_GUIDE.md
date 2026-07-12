# Open Source Maintainer Guide

> How the Tippen maintainers run the project: repo structure, releases,
> issue triage, CI, branch protection, and Dependabot.

This is an internal-facing document for maintainers. Contributors don't
need to read it, but it's public so everyone can see how we operate.

## 1. Repo structure

```
tippen/
├── docs/                       # ← all documentation
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── tippen/             # feature components
│   │   └── ui/                 # shadcn/ui primitives
│   ├── hooks/
│   ├── lib/
│   │   └── tippen/             # domain model, presets, seed
│   └── stores/
├── prisma/
│   └── schema.prisma
├── public/
├── .github/
│   ├── ISSUE_TEMPLATE/         # bug, feature, config
│   ├── workflows/              # ci.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── dependabot.yml
│   └── FUNDING.yml
├── .env.example
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .prettierrc
├── LICENSE                     # MIT
└── package.json
```

When the monorepo lands (see [ARCHITECTURE.md](./ARCHITECTURE.md) §2), this
becomes a Turborepo with `apps/`, `packages/`, and `server/`. The docs/
folder stays at the root.

## 2. Roles

| Role | Who | Powers |
| --- | --- | --- |
| **Contributor** | Anyone with a PR open | Code, docs, issues |
| **Triager** | Maintainers with `triage` perms | Label, close, assign issues |
| **Maintainer** | Core team | Review + merge PRs, push to `main` |
| **Admin** | Founders | Repo settings, branch protection, secrets |

We follow the [Sustain OSS membership
model](https://sustainoss.org/): contributors who consistently deliver
high-quality PRs are invited to become maintainers.

## 3. Branch protection

`main` is protected:

- ✅ Require pull request before merging.
- ✅ Require approval from at least one maintainer.
- ✅ Require status checks: `lint`, `typecheck` (and `test` once added).
- ✅ Require branches to be up to date before merging.
- ✅ Require linear history (rebase, no merge commits).
- ✅ Dismiss stale approvals when new commits are pushed.
- ❌ Allow force pushes: **never** on `main`.
- ❌ Allow deletions: **never** on `main`.

## 4. Release process

Tippen follows [Semantic Versioning](https://semver.org/):

- **0.x.y** — anything goes. Minor versions may break. Patches are
  bug fixes only.
- **1.0.0+** — backward-compatible per semver. Breaking changes increment
  the major version and ship in a migration guide.

### 4.1 Cutting a release

1. Update `docs/CHANGELOG.md` — move `[Unreleased]` items into a new
   `## [0.x.y] - YYYY-MM-DD` section.
2. Bump `version` in `package.json` (`0.x.y`).
3. Open a PR titled `chore(release): v0.x.y`.
4. After merge, tag the commit: `git tag v0.x.y && git push origin v0.x.y`.
5. GitHub Actions (planned) will create a Release with the changelog body.
6. Announce in Discussions and on the project's socials.

### 4.2 Hotfix

For a critical bug on the latest release:

1. Branch `hotfix/0.x.y+1` from the release tag.
2. Fix + add a changelog entry under a new `## [0.x.y+1]`.
3. PR to `main` (which is ahead, so the fix lands there too).
4. Tag and release as in §4.1.

## 5. Issue triage

### 5.1 Labels

| Label | Meaning |
| --- | --- |
| `triage` | New, not yet categorized |
| `bug` | Confirmed defect |
| `enhancement` | Feature request |
| `good first issue` | Small, self-contained — perfect for newcomers |
| `help wanted` | We want this, but maintainers can't do it now |
| `discussion` | Needs more conversation before action |
| `question` | User question (often → Discussions) |
| `duplicate` | Already filed |
| `wontfix` | Out of scope — see [ROADMAP.md](./ROADMAP.md) |
| `invalid` | Not a real issue (spam, misuse) |
| `accessibility` | A11y-specific |
| `performance` | Perf-specific |
| `dependencies` | From Dependabot |
| `ci` | CI / build / tooling |

### 5.2 SLA targets

| Issue type | First response | Resolution target |
| --- | --- | --- |
| Security (private) | 48 hours | 30 days (see [SECURITY.md](./SECURITY.md)) |
| Bug (high severity) | 3 business days | Next minor release |
| Bug (low severity) | 1 week | Best-effort |
| Feature request | 1 week | Scheduled in ROADMAP or closed as wontfix |
| Question | 3 business days | Often redirected to Discussions |

### 5.3 Triaging workflow

1. Read the issue. If unclear, ask for repro steps.
2. Reproduce locally if it's a bug.
3. Apply labels (start with `triage`, then a category).
4. If it's a duplicate, close with a link to the original.
5. If it's out of scope, close with a reference to ROADMAP.md.
6. If it's a `good first issue`, add a comment with a hint at where to
   start.
7. Assign to a maintainer if it's high priority.

## 6. Pull request review

### 6.1 Reviewer assignment

- Default: round-robin among maintainers.
- For `docs/` PRs: any maintainer can approve.
- For `src/lib/tippen/` changes: requires a maintainer who knows the
  domain model.
- For theme token changes: requires a maintainer who knows the design
  system.

### 6.2 Review checklist

See [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md).
Reviewers should verify:

- [ ] CI is green.
- [ ] No hardcoded colors.
- [ ] Works in light and dark themes.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Adds a changelog entry.
- [ ] Updates docs for user-facing changes.
- [ ] No unrelated reformatting.

### 6.3 Merge strategy

- **Squash merge** for PRs with one logical commit.
- **Rebase merge** for PRs with multiple meaningful commits.
- **Never merge commits** — keeps history linear.

## 7. CI

See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). Today it
runs:

- `bun install --frozen-lockfile`
- `bun run lint` (ESLint)
- `bunx tsc --noEmit` (typecheck)
- `bun run build` (optional — `continue-on-error: true` until green on
  main)

When tests land (see [TESTING.md](./TESTING.md)), a `test` job is added:
unit, component, E2E, a11y.

## 8. Dependabot

See [`.github/dependabot.yml`](../.github/dependabot.yml).

- **npm** — weekly, Monday 06:00 PT. Max 10 open PRs. Grouped by ecosystem
  (react, next, radix, tailwind).
- **github-actions** — monthly.

Maintainer workflow:

1. Dependabot opens a PR.
2. CI runs.
3. If green and the change is a patch, merge.
4. If minor/major, review the changelog and update if needed.
5. If it breaks something, close with a comment and pin the old version.

## 9. Communication channels

| Channel | Purpose |
| --- | --- |
| **GitHub Issues** | Bugs, feature requests |
| **GitHub Discussions** | Questions, ideas, show & tell |
| **GitHub Security Advisories** | Private security reports |
| **Pull request comments** | Code review |
| **Email (`conduct@tippen.dev`)** | Code of Conduct reports |
| **Email (`security@tippen.dev`)** | Security reports (fallback) |

We do not run a Discord/Slack for the MVP. If the community grows, we'll
open a GitHub Discussion category "Show & Tell" first.

## 10. Code of Conduct enforcement

Reports go to `conduct@tippen.dev`. The enforcement ladder is in
[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) §"Enforcement Guidelines".
The maintainers who handle reports are listed in the repo's `.github/CODEOWNERS`
(planned). At least two maintainers review each report.

## 11. License & IP

Tippen is [MIT licensed](../LICENSE). Contributors retain their copyright
but grant it under MIT (see `LICENSE` — "Copyright (c) 2025 Tippen
Contributors").

We do **not** require a CLA. The MIT license is sufficient. If a
contributor's employer has an IP claim, that's between them and their
employer — we don't get involved.

## 12. Funding

Tippen has no funding today (`.github/FUNDING.yml` is intentionally
empty). If we add sponsorships:

- Funds go to a dedicated maintainer fund.
- Use is decided transparently in Discussions.
- Sponsors get priority on feature requests but **never** exclusive
  features (Tippen stays MIT).

## 13. Sunset policy

If Tippen ever stops being maintained:

- The repo stays public (MIT is irrevocable).
- A final release is cut with a `SUNSET.md` explaining the state.
- Issues and PRs are closed with a pointer to the sunset note.
- The domain (`tippen.dev`) is released or redirected to the repo.

We will not silently abandon the project. If we can't maintain it, we'll
say so.

## 14. See also

- [CONTRIBUTING.md](./CONTRIBUTING.md) — the contributor-facing counterpart
- [CHANGELOG.md](./CHANGELOG.md) — release history
- [ROADMAP.md](./ROADMAP.md) — what we're building
- [SECURITY.md](./SECURITY.md) — security disclosure
