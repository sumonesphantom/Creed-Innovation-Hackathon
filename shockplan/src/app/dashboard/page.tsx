"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  AlertTriangle, BookOpen, FileText, Umbrella,
  Lightbulb, ChevronRight, HelpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Breakdown = {
  savings: number;
  insurance: number;
  documents: number;
  awareness: number;
};

const SCORE_WHY: Record<"Savings" | "Insurance" | "Documents" | "Awareness", string> = {
  Savings:
    "Points from your answer about covering a $500 surprise: yes is strongest, maybe is partial, no is lowest.",
  Insurance:
    "Up to 5 points per insurance type you said you have (auto, renters, health, life, etc.), with a bonus when you have several kinds of coverage.",
  Documents:
    "Up to 5 points per document category you have in the vault (insurance, ID, lease, medical, financial).",
  Awareness:
    "Points when you use crisis flows, the budget tool, and other awareness-building parts of the app.",
};

function scoreColor(pct: number) {
  if (pct < 30) return "var(--destructive, #ef4444)";
  if (pct < 55) return "#f59e0b";
  if (pct < 75) return "oklch(0.55 0.20 260)";
  return "oklch(0.55 0.17 150)";
}

function scoreLabel(score: number) {
  if (score < 30) return "At Risk";
  if (score < 55) return "Developing";
  if (score < 75) return "Building";
  return "Resilient";
}

function ReadinessRing({ score, breakdown }: { score: number; breakdown: Breakdown }) {
  const radius = 80;
  const stroke = 10;
  const r = radius - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  const rows = [
    { label: "Savings" as const, value: breakdown.savings, max: 25 },
    { label: "Insurance" as const, value: breakdown.insurance, max: 25 },
    { label: "Documents" as const, value: breakdown.documents, max: 25 },
    { label: "Awareness" as const, value: breakdown.awareness, max: 25 },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative flex items-center justify-center">
        <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
          <circle cx={radius} cy={radius} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border" />
          <circle
            cx={radius} cy={radius} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius} ${radius})`}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold leading-none tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color }}>
            {scoreLabel(score)}
          </span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        {rows.map(({ label, value, max }) => {
          const pct = Math.round((value / max) * 100);
          const barColor = scoreColor(pct);
          return (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  {label}
                  <Popover>
                    <PopoverTrigger>
                      <button
                        type="button"
                        className="inline-flex rounded-md p-0.5 text-muted-foreground hover:text-foreground"
                        aria-label={`Why ${label}`}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="text-xs w-72 text-popover-foreground">
                      {SCORE_WHY[label]}
                    </PopoverContent>
                  </Popover>
                </span>
                <span className="tabular-nums">{value} / {max}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: barColor, transition: "width 0.7s ease" }}
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

function CrisisCTA() {
  return (
    <Link href="/crisis" className="block w-full group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
      <div className="flex items-center gap-4 w-full rounded-2xl px-5 py-4 border border-destructive/20 bg-destructive/5 group-hover:bg-destructive/10 transition-colors">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-destructive/10 shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm">{"I'm in a crisis right now"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Get step-by-step help immediately</p>
        </div>
        <ChevronRight className="h-4 w-4 text-destructive shrink-0" />
      </div>
    </Link>
  );
}

const ACTIONS = [
  {
    icon: Umbrella,
    label: "Review your insurance coverage",
    sub: "You may be under-insured",
    href: "/budget",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: FileText,
    label: "Upload key documents",
    sub: "ID, lease, insurance cards",
    href: "/vault",
    iconBg: "bg-[oklch(0.52_0.17_150/0.1)]",
    iconColor: "text-[oklch(0.52_0.17_150)]",
  },
  {
    icon: BookOpen,
    label: "Complete a financial literacy module",
    sub: "Build your awareness score",
    href: "/buddy",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  {
    icon: Lightbulb,
    label: "Set up an emergency fund goal",
    sub: "Even $20/month helps",
    href: "/budget",
    iconBg: "bg-[oklch(0.58_0.18_80/0.1)]",
    iconColor: "text-[oklch(0.58_0.18_80)]",
  },
] as const;

function ActionItems() {
  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-sm font-bold text-foreground tracking-tight">Improve your score</h2>
      <div className="grid grid-cols-1 gap-3">
        {ACTIONS.map(({ icon: Icon, label, sub, href, iconBg, iconColor }) => (
          <Link key={label} href={href} className="block group rounded-2xl">
            <Card className="border border-border shadow-sm group-hover:shadow-md transition-shadow bg-card rounded-2xl">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
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
        <div className="w-40 h-40 rounded-full bg-muted" />
      </div>
      <div className="space-y-3 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded-full w-full" />
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
    savings: 0,
    insurance: 0,
    documents: 0,
    awareness: 0,
  });

  const loadScore = useCallback(async () => {
    if (typeof window === "undefined") return;
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    if (!deviceId) {
      setStatus("no-profile");
      return;
    }
    setStatus("loading");
    const hasUsedBudget = localStorage.getItem("shockplan_used_budget") === "1";
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          hasUsedBudget,
          hasCompletedCrisisFlow: false,
          hasVisitedBenefits: false,
        }),
      });
      if (res.status === 404) {
        setStatus("no-profile");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as {
        score?: number;
        breakdown?: Breakdown;
      };
      setScore(typeof data.score === "number" ? data.score : 0);
      setBreakdown(
        data.breakdown ?? {
          savings: 0,
          insurance: 0,
          documents: 0,
          awareness: 0,
        }
      );
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadScore();
  }, [loadScore]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadScore();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadScore]);

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        <section className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {firstName ? `Hey, ${firstName}!` : "Hey there!"}
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {"Here's where you stand."}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="w-full border border-border shadow-sm bg-card rounded-2xl">
              <CardContent className="px-6 py-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-5">
                  Shock Readiness Score
                </p>
                {status === "loading" && <ScoreCardSkeleton />}
                {status === "error" && (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      We could not load your score. Check your connection and try again.
                    </p>
                    <Button type="button" variant="secondary" className="rounded-xl" onClick={() => void loadScore()}>
                      Retry
                    </Button>
                  </div>
                )}
                {status === "no-profile" && (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Complete onboarding to see your personalized readiness score.
                    </p>
                    <Link
                      href="/onboarding"
                      className={cn(buttonVariants(), "rounded-xl")}
                    >
                      Start onboarding
                    </Link>
                  </div>
                )}
                {status === "ready" && (
                  <ReadinessRing score={score} breakdown={breakdown} />
                )}
              </CardContent>
            </Card>

            <CrisisCTA />
          </div>

          <div className="lg:col-span-3">
            <ActionItems />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
