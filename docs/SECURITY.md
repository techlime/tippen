# Security Policy

Tippen takes security seriously. This document explains how to report
vulnerabilities and what to expect in return.

## Reporting a vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, report them privately using one of these channels:

1. **GitHub Security Advisories** (preferred) —
   <https://github.com/tippen/tippen/security/advisories/new>. Select
   "Report a vulnerability" and fill in the template. This keeps the report
   private to maintainers.
2. **Email** — `security@tippen.dev` with a description, repro steps, and
   impact assessment. PGP key fingerprint:
   `9F12 3C4D 5E67 89A0 BC1D 2EF3 4567 89AB CDEF 0123` *(published once
   the project moves out of sandbox)*.

Please include:

- A clear description of the issue and its impact.
- Affected versions / commits.
- Steps to reproduce, including any proof-of-concept.
- Suggested fix, if you have one.
- Whether you'd like to be credited in the advisory.

## Response timeline

We aim to acknowledge reports within **48 hours** and to provide an initial
assessment within **5 business days**. The table below lists our targets:

| Step | Target |
| --- | --- |
| Acknowledge report | 48 hours |
| Initial assessment | 5 business days |
| Fix or mitigation | 30 days (severity-dependent) |
| Public advisory (CVE) | After a fix is released, or 90 days from report |

If you don't hear back within 5 business days, please follow up by email.

## Coordinated disclosure

We practice **coordinated disclosure**. We'll work with you to:

1. Confirm and triage the issue.
2. Develop and test a fix.
3. Agree on a publication date (typically the day after a release ships).
4. Credit you in the advisory and `CHANGELOG.md` (unless you prefer to
   remain anonymous).

We ask that you do not disclose the vulnerability publicly until a fix is
released, or until 90 days have passed since the report — whichever is
sooner.

## Scope

**In scope:**

- The Tippen web app (`src/app`, `src/components`, `src/hooks`, `src/stores`,
  `src/lib`).
- The planned Hono API (`server/api`) once it exists.
- The build and CI pipeline.

**Out of scope:**

- Vulnerabilities in third-party dependencies — report these upstream
  instead. We'll patch via Dependabot.
- Theoretical issues without a working proof of concept.
- Spam, social engineering, or physical attacks.
- Self-XSS or issues requiring the victim to paste malicious content.
- Bugs in the local development SQLite database (it has no sensitive data).

## Supported versions

Tippen is in early development (`0.x`). Only the latest minor release
receives security fixes.

| Version | Supported |
| --- | --- |
| 0.1.x | ✅ |
| < 0.1 | ❌ |

Once we reach `1.0`, we'll publish a longer support window per release line.

## Security best practices for contributors

- **Never commit secrets.** Use `.env.example` for placeholders only. Real
  keys go in `.env`, which is gitignored.
- **Don't `eval` user input.** The AI panel renders model output as text,
  not HTML. If you add a new AI action, sanitize before rendering.
- **Validate at the boundary.** Use Zod at every API entry point. The
  client-side store is not a security boundary.
- **Prefer parameterized queries.** Prisma (and, later, Drizzle) protect
  against SQL injection by default — don't bypass them with raw strings.
- **Don't add new dependencies without review.** Open an issue first if
  you're unsure.

## Acknowledgements

We thank everyone who reports security issues responsibly. Reported
vulnerabilities (after fix) will be listed in [CHANGELOG.md](./CHANGELOG.md)
under a `### Security` subsection, with credit to the reporter unless they
ask to remain anonymous.
