"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading, SectionShell, Reveal } from "./landing-motion";
import { FAQS } from "./landing-data";

export function LandingFAQ() {
  return (
    <SectionShell
      id="faq"
      className="border-y border-border/40 bg-muted/20"
    >
      <SectionHeading
        eyebrow="FAQ"
        title={
          <>
            Questions, <span className="text-gradient-ember">answered.</span>
          </>
        }
        description="Everything you might want to know before you start typing."
      />

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl">
        <Accordion
          type="single"
          collapsible
          defaultValue="faq-0"
          className="rounded-2xl border border-border/60 bg-card px-5 shadow-sm"
        >
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${i}`}
              className={i === FAQS.length - 1 ? "border-b-0" : ""}
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </SectionShell>
  );
}
