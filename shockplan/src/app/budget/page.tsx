"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign, Home, ShoppingCart, Car,
  Heart, MoreHorizontal, Lightbulb, PiggyBank, Scissors, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app-shell";
import { BudgetTable } from "@/components/budget-table";
import { calculateBudget, incomeRangeToMonthlyMid } from "@/lib/budget";
import type { BudgetBillLine, UserProfile } from "@/types";

type ExpenseKey = "housing" | "food" | "transport" | "medical" | "other";

const EXPENSE_CATEGORIES: {
  key: ExpenseKey;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}[] = [
  { key: "housing",   label: "Housing",   icon: Home,           iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400" },
  { key: "food",      label: "Food",      icon: ShoppingCart,   iconBg: "bg-green-100 dark:bg-green-900/30",   iconColor: "text-green-600 dark:text-green-400" },
  { key: "transport", label: "Transport", icon: Car,            iconBg: "bg-blue-100 dark:bg-blue-900/30",     iconColor: "text-blue-600 dark:text-blue-400" },
  { key: "medical",   label: "Medical",   icon: Heart,          iconBg: "bg-red-100 dark:bg-red-900/30",       iconColor: "text-red-500 dark:text-red-400" },
  { key: "other",     label: "Other",     icon: MoreHorizontal, iconBg: "bg-gray-100 dark:bg-gray-800/50",     iconColor: "text-gray-600 dark:text-gray-400" },
];

const DEFAULT_CRISIS_BILL_DEFS = [
  { id: "rent",          label: "Rent / mortgage" },
  { id: "utilities",     label: "Utilities" },
  { id: "food",          label: "Food & groceries" },
  { id: "transport",     label: "Transport" },
  { id: "debt",          label: "Debt payments" },
  { id: "subscriptions", label: "Subscriptions" },
] as const;

const CATEGORY_BAR_BG: Record<ExpenseKey, string> = {
  housing:   "bg-purple-500",
  food:      "bg-green-500",
  transport: "bg-blue-500",
  medical:   "bg-red-500",
  other:     "bg-gray-400",
};

const CATEGORY_DOT: Record<ExpenseKey, string> = {
  housing:   "bg-purple-500",
  food:      "bg-green-500",
  transport: "bg-blue-500",
  medical:   "bg-red-500",
  other:     "bg-gray-400",
};

const TIPS = [
  { icon: Scissors,     iconBg: "bg-gray-100 dark:bg-gray-800/50",    iconColor: "text-gray-600 dark:text-gray-400",   title: "Cut the subscriptions you forget",      body: "Most households have 3–5 unused subscriptions. Canceling even two can free up $30–$60 a month toward your emergency fund." },
  { icon: ShoppingCart, iconBg: "bg-green-100 dark:bg-green-900/30",  iconColor: "text-green-600 dark:text-green-400", title: "Shop with a list and eat before you go", body: "Impulse grocery spending adds up fast. A written list and a full stomach can cut your food bill by 15–20% each month." },
  { icon: PiggyBank,    iconBg: "bg-[#FEFAE8] dark:bg-yellow-900/20", iconColor: "text-[#B8940E] dark:text-yellow-400", title: "Save automatically on payday",           body: "Set up a $10–$25 automatic transfer the day you get paid. Saving before you spend means you never have to think about it." },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function MoneyInput({
  id, label, value, onChange, placeholder = "0", inputSize = "md",
}: {
  id: string; label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; inputSize?: "md" | "lg";
}) {
  return (
    <div>
      {label && (
        <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground block mb-1.5">
          {label}
        </Label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
        <Input
          id={id} type="number" min={0} inputMode="decimal"
          placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-7 rounded-[10px] border-border text-sm font-semibold ${inputSize === "lg" ? "h-11 text-base" : "h-9"}`}
        />
      </div>
    </div>
  );
}

function ExpenseRow({
  cat, value, onChange, max = 5000,
}: { cat: (typeof EXPENSE_CATEGORIES)[number]; value: string; onChange: (v: string) => void; max?: number }) {
  const { icon: Icon } = cat;
  const numVal = parseNum(value);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${cat.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${cat.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
          <Label htmlFor={`expense-${cat.key}`} className="text-xs font-semibold text-muted-foreground">{cat.label}</Label>
          <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(numVal)}</span>
        </div>
      </div>
      <div className="ml-11">
        <input
          id={`expense-slider-${cat.key}`}
          type="range"
          min={0}
          max={max}
          step={25}
          value={numVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#E8E8E8] dark:bg-[#333] accent-[#F5C518]"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>$0</span>
          <span>{fmt(max)}</span>
        </div>
      </div>
    </div>
  );
}

function markBudgetUsed() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("shockplan_used_budget", "1"); } catch {}
}

export default function BudgetPage() {
  const [crisisMode, setCrisisMode] = useState(false);
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>({
    housing: "", food: "", transport: "", medical: "", other: "",
  });
  const [currentSavings, setCurrentSavings] = useState("");
  const [incomePrefilled, setIncomePrefilled] = useState(false);

  const [crisisAmounts, setCrisisAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(DEFAULT_CRISIS_BILL_DEFS.map((b) => [b.id, ""]))
  );
  const [billOrder, setBillOrder] = useState<string[]>(() =>
    DEFAULT_CRISIS_BILL_DEFS.map((b) => b.id)
  );
  const [cashOnHand, setCashOnHand] = useState("");
  const [skippedBillIds, setSkippedBillIds] = useState<Record<string, boolean>>({});
  const [extraIncomeWeekly, setExtraIncomeWeekly] = useState("");

  useEffect(() => {
    if (incomePrefilled || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("shockplan_profile");
      if (!raw) return;
      const profile = JSON.parse(raw) as Partial<UserProfile>;
      const mid = profile.incomeRange ? incomeRangeToMonthlyMid(profile.incomeRange) : null;
      if (mid != null) { setIncome(String(mid)); setIncomePrefilled(true); }
    } catch {}
  }, [incomePrefilled]);

  const incomeNum = parseNum(income);
  const normalExpenses = useMemo(() => ({
    housing:   parseNum(expenses.housing),
    food:      parseNum(expenses.food),
    transport: parseNum(expenses.transport),
    medical:   parseNum(expenses.medical),
    other:     parseNum(expenses.other),
  }), [expenses]);

  const normalResult = useMemo(
    () => calculateBudget({ mode: "normal", monthlyIncome: incomeNum, normalExpenses }),
    [incomeNum, normalExpenses]
  );

  const crisisBills: BudgetBillLine[] = useMemo(
    () => DEFAULT_CRISIS_BILL_DEFS.map((d) => ({
      id: d.id, label: d.label, amount: parseNum(crisisAmounts[d.id] ?? ""),
    })),
    [crisisAmounts]
  );

  const crisisResult = useMemo(() => {
    if (!crisisMode) return null;
    return calculateBudget({
      mode: "crisis",
      monthlyIncome: incomeNum,
      normalExpenses,
      bills: crisisBills,
      billOrder,
      cashOnHand: parseNum(cashOnHand),
      skippedBillIds: Object.keys(skippedBillIds).filter((id) => skippedBillIds[id]),
      extraIncomeWeekly: parseNum(extraIncomeWeekly),
      timelineWeeks: 8,
    });
  }, [crisisMode, incomeNum, normalExpenses, crisisBills, billOrder, cashOnHand, skippedBillIds, extraIncomeWeekly]);

  const totalExpenses = normalResult.totalExpenses;
  const remaining     = normalResult.remaining;
  const oneMonth      = totalExpenses;
  const threeMonth    = totalExpenses * 3;
  const saved         = parseNum(currentSavings);
  const pct           = oneMonth > 0 ? Math.min(Math.round((saved / oneMonth) * 100), 100) : 0;

  const remainingColor = remaining >= 0
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-destructive";

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 lg:pt-8 pb-8">

        {/* ── Page header ── */}
        <section className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1A1A1A] shrink-0">
                  <DollarSign className="h-4 w-4 text-[#F5C518]" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-light text-foreground tracking-tight">
                  Emergency Budget
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-12">
                See where your money goes and how much you need to stay resilient.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { markBudgetUsed(); setCrisisMode((c) => !c); }}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shrink-0 transition-colors",
                crisisMode
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "border border-destructive/30 text-destructive bg-background hover:bg-destructive/5",
              ].join(" ")}
            >
              <AlertTriangle className="h-4 w-4" />
              {crisisMode ? "Exit crisis mode" : "I'm in a crisis"}
            </button>
          </div>
        </section>

        {/* ── Crisis mode banner ── */}
        {crisisMode && (
          <div className="mb-4 rounded-[10px] bg-[#1A1A1A] dark:bg-[#111] px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-[#F5C518] shrink-0" />
            <p className="text-sm font-medium text-white">
              Crisis mode active — prioritize essentials and fill in your bills below.
            </p>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

          {/* Left: Income + Expenses */}
          <div className="space-y-3">

            {/* Income card */}
            <div className="rounded-[10px] bg-card border border-border overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="h-1 w-full bg-[#F5C518]" />
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Monthly Income
                </p>
                <MoneyInput
                  id="income" label="Monthly take-home income"
                  value={income} onChange={(v) => { markBudgetUsed(); setIncome(v); }}
                  inputSize="lg"
                />
              </div>
            </div>

            {/* Expenses card */}
            <div className="rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="p-4 flex flex-col gap-3.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Monthly Expenses
                </p>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <ExpenseRow
                    key={cat.key} cat={cat} value={expenses[cat.key]}
                    max={cat.key === "housing" ? 5000 : cat.key === "food" ? 2000 : cat.key === "medical" ? 3000 : 2000}
                    onChange={(v) => { markBudgetUsed(); setExpenses((prev) => ({ ...prev, [cat.key]: v })); }}
                  />
                ))}
              </div>
            </div>

            {/* Breakdown card */}
            <div className="rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="p-4 flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Expense breakdown
                </p>
                {normalResult.totalExpenses <= 0 ? (
                  <p className="text-sm text-muted-foreground">Enter expenses above to see the breakdown.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Stacked bar */}
                    <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-border gap-px">
                      {normalResult.categoryPercents
                        .filter((c) => c.amount > 0)
                        .map((c, i, arr) => (
                          <div
                            key={c.key}
                            className={`h-full ${CATEGORY_BAR_BG[c.key as ExpenseKey]}
                                        ${i === 0 ? "rounded-l-full" : ""}
                                        ${i === arr.length - 1 ? "rounded-r-full" : ""}
                                        transition-all`}
                            style={{ width: `${c.percent}%` }}
                            title={`${c.label} ${c.percent}%`}
                          />
                        ))}
                    </div>
                    {/* Legend */}
                    <ul className="flex flex-col gap-1.5">
                      {normalResult.categoryPercents
                        .filter((c) => c.amount > 0)
                        .map((c) => (
                          <li key={c.key} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-muted-foreground font-medium">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT[c.key as ExpenseKey]}`} />
                              {c.label}
                            </span>
                            <span className="font-semibold tabular-nums text-foreground">
                              {fmt(c.amount)}{" "}
                              <span className="text-muted-foreground font-normal">({c.percent}%)</span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Summary + Savings + Crisis Table */}
          <div className="space-y-3">

            {/* Monthly summary card */}
            <div className="rounded-[10px] bg-card border border-border overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="h-1 w-full bg-[#F5C518]" />
              <div className="p-4 flex flex-col gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Monthly Summary
                </p>

                {/* Stat trio */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Income",    value: fmt(incomeNum),     color: "text-foreground" },
                    { label: "Expenses",  value: fmt(totalExpenses),  color: "text-foreground" },
                    { label: "Remaining", value: fmt(remaining),      color: remainingColor },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted/40">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                        {label}
                      </span>
                      <span className={`text-lg font-light tabular-nums ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border" />

                {/* Fund goals */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">3-month emergency fund</span>
                    <span className="text-sm font-semibold text-foreground tabular-nums">{fmt(threeMonth)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">1-month buffer goal</span>
                    <span className="text-sm text-muted-foreground tabular-nums">{fmt(oneMonth)}</span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Current savings */}
                <MoneyInput
                  id="current-savings"
                  label="How much do you have saved right now?"
                  value={currentSavings}
                  onChange={setCurrentSavings}
                  inputSize="lg"
                />

                {/* Progress */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">1-month fund progress</span>
                    <span className={`tabular-nums font-semibold ${pct >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-emerald-500" : "bg-[#F5C518]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pct >= 100
                      ? "You have covered 1 month of expenses — great work!"
                      : saved > 0 && oneMonth > 0
                        ? `${fmt(saved)} saved toward a ${fmt(oneMonth)} one-month buffer.`
                        : "Enter your current savings to see progress."}
                  </p>
                </div>
              </div>
            </div>

            {/* Crisis budget table */}
            {crisisMode && crisisResult?.crisis && (
              <BudgetTable
                bills={crisisBills}
                billOrder={billOrder}
                setBillOrder={setBillOrder}
                amountStrings={crisisAmounts}
                onBillAmountChange={(id, v) => { markBudgetUsed(); setCrisisAmounts((prev) => ({ ...prev, [id]: v })); }}
                cashOnHand={cashOnHand}
                setCashOnHand={(v) => { markBudgetUsed(); setCashOnHand(v); }}
                skippedBillIds={skippedBillIds}
                toggleSkip={(id) => { markBudgetUsed(); setSkippedBillIds((prev) => ({ ...prev, [id]: !prev[id] })); }}
                extraIncomeWeekly={extraIncomeWeekly}
                setExtraIncomeWeekly={(v) => { markBudgetUsed(); setExtraIncomeWeekly(v); }}
                crisis={crisisResult.crisis}
                fmt={fmt}
              />
            )}
          </div>
        </div>

        {/* ── Tips ── */}
        <section className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#B8940E]" />
            <h2 className="text-sm font-semibold text-foreground">Tips to stretch your budget</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {TIPS.map(({ icon: Icon, iconBg, iconColor, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-3 px-4 py-3.5 rounded-[10px] bg-card border border-border
                           shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5 ${iconBg}`}>
                  <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  );
}
