"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  AlertTriangle, BookOpen, GitBranch, Umbrella,
  Lightbulb, ChevronRight, HelpCircle, TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Breakdown = {
  savings: number;
  insurance: number;
  awareness: number;
};

const SCORE_WHY: Record<"Savings" | "Insurance" | "Awareness", string> = {
  Savings:
    "Points from your answer about covering a $500 surprise: yes is strongest, maybe is partial, no is lowest.",
  Insurance:
    "Up to 5 points per insurance type you said you have (auto, renters, health, life, etc.), with a bonus when you have several kinds of coverage.",
  Awareness:
    "Points when you use crisis flows, the budget tool, benefits page, and other awareness-building parts of the app (up to 50).",
};

// Monochrome + yellow theme: dark → gray → yellow hierarchy
const CATEGORY_COLORS: Record<
  "Savings" | "Insurance" | "Awareness",
  { bar: string; dot: string }
> = {
  Savings:   { bar: "bg-[#1A1A1A] dark:bg-gray-200", dot: "bg-[#1A1A1A] dark:bg-gray-200" },
  Insurance: { bar: "bg-gray-500 dark:bg-gray-400",  dot: "bg-gray-500 dark:bg-gray-400" },
  Awareness: { bar: "bg-[#F5C518]",                  dot: "bg-[#F5C518]" },
};

function scoreColor(pct: number) {
  if (pct < 30) return "#ef4444";
  if (pct < 55) return "#f59e0b";
  return "#F5C518"; // yellow accent for building & resilient
}

function scoreLabel(score: number) {
  if (score < 30) return "At Risk";
  if (score < 55) return "Developing";
  if (score < 75) return "Building";
  return "Resilient";
}

function ReadinessRing({ score, breakdown }: { score: number; breakdown: Breakdown }) {
  const radius = 84;
  const stroke = 10;
  const r = radius - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  const rows = [
    { label: "Savings" as const,   value: breakdown.savings,   max: 25 },
    { label: "Insurance" as const, value: breakdown.insurance, max: 25 },
    { label: "Awareness" as const, value: breakdown.awareness, max: 50 },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Ring */}
      <div className="relative flex items-center justify-center">
        <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
          <circle
            cx={radius} cy={radius} r={r}
            fill="none" stroke="currentColor" strokeWidth={stroke}
            className="text-border"
          />
          <circle
            cx={radius} cy={radius} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius} ${radius})`}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-light leading-none tabular-nums"
            style={{ color }}
          >
            {score}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest mt-2 px-2.5 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}22` }}
          >
            {scoreLabel(score)}
          </span>
        </div>
      </div>

      {/* Breakdown bars — pill-shaped, monochrome + yellow */}
      <div className="w-full flex flex-col gap-2.5">
        {rows.map(({ label, value, max }) => {
          const pct = Math.round((value / max) * 100);
          const colors = CATEGORY_COLORS[label];
          return (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground items-center">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {label}
                  <Popover>
                    <PopoverTrigger
                      className="inline-flex rounded-md p-0.5 text-muted-foreground/50 hover:text-foreground"
                      aria-label={`Why ${label}`}
                    >
                      <HelpCircle className="h-3 w-3" />
                    </PopoverTrigger>
                    <PopoverContent className="text-xs w-72">
                      {SCORE_WHY[label]}
                    </PopoverContent>
                  </Popover>
                </span>
                <span className="tabular-nums font-semibold text-foreground">{value} / {max}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors.bar}`}
                  style={{ width: `${pct}%`, transition: "width 0.7s ease" }}
                  role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Dark card crisis CTA — #1A1A1A background, yellow accent
function CrisisCTA() {
  return (
    <Link
      href="/crisis"
      className="block w-full group rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518]"
    >
      <div className="flex items-center gap-3 w-full rounded-[10px] px-4 py-3 bg-[#1A1A1A] dark:bg-[#111] group-hover:bg-[#242424] transition-all">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 shrink-0">
          <AlertTriangle className="h-4 w-4 text-[#F5C518]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{"I'm in a crisis right now"}</p>
          <p className="text-xs text-gray-400 mt-0.5">Get step-by-step help immediately</p>
        </div>
        <ChevronRight className="h-4 w-4 text-[#F5C518] shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

// Alternating dark / yellow icon backgrounds
const ACTIONS = [
  {
    icon: Umbrella,
    label: "Review your insurance coverage",
    sub: "You may be under-insured",
    href: "/budget",
    iconBg: "bg-[#1A1A1A] dark:bg-white/10",
    iconColor: "text-white",
  },
  {
    icon: GitBranch,
    label: "Try the Flow of Life planner",
    sub: "Map branches of your financial path",
    href: "/flow",
    iconBg: "bg-[#F5C518]",
    iconColor: "text-[#1A1A1A]",
  },
  {
    icon: BookOpen,
    label: "Complete a financial literacy module",
    sub: "Build your awareness score",
    href: "/buddy",
    iconBg: "bg-[#1A1A1A] dark:bg-white/10",
    iconColor: "text-white",
  },
  {
    icon: Lightbulb,
    label: "Set up an emergency fund goal",
    sub: "Even $20/month helps",
    href: "/budget",
    iconBg: "bg-[#F5C518]",
    iconColor: "text-[#1A1A1A]",
  },
] as const;

function ActionItems() {
  return (
    <section className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-4 w-4 text-[#B8940E]" />
        <h2 className="text-sm font-bold text-foreground tracking-tight">Improve your score</h2>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {ACTIONS.map(({ icon: Icon, label, sub, href, iconBg, iconColor }) => (
          <Link key={label} href={href} className="block group">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-card border border-border
                         shadow-[0_1px_4px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                         transition-all duration-200"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ScoreCardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="flex justify-center">
        <div className="w-42 h-42 rounded-full bg-muted" />
      </div>
      <div className="space-y-3.5 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/6" />
            </div>
            <div className="h-2.5 bg-muted rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0];
  const [status, setStatus] = useState<"loading" | "error" | "no-profile" | "ready">("loading");
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState<Breakdown>({
    savings: 0, insurance: 0, awareness: 0,
  });

  const loadScore = useCallback(async () => {
    if (typeof window === "undefined") return;
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    if (!deviceId) { setStatus("no-profile"); return; }
    setStatus("loading");
    const hasUsedBudget = localStorage.getItem("shockplan_used_budget") === "1";
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId, hasUsedBudget,
          hasCompletedCrisisFlow: false,
          hasVisitedBenefits: false,
        }),
      });
      if (res.status === 404) { setStatus("no-profile"); return; }
      if (!res.ok) { setStatus("error"); return; }
      const data = (await res.json()) as { score?: number; breakdown?: Breakdown };
      setScore(typeof data.score === "number" ? data.score : 0);
      setBreakdown(data.breakdown ?? { savings: 0, insurance: 0, awareness: 0 });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { void loadScore(); }, [loadScore]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadScore();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadScore]);

  return (
    <AppShell>
      {/* Page wrapper with subtle yellow radial tint (top-right, like reference) */}
      <div className="relative w-full min-h-screen">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div
            className="absolute top-0 right-0 w-2/3 h-2/3 opacity-50 dark:opacity-10"
            style={{ background: "radial-gradient(ellipse at top right, #FEFAE8 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-6 pt-6 lg:pt-8">

          {/* ── Header ── */}
          <section className="mb-5">
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground">
              {firstName ? `Welcome, ${firstName}` : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {"Here's your financial resilience at a glance."}
            </p>
          </section>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-4">

            {/* Left column: score card + crisis CTA */}
            <div className="lg:col-span-2 space-y-3">

              {/* Score card */}
              <div
                className="w-full rounded-[10px] bg-card border border-border overflow-hidden
                           shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
              >
                {/* Yellow accent strip at top */}
                <div className="h-1.5 w-full bg-[#F5C518]" />
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Shock Readiness
                    </p>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      / 100
                    </span>
                  </div>

                  {status === "loading" && <ScoreCardSkeleton />}

                  {status === "error" && (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Could not load your score. Check your connection and try again.
                      </p>
                      <Button
                        type="button" variant="secondary"
                        className="rounded-full px-5"
                        onClick={() => void loadScore()}
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {status === "no-profile" && (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                      <div className="w-14 h-14 rounded-[10px] bg-[#F5C518]/15 flex items-center justify-center">
                        <TrendingUp className="h-7 w-7 text-[#B8940E]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">No score yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete onboarding to see your personalized readiness score.
                        </p>
                      </div>
                      <Link
                        href="/onboarding"
                        className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold
                                   bg-[#1A1A1A] text-white hover:bg-[#333] dark:bg-white dark:text-[#1A1A1A]
                                   transition-colors"
                      >
                        Start onboarding
                      </Link>
                    </div>
                  )}

                  {status === "ready" && (
                    <ReadinessRing score={score} breakdown={breakdown} />
                  )}
                </div>
              </div>

              {/* Crisis CTA */}
              <CrisisCTA />
            </div>

            {/* Right column: action items */}
            <div className="lg:col-span-3">
              <ActionItems />
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
