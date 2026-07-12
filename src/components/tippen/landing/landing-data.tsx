import type { Scene, AnimationPresetId, BackgroundId } from "@/lib/tippen/types";

/**
 * Landing page static content.
 * Kept in one place so the section components stay declarative.
 */

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: "Keyboard",
    title: "Typing animation",
    description:
      "Character-by-character reveal with adjustable characters-per-second and a blinking caret.",
  },
  {
    icon: "MousePointer2",
    title: "Cursor control",
    description:
      "Block, beam, or classic caret — choose the cursor that fits your scene's mood.",
  },
  {
    icon: "Mic",
    title: "Voice sync",
    description:
      "Attach narration and let Tippen align typing speed to spoken words automatically.",
  },
  {
    icon: "Music",
    title: "Music & ambience",
    description:
      "Layer ambient pads and score on the music track with per-clip gain control.",
  },
  {
    icon: "Volume2",
    title: "Keyboard sounds",
    description:
      "Per-keystroke SFX track so every reveal feels tactile and mechanical.",
  },
  {
    icon: "Layers",
    title: "Scene manager",
    description:
      "Compose your story from many scenes. Reorder, duplicate, and time them on the timeline.",
  },
  {
    icon: "GalleryHorizontalEnd",
    title: "Multi-track timeline",
    description:
      "Typing, cursor, voice, music, camera, highlights, SFX and transitions — nine tracks, one canvas.",
  },
  {
    icon: "Sparkles",
    title: "Animation editor",
    description:
      "Eleven built-in presets — typewriter, terminal, apple-intro, fade, blur, elastic and more.",
  },
  {
    icon: "SunMoon",
    title: "Theme switch",
    description:
      "Light, dark, and system themes with warm ember accents that look right in any mode.",
  },
  {
    icon: "Film",
    title: "Export to MP4",
    description:
      "Render a cinematic 1080p MP4 straight from your timeline. (Renderer is on the roadmap.)",
  },
];

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  scene: Scene;
}

function makeScene(
  id: string,
  name: string,
  background: BackgroundId,
  camera: Scene["camera"],
  content: string,
  preset: AnimationPresetId,
  cps: number,
  fontSize: number,
  highlights: Array<{ start: number; end: number }> = [],
): Scene {
  return {
    id,
    name,
    background,
    startMs: 0,
    durationMs: 2400,
    camera,
    lines: [
      {
        id: `${id}-line-1`,
        content,
        preset,
        cps,
        fontSize,
        align: "center",
        highlights,
      },
    ],
  };
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: "tpl-product",
    name: "Product Launch",
    description: "Slow, deliberate apple-intro reveal for headline moments.",
    scene: makeScene(
      "tpl-product",
      "Product Launch",
      "ink",
      "push-in",
      "Introducing Tippen",
      "apple-intro",
      9,
      44,
      [{ start: 0, end: 10 }],
    ),
  },
  {
    id: "tpl-cold-open",
    name: "Cold Open",
    description: "Classic typewriter cold open with a blinking caret.",
    scene: makeScene(
      "tpl-cold-open",
      "Cold Open",
      "noir",
      "static",
      "It was a dark and stormy night.",
      "typewriter",
      20,
      36,
    ),
  },
  {
    id: "tpl-manifesto",
    name: "Manifesto",
    description: "Bold fade-in manifesto with ember highlights.",
    scene: makeScene(
      "tpl-manifesto",
      "Manifesto",
      "ember",
      "pull-out",
      "We type. We sync. We render.",
      "fade",
      18,
      40,
      [{ start: 8, end: 14 }],
    ),
  },
  {
    id: "tpl-quote",
    name: "Quote Card",
    description: "Elegant zoom-in quote card for social posts.",
    scene: makeScene(
      "tpl-quote",
      "Quote Card",
      "midnight",
      "static",
      "\u201CStories are data with a soul.\u201D",
      "zoom",
      18,
      34,
    ),
  },
  {
    id: "tpl-terminal",
    name: "Terminal Log",
    description: "Fast monospace terminal typing for dev content.",
    scene: makeScene(
      "tpl-terminal",
      "Terminal Log",
      "noir",
      "static",
      "$ tippen render --cinematic",
      "terminal",
      42,
      30,
    ),
  },
  {
    id: "tpl-apple",
    name: "Apple-Style Intro",
    description: "The premium product-launch feel, ember on ink.",
    scene: makeScene(
      "tpl-apple",
      "Apple-Style Intro",
      "ink",
      "push-in",
      "Think different.",
      "apple-intro",
      8,
      48,
      [{ start: 0, end: 5 }],
    ),
  },
];

export interface AiFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export const AI_FEATURES: AiFeatureItem[] = [
  {
    icon: "Wand2",
    title: "Generate Intro",
    description:
      "Describe your story; Tippen drafts an opening scene with the right tone and pacing.",
  },
  {
    icon: "PenLine",
    title: "Rewrite Script",
    description:
      "Tighten, shorten, or restyle a line in place — your selection becomes the rewrite target.",
  },
  {
    icon: "Gauge",
    title: "Generate Typing Timing",
    description:
      "Auto-derive characters-per-second so reveals feel human, not robotic.",
  },
  {
    icon: "AudioLines",
    title: "Voice \u2192 Text",
    description:
      "Drop in narration audio and get a transcript ready to animate, line by line.",
  },
  {
    icon: "AlignCenter",
    title: "Word-Level Sync",
    description:
      "Per-word highlights follow the spoken audio, beat for beat.",
  },
  {
    icon: "Highlighter",
    title: "Auto Highlight",
    description:
      "Tippen picks the most emphatic word in each line and paints it ember.",
  },
  {
    icon: "Lightbulb",
    title: "Scene Suggestions",
    description:
      "Stuck? Get next-scene ideas that fit the arc you have already built.",
  },
  {
    icon: "History",
    title: "Prompt History",
    description:
      "Every AI prompt and result is saved, so you can roll back or re-apply.",
  },
];

export interface StepItem {
  icon: string;
  title: string;
  description: string;
}

export const HOW_IT_WORKS: StepItem[] = [
  {
    icon: "PenLine",
    title: "Write your script",
    description:
      "Type your story line by line. Each line becomes a beat on the cinematic canvas.",
  },
  {
    icon: "SlidersHorizontal",
    title: "Pick animation & voice",
    description:
      "Choose a reveal preset, set characters-per-second, and attach narration or music.",
  },
  {
    icon: "GalleryHorizontalEnd",
    title: "Arrange on timeline",
    description:
      "Drag clips across nine tracks. Camera moves, highlights, SFX — all on the same clock.",
  },
  {
    icon: "Film",
    title: "Export cinematic MP4",
    description:
      "Render a 1080p MP4 with grain, camera moves, and synced audio baked in.",
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: "What is Tippen?",
    a: "Tippen is an AI-powered cinematic text storytelling editor. You write text, pick how it should be revealed, arrange scenes on a multi-track timeline, and render a cinematic video. It is not a video editor and it is not a generic typewriter generator — it is a focused tool for turning text into film.",
  },
  {
    q: "Is Tippen free and open source?",
    a: "Yes. Tippen is MIT-licensed and built in the open. You can read the source, run it locally, and contribute back. A hosted cloud version is planned for later.",
  },
  {
    q: "Do I need a GPU?",
    a: "No. Tippen's animation engine runs on the CPU in your browser using requestAnimationFrame. There is no ML inference required for the editor itself — AI features are optional and run on the server side.",
  },
  {
    q: "Can I export an MP4?",
    a: "The MP4 exporter is on the ROADMAP. Today you can play back the cinematic stage in real time and share projects as JSON. Frame-accurate MP4 export is the next major milestone.",
  },
  {
    q: "What about audio — voice and music?",
    a: "Tippen has dedicated voice and music tracks on the timeline with per-clip gain. You can attach narration, auto-transcribe it, and sync typing speed to spoken words. Multi-track mixing is already supported.",
  },
  {
    q: "Is there real-time collaboration?",
    a: "Real-time multiplayer collaboration is on the ROADMAP and will arrive after MP4 export. Today, projects are single-user but import/export as JSON so teams can version and hand off files.",
  },
  {
    q: "Can I self-host Tippen?",
    a: "Absolutely. Tippen is a standard Next.js app. Clone the repository, install dependencies, and run it locally or on any Node host. No proprietary services are required for the core editor.",
  },
  {
    q: "Which AI model powers the assistant?",
    a: "Tippen's AI features (generate intro, rewrite, timing, auto-highlight) are designed to be model-agnostic. The reference implementation uses the z-ai-web-dev-sdk. You can swap providers without changing the editor.",
  },
];
