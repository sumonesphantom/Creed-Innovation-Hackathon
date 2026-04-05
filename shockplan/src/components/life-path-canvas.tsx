"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Download,
  MessageCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ZOOM_TO_MONTHS,
  accumulatePathMetrics,
  getPathThroughTemplate,
  type TimeZoom,
} from "@/lib/life-path";
import { LIFE_PATH_TEMPLATES } from "@/lib/life-path-templates";
import type { LifePathExtraEvent, LifePathTemplate } from "@/types";

const LifePathReactFlow = dynamic(
  () => import("./life-path-react-flow").then((m) => m.LifePathReactFlow),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70vh,640px)] min-h-[420px] flex items-center justify-center rounded-2xl border border-border bg-muted/30 text-muted-foreground text-sm">
        Loading graph…
      </div>
    ),
  }
);

function fmtMoney(n: number) {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return n < 0 ? `-${s}` : s;
}

function initialSelections(t: LifePathTemplate): Record<string, number> {
  const decs = t.nodes.filter((n) => n.type === "decision");
  return Object.fromEntries(decs.map((d) => [d.id, 0]));
}

const PRESET_EVENTS: { label: string; monthlyIncomeDelta: number; monthlyExpenseDelta: number; monthsToStability: number; risk: "stable" | "risky" | "crisis" }[] = [
  { label: "New job (raise)", monthlyIncomeDelta: 600, monthlyExpenseDelta: 0, monthsToStability: -4, risk: "stable" },
  { label: "New baby", monthlyIncomeDelta: 0, monthlyExpenseDelta: 450, monthsToStability: 10, risk: "risky" },
  { label: "Move to lower rent", monthlyIncomeDelta: 0, monthlyExpenseDelta: -300, monthsToStability: -3, risk: "stable" },
  { label: "Medical event", monthlyIncomeDelta: 0, monthlyExpenseDelta: 350, monthsToStability: 8, risk: "crisis" },
];

export function LifePathCanvas() {
  const [templateId, setTemplateId] = useState(LIFE_PATH_TEMPLATES[0].id);
  const template = useMemo(
    () => LIFE_PATH_TEMPLATES.find((t) => t.id === templateId)!,
    [templateId]
  );

  const [selections, setSelections] = useState<Record<string, number>>(() =>
    initialSelections(LIFE_PATH_TEMPLATES[0])
  );

  const [zoom, setZoom] = useState<TimeZoom>("year");
  const [extraEvents, setExtraEvents] = useState<LifePathExtraEvent[]>([]);
  const [selectedCustomEventId, setSelectedCustomEventId] = useState<string | undefined>();
  const [exporting, setExporting] = useState(false);

  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelections(initialSelections(template));
    setExtraEvents([]);
  }, [template]);

  const horizonMonths = ZOOM_TO_MONTHS[zoom];

  const pathNodes = useMemo(() => {
    const base = getPathThroughTemplate(template, selections);
    const extras = extraEvents.map((e) => ({
      id: e.id,
      type: "outcome" as const,
      label: e.label,
      monthlyIncomeDelta: e.monthlyIncomeDelta,
      monthlyExpenseDelta: e.monthlyExpenseDelta,
      monthsToStability: e.monthsToStability ?? e.durationMonths,
    }));
    return [...base, ...extras];
  }, [template, selections, extraEvents]);

  const metrics = useMemo(
    () => accumulatePathMetrics(pathNodes, horizonMonths),
    [pathNodes, horizonMonths]
  );

  async function exportImage() {
    const el = flowRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const bg =
        typeof window !== "undefined"
          ? getComputedStyle(el).backgroundColor || "#ffffff"
          : "#ffffff";
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bg,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `shockplan-flow-${template.id}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  function addPreset(ev: (typeof PRESET_EVENTS)[number]) {
    const id = `extra-${Date.now()}`;
    setExtraEvents((prev) => [
      ...prev,
      {
        id,
        label: ev.label,
        category: "other",
        monthlyIncomeDelta: ev.monthlyIncomeDelta,
        monthlyExpenseDelta: ev.monthlyExpenseDelta,
        oneTimeCashDelta: 0,
        startMonthOffset: 0,
        durationMonths: Math.max(1, Math.abs(ev.monthsToStability)),
        monthsToStability: ev.monthsToStability,
        risk: ev.risk,
        notes: "",
      },
    ]);
  }

  const buddyContext = useMemo(() => {
    const path = getPathThroughTemplate(template, selections)
      .filter((n) => n.type !== "root")
      .map((n) => n.label)
      .join(" → ");
    return `The user is using Flow of Life with template "${template.title}". Their selected path is: ${path}. They are viewing a ${zoom} horizon (${horizonMonths} months). Suggest practical next steps and tradeoffs for their situation.`;
  }, [template, selections, zoom, horizonMonths]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">Load a path, then tap an outcome node to switch branches.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LIFE_PATH_TEMPLATES.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant={t.id === templateId ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setTemplateId(t.id)}
            >
              {t.title}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{template.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Timeline zoom</span>
        {(
          [
            ["month", "6 months"],
            ["year", "1 year"],
            ["fiveYear", "5 years"],
          ] as const
        ).map(([k, label]) => (
          <Button
            key={k}
            type="button"
            variant={zoom === k ? "secondary" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setZoom(k)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl gap-2"
          disabled={exporting}
          onClick={() => exportImage()}
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export as PNG"}
        </Button>
        <Link
          href={`/buddy?context=${encodeURIComponent(buddyContext)}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-xl gap-2 inline-flex"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          Ask Buddy about this path
        </Link>
      </div>

      <div
        ref={flowRef}
        className="rounded-2xl border border-border bg-muted/20 overflow-hidden h-[min(70vh,640px)] min-h-[420px]"
      >
        <LifePathReactFlow
          template={template}
          selections={selections}
          setSelections={setSelections}
          customEvents={extraEvents}
          selectedCustomEventId={selectedCustomEventId}
          onSelectCustomEvent={setSelectedCustomEventId}
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Add life events to the canvas</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_EVENTS.map((ev) => (
            <Button
              key={ev.label}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl gap-1"
              onClick={() => addPreset(ev)}
            >
              <Plus className="h-3.5 w-3.5" />
              {ev.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border border-border shadow-sm bg-card rounded-2xl">
        <CardContent className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Projected impact</p>
            <p className="text-sm text-muted-foreground mt-1">
              Horizon: {horizonMonths} months ({zoom === "month" ? "6-mo" : zoom === "year" ? "1-yr" : "5-yr"} view)
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Income Δ / mo</p>
              <p className="font-bold tabular-nums text-foreground">{fmtMoney(metrics.monthlyIncomeDelta)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Expenses Δ / mo</p>
              <p className="font-bold tabular-nums text-foreground">{fmtMoney(metrics.monthlyExpenseDelta)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Net / mo</p>
              <p className="font-bold tabular-nums text-foreground">{fmtMoney(metrics.netMonthly)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Stability signal</p>
              <p className="font-bold tabular-nums text-foreground">
                {metrics.stabilityMonths <= 0 ? "Stretched" : `~${metrics.stabilityMonths} mo`}
              </p>
            </div>
          </div>
        </CardContent>
        <CardContent className="p-5 pt-0 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Cumulative swing vs starting point over {horizonMonths} months (illustrative):{" "}
            <span className="font-semibold text-foreground tabular-nums">{fmtMoney(metrics.projectedSwing)}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
