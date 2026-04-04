import type {
  BudgetBillLine,
  BudgetBucketGroup,
  BudgetBucketName,
  BudgetCalculationInput,
  BudgetCalculationResult,
  BudgetNormalBreakdown,
  BudgetWeekProjection,
} from "@/types";

const WEEKS_PER_MONTH = 4.33;
const DAYS_PER_MONTH = 30;

const CATEGORY_LABELS: Record<keyof BudgetNormalBreakdown, string> = {
  housing: "Housing",
  food: "Food",
  transport: "Transport",
  medical: "Medical",
  other: "Other",
};

function clampNonNeg(n: number): number {
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function normalizeBillOrder(bills: BudgetBillLine[], billOrder: string[] | undefined): BudgetBillLine[] {
  const byId = new Map(bills.map((b) => [b.id, b]));
  const seen = new Set<string>();
  const ordered: BudgetBillLine[] = [];
  for (const id of billOrder || []) {
    const b = byId.get(id);
    if (b && !seen.has(id)) {
      ordered.push(b);
      seen.add(id);
    }
  }
  for (const b of bills) {
    if (!seen.has(b.id)) {
      ordered.push(b);
      seen.add(b.id);
    }
  }
  return ordered;
}

function splitIntoBuckets(ordered: BudgetBillLine[]): BudgetBucketGroup[] {
  const n = ordered.length;
  if (n === 0) {
    return [
      { bucket: "payFirst", billIds: [] },
      { bucket: "defer", billIds: [] },
      { bucket: "cut", billIds: [] },
    ];
  }
  const third = Math.ceil(n / 3);
  const payIds = ordered.slice(0, third).map((b) => b.id);
  const deferIds = ordered.slice(third, third * 2).map((b) => b.id);
  const cutIds = ordered.slice(third * 2).map((b) => b.id);
  return [
    { bucket: "payFirst" as const, billIds: payIds },
    { bucket: "defer" as const, billIds: deferIds },
    { bucket: "cut" as const, billIds: cutIds },
  ];
}

function sumBucketMonthly(
  buckets: BudgetBucketGroup[],
  bucket: BudgetBucketName,
  byId: Map<string, BudgetBillLine>
): number {
  const g = buckets.find((x) => x.bucket === bucket);
  if (!g) return 0;
  return g.billIds.reduce((s, id) => s + clampNonNeg(byId.get(id)?.amount ?? 0), 0);
}

export function calculateBudget(input: BudgetCalculationInput): BudgetCalculationResult {
  const monthlyIncome = clampNonNeg(input.monthlyIncome);
  const mode = input.mode;

  const empty: BudgetNormalBreakdown = { housing: 0, food: 0, transport: 0, medical: 0, other: 0 };
  const exp = input.normalExpenses ?? empty;
  const keys: (keyof BudgetNormalBreakdown)[] = ["housing", "food", "transport", "medical", "other"];
  let totalExpenses = 0;
  for (const k of keys) {
    totalExpenses += clampNonNeg(exp[k]);
  }

  const categoryPercents = keys.map((key) => {
    const amount = clampNonNeg(exp[key]);
    const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0;
    return { key, label: CATEGORY_LABELS[key], percent, amount };
  });

  const remaining = monthlyIncome - totalExpenses;

  const result: BudgetCalculationResult = {
    mode,
    monthlyIncome,
    totalExpenses,
    remaining,
    categoryPercents,
  };

  if (mode !== "crisis") {
    return result;
  }

  const bills = (input.bills ?? []).map((b) => ({
    ...b,
    amount: clampNonNeg(b.amount),
  }));
  const byId = new Map(bills.map((b) => [b.id, b]));
  const ordered = normalizeBillOrder(bills, input.billOrder);
  const buckets = splitIntoBuckets(ordered);
  const payFirstMonthly = sumBucketMonthly(buckets, "payFirst", byId);

  const cashOnHand = clampNonNeg(input.cashOnHand ?? 0);
  const skipped = new Set(input.skippedBillIds ?? []);
  let totalMonthlyNonSkipped = 0;
  for (const b of bills) {
    if (!skipped.has(b.id)) {
      totalMonthlyNonSkipped += b.amount;
    }
  }

  const weeklyEssentialBurn = payFirstMonthly / WEEKS_PER_MONTH;
  const extraWeekly = clampNonNeg(input.extraIncomeWeekly ?? 0);
  const weeklyOutflow = totalMonthlyNonSkipped / WEEKS_PER_MONTH;
  const weeklyNetOutflow = weeklyOutflow - extraWeekly;

  let runwayDays: number | null = null;
  let runwayWeeks: number | null = null;
  if (payFirstMonthly > 0 && cashOnHand >= 0) {
    const dailyEssential = payFirstMonthly / DAYS_PER_MONTH;
    runwayDays = dailyEssential > 0 ? Math.floor(cashOnHand / dailyEssential) : null;
    runwayWeeks =
      runwayDays !== null ? Math.round((runwayDays / 7) * 10) / 10 : null;
  }

  const timelineWeeks = Math.min(52, Math.max(4, input.timelineWeeks ?? 8));
  const weeks: BudgetWeekProjection[] = [];
  let balance = cashOnHand;
  for (let w = 1; w <= timelineWeeks; w++) {
    balance -= weeklyNetOutflow;
    weeks.push({ week: w, balanceEnd: Math.round(balance * 100) / 100 });
  }

  result.crisis = {
    cashOnHand,
    buckets,
    payFirstMonthly,
    weeklyEssentialBurn: Math.round(weeklyEssentialBurn * 100) / 100,
    runwayDays,
    runwayWeeks,
    weeklyNetOutflow: Math.round(weeklyNetOutflow * 100) / 100,
    weeks,
  };

  return result;
}

export function incomeRangeToMonthlyMid(range: string): number | null {
  switch (range) {
    case "0-1k":
      return 500;
    case "1k-3k":
      return 2000;
    case "3k-5k":
      return 4000;
    case "5k+":
      return 6500;
    default:
      return null;
  }
}
