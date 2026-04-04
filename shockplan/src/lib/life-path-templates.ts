import type { LifePathTemplate } from "@/types";

export const LIFE_PATH_TEMPLATES: LifePathTemplate[] = [
  {
    id: "job-loss",
    title: "Recovering from job loss",
    description: "Compare cutting costs plus side income, burning savings, or investing in a career pivot.",
    nodes: [
      {
        id: "jl-root",
        type: "root",
        label: "Job loss",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 0,
        monthsToStability: 0,
        summary: "A sudden income drop means we need a plan that balances cash protection and recovery speed.",
      },
      {
        id: "jl-dec1",
        type: "decision",
        label: "Your main strategy",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 0,
        monthsToStability: 0,
        summary: "Pick the path that best matches your bandwidth, savings cushion, and support system.",
      },
      {
        id: "jl-cut-gig",
        type: "outcome",
        label: "Cut costs plus gig or temp work",
        monthlyIncomeDelta: 900,
        monthlyExpenseDelta: 200,
        monthsToStability: 8,
        summary: "Bridge the gap with fast income while trimming spending enough to protect cash reserves.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "List your must-pay bills and immediate income options",
            detail: "Lock in housing, food, transport, and any temp or gig leads you can activate this week.",
          },
          {
            phase: "next30",
            title: "Set a weekly job-search and side-income target",
            detail: "Keep your main search moving while tracking how much the side work actually closes the gap.",
          },
        ],
      },
      {
        id: "jl-savings",
        type: "outcome",
        label: "Rely on savings while job searching",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 0,
        monthsToStability: -18,
        summary: "Savings buy time, but the plan depends on runway discipline and a clear stop-loss point.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Calculate exactly how many months your savings can cover",
            detail: "Use your current bills, not ideal spending, so your runway estimate stays realistic.",
          },
          {
            phase: "next30",
            title: "Set a runway checkpoint and backup plan",
            detail: "Choose the month when you will switch to deeper cuts, benefits, or bridge income if hiring takes longer.",
          },
        ],
      },
      {
        id: "jl-retrain",
        type: "outcome",
        label: "Retrain or pivot careers",
        monthlyIncomeDelta: -400,
        monthlyExpenseDelta: 350,
        monthsToStability: 16,
        summary: "A longer path that can improve future income, but it needs a strict transition budget.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Price the pivot before committing",
            detail: "Write down tuition, software, transport, and the income dip so the change is fully visible.",
          },
          {
            phase: "oneToThreeMonths",
            title: "Review progress against the pivot timeline",
            detail: "Check whether coursework, certificates, or applications are actually improving your next-income odds.",
          },
        ],
      },
    ],
    edges: [
      { id: "jl-e0", from: "jl-root", to: "jl-dec1", risk: "stable" },
      { id: "jl-e1", from: "jl-dec1", to: "jl-cut-gig", risk: "stable" },
      { id: "jl-e2", from: "jl-dec1", to: "jl-savings", risk: "crisis" },
      { id: "jl-e3", from: "jl-dec1", to: "jl-retrain", risk: "risky" },
    ],
  },
  {
    id: "emergency-fund",
    title: "Building first emergency fund",
    description: "See how different monthly savings rates change your timeline and flexibility.",
    nodes: [
      {
        id: "ef-root",
        type: "root",
        label: "Start building",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 0,
        monthsToStability: 0,
        summary: "Even a small recurring contribution can turn surprise costs into manageable setbacks.",
      },
      {
        id: "ef-dec1",
        type: "decision",
        label: "Monthly savings target",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 0,
        monthsToStability: 0,
        summary: "Choose a target you can actually keep through good and bad months.",
      },
      {
        id: "ef-200",
        type: "outcome",
        label: "Save $200 per month",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 200,
        monthsToStability: 10,
        summary: "Fast progress if your budget can absorb it without causing bounce-back spending later.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Move the first contribution automatically",
            detail: "Automation makes the plan durable and removes the need to decide every month.",
          },
          {
            phase: "next30",
            title: "Protect the contribution from category creep",
            detail: "If this target feels tight, trim one category instead of abandoning the whole goal.",
          },
        ],
      },
      {
        id: "ef-50",
        type: "outcome",
        label: "Save $50 per month",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 50,
        monthsToStability: 18,
        summary: "A steadier pace that may be easier to maintain during uneven months.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Choose the account and transfer day",
            detail: "Make the habit visible so you can tell quickly if the plan is slipping.",
          },
          {
            phase: "oneToThreeMonths",
            title: "Review whether you can increase the target",
            detail: "A modest bump later often works better than setting an aggressive number too early.",
          },
        ],
      },
      {
        id: "ef-15",
        type: "outcome",
        label: "Save $15 per month",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 15,
        monthsToStability: 28,
        summary: "A small start is still a real plan when cash flow is fragile.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Start with the smallest automatic transfer that feels safe",
            detail: "Consistency matters more than the opening amount when you are building the habit.",
          },
          {
            phase: "later",
            title: "Define the trigger for raising the contribution",
            detail: "Tie your next increase to a raise, debt payoff, lower rent, or another concrete change.",
          },
        ],
      },
    ],
    edges: [
      { id: "ef-e0", from: "ef-root", to: "ef-dec1", risk: "stable" },
      { id: "ef-e1", from: "ef-dec1", to: "ef-200", risk: "stable" },
      { id: "ef-e2", from: "ef-dec1", to: "ef-50", risk: "risky" },
      { id: "ef-e3", from: "ef-dec1", to: "ef-15", risk: "risky" },
    ],
  },
  {
    id: "debt",
    title: "Getting out of debt",
    description: "Snowball vs avalanche vs minimum payments - modeled impact on cash flow.",
    nodes: [
      {
        id: "db-root",
        type: "root",
        label: "Debt payoff",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 0,
        monthsToStability: 0,
        summary: "Your payment strategy changes both monthly breathing room and long-term cost.",
      },
      {
        id: "db-dec1",
        type: "decision",
        label: "Strategy",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 0,
        monthsToStability: 0,
        summary: "Choose between momentum, interest savings, or short-term flexibility.",
      },
      {
        id: "db-snowball",
        type: "outcome",
        label: "Snowball (smallest first)",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 320,
        monthsToStability: 14,
        summary: "Build motivation with early wins, even if it is not always the mathematically cheapest route.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Order your balances from smallest to largest",
            detail: "Define the exact first account that gets every extra dollar so the plan stays simple.",
          },
          {
            phase: "next30",
            title: "Redirect each paid-off amount into the next balance",
            detail: "Keep the payment rolling forward instead of letting the freed cash disappear into other spending.",
          },
        ],
      },
      {
        id: "db-avalanche",
        type: "outcome",
        label: "Avalanche (highest APR)",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 340,
        monthsToStability: 12,
        summary: "Costs more each month now, but usually reduces interest drag the fastest.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Rank debts by APR and confirm minimums",
            detail: "You need the interest order and minimum payment amounts in one place before executing the plan.",
          },
          {
            phase: "oneToThreeMonths",
            title: "Check whether the highest-rate debt is shrinking as expected",
            detail: "If the balance is not moving, revisit the payment amount or fees dragging progress.",
          },
        ],
      },
      {
        id: "db-min",
        type: "outcome",
        label: "Minimum payments only",
        monthlyIncomeDelta: 0,
        monthlyExpenseDelta: 110,
        monthsToStability: 42,
        summary: "Preserves short-term flexibility, but keeps the debt burden around much longer.",
        milestoneTemplates: [
          {
            phase: "now",
            title: "Use the lower payment to stabilize the rest of your budget",
            detail: "This path only works if the extra room prevents new missed bills or new debt.",
          },
          {
            phase: "later",
            title: "Choose the signal for moving to a stronger payoff plan",
            detail: "Set the income, savings, or expense-change target that lets you step up from minimums.",
          },
        ],
      },
    ],
    edges: [
      { id: "db-e0", from: "db-root", to: "db-dec1", risk: "stable" },
      { id: "db-e1", from: "db-dec1", to: "db-snowball", risk: "stable" },
      { id: "db-e2", from: "db-dec1", to: "db-avalanche", risk: "stable" },
      { id: "db-e3", from: "db-dec1", to: "db-min", risk: "crisis" },
    ],
  },
];

export function getTemplateById(id: string): LifePathTemplate | undefined {
  return LIFE_PATH_TEMPLATES.find((t) => t.id === id);
}

