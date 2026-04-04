"use client";

import { GitBranch } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FlowOfLifePlanner } from "@/components/flow-of-life-planner";

export default function FlowPage() {
  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              Flow of Life
            </h1>
          </div>
          <p className="text-base text-muted-foreground mt-2 max-w-2xl">
            Map branches of your financial path, compare stable and risky outcomes, and preview how choices
            might feel over the next months or years. Illustrative only — not financial advice.
          </p>
        </section>

        <FlowOfLifePlanner />
      </div>
    </AppShell>
  );
}

