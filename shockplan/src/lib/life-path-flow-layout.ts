import type { Edge, Node } from "@xyflow/react";
import { edgeRiskForChild, getPathThroughTemplate, layoutColumns, nodesByDepth } from "@/lib/life-path";
import type { EventStatus, LifePathCustomEvent, LifePathNodeDef, LifePathTemplate, PathRiskLevel } from "@/types";

export type LifePathFlowNodeData = {
  kind: string;
  label: string;
  caption?: string;
  dimmed?: boolean;
  selected?: boolean;
  risk?: PathRiskLevel;
  income?: number;
  expense?: number;
  status?: EventStatus;
  targetDate?: string;
};

const COL_GAP = 280;
const ROW_GAP = 130;
const PAD_X = 24;
const PAD_Y = 24;

const STROKE: Record<PathRiskLevel, string> = {
  stable: "#C8C8C8",
  risky: "#666666",
  crisis: "#1A1A1A",
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
  customEvents: LifePathCustomEvent[],
  selectedCustomEventId?: string,
  nodeOverrides?: Record<string, { monthlyIncomeDelta: number; monthlyExpenseDelta: number }>
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

      const override = nodeOverrides?.[def.id];
      nodes.push({
        id: def.id,
        type: rfType,
        position: { x, y },
        data: {
          kind: def.type,
          label: def.label,
          caption: def.summary,
          dimmed: def.type === "outcome" ? !onPath : false,
          risk,
          income: override?.monthlyIncomeDelta ?? def.monthlyIncomeDelta,
          expense: override?.monthlyExpenseDelta ?? def.monthlyExpenseDelta,
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

  // Anchor events at a fixed column after ALL template columns.
  const eventCol = maxD + 1;
  const attachX = PAD_X + eventCol * COL_GAP;
  const attachY = PAD_Y;

  customEvents.forEach((event, i) => {
    const y = attachY + i * ROW_GAP;
    nodes.push({
      id: event.id,
      type: "lifeExtra",
      position: { x: attachX, y },
      data: {
        kind: "extra",
        label: event.label,
        caption: `Starts month ${event.startMonthOffset + 1} | ${event.durationMonths} months`,
        risk: event.risk,
        income: event.monthlyIncomeDelta,
        expense: event.monthlyExpenseDelta,
        selected: selectedCustomEventId === event.id,
        status: event.status,
        targetDate: event.targetDate,
      },
    });

    // First event in each group connects to the branch node it was created on.
    // Falls back to current leaf if attachedNodeId not set (legacy events).
    const attachId = event.attachedNodeId || leaf?.id;
    const prevEvent = i > 0 ? customEvents[i - 1] : null;
    const sameGroup = prevEvent && (prevEvent.attachedNodeId || leaf?.id) === attachId;
    const fromId = sameGroup ? prevEvent.id : attachId;

    if (fromId) {
      edges.push({
        id: `extra-edge-${event.id}`,
        source: fromId,
        target: event.id,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: STROKE[event.risk],
          strokeWidth: 2,
          opacity: 0.9,
        },
      });
    }
  });

  // Add a "+" node — connects from the current branch leaf
  const lastNodeId = customEvents.length > 0
    ? customEvents[customEvents.length - 1].id
    : leaf?.id;
  const addNodeX = attachX;
  const addNodeY = customEvents.length > 0
    ? attachY + customEvents.length * ROW_GAP
    : attachY;

  nodes.push({
    id: "__add_event__",
    type: "lifeAddEvent",
    position: { x: addNodeX, y: addNodeY },
    data: {
      kind: "addEvent",
      label: "Add event",
    },
  });

  if (lastNodeId) {
    edges.push({
      id: "add-edge",
      source: lastNodeId,
      target: "__add_event__",
      type: "smoothstep",
      animated: false,
      style: {
        stroke: "#C8C8C8",
        strokeWidth: 2,
        strokeDasharray: "6 4",
        opacity: 0.5,
      },
    });
  }

  return { nodes, edges };
}
