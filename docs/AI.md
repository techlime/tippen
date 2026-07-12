# AI Layer

> How Tippen's AI actions work, which providers are supported, and how to
> add a new action or provider.

Tippen's AI layer is intentionally **action-oriented**, not chat-oriented.
Instead of exposing a raw chat box, the editor offers discrete actions that
map directly onto editor operations (write an intro, rewrite a line, suggest
timing, etc.). This keeps results reviewable, undoable, and auditable.

---

## 1. Actions

All actions live in `AiActionId` (see `src/lib/tippen/types.ts`):

```ts
export type AiActionId =
  | "generate-intro"
  | "rewrite-script"
  | "generate-timing"
  | "voice-to-text"
  | "word-sync"
  | "auto-highlight"
  | "scene-suggestions";
```

| Action | Input | Output | Applied to |
| --- | --- | --- | --- |
| `generate-intro` | Prompt + scene context | A new cinematic intro line (string) | Currently selected line's `content` |
| `rewrite-script` | Prompt + selected line | Rewritten line content (string) | Currently selected line's `content` |
| `generate-timing` | Prompt + scene lines | Per-line `cps` suggestion (JSON) | Each line's `cps` field |
| `voice-to-text` | Audio asset key | Transcript (string + word timestamps) | A new line per sentence |
| `word-sync` | Audio asset key + line content | Per-word timestamps (JSON) | Hidden sync metadata (planned) |
| `auto-highlight` | Scene lines | Per-line highlight ranges | Each line's `highlights` array |
| `scene-suggestions` | Current scene list | Suggested next scene (name + first line) | A preview card; user clicks to add |

Every action's result is funneled through `applyAiResult(action, result)` on
the Zustand store, which writes the change to project state **and** pushes
a history snapshot — so AI edits are undoable with `⌘Z`.

## 2. Prompt history

Every action is logged to `promptHistory` in the store:

```ts
interface PromptHistoryEntry {
  id: string;
  action: AiActionId;
  prompt: string;
  result: string;
  createdAt: number;
}
```

The history is capped at 50 entries (client-side). On the planned Hono API,
these are persisted to Postgres so they sync across sessions. The AI panel
shows the history with re-apply / copy / delete actions.

## 3. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Editor (browser) — Zustand store                              │
│   aiBusy: boolean, promptHistory: PromptHistoryEntry[]        │
└───────────┬──────────────────────────────────────────────────┘
            │ user clicks an action
            ▼
┌──────────────────────────────────────────────────────────────┐
│ aiActions registry (planned packages/ai)                     │
│   action → { promptTemplate, schema, apply }                 │
└───────────┬──────────────────────────────────────────────────┘
            │ POST /api/tippen/ai (MVP) or /v1/ai/actions (planned)
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Provider router (server)                                     │
│   OpenRouter • Gemini • WhisperX • HuggingFace • Kokoro TTS  │
└───────────┬──────────────────────────────────────────────────┘
            │ response
            ▼
┌──────────────────────────────────────────────────────────────┐
│ applyAiResult(action, result) → store updates + history      │
└──────────────────────────────────────────────────────────────┘
```

## 4. Providers

Tippen is provider-agnostic. Each action maps to one or more providers; the
server picks the first that's configured.

| Provider | Used for | Env var |
| --- | --- | --- |
| **OpenRouter** | Text actions (`generate-intro`, `rewrite-script`, `scene-suggestions`) | `OPENROUTER_API_KEY` |
| **Gemini** | Text actions + structured outputs (`auto-highlight`, `generate-timing`) | `GEMINI_API_KEY` |
| **WhisperX** *(planned)* | `voice-to-text`, `word-sync` (word-level alignment) | `HUGGINGFACE_TOKEN` |
| **HuggingFace** *(planned)* | Alternative STT + classification | `HUGGINGFACE_TOKEN` |
| **Kokoro TTS** *(planned)* | Optional TTS preview of the script | `KOKORO_TTS_ENDPOINT` |

In the MVP, when **no provider is configured**, the panel shows a friendly
"AI disabled — set `OPENROUTER_API_KEY` or `GEMINI_API_KEY`" message and
the actions are disabled. The rest of the editor is fully functional.

## 5. Extendable architecture

The MVP keeps the action list in `types.ts` and the apply logic in
`applyAiResult()` on the store. The planned `packages/ai` package will turn
this into a proper **registry**:

```ts
// packages/ai/src/registry.ts (planned)
export interface AiAction<P = unknown, R = unknown> {
  id: AiActionId;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Build the system + user prompt from editor context. */
  buildPrompt(ctx: AiContext): { system: string; user: string };
  /** Validate the provider's raw output. */
  schema: z.ZodType<R>;
  /** Apply the parsed result to the project. Returns a partial patch. */
  apply(ctx: AiContext, result: R): ProjectPatch;
  /** Which providers can serve this action. */
  providers: ProviderId[];
}
```

To register an action, you call `registerAction(myAction)`. To run an
action, the UI calls `runAction(id, ctx)`, which routes through the
provider router and applies the result via the store.

## 6. Adding a new AI action

1. **Add the ID.** Extend `AiActionId` in `src/lib/tippen/types.ts`.
2. **Add the prompt template.** Describe inputs and outputs in
   `src/lib/tippen/ai/<action>.prompt.ts` (planned) — keep prompts short,
   deterministic, and ask for structured output (JSON) when possible.
3. **Define a Zod schema.** This validates the provider's output before
   `apply()` runs.
4. **Write the apply function.** Return a partial `TippenProject` patch.
   Never mutate the store directly — the registry hands the patch to the
   store, which pushes a history snapshot.
5. **Register the action.** Add it to the registry (planned) and to the
   AI panel UI (`src/components/tippen/editor/ai-panel.tsx`).
6. **Document it.** Add a row to the table in §1 above and in
   [CHANGELOG.md](./CHANGELOG.md).
7. **Test the degrade path.** Verify the editor still works when no
   provider is configured.

## 7. Prompt engineering guidelines

Tippen AI prompts follow a few rules:

- **Be specific about the output format.** If you need JSON, give the
  schema in the prompt and ask for a single JSON object.
- **Constrain length.** Cinematic lines are short. Cap intros at ~12 words.
- **Use the scene context.** Pass `projectTitle`, `sceneName`, and
  existing line content. Don't make the AI guess.
- **Avoid chatbots.** No "As an AI…", no "Sure, here's…". Ask for the raw
  artifact only.
- **Fail gracefully.** If the output doesn't validate, show an error toast
  and **don't** apply a partial result.
- **Don't trust the model with destructive operations.** `applyAiResult`
  always writes to history — undo is always available.
- **Respect locale.** Pass `context.locale` and instruct the model to
  respond in that language.

### Example prompt (generate-intro)

```
SYSTEM:
You are a cinematic scriptwriter for short-form video. You write single
lines of text — never dialogue, never sentences longer than 12 words.
You respond with a single line of plain text. No quotes, no commentary.

USER:
Project: {{projectTitle}}
Scene: {{sceneName}}
Goal: {{prompt}}

Write one cinematic intro line (≤ 12 words) in {{locale}}.
```

## 8. Privacy

- The MVP sends only the prompt and the immediate context (project title,
  scene name, selected line content) — never the full project.
- The planned Hono API will redact voice/audio content to text-only before
  sending to a provider, unless the action explicitly needs audio
  (`voice-to-text`, `word-sync`).
- Provider keys are server-side only. The browser never sees them.
- We will never train on user content. (OpenRouter and Gemini's default
  policies apply; users can disable training on their provider accounts.)

## 9. Cost control

- Default models: `openai/gpt-4o-mini` (OpenRouter) and `gemini-1.5-flash`.
- Hard cap per action: 1,000 input tokens, 500 output tokens.
- The server logs `tokensIn` / `tokensOut` per request (visible in the
  response and in the planned admin dashboard).
- Rate limits are described in [API.md](./API.md) §5.

## 10. See also

- [API.md](./API.md) — HTTP shape of AI requests
- [EDITOR.md](./EDITOR.md) — where the AI panel sits in the UI
- [ROADMAP.md](./ROADMAP.md) — when each action ships for real
