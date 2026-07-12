"use client";

import * as React from "react";
import { Github, Twitter } from "lucide-react";
import { TippenLogo } from "@/components/tippen/tippen-logo";
import { useEditorStore } from "@/stores/editor-store";

type FooterColumn = {
  title: string;
  links: Array<{ label: string; href: string; action?: () => void }>;
};

export function LandingFooter() {
  const openEditor = useEditorStore((s) => s.openEditor);

  const columns: FooterColumn[] = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Templates", href: "#templates" },
        { label: "AI", href: "#ai" },
        { label: "Editor", href: "#top", action: openEditor },
        { label: "Timeline", href: "#screenshots" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "#faq" },
        { label: "Architecture", href: "#faq" },
        { label: "Roadmap", href: "#faq" },
        { label: "Contributing", href: "https://github.com" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "GitHub", href: "https://github.com" },
        { label: "Discussions", href: "https://github.com" },
        { label: "Issues", href: "https://github.com" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "License (MIT)", href: "https://github.com" },
        { label: "Security", href: "https://github.com" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand block */}
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-2">
            <TippenLogo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              An AI-powered cinematic text storytelling editor. Type a script,
              render a film.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:border-ember/30 hover:text-foreground"
              >
                <Github className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Twitter / X"
                className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:border-ember/30 hover:text-foreground"
              >
                <Twitter className="size-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav
              key={col.title}
              aria-label={col.title}
              className="flex flex-col gap-3"
            >
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.action ? (
                      <button
                        onClick={link.action}
                        className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2025 Tippen. MIT License.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Made for storytellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
