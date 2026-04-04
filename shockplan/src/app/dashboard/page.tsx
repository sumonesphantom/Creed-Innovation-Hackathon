"use client";

import Link from "next/link";
import {
  Shield, Lock, AlertTriangle, BookOpen,
  FileText, Umbrella, Lightbulb, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/landing/bottom-nav";

// ─── Readiness Score Ring ──────────────────────────────────────────────────────

const SCORE = 62;

const BREAKDOWN = [
  { label: "Savings",   value: 15, max: 25 },
  { label: "Insurance", value: 8,  max: 25 },
  { label: "Documents", value: 22, max: 25 },
  { label: "Awareness", value: 17, max: 25 },
];

function scoreColor(pct: number) {
  if (pct < 30) return "#ef4444";
  if (pct < 55) return "#f59e0b";
  if (pct < 75) return "#3b82f6";
  return "#22c55e";
}

function scoreLabel(pct: number) {
  if (pct < 30) return "At Risk";
  if (pct < 55) return "Developing";
  if (pct < 75) return "Building";
  return "Resilient";
}

function ReadinessRing() {
  const radius = 72;
  const stroke = 10;
  const r = radius - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (SCORE / 100) * circumference;
  const color = scoreColor(SCORE);

  return (
    <section aria-label="Shock Readiness Score" className="flex flex-col items-center gap-6 w-full">
      {/* Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          aria-hidden="true"
        >
          <circle
            cx={radius} cy={radius} r={r}
            fill="none"
            stroke="oklch(0.91 0.016 240)"
            strokeWidth={stroke}
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
            className="text-4xl font-extrabold leading-none tabular-nums"
            style={{ color }}
            aria-label={`Score: ${SCORE} out of 100`}
          >
            {SCORE}
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-widest mt-1"
            style={{ color }}
          >
            {scoreLabel(SCORE)}
          </span>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="w-full flex flex-col gap-3">
        {BREAKDOWN.map(({ label, value, max }) => {
          const pct = Math.round((value / max) * 100);
          const barColor = scoreColor(pct);
          return (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium text-foreground/70">
                <span>{label}</span>
                <span className="tabular-nums">{value} / {max}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: barColor, transition: "width 0.7s ease" }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={max}
                  aria-label={`${label}: ${value} of ${max}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Crisis CTA ────────────────────────────────────────────────────────────────

function CrisisCTA() {
  return (
    <Link
      href="/crisis"
      className="block w-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.22_27)] focus-visible:ring-offset-2 rounded-2xl"
    >
      <div
        className="flex items-center gap-4 w-full rounded-2xl px-5 py-4 border border-[oklch(0.88_0.06_27)] bg-[oklch(0.98_0.015_27)] group-hover:bg-[oklch(0.96_0.03_27)] transition-colors duration-150"
        style={{ boxShadow: "0 2px 12px 0 oklch(0.58 0.22 27 / 0.08)" }}
      >
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[oklch(0.96_0.04_27)] shrink-0">
          <AlertTriangle className="h-5 w-5 text-[oklch(0.58_0.22_27)] stroke-[2.2px]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[oklch(0.35_0.16_27)] text-sm leading-tight">
            {"I'm in a crisis right now"}
          </p>
          <p className="text-xs text-[oklch(0.50_0.10_27)] mt-0.5 leading-relaxed">
            Get step-by-step help immediately
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-[oklch(0.58_0.22_27)] shrink-0" aria-hidden="true" />
      </div>
    </Link>
  );
}

// ─── Action Items ──────────────────────────────────────────────────────────────

const ACTIONS = [
  {
    icon: Umbrella,
    label: "Review your insurance coverage",
    sub: "You may be under-insured",
    href: "/budget",
    iconBg: "bg-[oklch(0.94_0.04_260)]",
    iconColor: "text-[oklch(0.51_0.22_260)]",
  },
  {
    icon: FileText,
    label: "Upload key documents",
    sub: "ID, lease, insurance cards",
    href: "/my-data",
    iconBg: "bg-[oklch(0.94_0.05_150)]",
    iconColor: "text-[oklch(0.52_0.17_150)]",
  },
  {
    icon: BookOpen,
    label: "Complete a financial literacy module",
    sub: "Build your awareness score",
    href: "/buddy",
    iconBg: "bg-[oklch(0.96_0.04_27)]",
    iconColor: "text-[oklch(0.58_0.22_27)]",
  },
  {
    icon: Lightbulb,
    label: "Set up an emergency fund goal",
    sub: "Even $20/month helps",
    href: "/budget",
    iconBg: "bg-[oklch(0.96_0.05_80)]",
    iconColor: "text-[oklch(0.58_0.18_80)]",
  },
] as const;

function ActionItems() {
  return (
    <section aria-label="Ways to improve your score" className="w-full flex flex-col gap-3">
      <h2 className="text-sm font-bold text-foreground tracking-tight">Improve your score</h2>
      {ACTIONS.map(({ icon: Icon, label, sub, href, iconBg, iconColor }) => (
        <Link
          key={label}
          href={href}
          className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
        >
          <Card className="border border-border shadow-sm group-hover:shadow-md transition-shadow duration-200 bg-card rounded-2xl">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div
      className="flex flex-col min-h-screen font-sans"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.95 0.022 240) 0%, oklch(0.985 0.008 240) 50%, oklch(1 0 0) 100%)",
      }}
    >
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-5 bg-white/60 backdrop-blur-sm sticky top-0 z-10 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
            <Shield className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-sans">
            ShockPlan
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Encrypted</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-5 pt-6 pb-28 gap-6 w-full max-w-md mx-auto">
        {/* Greeting */}
        <section className="w-full" aria-label="Greeting">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-balance leading-tight">
            Hey there!
          </h1>
          <p className="text-base text-muted-foreground mt-1 leading-relaxed">
            {"Here's where you stand."}
          </p>
        </section>

        {/* Score Ring Card */}
        <Card className="w-full border border-border shadow-sm bg-card rounded-2xl">
          <CardContent className="px-6 py-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-5">
              Shock Readiness Score
            </p>
            <ReadinessRing />
          </CardContent>
        </Card>

        {/* Crisis CTA */}
        <CrisisCTA />

        {/* Action Items */}
        <ActionItems />
      </main>

      <BottomNav />
    </div>
  );
}
