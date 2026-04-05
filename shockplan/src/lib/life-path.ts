import type {
  GeneratedLifePathMilestone,
  LifePathCustomEvent,
  LifePathMilestonePhase,
  LifePathNodeDef,
  LifePathProjectionMonth,
  LifePathProjectionSummary,
  LifePathTemplate,
  LifePathZoom,
  PathRiskLevel,
} from "@/types";

export type TimeZoom = LifePathZoom;

export const ZOOM_TO_MONTHS: Record<TimeZoom, number> = {
  month: 6,
  year: 12,
  fiveYear: 60,
};

export const PHASE_LABEL: Record<LifePathMilestonePhase, string> = {
  now: "Now",
  next30: "Next 30 days",
  oneToThreeMonths: "1-3 months",
  later: "Later",
};

export const EVENT_CATEGORY_LABEL: Record<LifePathCustomEvent["category"], string> = {
  income: "Income",
  housing: "Housing",
  family: "Family",
  health: "Health",
  debt: "Debt",
  transport: "Transport",
  education: "Education",
  benefits: "Benefits",
  savings: "Savings",
  other: "Other",
};

export const RISK_BG_CLASS: Record<PathRiskLevel, string> = {
  stable: "bg-card border border-border text-card-foreground",
  risky: "bg-muted/35 border border-border text-card-foreground",
  crisis:
    "bg-[#222222] border border-[#333333] text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/70",
};

export const RISK_LABEL: Record<PathRiskLevel, string> = {
  stable: "Stable",
  risky: "Risky",
  crisis: "Crisis",
};

const CUSTOM_EVENT_MILESTONES: Record<
  LifePathCustomEvent["category"],
  { phase: LifePathMilestonePhase; title: string; detail: string }[]
> = {
  income: [
    {
      phase: "now",
      title: "Confirm how this income change starts",
      detail: "Write down the first pay date, amount, and any setup steps so your timing assumptions stay grounded.",
    },
    {
      phase: "next30",
      title: "Check whether the income change matches the plan",
      detail: "Compare the actual monthly impact with your estimate and adjust the scenario if the difference is meaningful.",
    },
  ],
  housing: [
    {
      phase: "now",
      title: "List the housing costs this event changes",
      detail: "Include rent or mortgage, utilities, deposits, moving costs, and any overlap month that could hit cash flow.",
    },
    {
      phase: "oneToThreeMonths",
      title: "Review whether the housing change really reduced pressure",
      detail: "If the savings are being offset elsewhere, update the plan before that drift becomes permanent.",
    },
  ],
  family: [
    {
      phase: "now",
      title: "Map the immediate family-related costs",
      detail: "Start with childcare, food, transport, and schedule changes so the first month is visible.",
    },
    {
      phase: "later",
      title: "Revisit the plan after the routine settles",
      detail: "Family changes often shift over time, so check whether the first estimate is still true once the new pattern is real.",
    },
  ],
  health: [
    {
      phase: "now",
      title: "Capture the known medical costs and deadlines",
      detail: "Track expected bills, payment dates, and any insurance or reimbursement step attached to this event.",
    },
    {
      phase: "next30",
      title: "Review payment options before balances snowball",
      detail: "If the cost remains risky, check whether payment plans, assistance, or claims follow-up change the timeline.",
    },
  ],
  debt: [
    {
      phase: "now",
      title: "Tie this debt event to a payment rule",
      detail: "Decide whether the change increases minimums, adds a payoff target, or creates a pause you need to plan around.",
    },
    {
      phase: "oneToThreeMonths",
      title: "Check whether balances are moving as expected",
      detail: "If the debt is not shrinking or the payment feels unstable, update the scenario before interest compounds further.",
    },
  ],
  transport: [
    {
      phase: "now",
      title: "Write down the transport cost timing",
      detail: "Capture recurring fuel, insurance, or transit changes plus any one-time repair or vehicle cost.",
    },
    {
      phase: "next30",
      title: "Test whether the new transport pattern is durable",
      detail: "If costs stay high, consider whether another route, schedule, or vehicle plan needs to be modeled.",
    },
  ],
  education: [
    {
      phase: "now",
      title: "List the full education-related cash impact",
      detail: "Include tuition, materials, software, transport, and any temporary income drop caused by the change.",
    },
    {
      phase: "later",
      title: "Review whether the education plan is still worth the cost",
      detail: "Check progress against the benefit you expected before adding more time or money.",
    },
  ],
  benefits: [
    {
      phase: "now",
      title: "Write down the benefits application or renewal steps",
      detail: "Track what you need, when it starts, and what delay would mean for your cash flow.",
    },
    {
      phase: "next30",
      title: "Confirm the benefit amount landed as expected",
      detail: "If timing or approval changes, update the scenario so the rest of the plan stays realistic.",
    },
  ],
  savings: [
    {
      phase: "now",
      title: "Decide where the savings move will live",
      detail: "Pick the account, transfer rule, and trigger so this change becomes an actual habit instead of a loose intention.",
    },
    {
      phase: "later",
      title: "Revisit the savings move after a few cycles",
      detail: "If the transfer is easy to keep, consider increasing it. If not, lower it before the habit breaks completely.",
    },
  ],
  other: [
    {
      phase: "now",
      title: "Define what this event changes first",
      detail: "Be explicit about timing, amount, and whether it is recurring so the scenario remains easy to reason about.",
    },
    {
      phase: "next30",
      title: "Check whether the event behaved the way you modeled it",
      detail: "Update the plan if the real impact is smaller, bigger, or shorter than expected.",
    },
  ],
};

export function initialSelections(template: LifePathTemplate): Record<string, number> {
  const decisions = template.nodes.filter((node) => node.type === "decision");
  return Object.fromEntries(decisions.map((node) => [node.id, 0]));
}

export function getPathThroughTemplate(
  template: LifePathTemplate,
  selections: Record<string, number>
): LifePathNodeDef[] {
  const byId = new Map(template.nodes.map((node) => [node.id, node]));
  const root = template.nodes.find((node) => node.type === "root");
  if (!root) return [];

  const path: LifePathNodeDef[] = [root];
  let current = root;

  for (;;) {
    const outgoing = template.edges.filter((edge) => edge.from === current.id);
    if (outgoing.length === 0) break;

    if (outgoing.length === 1) {
      const next = byId.get(outgoing[0].to);
      if (!next) break;
      current = next;
      path.push(current);
      continue;
    }

    const sorted = [...outgoing].sort((a, b) => a.to.localeCompare(b.to));
    const idx = Math.min(selections[current.id] ?? 0, sorted.length - 1);
    const edge = sorted[idx];
    const next = byId.get(edge.to);
    if (!next) break;
    current = next;
    path.push(current);
  }

  return path;
}

export function buildProjection(
  pathNodes: LifePathNodeDef[],
  customEvents: LifePathCustomEvent[],
  horizonMonths: number
): { months: LifePathProjectionMonth[]; summary: LifePathProjectionSummary } {
  const recurringNodes = pathNodes.filter((node) => node.type === "outcome");
  const baseIncome = recurringNodes.reduce((sum, node) => sum + node.monthlyIncomeDelta, 0);
  const baseExpense = recurringNodes.reduce((sum, node) => sum + node.monthlyExpenseDelta, 0);
  const stabilityMonths = recurringNodes.reduce((sum, node) => sum + node.monthsToStability, 0);

  const months: LifePathProjectionMonth[] = [];
  let cumulativeSwing = 0;
  let totalNet = 0;
  let highestCumulativeSwing = Number.NEGATIVE_INFINITY;
  let lowestCumulativeSwing = Number.POSITIVE_INFINITY;

  for (let index = 0; index < horizonMonths; index += 1) {
    let incomeDelta = baseIncome;
    let expenseDelta = baseExpense;
    let oneTimeCashDelta = 0;
    const activeEvents: string[] = [];

    for (const event of customEvents) {
      const eventStarts = index >= event.startMonthOffset;
      const eventEnds = index < event.startMonthOffset + Math.max(1, event.durationMonths);
      if (!eventStarts || !eventEnds) continue;

      incomeDelta += event.monthlyIncomeDelta;
      expenseDelta += event.monthlyExpenseDelta;
      activeEvents.push(event.label);

      if (index === event.startMonthOffset && event.oneTimeCashDelta !== 0) {
        oneTimeCashDelta += event.oneTimeCashDelta;
      }
    }

    const netChange = incomeDelta - expenseDelta + oneTimeCashDelta;
    cumulativeSwing += netChange;
    totalNet += netChange;
    highestCumulativeSwing = Math.max(highestCumulativeSwing, cumulativeSwing);
    lowestCumulativeSwing = Math.min(lowestCumulativeSwing, cumulativeSwing);

    months.push({
      month: index + 1,
      label: `Month ${index + 1}`,
      incomeDelta,
      expenseDelta,
      oneTimeCashDelta,
      netChange,
      cumulativeSwing,
      activeEvents,
    });
  }

  const first = months[0] ?? {
    incomeDelta: baseIncome,
    expenseDelta: baseExpense,
    netChange: baseIncome - baseExpense,
    cumulativeSwing: 0,
  };

  return {
    months,
    summary: {
      currentMonthlyIncomeDelta: first.incomeDelta,
      currentMonthlyExpenseDelta: first.expenseDelta,
      currentNetMonthly: first.incomeDelta - first.expenseDelta,
      averageNetMonthly: horizonMonths > 0 ? totalNet / horizonMonths : 0,
      projectedSwing: months.at(-1)?.cumulativeSwing ?? 0,
      stabilityMonths: Math.max(0, Math.round(stabilityMonths)),
      highestCumulativeSwing: Number.isFinite(highestCumulativeSwing) ? highestCumulativeSwing : 0,
      lowestCumulativeSwing: Number.isFinite(lowestCumulativeSwing) ? lowestCumulativeSwing : 0,
    },
  };
}

export function accumulatePathMetrics(pathNodes: LifePathNodeDef[], horizonMonths: number) {
  const { summary } = buildProjection(pathNodes, [], horizonMonths);
  return {
    monthlyIncomeDelta: summary.currentMonthlyIncomeDelta,
    monthlyExpenseDelta: summary.currentMonthlyExpenseDelta,
    netMonthly: summary.currentNetMonthly,
    stabilityMonths: summary.stabilityMonths,
    projectedSwing: summary.projectedSwing,
  };
}

export function generateMilestones(
  pathNodes: LifePathNodeDef[],
  customEvents: LifePathCustomEvent[]
): GeneratedLifePathMilestone[] {
  const milestones: GeneratedLifePathMilestone[] = [];

  for (const node of pathNodes) {
    if (!node.milestoneTemplates?.length) continue;
    node.milestoneTemplates.forEach((template, index) => {
      milestones.push({
        sourceKey: `node:${node.id}:${index}`,
        title: template.title,
        detail: template.detail ?? node.summary ?? "Use this branch as a checkpoint for your plan.",
        phase: template.phase,
      });
    });
  }

  for (const event of customEvents) {
    CUSTOM_EVENT_MILESTONES[event.category].forEach((template, index) => {
      milestones.push({
        sourceKey: `event:${event.id}:${index}`,
        title: template.title,
        detail: event.notes ? `${template.detail} Notes: ${event.notes}` : template.detail,
        phase: template.phase,
      });
    });

    if (event.risk !== "stable") {
      milestones.push({
        sourceKey: `event:${event.id}:risk`,
        title: `Set a fallback if "${event.label}" stays ${RISK_LABEL[event.risk].toLowerCase()}`,
        detail: "Choose the bill cuts, savings use, support options, or follow-up steps you will trigger if this event costs more or lasts longer than expected.",
        phase: event.risk === "crisis" ? "now" : "next30",
      });
    }
  }

  return milestones;
}

export function getTopRisks(
  template: LifePathTemplate,
  selections: Record<string, number>,
  customEvents: LifePathCustomEvent[]
): string[] {
  const path = getPathThroughTemplate(template, selections);
  const riskLabels = path
    .filter((node) => node.type === "outcome")
    .map((node) => {
      const incoming = template.edges.find((edge) => edge.to === node.id);
      const risk = incoming?.risk;
      return risk && risk !== "stable" ? `${node.label} (${RISK_LABEL[risk]})` : null;
    })
    .filter((label): label is string => Boolean(label));

  const eventLabels = customEvents
    .filter((event) => event.risk !== "stable")
    .map((event) => `${event.label} (${RISK_LABEL[event.risk]})`);

  return [...riskLabels, ...eventLabels].slice(0, 5);
}

export function buildBuddyContext(
  template: LifePathTemplate,
  selections: Record<string, number>,
  customEvents: LifePathCustomEvent[],
  upcomingMilestones: GeneratedLifePathMilestone[],
  zoom: TimeZoom
): string {
  const path = getPathThroughTemplate(template, selections)
    .filter((node) => node.type !== "root")
    .map((node) => node.label)
    .join(" -> ");
  const eventText =
    customEvents.length > 0
      ? customEvents
          .map(
            (event) =>
              `${event.label} (${EVENT_CATEGORY_LABEL[event.category]}, starts month ${event.startMonthOffset + 1}, lasts ${event.durationMonths} months, ${RISK_LABEL[event.risk]})`
          )
          .join("; ")
      : "None";
  const milestoneText =
    upcomingMilestones.length > 0
      ? upcomingMilestones.slice(0, 5).map((milestone) => `${PHASE_LABEL[milestone.phase]}: ${milestone.title}`).join("; ")
      : "None";

  return `The user is using Flow of Life with template "${template.title}". Selected path: ${path || "No branch selected yet"}. Zoom: ${zoom}. Custom events: ${eventText}. Upcoming milestones: ${milestoneText}. Give practical next steps, tradeoffs, and ways to reduce risk.`;
}

export function edgeRiskForChild(
  template: LifePathTemplate,
  parentId: string,
  childId: string
): PathRiskLevel {
  const edge = template.edges.find((item) => item.from === parentId && item.to === childId);
  return edge?.risk ?? "stable";
}

export function layoutColumns(template: LifePathTemplate): Map<string, number> {
  const depth = new Map<string, number>();
  const root = template.nodes.find((node) => node.type === "root");
  if (!root) return depth;

  const queue: string[] = [root.id];
  depth.set(root.id, 0);

  while (queue.length) {
    const id = queue.shift()!;
    const currentDepth = depth.get(id) ?? 0;
    const outgoing = template.edges.filter((edge) => edge.from === id);
    for (const edge of outgoing) {
      if (!depth.has(edge.to)) {
        depth.set(edge.to, currentDepth + 1);
        queue.push(edge.to);
      }
    }
  }

  for (const node of template.nodes) {
    if (!depth.has(node.id)) depth.set(node.id, 0);
  }

  return depth;
}

export function nodesByDepth(template: LifePathTemplate): Map<number, LifePathNodeDef[]> {
  const columns = layoutColumns(template);
  const byColumn = new Map<number, LifePathNodeDef[]>();
  const maxColumn = Math.max(0, ...columns.values());

  for (let column = 0; column <= maxColumn; column += 1) {
    byColumn.set(column, []);
  }

  for (const node of template.nodes) {
    const column = columns.get(node.id) ?? 0;
    byColumn.get(column)!.push(node);
  }

  for (const [, nodes] of byColumn) {
    nodes.sort((a, b) => a.id.localeCompare(b.id));
  }

  return byColumn;
}
