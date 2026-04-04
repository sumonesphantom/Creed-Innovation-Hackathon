import type { Edge, Node } from "@xyflow/react";

export type LifePathFlowNodeData = {
  kind: string;
  label: string;
  dimmed?: boolean;
  risk?: PathRiskLevel;
  income?: number;
  expense?: number;
  onRemove?: () => void;
  removeId?: string;
};
import { layoutColumns, nodesByDepth, edgeRiskForChild, getPathThroughTemplate } from "@/lib/life-path";
import type { LifePathExtraEvent, LifePathNodeDef, LifePathTemplate, PathRiskLevel } from "@/types";

const COL_GAP = 280;
const ROW_GAP = 130;
const PAD_X = 24;
const PAD_Y = 24;

const STROKE: Record<PathRiskLevel, string> = {
  stable: "#22c55e",
  risky: "#f59e0b",
  crisis: "#ef4444",
};

function isOutcomeOnPath(
  template: LifePathTemplate,
  selections: Record<string, number>,
  node: LifePathNodeDef
): boolean {
  if (node.type !== "outcome") return true;
  const incoming = template.edges.find((e) => e.to === node.id);
  const parent = incoming ? template.nodes.find((n) => n.id === incoming.from) : undefined;
  if (!parent || parent.type !== "decision") return true;
  const outs = template.edges.filter((e) => e.from === parent.id).sort((a, b) => a.to.localeCompare(b.to));
  const pick = outs[selections[parent.id] ?? 0];
  return pick?.to === node.id;
}

function isEdgeActive(
  template: LifePathTemplate,
  selections: Record<string, number>,
  from: string,
  to: string
): boolean {
  const edge = template.edges.find((x) => x.from === from && x.to === to);
  if (!edge) return true;
  const outs = template.edges.filter((x) => x.from === from);
  if (outs.length <= 1) return true;
  const sorted = [...outs].sort((a, b) => a.to.localeCompare(b.to));
  const pick = sorted[selections[from] ?? 0];
  return pick?.to === to;
}

export function buildLifePathFlowElements(
  template: LifePathTemplate,
  selections: Record<string, number>,
  extraEvents: LifePathExtraEvent[],
  onRemoveExtra?: (id: string) => void
): { nodes: Node<LifePathFlowNodeData>[]; edges: Edge[] } {
  const depthMap = layoutColumns(template);
  const byCol = nodesByDepth(template);
  const maxD = Math.max(0, ...depthMap.values());

  const nodes: Node<LifePathFlowNodeData>[] = [];
  const edges: Edge[] = [];

  for (let c = 0; c <= maxD; c++) {
    const colNodes = byCol.get(c) ?? [];
    colNodes.forEach((def, row) => {
      const x = PAD_X + c * COL_GAP;
      const y = PAD_Y + row * ROW_GAP;
      const onPath = isOutcomeOnPath(template, selections, def);

      let rfType = "lifeRoot";
      if (def.type === "decision") rfType = "lifeDecision";
      if (def.type === "outcome") rfType = "lifeOutcome";

      const parentEdge = template.edges.find((e) => e.to === def.id);
      const parent = parentEdge ? template.nodes.find((n) => n.id === parentEdge.from) : undefined;
      const risk =
        parent && parentEdge && def.type === "outcome"
          ? edgeRiskForChild(template, parent.id, def.id)
          : undefined;

      nodes.push({
        id: def.id,
        type: rfType,
        position: { x, y },
        data: {
          kind: def.type,
          label: def.label,
          dimmed: def.type === "outcome" ? !onPath : false,
          risk,
          income: def.monthlyIncomeDelta,
          expense: def.monthlyExpenseDelta,
        },
      });
    });
  }

  for (const e of template.edges) {
    const active = isEdgeActive(template, selections, e.from, e.to);
    edges.push({
      id: e.id,
      source: e.from,
      target: e.to,
      type: "smoothstep",
      animated: active,
      style: {
        stroke: STROKE[e.risk],
        strokeWidth: active ? 3 : 2,
        opacity: active ? 1 : 0.35,
      },
    });
  }

  const path = getPathThroughTemplate(template, selections);
  const leaf = path[path.length - 1];
  let attachX = PAD_X;
  let attachY = PAD_Y;
  const leafNode = nodes.find((n) => n.id === leaf?.id);
  if (leafNode) {
    attachX = leafNode.position.x + COL_GAP;
    attachY = leafNode.position.y;
  }

  extraEvents.forEach((ex, i) => {
    const y = attachY + i * ROW_GAP;
    nodes.push({
      id: ex.id,
      type: "lifeExtra",
      position: { x: attachX, y },
      data: {
        kind: "extra",
        label: ex.label,
        risk: ex.risk,
        income: ex.monthlyIncomeDelta,
        expense: ex.monthlyExpenseDelta,
        removeId: ex.id,
        onRemove: onRemoveExtra ? () => onRemoveExtra(ex.id) : undefined,
      },
    });

    const fromId = i === 0 ? leaf?.id : extraEvents[i - 1].id;
    if (fromId) {
      edges.push({
        id: `extra-edge-${fromId}-${ex.id}`,
        source: fromId,
        target: ex.id,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: STROKE[ex.risk],
          strokeWidth: 2,
          opacity: 0.9,
        },
      });
    }
  });

  return { nodes, edges };
}
