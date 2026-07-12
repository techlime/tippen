"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { TippenLogo } from "@/components/tippen/tippen-logo";
import { ThemeToggle } from "@/components/tippen/theme-toggle";
import { useEditorStore } from "@/stores/editor-store";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "AI", href: "#ai" },
  { label: "How it Works", href: "#how" },
  { label: "FAQ", href: "#faq" },
] as const;

export function LandingNavbar() {
  const openEditor = useEditorStore((s) => s.openEditor);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-transparent bg-background/0",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left — logo */}
        <a
          href="#top"
          className="flex items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Tippen home"
        >
          <TippenLogo />
        </a>

        {/* Center — nav links (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </Button>
          <Button
            size="sm"
            onClick={openEditor}
            className="bg-ember text-ember-foreground shadow-sm hover:bg-ember/90"
          >
            <Sparkles className="size-4" />
            Start Creating
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle asChild>
                  <span>
                    <TippenLogo />
                  </span>
                </SheetTitle>
              </SheetHeader>
              <AnimatePresence>
                {mobileOpen && (
                  <motion.nav
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1 px-4"
                  >
                    {NAV_LINKS.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <a
                          href={link.href}
                          className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          {link.label}
                        </a>
                      </SheetClose>
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full"
                >
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Github className="size-4" />
                    GitHub
                  </a>
                </Button>
                <SheetClose asChild>
                  <Button
                    size="sm"
                    onClick={openEditor}
                    className="w-full bg-ember text-ember-foreground hover:bg-ember/90"
                  >
                    <Sparkles className="size-4" />
                    Start Creating
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
