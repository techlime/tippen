import { NextResponse } from "next/server";
import type { AiActionId } from "@/lib/tippen/types";

/**
 * TIPPEN — AI endpoint
 *
 * POST /api/tippen/ai
 * Body: { action: AiActionId, prompt: string, context?: string }
 * Returns: { result: string }
 *
 * Uses z-ai-web-dev-sdk (server-only). If the SDK call fails for any reason
 * (missing config, network, model error), falls back to a deterministic
 * locally-generated result so the editor UX never breaks.
 */

export const runtime = "nodejs";

interface RequestBody {
  action: AiActionId;
  prompt: string;
  context?: string;
}

const SYSTEM_PROMPTS: Record<AiActionId, string> = {
  "generate-intro":
    "You are a cinematic copywriter. Write a single punchy line (max 12 words) for a cinematic text video intro based on the user's topic. Return ONLY the line, no quotes.",
  "rewrite-script":
    "Rewrite the given text as a more cinematic, punchy single line. Keep it under 14 words. Return ONLY the rewritten line.",
  "generate-timing":
    "You are a timing designer. Suggest cps (characters per second) for cinematic typing. Return ONLY a number between 8 and 30.",
  "voice-to-text":
    "Transcribe the audio description into clean narration text. Return ONLY the transcribed text.",
  "word-sync":
    "Suggest word-level sync timing for the given line. Return ONLY a brief description.",
  "auto-highlight":
    "Identify the most important word in the given line for emphasis. Return ONLY that word.",
  "scene-suggestions":
    "Return exactly 3 short cinematic scene names for the user's topic, one per line, no numbering, no quotes.",
};

/** Deterministic local fallbacks used when the SDK is unavailable. */
function localFallback(action: AiActionId, prompt: string): string {
  const topic = (prompt || "").trim();
  switch (action) {
    case "generate-intro":
      if (topic) {
        // Cap to ~10 words, lowercase, keep it punchy.
        const words = topic.split(/\s+/).slice(0, 10).join(" ");
        return `It started with ${words.toLowerCase()}.`;
      }
      return "It started with a single line.";
    case "rewrite-script": {
      const cleaned = (topic || "Every story begins with a single keystroke.")
        .replace(/[.!?]+$/g, "")
        .trim();
      return cleaned.endsWith(".") ? cleaned : `${cleaned}.`;
    }
    case "generate-timing":
      return "16";
    case "voice-to-text":
      return "Welcome to Tippen — where typing becomes cinema.";
    case "word-sync":
      return "Aligned to keystroke onsets at 16 cps.";
    case "auto-highlight":
      if (!topic) return "story";
      return topic.split(/\s+/).sort((a, b) => b.length - a.length)[0] ?? topic;
    case "scene-suggestions":
      return ["Cold Open", "The Premise", "The Reveal"].join("\n");
    default:
      return "Done.";
  }
}

function truncate(s: string, max = 240): string {
  const clean = s.trim().replace(/^["'`]+|["'`]+$/g, "").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { action, prompt = "", context } = body ?? {};
  if (!action) {
    return NextResponse.json({ error: "Missing action." }, { status: 400 });
  }

  // Small artificial delay so the UI loading state is visible.
  await new Promise((r) => setTimeout(r, 350 + Math.random() * 150));

  let result = "";
  let usedFallback = false;

  try {
    // Dynamically import so a missing/failed SDK never crashes the route.
    const ZAIModule = await import("z-ai-web-dev-sdk");
    const ZAI = (ZAIModule as unknown as {
      default: { create: () => Promise<unknown> };
    }).default;
    const zai = await ZAI.create();

    const system = SYSTEM_PROMPTS[action] ?? SYSTEM_PROMPTS["generate-intro"];
    const userContent =
      action === "rewrite-script" || action === "auto-highlight"
        ? context || prompt
        : prompt || context || "";

    const completion = await (
      zai as {
        chat: {
          completions: {
            create: (b: unknown) => Promise<{
              choices?: Array<{ message?: { content?: string } }>;
            }>;
          };
        };
      }
    ).chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent || "Tippen" },
      ],
    } as {
      messages: { role: "system" | "user"; content: string }[];
    });

    const raw = completion?.choices?.[0]?.message?.content?.trim() ?? "";
    if (raw) {
      result = truncate(raw);
    } else {
      result = localFallback(action, prompt);
      usedFallback = true;
    }
  } catch {
    result = localFallback(action, prompt);
    usedFallback = true;
  }

  return NextResponse.json({
    result,
    fallback: usedFallback,
    action,
  });
}
