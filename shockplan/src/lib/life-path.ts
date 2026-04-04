import type { LifePathNodeDef, LifePathTemplate, PathRiskLevel } from "@/types";

export type TimeZoom = "month" | "year" | "fiveYear";

export const ZOOM_TO_MONTHS: Record<TimeZoom, number> = {
  month: 6,
  year: 12,
  fiveYear: 60,
};

export const RISK_BG_CLASS: Record<PathRiskLevel, string> = {
  stable: "bg-green-500/15 border-green-500/40 text-green-700 dark:text-green-400",
  risky: "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300",
  crisis: "bg-red-500/15 border-red-500/40 text-red-800 dark:text-red-300",
};

export const RISK_LABEL: Record<PathRiskLevel, string> = {
  stable: "Stable",
  risky: "Risky",
  crisis: "Crisis",
};

export function getPathThroughTemplate(
  template: LifePathTemplate,
  selections: Record<string, number>
): LifePathNodeDef[] {
  const byId = new Map(template.nodes.map((n) => [n.id, n]));
  const root = template.nodes.find((n) => n.type === "root");
  if (!root) return [];

  const path: LifePathNodeDef[] = [root];
  let current = root;

  for (;;) {
    const outgoing = template.edges.filter((e) => e.from === current.id);
    if (outgoing.length === 0) break;

    if (outgoing.length === 1) {
      const next = byId.get(outgoing[0].to);
      if (!next) break;
      current = next;
      path.push(current);
      continue;
    }

    const sorted = [...outgoing].sort((a, b) => a.to.localeCompare(b.to));
    const idx = Math.min(
      selections[current.id] ?? 0,
      sorted.length - 1
    );
    const edge = sorted[idx];
    const next = byId.get(edge.to);
    if (!next) break;
    current = next;
    path.push(current);
  }

  return path;
}

export function accumulatePathMetrics(nodes: LifePathNodeDef[], horizonMonths: number) {
  let monthlyIncomeDelta = 0;
  let monthlyExpenseDelta = 0;
  let stabilityMonths = 0;

  for (const n of nodes) {
    if (n.type === "root" || n.type === "decision") continue;
    monthlyIncomeDelta += n.monthlyIncomeDelta;
    monthlyExpenseDelta += n.monthlyExpenseDelta;
    stabilityMonths += n.monthsToStability;
  }

  const netMonthly = monthlyIncomeDelta - monthlyExpenseDelta;
  const projectedSwing = netMonthly * horizonMonths;

  return {
    monthlyIncomeDelta,
    monthlyExpenseDelta,
    netMonthly,
    projectedSwing,
    stabilityMonths: Math.max(0, Math.round(stabilityMonths)),
  };
}

export function edgeRiskForChild(
  template: LifePathTemplate,
  parentId: string,
  childId: string
): PathRiskLevel {
  const e = template.edges.find((x) => x.from === parentId && x.to === childId);
  return e?.risk ?? "stable";
}

export function layoutColumns(template: LifePathTemplate): Map<string, number> {
  const depth = new Map<string, number>();
  const root = template.nodes.find((n) => n.type === "root");
  if (!root) return depth;

  const q: string[] = [root.id];
  depth.set(root.id, 0);

  while (q.length) {
    const id = q.shift()!;
    const d = depth.get(id) ?? 0;
    const outs = template.edges.filter((e) => e.from === id);
    for (const e of outs) {
      if (!depth.has(e.to)) {
        depth.set(e.to, d + 1);
        q.push(e.to);
      }
    }
  }

  for (const n of template.nodes) {
    if (!depth.has(n.id)) depth.set(n.id, 0);
  }

  return depth;
}

export function nodesByDepth(template: LifePathTemplate): Map<number, LifePathNodeDef[]> {
  const col = layoutColumns(template);
  const byCol = new Map<number, LifePathNodeDef[]>();
  const maxC = Math.max(0, ...col.values());

  for (let c = 0; c <= maxC; c++) {
    byCol.set(c, []);
  }

  for (const n of template.nodes) {
    const c = col.get(n.id) ?? 0;
    byCol.get(c)!.push(n);
  }

  for (const [, arr] of byCol) {
    arr.sort((a, b) => a.id.localeCompare(b.id));
  }

  return byCol;
}
