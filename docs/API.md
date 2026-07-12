# API

> Tippen's HTTP surface today (MVP) and the planned Hono API.

The MVP exposes a single in-app route handler. The production API (planned)
will be a Hono server with routes for projects, auth, renders, and an AI
proxy. This document covers both.

---

## 1. MVP API (Next.js route handlers)

### `POST /api/tippen/ai`

The editor's AI panel calls this endpoint to run an AI action against the
current project state.

#### Request

```http
POST /api/tippen/ai HTTP/1.1
Content-Type: application/json

{
  "action": "generate-intro",
  "prompt": "A 6-word cinematic intro for a fintech launch",
  "context": {
    "projectTitle": "Untitled Cinematic",
    "sceneName": "Cold Open",
    "lineContent": "",
    "locale": "en"
  }
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | ✅ | One of the AI action IDs (see [AI.md](./AI.md)) |
| `prompt` | `string` | ✅ | The user's natural-language prompt |
| `context.projectTitle` | `string` | | Current project title |
| `context.sceneName` | `string` | | Selected scene name |
| `context.lineContent` | `string` | | Selected line content (for rewrite / timing) |
| `context.locale` | `string` | | BCP-47 language tag, default `en` |

#### Response (200)

```json
{
  "action": "generate-intro",
  "result": "Every ledger begins with a single entry.",
  "model": "openai/gpt-4o-mini",
  "tokensIn": 142,
  "tokensOut": 9,
  "createdAt": 1731000000000
}
```

#### Response (400 — bad request)

```json
{
  "error": "INVALID_ACTION",
  "message": "Unknown action 'foo'. See docs/AI.md for the list.",
  "actions": [
    "generate-intro",
    "rewrite-script",
    "generate-timing",
    "voice-to-text",
    "word-sync",
    "auto-highlight",
    "scene-suggestions"
  ]
}
```

#### Response (503 — no provider configured)

```json
{
  "error": "NO_PROVIDER",
  "message": "Set OPENROUTER_API_KEY or GEMINI_API_KEY to enable AI actions."
}
```

#### cURL example

```bash
curl -X POST http://localhost:3000/api/tippen/ai \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate-intro",
    "prompt": "A 6-word cinematic intro for a fintech launch",
    "context": { "projectTitle": "Untitled Cinematic" }
  }'
```

### `GET /api`

A health-check endpoint. Returns `{ "message": "Hello, world!" }`. Used by
CI to verify the route handlers compile.

---

## 2. AI action IDs

These are the supported `action` values for `/api/tippen/ai`. See
[AI.md](./AI.md) for what each action does and how to add a new one.

| Action ID | Description |
| --- | --- |
| `generate-intro` | Write a new cinematic intro line for the selected scene |
| `rewrite-script` | Rewrite the currently selected line's content |
| `generate-timing` | Suggest `cps` values per line based on desired pacing |
| `voice-to-text` | Transcribe an uploaded voice clip (WhisperX, planned) |
| `word-sync` | Compute word-level timestamps for word-level typing sync |
| `auto-highlight` | Pick which words to highlight in each line |
| `scene-suggestions` | Suggest the next scene given the current sequence |

---

## 3. Planned Hono API

When the backend lands, the API moves to `server/api` (see
[ARCHITECTURE.md](./ARCHITECTURE.md)). All routes are JSON over HTTPS,
versioned under `/v1`.

### 3.1 Auth — Better Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/v1/auth/signup` | Email + password signup |
| `POST` | `/v1/auth/signin` | Sign in |
| `POST` | `/v1/auth/magic-link` | Request a magic-link email |
| `POST` | `/v1/auth/signout` | Sign out |
| `GET`  | `/v1/auth/session` | Current session |

### 3.2 Projects

| Method | Path | Description |
| --- | --- | --- |
| `GET`    | `/v1/projects` | List the signed-in user's projects |
| `POST`   | `/v1/projects` | Create a project |
| `GET`    | `/v1/projects/:id` | Fetch a project |
| `PATCH`  | `/v1/projects/:id` | Update project settings |
| `DELETE` | `/v1/projects/:id` | Delete a project |
| `POST`   | `/v1/projects/:id/duplicate` | Duplicate a project |

A project body matches the `TippenProject` shape from
`src/lib/tippen/types.ts`:

```json
{
  "id": "project-uuid",
  "settings": { "title": "Untitled", "width": 1920, "height": 1080, "fps": 30, "durationMs": 12800, "background": "ink" },
  "scenes": [ /* … */ ],
  "tracks": [ /* … */ ],
  "createdAt": 1731000000000,
  "updatedAt": 1731000000000
}
```

### 3.3 Renders

| Method | Path | Description |
| --- | --- | --- |
| `POST`   | `/v1/renders` | Queue a render (`{ projectId, format: "mp4"|"gif", fps }`) |
| `GET`    | `/v1/renders/:id` | Poll render status (`pending` / `rendering` / `done` / `failed`) |
| `GET`    | `/v1/renders/:id/download` | Redirect to a signed R2 URL (when `done`) |
| `DELETE` | `/v1/renders/:id` | Cancel / delete a render |

### 3.4 AI proxy

Same shape as the MVP `/api/tippen/ai` endpoint, but at
`POST /v1/ai/actions` and authenticated. The server stores the
`PromptHistoryEntry` in Postgres so it syncs across sessions.

### 3.5 Assets (R2)

| Method | Path | Description |
| --- | --- | --- |
| `POST`   | `/v1/assets/voice` | Upload a voice clip → returns an R2 key |
| `POST`   | `/v1/assets/music` | Upload a music track → returns an R2 key |
| `GET`    | `/v1/assets/:key` | Redirect to a signed R2 URL |

### 3.6 Example: create a project (planned)

```bash
curl -X POST https://api.tippen.dev/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @project.json
```

Response:

```json
{ "id": "prj_01HFZ…", "createdAt": 1731000000000 }
```

---

## 4. Errors

All errors use a consistent envelope:

```json
{
  "error": "MACHINE_CODE",
  "message": "Human-readable description.",
  "details": { /* optional, action-specific */ }
}
```

| HTTP | `error` | When |
| --- | --- | --- |
| 400 | `INVALID_ACTION` | Unknown AI action ID |
| 400 | `VALIDATION_ERROR` | Zod validation failed (includes `details.field`) |
| 401 | `UNAUTHORIZED` | Missing or invalid session |
| 403 | `FORBIDDEN` | Session valid but not allowed on this resource |
| 404 | `NOT_FOUND` | Project / render / asset not found |
| 409 | `CONFLICT` | E.g. duplicate project title |
| 422 | `UNPROCESSABLE` | Action ran but produced no usable output |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 500 | `INTERNAL` | Unhandled server error (logged with a request ID) |
| 503 | `NO_PROVIDER` | No AI provider configured for this action |

## 5. Rate limiting (planned)

- Anonymous: 10 requests / hour per IP.
- Authenticated: 100 requests / hour per user.
- Renders: 5 concurrent per user.

Returned via standard `RateLimit-*` headers.

## 6. Versioning

- `/v1/*` is the first stable API. We will not break it without a deprecation
  period.
- Breaking changes ship under `/v2/*` with at least 6 months of overlap.
- The MVP endpoint (`/api/tippen/ai`) is **unversioned** and may change
  without notice until 1.0.
