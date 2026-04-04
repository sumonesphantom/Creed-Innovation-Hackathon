import { NextRequest, NextResponse } from "next/server";
import { calculateBudget } from "@/lib/budget";
import type { BudgetCalculationInput, BudgetNormalBreakdown } from "@/types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function parseNormalExpenses(body: Record<string, unknown>): BudgetNormalBreakdown | undefined {
  const raw = body.normalExpenses;
  if (!isRecord(raw)) return undefined;
  return {
    housing: Number(raw.housing) || 0,
    food: Number(raw.food) || 0,
    transport: Number(raw.transport) || 0,
    medical: Number(raw.medical) || 0,
    other: Number(raw.other) || 0,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Expected object body" }, { status: 400 });
  }

  const mode = body.mode;
  if (mode !== "normal" && mode !== "crisis") {
    return NextResponse.json({ error: "mode must be normal or crisis" }, { status: 400 });
  }

  const monthlyIncome = Number(body.monthlyIncome);
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
    return NextResponse.json({ error: "monthlyIncome must be a non-negative number" }, { status: 400 });
  }

  const input: BudgetCalculationInput = {
    mode,
    monthlyIncome,
    deviceId: typeof body.deviceId === "string" ? body.deviceId : undefined,
    normalExpenses: parseNormalExpenses(body),
  };

  if (mode === "crisis") {
    const rawBills = body.bills;
    if (!Array.isArray(rawBills)) {
      return NextResponse.json({ error: "crisis mode requires bills array" }, { status: 400 });
    }
    const bills: { id: string; label: string; amount: number }[] = [];
    for (let i = 0; i < rawBills.length; i++) {
      const item = rawBills[i];
      if (!isRecord(item)) {
        return NextResponse.json({ error: "Each bill must be an object" }, { status: 400 });
      }
      const id = typeof item.id === "string" ? item.id : `bill-${i}`;
      const label = typeof item.label === "string" ? item.label : "Bill";
      const amount = Number(item.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: "Each bill amount must be a non-negative number" }, { status: 400 });
      }
      bills.push({ id, label, amount });
    }
    input.bills = bills;

    const cashOnHand = Number(body.cashOnHand);
    if (!Number.isFinite(cashOnHand) || cashOnHand < 0) {
      return NextResponse.json({ error: "cashOnHand must be a non-negative number" }, { status: 400 });
    }
    input.cashOnHand = cashOnHand;

    if (body.billOrder !== undefined) {
      if (!Array.isArray(body.billOrder) || !body.billOrder.every((x) => typeof x === "string")) {
        return NextResponse.json({ error: "billOrder must be an array of strings" }, { status: 400 });
      }
      input.billOrder = body.billOrder as string[];
    }

    if (body.skippedBillIds !== undefined) {
      if (!Array.isArray(body.skippedBillIds) || !body.skippedBillIds.every((x) => typeof x === "string")) {
        return NextResponse.json({ error: "skippedBillIds must be an array of strings" }, { status: 400 });
      }
      input.skippedBillIds = body.skippedBillIds as string[];
    }

    const extra = body.extraIncomeWeekly;
    if (extra !== undefined && extra !== null) {
      const n = Number(extra);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: "extraIncomeWeekly must be a non-negative number" }, { status: 400 });
      }
      input.extraIncomeWeekly = n;
    }

    const tw = body.timelineWeeks;
    if (tw !== undefined && tw !== null) {
      const n = Number(tw);
      if (!Number.isFinite(n) || n < 1 || n > 52) {
        return NextResponse.json({ error: "timelineWeeks must be between 1 and 52" }, { status: 400 });
      }
      input.timelineWeeks = Math.floor(n);
    }
  }

  const result = calculateBudget(input);
  return NextResponse.json(result);
}
