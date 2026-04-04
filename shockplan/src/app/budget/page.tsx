"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign, Home, ShoppingCart, Car,
  Heart, MoreHorizontal, Lightbulb, PiggyBank, Scissors, AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  { key: "medical",   label: "Medical",   icon: Heart,          iconBg: "bg-red-100 dark:bg-red-900/30",       iconColor: "text-red-600 dark:text-red-400" },
  { key: "other",     label: "Other",     icon: MoreHorizontal, iconBg: "bg-gray-100 dark:bg-gray-800/50",     iconColor: "text-gray-600 dark:text-gray-400" },
];

const DEFAULT_CRISIS_BILL_DEFS = [
  { id: "rent", label: "Rent / mortgage" },
  { id: "utilities", label: "Utilities" },
  { id: "food", label: "Food & groceries" },
  { id: "transport", label: "Transport" },
  { id: "debt", label: "Debt payments" },
  { id: "subscriptions", label: "Subscriptions" },
] as const;

const CATEGORY_BAR_BG: Record<ExpenseKey, string> = {
  housing:   "bg-purple-500",
  food:      "bg-green-500",
  transport: "bg-blue-500",
  medical:   "bg-red-500",
  other:     "bg-gray-500",
};

const CATEGORY_DOT: Record<ExpenseKey, string> = {
  housing:   "bg-purple-500",
  food:      "bg-green-500",
  transport: "bg-blue-500",
  medical:   "bg-red-500",
  other:     "bg-gray-400",
};

const TIPS = [
  { icon: Scissors,     iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", title: "Cut the subscriptions you forget", body: "Most households have 3–5 unused subscriptions. Canceling even two can free up $30–$60 a month toward your emergency fund." },
  { icon: ShoppingCart, iconBg: "bg-green-100 dark:bg-green-900/30",   iconColor: "text-green-600 dark:text-green-400",   title: "Shop with a list and eat before you go", body: "Impulse grocery spending adds up fast. A written list and a full stomach can cut your food bill by 15–20% each month." },
  { icon: PiggyBank,    iconBg: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-600 dark:text-yellow-400", title: "Save automatically on payday", body: "Set up a $10–$25 automatic transfer the day you get paid. Saving before you spend means you never have to think about it." },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function MoneyInput({ id, label, value, onChange, placeholder = "0", inputSize = "md" }: {
  id: string; label?: string; value: string; onChange: (v: string) => void; placeholder?: string; inputSize?: "md" | "lg";
}) {
  return (
    <div>
      {label && <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground block mb-1.5">{label}</Label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
        <Input
          id={id} type="number" min={0} inputMode="decimal" placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-7 rounded-xl border-border text-sm font-semibold ${inputSize === "lg" ? "h-12 text-base" : "h-10"}`}
        />
      </div>
    </div>
  );
}

function ExpenseRow({ cat, value, onChange }: { cat: (typeof EXPENSE_CATEGORIES)[number]; value: string; onChange: (v: string) => void }) {
  const { icon: Icon } = cat;
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${cat.iconBg}`}>
        <Icon className={`h-4 w-4 ${cat.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <MoneyInput id={`expense-${cat.key}`} label={cat.label} value={value} onChange={onChange} />
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
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>({ housing: "", food: "", transport: "", medical: "", other: "" });
  const [currentSavings, setCurrentSavings] = useState("");
  const [incomePrefilled, setIncomePrefilled] = useState(false);

  const [crisisAmounts, setCrisisAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(DEFAULT_CRISIS_BILL_DEFS.map((b) => [b.id, ""]))
  );
  const [billOrder, setBillOrder] = useState<string[]>(() => DEFAULT_CRISIS_BILL_DEFS.map((b) => b.id));
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
    housing: parseNum(expenses.housing),
    food: parseNum(expenses.food),
    transport: parseNum(expenses.transport),
    medical: parseNum(expenses.medical),
    other: parseNum(expenses.other),
  }), [expenses]);

  const normalResult = useMemo(() => calculateBudget({ mode: "normal", monthlyIncome: incomeNum, normalExpenses }), [incomeNum, normalExpenses]);

  const crisisBills: BudgetBillLine[] = useMemo(
    () => DEFAULT_CRISIS_BILL_DEFS.map((d) => ({ id: d.id, label: d.label, amount: parseNum(crisisAmounts[d.id] ?? "") })),
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
  const remaining = normalResult.remaining;
  const oneMonth = totalExpenses;
  const threeMonth = totalExpenses * 3;
  const saved = parseNum(currentSavings);
  const pct = oneMonth > 0 ? Math.min(Math.round((saved / oneMonth) * 100), 100) : 0;

  const remainingColor = remaining >= 0
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400";

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        {/* Page header */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Emergency Budget</h1>
              </div>
              <p className="text-base text-muted-foreground mt-1 ml-13">
                See where your money goes and how much you need to stay resilient.
              </p>
            </div>
            <Button
              type="button"
              variant={crisisMode ? "destructive" : "outline"}
              className={`rounded-xl shrink-0 gap-2 font-semibold ${!crisisMode ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50" : ""}`}
              onClick={() => { markBudgetUsed(); setCrisisMode((c) => !c); }}
            >
              <AlertTriangle className="h-4 w-4" />
              {crisisMode ? "Exit crisis mode" : "I'm in a crisis"}
            </Button>
          </div>
        </section>

        {crisisMode && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-linear-to-r from-destructive/8 to-destructive/4 px-5 py-3.5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">Crisis mode active — prioritize essentials and fill in your bills below.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Income + Expenses */}
          <div className="space-y-5">
            <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
              <div className="h-1 w-full bg-linear-to-r from-emerald-500 to-emerald-400/30" />
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Monthly Income</p>
                <MoneyInput id="income" label="Monthly take-home income" value={income} onChange={(v) => { markBudgetUsed(); setIncome(v); }} inputSize="lg" />
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm bg-card rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Monthly Expenses</p>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <ExpenseRow key={cat.key} cat={cat} value={expenses[cat.key]} onChange={(v) => { markBudgetUsed(); setExpenses((prev) => ({ ...prev, [cat.key]: v })); }} />
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm bg-card rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Expense breakdown</p>
                {normalResult.totalExpenses <= 0 ? (
                  <p className="text-sm text-muted-foreground">Enter expenses above to see the breakdown.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-border gap-px">
                      {normalResult.categoryPercents.filter((c) => c.amount > 0).map((c, i, arr) => (
                        <div
                          key={c.key}
                          className={`h-full ${CATEGORY_BAR_BG[c.key as ExpenseKey]} ${i === 0 ? "rounded-l-full" : ""} ${i === arr.length - 1 ? "rounded-r-full" : ""} transition-all`}
                          style={{ width: `${c.percent}%` }}
                          title={`${c.label} ${c.percent}%`}
                        />
                      ))}
                    </div>
                    <ul className="flex flex-col gap-1.5 mt-1">
                      {normalResult.categoryPercents.filter((c) => c.amount > 0).map((c) => (
                        <li key={c.key} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-muted-foreground font-medium">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT[c.key as ExpenseKey]}`} />
                            {c.label}
                          </span>
                          <span className="font-bold tabular-nums text-foreground">
                            {fmt(c.amount)} <span className="text-muted-foreground font-normal">({c.percent}%)</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary + Savings + Crisis Table */}
          <div className="space-y-5">
            <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
              <div className="h-1 w-full bg-linear-to-r from-primary to-primary/30" />
              <CardContent className="p-5 flex flex-col gap-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Monthly Summary</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Income",    value: fmt(incomeNum),    color: "text-foreground" },
                    { label: "Expenses",  value: fmt(totalExpenses), color: "text-foreground" },
                    { label: "Remaining", value: fmt(remaining),     color: remainingColor },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex flex-col gap-0.5 p-3 rounded-xl bg-muted/40">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                      <span className={`text-base font-extrabold tabular-nums ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border" />

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground font-medium">3-month emergency fund</span>
                    <span className="text-sm font-bold text-foreground tabular-nums">{fmt(threeMonth)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground font-medium">1-month buffer goal</span>
                    <span className="text-sm font-semibold text-muted-foreground tabular-nums">{fmt(oneMonth)}</span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <MoneyInput id="current-savings" label="How much do you have saved right now?" value={currentSavings} onChange={setCurrentSavings} inputSize="lg" />

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">1-month fund progress</span>
                    <span className={`tabular-nums font-bold ${pct >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`}
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
              </CardContent>
            </Card>

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

        {/* Tips */}
        <section className="mt-8 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground tracking-tight">Tips to stretch your budget</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TIPS.map(({ icon: Icon, iconBg, iconColor, title, body }) => (
              <Card key={title} className="border border-border shadow-sm bg-card rounded-2xl">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5 ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
