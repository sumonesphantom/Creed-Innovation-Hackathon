"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BudgetBillLine, BudgetCalculationResult } from "@/types";

type CrisisSlice = NonNullable<BudgetCalculationResult["crisis"]>;

const BUCKET_LABEL: Record<string, string> = {
  payFirst: "Pay these first",
  defer:    "Defer these",
  cut:      "Cut or pause",
};

const BUCKET_STYLE: Record<string, { dot: string; label: string }> = {
  payFirst: { dot: "bg-[#1A1A1A] dark:bg-white",  label: "text-foreground" },
  defer:    { dot: "bg-gray-400",                  label: "text-muted-foreground" },
  cut:      { dot: "bg-destructive",               label: "text-destructive" },
};

export function BudgetTable({
  bills,
  billOrder,
  setBillOrder,
  amountStrings,
  onBillAmountChange,
  cashOnHand,
  setCashOnHand,
  skippedBillIds,
  toggleSkip,
  extraIncomeWeekly,
  setExtraIncomeWeekly,
  crisis,
  fmt,
}: {
  bills: BudgetBillLine[];
  billOrder: string[];
  setBillOrder: (order: string[]) => void;
  amountStrings: Record<string, string>;
  onBillAmountChange: (id: string, value: string) => void;
  cashOnHand: string;
  setCashOnHand: (v: string) => void;
  skippedBillIds: Record<string, boolean>;
  toggleSkip: (id: string) => void;
  extraIncomeWeekly: string;
  setExtraIncomeWeekly: (v: string) => void;
  crisis: CrisisSlice;
  fmt: (n: number) => string;
}) {
  const byId = new Map(bills.map((b) => [b.id, b]));

  function move(id: string, dir: -1 | 1) {
    const idx = billOrder.indexOf(id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= billOrder.length) return;
    const copy = [...billOrder];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setBillOrder(copy);
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Cash on hand ── */}
      <div className="rounded-[10px] bg-card border border-destructive/20 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="h-1 w-full bg-destructive rounded-t-[10px]" />
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Cash on hand
          </p>
          <div>
            <Label htmlFor="cash-on-hand" className="text-xs font-semibold text-muted-foreground block mb-1.5">
              How much cash do you have right now?
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
              <Input
                id="cash-on-hand" type="number" min={0} inputMode="decimal"
                value={cashOnHand} onChange={(e) => setCashOnHand(e.target.value)}
                className="pl-7 rounded-[10px] border-border text-sm font-semibold h-9"
              />
            </div>
          </div>
          {crisis.runwayDays !== null && crisis.payFirstMonthly > 0 && (
            <p className="text-sm text-foreground">
              At your <span className="font-semibold">pay-first</span> pace, that covers about{" "}
              <span className="font-semibold tabular-nums">{crisis.runwayDays}</span> days (
              <span className="font-semibold tabular-nums">{crisis.runwayWeeks}</span> weeks) of essentials.
            </p>
          )}
          {crisis.payFirstMonthly <= 0 && (
            <p className="text-xs text-muted-foreground">
              Add amounts to bills below to see how long your cash lasts for top-priority items.
            </p>
          )}
        </div>
      </div>

      {/* ── Bill priority ── */}
      <div className="rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Bill priority
          </p>
          <p className="text-xs text-muted-foreground">
            Use arrows to rank — top items are treated as pay-first in a crisis.
          </p>
          <ul className="flex flex-col gap-1.5">
            {billOrder.map((id) => {
              const b = byId.get(id);
              if (!b) return null;
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2 py-2"
                >
                  {/* Up/down buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label={`Move ${b.label} up`}
                      onClick={() => move(id, -1)}
                      className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${b.label} down`}
                      onClick={() => move(id, 1)}
                      className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate mb-1">{b.label}</p>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">$</span>
                      <Input
                        type="number" min={0} inputMode="decimal"
                        value={amountStrings[id] ?? ""}
                        onChange={(e) => onBillAmountChange(id, e.target.value)}
                        className="pl-5 h-7 text-xs font-semibold rounded-lg"
                        aria-label={`${b.label} amount`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Buckets ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {crisis.buckets.map((group) => {
          const style = BUCKET_STYLE[group.bucket] ?? { dot: "bg-gray-400", label: "text-muted-foreground" };
          return (
            <div
              key={group.bucket}
              className="rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-3.5 flex flex-col gap-2"
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${style.label}`}>
                  {BUCKET_LABEL[group.bucket] ?? group.bucket}
                </p>
              </div>
              <ul className="text-xs text-foreground space-y-1">
                {group.billIds.length === 0 && (
                  <li className="text-muted-foreground">—</li>
                )}
                {group.billIds.map((bid) => {
                  const b = byId.get(bid);
                  if (!b) return null;
                  return (
                    <li key={bid} className="font-medium truncate">
                      {b.label} · {fmt(b.amount)}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── What-if ── */}
      <div className="rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="p-4 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            What if?
          </p>

          {/* Extra weekly income */}
          <div>
            <Label htmlFor="extra-weekly" className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Extra income per week (side gig, part-time)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
              <Input
                id="extra-weekly" type="number" min={0} inputMode="decimal"
                value={extraIncomeWeekly} onChange={(e) => setExtraIncomeWeekly(e.target.value)}
                className="pl-7 rounded-[10px] border-border text-sm font-semibold h-9"
              />
            </div>
          </div>

          {/* Skip simulation */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground">Skip a bill this month (simulation)</p>
            <ul className="flex flex-col gap-1.5">
              {bills.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <input
                    type="checkbox" id={`skip-${b.id}`}
                    checked={!!skippedBillIds[b.id]}
                    onChange={() => toggleSkip(b.id)}
                    className="h-4 w-4 rounded border-border accent-[#F5C518]"
                  />
                  <label htmlFor={`skip-${b.id}`} className="text-sm text-foreground cursor-pointer">
                    Skip {b.label} ({fmt(b.amount)}/mo)
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Cash flow timeline ── */}
      <div className="rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Cash flow timeline
          </p>
          <p className="text-xs text-muted-foreground">
            Projected balance after each week using current bills (minus skipped) and extras. Weekly outflow ≈{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {fmt(crisis.weeklyNetOutflow * 4.33)}
            </span>/mo net.
          </p>
          <ul className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
            {crisis.weeks.map((w) => (
              <li
                key={w.week}
                className={`flex justify-between text-sm rounded-lg px-3 py-2 ${
                  w.balanceEnd < 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted/40 text-foreground"
                }`}
              >
                <span className="font-medium">Week {w.week}</span>
                <span className="font-semibold tabular-nums">{fmt(w.balanceEnd)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
