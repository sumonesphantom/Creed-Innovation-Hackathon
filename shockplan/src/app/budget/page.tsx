"use client";

import { useState } from "react";
import {
  DollarSign, Shield, Lock, Home, ShoppingCart, Car,
  Heart, MoreHorizontal, Lightbulb, PiggyBank, Scissors,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/landing/bottom-nav";

// ─── Data ──────────────────────────────────────────────────────────────────────

type ExpenseKey = "housing" | "food" | "transport" | "medical" | "other";

const EXPENSE_CATEGORIES: {
  key: ExpenseKey;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}[] = [
  { key: "housing",   label: "Housing",   icon: Home,          iconBg: "oklch(0.95 0.04 310)", iconColor: "oklch(0.50 0.20 310)" },
  { key: "food",      label: "Food",      icon: ShoppingCart,  iconBg: "oklch(0.95 0.05 150)", iconColor: "oklch(0.52 0.17 150)" },
  { key: "transport", label: "Transport", icon: Car,           iconBg: "oklch(0.94 0.04 240)", iconColor: "oklch(0.51 0.22 240)" },
  { key: "medical",   label: "Medical",   icon: Heart,         iconBg: "oklch(0.96 0.04 20)",  iconColor: "oklch(0.58 0.22 20)"  },
  { key: "other",     label: "Other",     icon: MoreHorizontal,iconBg: "oklch(0.94 0.02 250)", iconColor: "oklch(0.52 0.08 250)" },
];

const TIPS = [
  {
    icon: Scissors,
    iconBg: "oklch(0.95 0.04 310)",
    iconColor: "oklch(0.50 0.20 310)",
    title: "Cut the subscriptions you forget",
    body: "Most households have 3–5 unused subscriptions. Canceling even two can free up $30–$60 a month toward your emergency fund.",
  },
  {
    icon: ShoppingCart,
    iconBg: "oklch(0.95 0.05 150)",
    iconColor: "oklch(0.52 0.17 150)",
    title: "Shop with a list and eat before you go",
    body: "Impulse grocery spending adds up fast. A written list and a full stomach can cut your food bill by 15–20% each month.",
  },
  {
    icon: PiggyBank,
    iconBg: "oklch(0.96 0.07 90)",
    iconColor: "oklch(0.55 0.20 90)",
    title: "Save automatically on payday",
    body: "Set up a $10–$25 automatic transfer the day you get paid. Saving before you spend means you never have to think about it.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

// ─── Components ───────────────────────────────────────────────────────────────

function MoneyInput({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  inputSize = "md",
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputSize?: "md" | "lg";
}) {
  return (
    <div>
      {label && (
        <Label htmlFor={id} className="text-xs font-semibold text-foreground/70 block mb-1.5">
          {label}
        </Label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none">
          $
        </span>
        <Input
          id={id}
          type="number"
          min={0}
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-7 rounded-xl border-border text-sm font-semibold ${
            inputSize === "lg" ? "h-12 text-base" : "h-10"
          }`}
        />
      </div>
    </div>
  );
}

function ExpenseRow({
  cat,
  value,
  onChange,
}: {
  cat: (typeof EXPENSE_CATEGORIES)[number];
  value: string;
  onChange: (v: string) => void;
}) {
  const { icon: Icon } = cat;
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: cat.iconBg }}
      >
        <Icon className="h-4 w-4" style={{ color: cat.iconColor }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <MoneyInput
          id={`expense-${cat.key}`}
          label={cat.label}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  income,
  totalExpenses,
  currentSavings,
  onSavingsChange,
}: {
  income: number;
  totalExpenses: number;
  currentSavings: string;
  onSavingsChange: (v: string) => void;
}) {
  const remaining = income - totalExpenses;
  const oneMonth = totalExpenses;
  const threeMonth = totalExpenses * 3;
  const saved = parseNum(currentSavings);
  const pct = oneMonth > 0 ? Math.min(Math.round((saved / oneMonth) * 100), 100) : 0;

  const remainingColor =
    remaining > 0 ? "oklch(0.52 0.17 150)" : remaining < 0 ? "oklch(0.58 0.22 20)" : "oklch(0.52 0.08 250)";

  const progressColor =
    pct >= 100 ? "oklch(0.52 0.17 150)" :
    pct >= 50  ? "oklch(0.51 0.22 240)" :
    pct >= 25  ? "oklch(0.58 0.18 55)"  :
                 "oklch(0.58 0.22 20)";

  return (
    <Card className="w-full border border-border shadow-sm bg-card rounded-2xl">
      <CardContent className="p-5 flex flex-col gap-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          Monthly Summary
        </p>

        {/* Three key numbers */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Income",    value: fmt(income),        color: "text-foreground" },
            { label: "Expenses",  value: fmt(totalExpenses), color: "text-foreground" },
            { label: "Remaining", value: fmt(remaining),     color: undefined, style: { color: remainingColor } },
          ].map(({ label, value, color, style }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                {label}
              </span>
              <span
                className={`text-base font-extrabold tabular-nums ${color ?? ""}`}
                style={style}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px bg-border" />

        {/* Emergency fund target */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-muted-foreground font-medium">
              3-month emergency fund target
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">{fmt(threeMonth)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-muted-foreground font-medium">
              1-month buffer goal
            </span>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums">{fmt(oneMonth)}</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Savings input + progress */}
        <div className="flex flex-col gap-3">
          <MoneyInput
            id="current-savings"
            label="How much do you have saved right now?"
            value={currentSavings}
            onChange={onSavingsChange}
            inputSize="lg"
          />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium text-foreground/70">
              <span>1-month fund progress</span>
              <span className="tabular-nums font-bold" style={{ color: progressColor }}>
                {pct}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: progressColor }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Emergency fund ${pct}% funded`}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pct >= 100
                ? "You have covered 1 month of expenses — great work. Keep saving toward 3 months."
                : saved > 0 && oneMonth > 0
                ? `${fmt(saved)} saved toward a ${fmt(oneMonth)} one-month buffer.`
                : "Enter your current savings to see your progress."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TipsSection() {
  return (
    <section className="w-full flex flex-col gap-3" aria-label="Money-saving tips">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-[oklch(0.55_0.20_90)]" aria-hidden="true" />
        <h2 className="text-sm font-bold text-foreground tracking-tight">
          Tips to stretch your budget
        </h2>
      </div>
      {TIPS.map(({ icon: Icon, iconBg, iconColor, title, body }) => (
        <Card key={title} className="border border-border shadow-sm bg-card rounded-2xl">
          <CardContent className="flex items-start gap-4 p-4">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5"
              style={{ background: iconBg }}
            >
              <Icon className="h-4 w-4" style={{ color: iconColor }} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-snug">{title}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>({
    housing: "", food: "", transport: "", medical: "", other: "",
  });
  const [currentSavings, setCurrentSavings] = useState("");

  const incomeNum = parseNum(income);
  const totalExpenses = Object.values(expenses).reduce((sum, v) => sum + parseNum(v), 0);

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

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 pt-6 pb-28 gap-5 w-full max-w-md mx-auto">
        {/* Page title */}
        <section className="w-full" aria-label="Budget page intro">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[oklch(0.94_0.05_150)] shrink-0">
              <DollarSign className="h-5 w-5 text-[oklch(0.52_0.17_150)]" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-balance leading-tight">
              Emergency Budget
            </h1>
          </div>
          <p className="text-base text-muted-foreground mt-2 leading-relaxed">
            See where your money goes and how much you need to stay resilient.
          </p>
        </section>

        {/* Income */}
        <Card className="w-full border border-border shadow-sm bg-card rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
              Monthly Income
            </p>
            <MoneyInput
              id="income"
              label="Monthly take-home income"
              value={income}
              onChange={setIncome}
              inputSize="lg"
            />
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="w-full border border-border shadow-sm bg-card rounded-2xl">
          <CardContent className="p-5 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Monthly Expenses
            </p>
            {EXPENSE_CATEGORIES.map((cat) => (
              <ExpenseRow
                key={cat.key}
                cat={cat}
                value={expenses[cat.key]}
                onChange={(v) => setExpenses((prev) => ({ ...prev, [cat.key]: v }))}
              />
            ))}
          </CardContent>
        </Card>

        {/* Summary + progress */}
        <SummaryCard
          income={incomeNum}
          totalExpenses={totalExpenses}
          currentSavings={currentSavings}
          onSavingsChange={setCurrentSavings}
        />

        {/* Tips */}
        <TipsSection />
      </main>

      <BottomNav />
    </div>
  );
}
