import type { AnimationPreset, AnimationPresetId } from "./types";

/**
 * TIPPEN — Animation preset registry
 *
 * Reusable, declarative animation presets. Each preset describes how a line
 * of text is revealed on the cinematic canvas. The registry is extensible —
 * new presets can be added without touching the editor internals.
 *
 * Presets are split into two families:
 *  - Typewriter family: reveal character-by-character (cps controlled)
 *  - Reveal family: reveal the whole line with a transform (durationMs)
 */
export const ANIMATION_PRESETS: Record<AnimationPresetId, AnimationPreset> = {
  typewriter: {
    id: "typewriter",
    name: "Typewriter",
    description: "Classic character-by-character reveal with a blinking caret.",
    cps: 18,
    cursor: true,
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    description: "Fast monospace terminal-style typing with block cursor.",
    cps: 42,
    cursor: true,
  },
  "apple-intro": {
    id: "apple-intro",
    name: "Apple Intro",
    description: "Slow, deliberate reveal — premium product launch feel.",
    cps: 9,
    cursor: true,
  },
  fade: {
    id: "fade",
    name: "Fade",
    description: "Whole line fades in softly.",
    durationMs: 700,
    cursor: false,
  },
  slide: {
    id: "slide",
    name: "Slide",
    description: "Line slides up into place with a soft fade.",
    durationMs: 600,
    cursor: false,
  },
  zoom: {
    id: "zoom",
    name: "Zoom",
    description: "Line scales from 0.96 to 1 with a fade.",
    durationMs: 650,
    cursor: false,
  },
  blur: {
    id: "blur",
    name: "Blur",
    description: "Line de-blurs into focus.",
    durationMs: 750,
    cursor: false,
  },
  highlight: {
    id: "highlight",
    name: "Highlight",
    description: "Ember highlight sweeps across the line as it appears.",
    cps: 22,
    cursor: false,
  },
  "cursor-blink": {
    id: "cursor-blink",
    name: "Cursor Blink",
    description: "Idle blinking cursor — ambient scene filler.",
    durationMs: 1200,
    cursor: true,
  },
  elastic: {
    id: "elastic",
    name: "Elastic",
    description: "Springy entrance with a subtle overshoot.",
    durationMs: 700,
    cursor: false,
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Instant appear — no motion, just presence.",
    durationMs: 0,
    cursor: false,
  },
};

export const PRESET_ORDER: AnimationPresetId[] = [
  "typewriter",
  "terminal",
  "apple-intro",
  "fade",
  "slide",
  "zoom",
  "blur",
  "highlight",
  "cursor-blink",
  "elastic",
  "minimal",
];

export function getPreset(id: AnimationPresetId): AnimationPreset {
  return ANIMATION_PRESETS[id] ?? ANIMATION_PRESETS.typewriter;
}

/** True for presets that reveal character-by-character. */
export function isTypewriterPreset(id: AnimationPresetId): boolean {
  return ["typewriter", "terminal", "apple-intro", "highlight"].includes(id);
}
