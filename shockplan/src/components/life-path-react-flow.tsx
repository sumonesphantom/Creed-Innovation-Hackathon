"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Handle,
  Position,
  type Connection,
  type Node,
  type NodeProps,
  type Edge,
} from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildLifePathFlowElements,
  type LifePathFlowNodeData,
} from "@/lib/life-path-flow-layout";
import { EVENT_STATUS_COLOR, EVENT_STATUS_LABEL, RISK_BG_CLASS, RISK_LABEL } from "@/lib/life-path";
import type { LifePathCustomEvent, LifePathTemplate } from "@/types";

function fmtMoney(n: number) {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return n < 0 ? `-${s}` : s;
}

function NodeCaption({ caption }: { caption?: string }) {
  if (!caption) return null;
  return <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{caption}</p>;
}

function LifeRootNode({ data }: NodeProps<Node<LifePathFlowNodeData>>) {
  return (
    <div className="w-[210px]">
      <Handle type="source" position={Position.Right} className="!bg-[#333333] !w-2 !h-2 !border-0" />
      <Card className="border border-border bg-card shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-3">
          <p className="text-sm font-medium text-foreground leading-tight">{data.label}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Start here</p>
          <NodeCaption caption={data.caption} />
        </CardContent>
      </Card>
    </div>
  );
}

function LifeDecisionNode({ data }: NodeProps<Node<LifePathFlowNodeData>>) {
  return (
    <div className="w-[210px]">
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-2 !h-2 !border-0" />
      <Card className="border border-dashed border-border bg-muted/20 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-3">
          <p className="text-sm font-medium text-foreground leading-tight">{data.label}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">Tap an outcome node to choose a branch.</p>
          <NodeCaption caption={data.caption} />
        </CardContent>
      </Card>
    </div>
  );
}

function LifeOutcomeNode({ data }: NodeProps<Node<LifePathFlowNodeData>>) {
  const risk = data.risk ?? "stable";
  const isActive = !data.dimmed;
  return (
    <div className={`w-[210px] transition-opacity ${data.dimmed ? "opacity-40" : "opacity-100"}`}>
      <Handle type="target" position={Position.Left} className="!bg-[#333333] !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-[#333333] !w-2 !h-2 !border-0" />
      <Card className={`border shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-shadow ${RISK_BG_CLASS[risk]} ${data.selected ? "ring-2 ring-primary shadow-md" : ""}`}>
        <CardContent className="p-3 flex flex-col gap-0.5">
          <p className="text-xs font-medium text-foreground leading-snug">{data.label}</p>
          <p className="text-[10px] text-muted-foreground">
            {fmtMoney(data.income ?? 0)} in | {fmtMoney(data.expense ?? 0)} out / mo
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{RISK_LABEL[risk]}</p>
          <NodeCaption caption={data.caption} />
          {isActive && <p className="text-[10px] text-[#F5C518] mt-1">Tap to customize values</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function LifeExtraNode({ data }: NodeProps<Node<LifePathFlowNodeData>>) {
  const risk = data.risk ?? "stable";
  const status = data.status ?? "not_started";
  return (
    <div className="w-[210px]">
      <Handle type="target" position={Position.Left} className="!bg-[#333333] !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-[#333333] !w-2 !h-2 !border-0" />
      <Card className={`border shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-shadow ${RISK_BG_CLASS[risk]} ${data.selected ? "ring-2 ring-primary shadow-md" : ""}`}>
        <CardContent className="p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground truncate">{data.label}</p>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${EVENT_STATUS_COLOR[status]}`}>
              {EVENT_STATUS_LABEL[status]}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {fmtMoney((data.income ?? 0) - (data.expense ?? 0))}/mo | {RISK_LABEL[risk]}
          </p>
          {data.targetDate ? (
            <p className="text-[10px] text-muted-foreground">Target: {data.targetDate}</p>
          ) : null}
          <NodeCaption caption={data.caption} />
          <p className="text-[10px] text-muted-foreground">Tap to edit</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LifeAddEventNode() {
  return (
    <div className="w-[210px]">
      <Handle type="target" position={Position.Left} className="!bg-[#C8C8C8] !w-2 !h-2 !border-0" />
      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] border-2 border-dashed border-[#C8C8C8] dark:border-[#555] bg-card/50 dark:bg-card/30 hover:border-[#F5C518] hover:bg-[#FEFAE8] dark:hover:bg-[#F5C518]/10 transition-colors cursor-pointer">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F5C518] text-[#111]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </span>
        <p className="text-xs font-semibold text-muted-foreground">Add event</p>
      </div>
    </div>
  );
}

const nodeTypes = {
  lifeRoot: LifeRootNode,
  lifeDecision: LifeDecisionNode,
  lifeOutcome: LifeOutcomeNode,
  lifeExtra: LifeExtraNode,
  lifeAddEvent: LifeAddEventNode,
};

function FitViewOnChange({ templateId, extraCount, shouldFit }: { templateId: string; extraCount: number; shouldFit: boolean }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (!shouldFit) return;
    const t = window.setTimeout(() => {
      fitView({ padding: 0.2, duration: 250 });
    }, 50);
    return () => window.clearTimeout(t);
  }, [templateId, extraCount, fitView, shouldFit]);
  return null;
}

export interface LifePathReactFlowProps {
  template: LifePathTemplate;
  selections: Record<string, number>;
  setSelections: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  nodeOverrides?: Record<string, { monthlyIncomeDelta: number; monthlyExpenseDelta: number }>;
  customEvents: LifePathCustomEvent[];
  selectedCustomEventId?: string;
  onSelectCustomEvent: (id: string) => void;
  onAddEvent: () => void;
  onEditOutcomeNode: (nodeId: string) => void;
  onLinkEvent: (eventId: string, sourceNodeId: string) => void;
}

export function LifePathReactFlow({
  template,
  selections,
  setSelections,
  nodeOverrides,
  customEvents,
  selectedCustomEventId,
  onSelectCustomEvent,
  onAddEvent,
  onEditOutcomeNode,
  onLinkEvent,
}: LifePathReactFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<LifePathFlowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [autoFit, setAutoFit] = useState(true);
  const [prevTemplateId, setPrevTemplateId] = useState(template.id);

  useEffect(() => {
    const built = buildLifePathFlowElements(template, selections, customEvents, selectedCustomEventId, nodeOverrides);

    // Only auto-fit when template changes (not on every data update)
    const templateChanged = template.id !== prevTemplateId;
    if (templateChanged) setPrevTemplateId(template.id);

    setNodes((currentNodes) => {
      if (templateChanged || currentNodes.length === 0) return built.nodes;
      // Merge: keep existing positions for nodes that were already present,
      // use layout positions only for new nodes
      const posMap = new Map(currentNodes.map((n) => [n.id, n.position]));
      return built.nodes.map((n) => {
        const existing = posMap.get(n.id);
        return existing ? { ...n, position: existing } : n;
      });
    });
    setEdges(built.edges);
    if (templateChanged) setAutoFit(true);
  }, [template, selections, customEvents, selectedCustomEventId, nodeOverrides, setNodes, setEdges, prevTemplateId]);

  const handleNodeDragStop = useCallback(() => {
    setAutoFit(false);
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      // Only allow linking TO an event node (lifeExtra) or between events
      const targetIsEvent = customEvents.some((e) => e.id === connection.target);
      if (targetIsEvent) {
        onLinkEvent(connection.target, connection.source);
      }
    },
    [customEvents, onLinkEvent]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id === "__add_event__") {
        onAddEvent();
        return;
      }
      if (node.type === "lifeExtra") {
        onSelectCustomEvent(node.id);
        return;
      }
      if (node.type !== "lifeOutcome") return;
      const def = template.nodes.find((n) => n.id === node.id);
      if (!def || def.type !== "outcome") return;
      const incoming = template.edges.find((e) => e.to === node.id);
      const parent = incoming ? template.nodes.find((n) => n.id === incoming.from) : undefined;
      if (!parent || parent.type !== "decision") return;
      const outs = template.edges
        .filter((e) => e.from === parent.id)
        .sort((a, b) => a.to.localeCompare(b.to));
      const idx = outs.findIndex((e) => e.to === node.id);
      if (idx < 0) return;
      // If already selected, open edit dialog
      const currentIdx = selections[parent.id] ?? 0;
      if (currentIdx === idx) {
        onEditOutcomeNode(node.id);
        return;
      }
      setSelections((s) => ({ ...s, [parent.id]: idx }));
    },
    [template, selections, setSelections, onSelectCustomEvent, onAddEvent, onEditOutcomeNode]
  );

  return (
    <ReactFlowProvider>
      <div className="h-full w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStop={handleNodeDragStop}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          panOnScroll
          zoomOnScroll
          minZoom={0.4}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="rounded-[10px] h-full w-full"
        >
          <Background gap={16} size={1} className="bg-transparent" />
          <Controls className="!bg-card !border-border !shadow-sm" />
          <MiniMap
            className="!bg-card/90 !border-border rounded-lg"
            maskColor="rgba(0,0,0,0.12)"
            nodeStrokeWidth={2}
          />
          <FitViewOnChange templateId={template.id} extraCount={customEvents.length} shouldFit={autoFit} />
        </ReactFlow>
        {!autoFit && (
          <button
            type="button"
            onClick={() => {
              // Reset positions to layout defaults
              const built = buildLifePathFlowElements(template, selections, customEvents, selectedCustomEventId, nodeOverrides);
              setNodes(built.nodes);
              setAutoFit(true);
            }}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1A1A1A] text-white hover:bg-[#333] dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-gray-200 shadow-md transition-colors"
          >
            Reset view
          </button>
        )}
      </div>
    </ReactFlowProvider>
  );
}
