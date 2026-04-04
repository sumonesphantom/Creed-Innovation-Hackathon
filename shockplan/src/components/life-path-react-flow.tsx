"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect } from "react";
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
  type Node,
  type NodeProps,
  type Edge,
} from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildLifePathFlowElements,
  type LifePathFlowNodeData,
} from "@/lib/life-path-flow-layout";
import { RISK_BG_CLASS, RISK_LABEL } from "@/lib/life-path";
import type { LifePathExtraEvent, LifePathTemplate } from "@/types";

function fmtMoney(n: number) {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return n < 0 ? `-${s}` : s;
}

function LifeRootNode({ data }: NodeProps<Node<LifePathFlowNodeData>>) {
  return (
    <div className="w-[210px]">
      <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2 !border-0" />
      <Card className="border-2 border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-foreground leading-tight">{data.label}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Start here</p>
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
      <Card className="border-2 border-dashed border-border bg-muted/20 shadow-sm">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-foreground leading-tight">{data.label}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">Tap an outcome node to choose a branch.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LifeOutcomeNode({ data }: NodeProps<Node<LifePathFlowNodeData>>) {
  const risk = data.risk ?? "stable";
  return (
    <div className={`w-[210px] transition-opacity ${data.dimmed ? "opacity-40" : "opacity-100"}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-0" style={{ background: risk === "stable" ? "#22c55e" : risk === "risky" ? "#f59e0b" : "#ef4444" }} />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-0" style={{ background: risk === "stable" ? "#22c55e" : risk === "risky" ? "#f59e0b" : "#ef4444" }} />
      <Card className={`border-2 shadow-sm ${RISK_BG_CLASS[risk]}`}>
        <CardContent className="p-3 flex flex-col gap-0.5">
          <p className="text-xs font-bold text-foreground leading-snug">{data.label}</p>
          <p className="text-[10px] text-muted-foreground">
            {fmtMoney(data.income ?? 0)} in · {fmtMoney(data.expense ?? 0)} out / mo
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{RISK_LABEL[risk]}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LifeExtraNode({ data }: NodeProps<Node<LifePathFlowNodeData>>) {
  const risk = data.risk ?? "stable";
  return (
    <div className="w-[210px]">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-0" style={{ background: "#6366f1" }} />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-0 opacity-0 pointer-events-none" />
      <Card className={`border-2 shadow-sm ${RISK_BG_CLASS[risk]}`}>
        <CardContent className="p-3 flex flex-col gap-1">
          <p className="text-xs font-bold text-foreground">{data.label}</p>
          <p className="text-[10px] text-muted-foreground">
            {fmtMoney((data.income ?? 0) - (data.expense ?? 0))}/mo · {RISK_LABEL[risk]}
          </p>
          {data.onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="self-end h-6 text-[10px]"
              onClick={(e) => {
                e.stopPropagation();
                data.onRemove?.();
              }}
            >
              Remove
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const nodeTypes = {
  lifeRoot: LifeRootNode,
  lifeDecision: LifeDecisionNode,
  lifeOutcome: LifeOutcomeNode,
  lifeExtra: LifeExtraNode,
};

function FitViewOnChange({ templateId, extraCount }: { templateId: string; extraCount: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const t = window.setTimeout(() => {
      fitView({ padding: 0.2, duration: 250 });
    }, 50);
    return () => window.clearTimeout(t);
  }, [templateId, extraCount, fitView]);
  return null;
}

export interface LifePathReactFlowProps {
  template: LifePathTemplate;
  selections: Record<string, number>;
  setSelections: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  extraEvents: LifePathExtraEvent[];
  onRemoveExtra: (id: string) => void;
}

export function LifePathReactFlow({
  template,
  selections,
  setSelections,
  extraEvents,
  onRemoveExtra,
}: LifePathReactFlowProps) {
  const removeCb = useCallback(
    (id: string) => {
      onRemoveExtra(id);
    },
    [onRemoveExtra]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<LifePathFlowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const built = buildLifePathFlowElements(template, selections, extraEvents, removeCb);
    setNodes(built.nodes);
    setEdges(built.edges);
  }, [template, selections, extraEvents, removeCb, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
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
      setSelections((s) => ({ ...s, [parent.id]: idx }));
    },
    [template, setSelections]
  );

  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnScroll
          zoomOnScroll
          minZoom={0.4}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="rounded-2xl h-full w-full"
        >
          <Background gap={16} size={1} className="bg-transparent" />
          <Controls className="!bg-card !border-border !shadow-sm" />
          <MiniMap
            className="!bg-card/90 !border-border rounded-lg"
            maskColor="oklch(0.2 0.02 260 / 0.12)"
            nodeStrokeWidth={2}
          />
          <FitViewOnChange templateId={template.id} extraCount={extraEvents.length} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
