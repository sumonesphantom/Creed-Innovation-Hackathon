"use client";

import { useState } from "react";
import {
  DollarSign, Home, ShoppingCart, Car,
  Heart, MoreHorizontal, Lightbulb, PiggyBank, Scissors,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app-shell";

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
        <Input id={id} type="number" min={0} inputMode="decimal" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
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

export default function BudgetPage() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>({ housing: "", food: "", transport: "", medical: "", other: "" });
  const [currentSavings, setCurrentSavings] = useState("");

  const incomeNum = parseNum(income);
  const totalExpenses = Object.values(expenses).reduce((sum, v) => sum + parseNum(v), 0);
  const remaining = incomeNum - totalExpenses;
  const oneMonth = totalExpenses;
  const threeMonth = totalExpenses * 3;
  const saved = parseNum(currentSavings);
  const pct = oneMonth > 0 ? Math.min(Math.round((saved / oneMonth) * 100), 100) : 0;

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        {/* Page header */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 shrink-0">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Emergency Budget</h1>
          </div>
          <p className="text-base text-muted-foreground mt-2">
            See where your money goes and how much you need to stay resilient.
          </p>
        </section>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Income + Expenses */}
          <div className="space-y-6">
            <Card className="border border-border shadow-sm bg-card rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Monthly Income</p>
                <MoneyInput id="income" label="Monthly take-home income" value={income} onChange={setIncome} inputSize="lg" />
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm bg-card rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Monthly Expenses</p>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <ExpenseRow key={cat.key} cat={cat} value={expenses[cat.key]} onChange={(v) => setExpenses((prev) => ({ ...prev, [cat.key]: v }))} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary + Tips */}
          <div className="space-y-6">
            <Card className="border border-border shadow-sm bg-card rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Monthly Summary</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Income", value: fmt(incomeNum) },
                    { label: "Expenses", value: fmt(totalExpenses) },
                    { label: "Remaining", value: fmt(remaining), color: remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                      <span className={`text-base font-extrabold tabular-nums ${color || "text-foreground"}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border" />

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground font-medium">3-month emergency fund target</span>
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
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>1-month fund progress</span>
                    <span className="tabular-nums font-bold text-foreground">{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pct >= 100 ? "You have covered 1 month of expenses — great work!" : saved > 0 && oneMonth > 0 ? `${fmt(saved)} saved toward a ${fmt(oneMonth)} one-month buffer.` : "Enter your current savings to see progress."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <h2 className="text-sm font-bold text-foreground tracking-tight">Tips to stretch your budget</h2>
              </div>
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
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
