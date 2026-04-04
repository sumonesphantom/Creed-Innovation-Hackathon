"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { BudgetBillLine, BudgetCalculationResult } from "@/types";

type CrisisSlice = NonNullable<BudgetCalculationResult["crisis"]>;

const BUCKET_LABEL: Record<string, string> = {
  payFirst: "Pay these first",
  defer: "Defer these",
  cut: "Cut or pause these",
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
    <div className="flex flex-col gap-5">
      <Card className="border border-destructive/20 shadow-sm bg-card rounded-2xl">
        <CardContent className="p-5 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Cash on hand</p>
          <div>
            <Label htmlFor="cash-on-hand" className="text-xs font-semibold text-muted-foreground block mb-1.5">
              How much cash do you have right now?
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
              <Input
                id="cash-on-hand"
                type="number"
                min={0}
                inputMode="decimal"
                value={cashOnHand}
                onChange={(e) => setCashOnHand(e.target.value)}
                className="pl-7 rounded-xl border-border text-sm font-semibold h-10"
              />
            </div>
          </div>
          {crisis.runwayDays !== null && crisis.payFirstMonthly > 0 && (
            <p className="text-sm text-foreground">
              At your <span className="font-semibold">pay-first</span> pace, that covers about{" "}
              <span className="font-bold tabular-nums">{crisis.runwayDays}</span> days (
              <span className="font-bold tabular-nums">{crisis.runwayWeeks}</span> weeks) of essentials.
            </p>
          )}
          {crisis.payFirstMonthly <= 0 && (
            <p className="text-xs text-muted-foreground">Add amounts to bills below to see how long your cash lasts for top-priority items.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm bg-card rounded-2xl">
        <CardContent className="p-5 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Bill priority</p>
          <p className="text-xs text-muted-foreground">Use arrows to rank — top items are treated as pay-first in a crisis.</p>
          <ul className="flex flex-col gap-2">
            {billOrder.map((id) => {
              const b = byId.get(id);
              if (!b) return null;
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-2 py-2"
                >
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={`Move ${b.label} up`}
                      onClick={() => move(id, -1)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={`Move ${b.label} down`}
                      onClick={() => move(id, 1)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{b.label}</p>
                    <div className="relative mt-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">$</span>
                      <Input
                        type="number"
                        min={0}
                        inputMode="decimal"
                        value={amountStrings[id] ?? ""}
                        onChange={(e) => onBillAmountChange(id, e.target.value)}
                        className="pl-6 h-8 text-xs font-semibold rounded-lg"
                        aria-label={`${b.label} amount`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {crisis.buckets.map((group) => (
          <Card key={group.bucket} className="border border-border shadow-sm bg-card rounded-2xl">
            <CardContent className="p-4 flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {BUCKET_LABEL[group.bucket] ?? group.bucket}
              </p>
              <ul className="text-xs text-foreground space-y-1">
                {group.billIds.length === 0 && <li className="text-muted-foreground">—</li>}
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm bg-card rounded-2xl">
        <CardContent className="p-5 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">What if?</p>
          <div>
            <Label htmlFor="extra-weekly" className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Extra income per week (side gig, part-time)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
              <Input
                id="extra-weekly"
                type="number"
                min={0}
                inputMode="decimal"
                value={extraIncomeWeekly}
                onChange={(e) => setExtraIncomeWeekly(e.target.value)}
                className="pl-7 rounded-xl border-border text-sm font-semibold h-10"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground">Skip a bill this month (simulation)</p>
            <ul className="flex flex-col gap-2">
              {bills.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`skip-${b.id}`}
                    checked={!!skippedBillIds[b.id]}
                    onChange={() => toggleSkip(b.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <label htmlFor={`skip-${b.id}`} className="text-sm text-foreground cursor-pointer">
                    Skip {b.label} ({fmt(b.amount)}/mo)
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm bg-card rounded-2xl">
        <CardContent className="p-5 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Cash flow timeline</p>
          <p className="text-xs text-muted-foreground">
            Projected balance after each week using current bills (minus skipped) and extras. Weekly outflow ≈{" "}
            <span className="font-semibold tabular-nums text-foreground">{fmt(crisis.weeklyNetOutflow * 4.33)}</span>
            /mo net.
          </p>
          <ul className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
            {crisis.weeks.map((w) => (
              <li
                key={w.week}
                className={`flex justify-between text-sm rounded-lg px-3 py-2 ${
                  w.balanceEnd < 0 ? "bg-destructive/10 text-destructive" : "bg-muted/40 text-foreground"
                }`}
              >
                <span className="font-medium">Week {w.week}</span>
                <span className="font-bold tabular-nums">{fmt(w.balanceEnd)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
