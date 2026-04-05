"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  DollarSign,
  Download,
  GitBranch,
  Loader2,
  MessageCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  EVENT_CATEGORY_LABEL,
  EVENT_STATUSES,
  EVENT_STATUS_COLOR,
  EVENT_STATUS_LABEL,
  PHASE_LABEL,
  RISK_LABEL,
  ZOOM_TO_MONTHS,
  buildBuddyContext,
  buildProjection,
  generateMilestones,
  getPathThroughTemplate,
  getTopRisks,
  initialSelections,
} from "@/lib/life-path";
import { CRISIS_TO_TEMPLATE, LIFE_PATH_TEMPLATES, getTemplateById } from "@/lib/life-path-templates";
import type {
  EventStatus,
  LifePathCustomEvent,
  LifePathEventCategory,
  LifePathManualMilestone,
  LifePathMilestonePhase,
  LifePathScenario,
} from "@/types";

const LifePathReactFlow = dynamic(
  () => import("./life-path-react-flow").then((module) => module.LifePathReactFlow),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70vh,640px)] min-h-[420px] flex items-center justify-center rounded-[10px] border border-border bg-card shadow-[0_1px_4px_rgba(0,0,0,0.05)] text-muted-foreground text-sm">
        Loading graph...
      </div>
    ),
  }
);

const ACTIVE_SCENARIO_KEY = "shockplan_flow_active_plan_id";
const EVENT_PHASES: LifePathMilestonePhase[] = ["now", "next30", "oneToThreeMonths", "later"];
const CATEGORY_OPTIONS: LifePathEventCategory[] = [
  "income",
  "housing",
  "family",
  "health",
  "debt",
  "transport",
  "education",
  "benefits",
  "savings",
  "other",
];

const PRESET_EVENTS: Array<{
  label: string;
  category: LifePathEventCategory;
  risk: LifePathCustomEvent["risk"];
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
  oneTimeCashDelta: number;
  startMonthOffset: number;
  durationMonths: number;
  notes: string;
}> = [
  {
    label: "New job",
    category: "income",
    risk: "stable",
    monthlyIncomeDelta: 900,
    monthlyExpenseDelta: 0,
    oneTimeCashDelta: 0,
    startMonthOffset: 0,
    durationMonths: 12,
    notes: "Use this if a raise or replacement role changes your recurring income.",
  },
  {
    label: "Medical event",
    category: "health",
    risk: "crisis",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 300,
    oneTimeCashDelta: -750,
    startMonthOffset: 0,
    durationMonths: 6,
    notes: "Track both recurring follow-up costs and the first large bill or deductible hit.",
  },
  {
    label: "Lower rent",
    category: "housing",
    risk: "stable",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: -250,
    oneTimeCashDelta: -500,
    startMonthOffset: 1,
    durationMonths: 12,
    notes: "Good for modeling a move that saves money after the deposit or move-in costs.",
  },
  {
    label: "Childcare cost",
    category: "family",
    risk: "risky",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 450,
    oneTimeCashDelta: 0,
    startMonthOffset: 0,
    durationMonths: 12,
    notes: "Use this for new care routines, after-school coverage, or summer schedule changes.",
  },
];

type SaveState = "idle" | "saving" | "saved" | "error";

function createId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem("shockplan_device_id");
  if (existing) return existing;
  const created = createId("device");
  localStorage.setItem("shockplan_device_id", created);
  return created;
}

function formatMoney(n: number) {
  const abs = Math.abs(n);
  const text = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  return n < 0 ? `-${text}` : text;
}

function createEventDraft(source?: Partial<LifePathCustomEvent>): LifePathCustomEvent {
  return {
    id: source?.id ?? createId("event"),
    label: source?.label ?? "",
    category: source?.category ?? "other",
    monthlyIncomeDelta: source?.monthlyIncomeDelta ?? 0,
    monthlyExpenseDelta: source?.monthlyExpenseDelta ?? 0,
    oneTimeCashDelta: source?.oneTimeCashDelta ?? 0,
    startMonthOffset: source?.startMonthOffset ?? 0,
    durationMonths: source?.durationMonths ?? 6,
    risk: source?.risk ?? "stable",
    status: source?.status ?? "not_started",
    targetDate: source?.targetDate ?? "",
    notes: source?.notes ?? "",
  };
}

function createManualMilestoneDraft(source?: Partial<LifePathManualMilestone>): LifePathManualMilestone {
  return {
    id: source?.id ?? createId("milestone"),
    title: source?.title ?? "",
    detail: source?.detail ?? "",
    phase: source?.phase ?? "now",
    done: source?.done ?? false,
  };
}

function createScenarioPayload(name: string, templateId: string, base?: Partial<LifePathScenario>) {
  return {
    name: name.trim(),
    templateId,
    selections: base?.selections ?? initialSelections(getTemplateById(templateId) ?? LIFE_PATH_TEMPLATES[0]),
    nodeOverrides: base?.nodeOverrides ?? {},
    customEvents: base?.customEvents ?? [],
    manualMilestones: base?.manualMilestones ?? [],
    generatedMilestoneCompletion: base?.generatedMilestoneCompletion ?? {},
    notes: base?.notes ?? "",
    zoom: base?.zoom ?? "year",
  };
}

function scenarioSnapshot(scenario: LifePathScenario) {
  return JSON.stringify({
    name: scenario.name,
    templateId: scenario.templateId,
    selections: scenario.selections,
    nodeOverrides: scenario.nodeOverrides,
    customEvents: scenario.customEvents,
    manualMilestones: scenario.manualMilestones,
    generatedMilestoneCompletion: scenario.generatedMilestoneCompletion,
    notes: scenario.notes,
    zoom: scenario.zoom,
  });
}

function SaveIndicator({ state }: { state: SaveState }) {
  const content =
    state === "saving"
      ? { text: "Saving...", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> }
      : state === "saved"
        ? { text: "Saved", icon: <Save className="h-3.5 w-3.5" /> }
        : state === "error"
          ? { text: "Save failed", icon: <Trash2 className="h-3.5 w-3.5" /> }
          : { text: "Ready", icon: <GitBranch className="h-3.5 w-3.5" /> };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
      {content.icon}
      <span>{content.text}</span>
    </div>
  );
}

function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-medium text-foreground tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function FlowOfLifePlanner({ initialCrisisId }: { initialCrisisId?: string } = {}) {
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [scenarios, setScenarios] = useState<LifePathScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [scenarioDialogMode, setScenarioDialogMode] = useState<"create" | "rename" | null>(null);
  const [scenarioNameInput, setScenarioNameInput] = useState("");
  const [deleteScenarioOpen, setDeleteScenarioOpen] = useState(false);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState<LifePathCustomEvent>(createEventDraft());
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState<LifePathManualMilestone>(createManualMilestoneDraft());
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sheetSide, setSheetSide] = useState<"right" | "bottom">("right");
  const [nodeEditOpen, setNodeEditOpen] = useState(false);
  const [nodeEditId, setNodeEditId] = useState<string | null>(null);
  const [nodeEditIncome, setNodeEditIncome] = useState(0);
  const [nodeEditExpense, setNodeEditExpense] = useState(0);
  const flowRef = useRef<HTMLDivElement>(null);
  const savedSnapshots = useRef<Record<string, string>>({});

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId) ?? null,
    [scenarios, activeScenarioId]
  );
  const template = useMemo(
    () => getTemplateById(activeScenario?.templateId ?? LIFE_PATH_TEMPLATES[0].id) ?? LIFE_PATH_TEMPLATES[0],
    [activeScenario?.templateId]
  );
  const zoom = activeScenario?.zoom ?? "year";
  const horizonMonths = ZOOM_TO_MONTHS[zoom];
  const pathNodes = useMemo(
    () => (activeScenario ? getPathThroughTemplate(template, activeScenario.selections) : []),
    [activeScenario, template]
  );
  const projection = useMemo(
    () => buildProjection(pathNodes, activeScenario?.customEvents ?? [], horizonMonths, activeScenario?.nodeOverrides),
    [activeScenario?.customEvents, activeScenario?.nodeOverrides, horizonMonths, pathNodes]
  );
  const generatedMilestones = useMemo(
    () => generateMilestones(pathNodes, activeScenario?.customEvents ?? []),
    [activeScenario?.customEvents, pathNodes]
  );
  const topRisks = useMemo(
    () => (activeScenario ? getTopRisks(template, activeScenario.selections, activeScenario.customEvents) : []),
    [activeScenario, template]
  );
  const upcomingMilestones = useMemo(
    () =>
      generatedMilestones.filter(
        (milestone) => !activeScenario?.generatedMilestoneCompletion?.[milestone.sourceKey]
      ),
    [activeScenario?.generatedMilestoneCompletion, generatedMilestones]
  );
  const buddyContext = useMemo(
    () =>
      activeScenario
        ? buildBuddyContext(template, activeScenario.selections, activeScenario.customEvents, upcomingMilestones, activeScenario.zoom)
        : "",
    [activeScenario, template, upcomingMilestones]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setSheetSide(media.matches ? "right" : "bottom");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  async function createScenarioOnServer(name: string, templateId: string, currentDeviceId: string, base?: Partial<LifePathScenario>) {
    const response = await fetch("/api/flow-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createScenarioPayload(name, templateId, base),
        deviceId: currentDeviceId,
      }),
    });
    if (!response.ok) throw new Error("create");
    const data = (await response.json()) as { item: LifePathScenario };
    return data.item;
  }

  useEffect(() => {
    const resolvedDeviceId = getOrCreateDeviceId();
    setDeviceId(resolvedDeviceId);

    const crisisTemplateId = initialCrisisId ? CRISIS_TO_TEMPLATE[initialCrisisId] : undefined;

    const load = async () => {
      try {
        const response = await fetch(`/api/flow-plans?deviceId=${encodeURIComponent(resolvedDeviceId)}`);
        if (!response.ok) throw new Error("load");
        const data = (await response.json()) as { items?: LifePathScenario[] };
        const items = data.items ?? [];

        if (crisisTemplateId) {
          const existing = items.find((item) => item.templateId === crisisTemplateId);
          if (existing) {
            setScenarios(items);
            items.forEach((item) => { savedSnapshots.current[item.id] = scenarioSnapshot(item); });
            setActiveScenarioId(existing.id);
          } else {
            const tpl = getTemplateById(crisisTemplateId) ?? LIFE_PATH_TEMPLATES[0];
            const created = await createScenarioOnServer(tpl.title, crisisTemplateId, resolvedDeviceId);
            const all = [created, ...items];
            all.forEach((item) => { savedSnapshots.current[item.id] = scenarioSnapshot(item); });
            setScenarios(all);
            setActiveScenarioId(created.id);
          }
        } else if (items.length === 0) {
          const created = await createScenarioOnServer("Scenario 1", LIFE_PATH_TEMPLATES[0].id, resolvedDeviceId);
          setScenarios([created]);
          setActiveScenarioId(created.id);
          savedSnapshots.current[created.id] = scenarioSnapshot(created);
        } else {
          setScenarios(items);
          items.forEach((item) => {
            savedSnapshots.current[item.id] = scenarioSnapshot(item);
          });
          const remembered = localStorage.getItem(ACTIVE_SCENARIO_KEY);
          const active = items.find((item) => item.id === remembered) ?? items[0];
          setActiveScenarioId(active.id);
        }
        setStatus("ready");
      } catch {
        setLoadError("We could not load your saved Flow scenarios.");
        setStatus("error");
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!activeScenarioId || typeof window === "undefined") return;
    localStorage.setItem(ACTIVE_SCENARIO_KEY, activeScenarioId);
  }, [activeScenarioId]);

  useEffect(() => {
    if (!activeScenario) return;
    const snapshot = scenarioSnapshot(activeScenario);
    if (savedSnapshots.current[activeScenario.id] === snapshot) return;

    const timeout = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const response = await fetch(`/api/flow-plans/${activeScenario.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...createScenarioPayload(activeScenario.name, activeScenario.templateId, activeScenario),
            deviceId,
          }),
        });
        if (!response.ok) throw new Error("save");
        const data = (await response.json()) as { item?: LifePathScenario };
        const saved = data.item ?? activeScenario;
        savedSnapshots.current[saved.id] = scenarioSnapshot(saved);
        setScenarios((current) => current.map((item) => (item.id === saved.id ? saved : item)));
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [activeScenario, deviceId]);

  function updateActiveScenario(updater: (scenario: LifePathScenario) => LifePathScenario) {
    setScenarios((current) =>
      current.map((scenario) => (scenario.id === activeScenarioId ? updater(scenario) : scenario))
    );
  }

  async function handleCreateScenario() {
    if (!scenarioNameInput.trim()) return;
    try {
      const created = await createScenarioOnServer(
        scenarioNameInput,
        activeScenario?.templateId ?? LIFE_PATH_TEMPLATES[0].id,
        deviceId
      );
      savedSnapshots.current[created.id] = scenarioSnapshot(created);
      setScenarios((current) => [created, ...current]);
      setActiveScenarioId(created.id);
      setScenarioDialogMode(null);
      setScenarioNameInput("");
    } catch {
      setSaveState("error");
    }
  }

  async function handleDuplicateScenario() {
    if (!activeScenario) return;
    try {
      const created = await createScenarioOnServer(
        `${activeScenario.name} copy`,
        activeScenario.templateId,
        deviceId,
        activeScenario
      );
      savedSnapshots.current[created.id] = scenarioSnapshot(created);
      setScenarios((current) => [created, ...current]);
      setActiveScenarioId(created.id);
    } catch {
      setSaveState("error");
    }
  }

  async function handleDeleteScenario() {
    if (!activeScenario) return;
    try {
      await fetch(`/api/flow-plans/${activeScenario.id}?deviceId=${encodeURIComponent(deviceId)}`, {
        method: "DELETE",
      });
      const remaining = scenarios.filter((scenario) => scenario.id !== activeScenario.id);
      if (remaining.length === 0) {
        const created = await createScenarioOnServer("Scenario 1", LIFE_PATH_TEMPLATES[0].id, deviceId);
        savedSnapshots.current[created.id] = scenarioSnapshot(created);
        setScenarios([created]);
        setActiveScenarioId(created.id);
      } else {
        setScenarios(remaining);
        setActiveScenarioId(remaining[0].id);
      }
      setDeleteScenarioOpen(false);
    } catch {
      setSaveState("error");
    }
  }

  function openEventDraft(source?: Partial<LifePathCustomEvent>) {
    setEditingEventId(source?.id ?? null);
    setEventDraft(createEventDraft(source));
    setEventSheetOpen(true);
  }

  function saveEventDraft() {
    if (!eventDraft.label.trim()) return;
    updateActiveScenario((scenario) => {
      if (editingEventId) {
        return { ...scenario, customEvents: scenario.customEvents.map((item) => (item.id === editingEventId ? eventDraft : item)) };
      }
      // Stamp new events with the current branch leaf so they stay connected to it
      const leaf = pathNodes[pathNodes.length - 1];
      const stamped = { ...eventDraft, attachedNodeId: eventDraft.attachedNodeId || leaf?.id };
      return { ...scenario, customEvents: [...scenario.customEvents, stamped] };
    });
    setEventSheetOpen(false);
    setEditingEventId(null);
  }

  function deleteEvent() {
    if (!editingEventId) return;
    updateActiveScenario((scenario) => ({
      ...scenario,
      customEvents: scenario.customEvents.filter((item) => item.id !== editingEventId),
    }));
    setEventSheetOpen(false);
    setEditingEventId(null);
  }

  function openMilestoneDraft(source?: Partial<LifePathManualMilestone>, phase?: LifePathMilestonePhase) {
    setEditingMilestoneId(source?.id ?? null);
    setMilestoneDraft(createManualMilestoneDraft({ ...source, phase: phase ?? source?.phase }));
    setMilestoneDialogOpen(true);
  }

  function saveManualMilestone() {
    if (!milestoneDraft.title.trim()) return;
    updateActiveScenario((scenario) => {
      const manualMilestones = editingMilestoneId
        ? scenario.manualMilestones.map((item) => (item.id === editingMilestoneId ? milestoneDraft : item))
        : [...scenario.manualMilestones, milestoneDraft];
      return { ...scenario, manualMilestones };
    });
    setMilestoneDialogOpen(false);
    setEditingMilestoneId(null);
  }

  function moveManualMilestone(id: string, direction: "up" | "down") {
    updateActiveScenario((scenario) => {
      const items = [...scenario.manualMilestones];
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return scenario;
      const phase = items[index].phase;
      const phaseIndexes = items
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter(({ item }) => item.phase === phase)
        .map(({ itemIndex }) => itemIndex);
      const phasePosition = phaseIndexes.indexOf(index);
      const swapIndex = direction === "up" ? phaseIndexes[phasePosition - 1] : phaseIndexes[phasePosition + 1];
      if (swapIndex == null) return scenario;
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
      return { ...scenario, manualMilestones: items };
    });
  }

  async function exportImage() {
    const element = flowRef.current;
    if (!element || !activeScenario) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `shockplan-flow-${activeScenario.id}.png`;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Loading your Flow scenarios...</p>;
  }

  if (status === "error" || !activeScenario) {
    return (
      <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-6 text-sm text-muted-foreground">
          {loadError ?? "We could not load Flow of Life."}
        </CardContent>
      </Card>
    );
  }

  const milestoneGroups = EVENT_PHASES.map((phase) => ({
    phase,
    generated: generatedMilestones.filter((item) => item.phase === phase),
    manual: activeScenario.manualMilestones.filter((item) => item.phase === phase),
  }));

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
      <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <SectionTitle
            title="Saved scenarios"
            description="Switch between named plans, duplicate an idea, or rename it as your situation changes."
            action={<SaveIndicator state={saveState} />}
          />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <select
              value={activeScenario.id}
              onChange={(event) => setActiveScenarioId(event.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => {
                setScenarioDialogMode("create");
                setScenarioNameInput(`Scenario ${scenarios.length + 1}`);
              }}>
                <Plus className="h-4 w-4" />
                New
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => void handleDuplicateScenario()}>
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => {
                setScenarioDialogMode("rename");
                setScenarioNameInput(activeScenario.name);
              }}>
                <Pencil className="h-4 w-4" />
                Rename
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteScenarioOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {LIFE_PATH_TEMPLATES.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={item.id === activeScenario.templateId ? "default" : "outline"}
                size="sm"
                className="rounded-lg"
                onClick={() =>
                  updateActiveScenario((scenario) => ({
                    ...scenario,
                    templateId: item.id,
                    selections: initialSelections(item),
                  }))
                }
              >
                {item.title}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </CardContent>
      </Card>

      {/* ── Financial Wellness Pipeline ── */}
      <Card className="border border-[#F5C518]/30 rounded-[10px] bg-[#FEFAE8] dark:bg-[#F5C518]/5 shadow-none">
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#111111] dark:text-[#F5C518] mb-3">Financial Wellness Pipeline</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/crisis" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A] text-white font-semibold hover:bg-[#333] transition-colors">
              <AlertTriangle className="h-3 w-3" />
              Crisis
            </Link>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5C518] text-[#111111] font-semibold">
              <GitBranch className="h-3 w-3" />
              Flow Plan
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Link href="/budget" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors">
              <DollarSign className="h-3 w-3" />
              Budget
            </Link>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Link href="/buddy" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors">
              <MessageCircle className="h-3 w-3" />
              AI Buddy
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Identify a crisis → map recovery paths here → build a budget around your chosen path → talk it through with your AI Buddy.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {(["month", "year", "fiveYear"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant={zoom === value ? "secondary" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => updateActiveScenario((scenario) => ({ ...scenario, zoom: value }))}
          >
            {value === "month" ? "6 months" : value === "year" ? "1 year" : "5 years"}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => openEventDraft()}>
          <Plus className="h-4 w-4" />
          Add event
        </Button>
        {PRESET_EVENTS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => openEventDraft(preset)}
          >
            {preset.label}
          </Button>
        ))}
        <Button type="button" variant="outline" size="sm" className="rounded-lg" disabled={exporting} onClick={() => void exportImage()}>
          <Download className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export PNG"}
        </Button>
        <Link
          href={`/buddy?context=${encodeURIComponent(buddyContext)}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg gap-2 inline-flex")}
        >
          <MessageCircle className="h-4 w-4" />
          Ask Buddy
        </Link>
      </div>

      <div
        ref={flowRef}
        className="rounded-[10px] border border-border bg-card shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden h-[min(70vh,640px)] min-h-[420px]"
      >
        <LifePathReactFlow
          template={template}
          selections={activeScenario.selections}
          setSelections={(updater) =>
            updateActiveScenario((scenario) => ({
              ...scenario,
              selections: typeof updater === "function" ? updater(scenario.selections) : updater,
            }))
          }
          customEvents={activeScenario.customEvents}
          selectedCustomEventId={editingEventId ?? undefined}
          nodeOverrides={activeScenario.nodeOverrides}
          onSelectCustomEvent={(id) => {
            const found = activeScenario.customEvents.find((item) => item.id === id);
            if (found) openEventDraft(found);
          }}
          onAddEvent={() => openEventDraft()}
          onEditOutcomeNode={(nodeId) => {
            const def = template.nodes.find((n) => n.id === nodeId);
            if (!def) return;
            const override = activeScenario.nodeOverrides?.[nodeId];
            setNodeEditId(nodeId);
            setNodeEditIncome(override?.monthlyIncomeDelta ?? def.monthlyIncomeDelta);
            setNodeEditExpense(override?.monthlyExpenseDelta ?? def.monthlyExpenseDelta);
            setNodeEditOpen(true);
          }}
          onLinkEvent={(eventId, sourceNodeId) => {
            updateActiveScenario((scenario) => ({
              ...scenario,
              customEvents: scenario.customEvents.map((ev) =>
                ev.id === eventId ? { ...ev, attachedNodeId: sourceNodeId } : ev
              ),
            }));
          }}
        />
      </div>

      {/* ── Budget Impact Summary ── */}
      <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground tracking-tight">Budget impact</h2>
              <p className="text-sm text-muted-foreground mt-1">How this flow plan affects your monthly finances.</p>
            </div>
            <Link
              href="/budget"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg gap-2 inline-flex")}
            >
              <DollarSign className="h-4 w-4" />
              Open Budget Tool
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="rounded-[10px] border border-border bg-background p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Monthly income change</p>
              <p className={`text-lg font-light tabular-nums ${projection.summary.currentMonthlyIncomeDelta >= 0 ? "text-foreground" : "text-destructive"}`}>
                {projection.summary.currentMonthlyIncomeDelta >= 0 ? "+" : ""}{formatMoney(projection.summary.currentMonthlyIncomeDelta)}
              </p>
            </div>
            <div className="rounded-[10px] border border-border bg-background p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Monthly expense change</p>
              <p className={`text-lg font-light tabular-nums ${projection.summary.currentMonthlyExpenseDelta <= 0 ? "text-foreground" : "text-destructive"}`}>
                {projection.summary.currentMonthlyExpenseDelta > 0 ? "+" : ""}{formatMoney(projection.summary.currentMonthlyExpenseDelta)}
              </p>
            </div>
            <div className="rounded-[10px] border border-border bg-background p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Net monthly impact</p>
              <p className={`text-lg font-light tabular-nums ${projection.summary.currentNetMonthly >= 0 ? "text-[#F5C518]" : "text-destructive"}`}>
                {projection.summary.currentNetMonthly >= 0 ? "+" : ""}{formatMoney(projection.summary.currentNetMonthly)}
              </p>
            </div>
            <div className="rounded-[10px] border border-border bg-background p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{horizonMonths}-month swing</p>
              <p className={`text-lg font-light tabular-nums ${projection.summary.projectedSwing >= 0 ? "text-foreground" : "text-destructive"}`}>
                {projection.summary.projectedSwing >= 0 ? "+" : ""}{formatMoney(projection.summary.projectedSwing)}
              </p>
            </div>
          </div>
          {activeScenario.customEvents.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeScenario.customEvents.map((event) => (
                <span key={event.id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${EVENT_STATUS_COLOR[event.status]}`}>
                  {event.label}: {EVENT_STATUS_LABEL[event.status]}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="p-5 flex flex-col gap-4">
            <SectionTitle
              title="Projection"
              description={`Month-aware summary for the next ${horizonMonths} months based on your branch and custom events.`}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Income delta / mo</p>
                <p className="font-light text-foreground tabular-nums">{formatMoney(projection.summary.currentMonthlyIncomeDelta)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Expense delta / mo</p>
                <p className="font-light text-foreground tabular-nums">{formatMoney(projection.summary.currentMonthlyExpenseDelta)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current net / mo</p>
                <p className="font-light text-foreground tabular-nums">{formatMoney(projection.summary.currentNetMonthly)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Average net / mo</p>
                <p className="font-light text-foreground tabular-nums">{formatMoney(projection.summary.averageNetMonthly)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Projected swing</p>
                <p className="font-light text-foreground tabular-nums">{formatMoney(projection.summary.projectedSwing)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Stability signal</p>
                <p className="font-light text-foreground tabular-nums">
                  {projection.summary.stabilityMonths <= 0 ? "Stretched" : `~${projection.summary.stabilityMonths} mo`}
                </p>
              </div>
            </div>
            <div className="rounded-[10px] border border-border bg-background">
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">Monthly timeline</p>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-border">
                {projection.months.map((month) => (
                  <li key={month.month} className="px-4 py-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{month.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Net {formatMoney(month.netChange)} | Cumulative {formatMoney(month.cumulativeSwing)}
                        </p>
                        {month.activeEvents.length > 0 ? (
                          <p className="text-xs text-muted-foreground mt-1">Active: {month.activeEvents.join(", ")}</p>
                        ) : null}
                      </div>
                      {month.oneTimeCashDelta !== 0 ? (
                        <span className="text-xs font-semibold text-foreground tabular-nums">
                          One-time {formatMoney(month.oneTimeCashDelta)}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="p-5 flex flex-col gap-4">
            <SectionTitle
              title="Scenario details"
              description="These notes and event cards help you keep the projection grounded in real choices."
            />
            <div className="flex flex-wrap gap-2">
              {topRisks.length > 0 ? (
                topRisks.map((risk) => (
                  <span key={risk} className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
                    {risk}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No major risks flagged yet.</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow-notes">Scenario notes</Label>
              <Textarea
                id="flow-notes"
                value={activeScenario.notes}
                onChange={(event) => updateActiveScenario((scenario) => ({ ...scenario, notes: event.target.value }))}
                placeholder="Write context you want to preserve for this scenario..."
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Custom events</p>
              {activeScenario.customEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add events like a new job, lower rent, or a medical bill to make the scenario more realistic.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeScenario.customEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className="text-left rounded-[10px] border border-border bg-background px-4 py-3 hover:bg-muted/50 transition-colors"
                      onClick={() => openEventDraft(event)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground">{event.label}</p>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${EVENT_STATUS_COLOR[event.status]}`}>
                          {EVENT_STATUS_LABEL[event.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {EVENT_CATEGORY_LABEL[event.category]} | starts month {event.startMonthOffset + 1} | {event.durationMonths} months | {RISK_LABEL[event.risk]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatMoney(event.monthlyIncomeDelta)} income | {formatMoney(event.monthlyExpenseDelta)} expense | {formatMoney(event.oneTimeCashDelta)} one-time
                      </p>
                      {event.targetDate ? (
                        <p className="text-xs text-muted-foreground mt-1">Target: {event.targetDate}</p>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <SectionTitle
            title="Detailed plan"
            description="Suggested milestones come from the chosen branch and your custom events. Manual milestones are fully editable."
          />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {milestoneGroups.map(({ phase, generated, manual }) => (
              <Card key={phase} className="border border-border rounded-[10px] bg-background">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{PHASE_LABEL[phase]}</p>
                    <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => openMilestoneDraft(undefined, phase)}>
                      <Plus className="h-4 w-4" />
                      Add step
                    </Button>
                  </div>
                  {generated.length === 0 && manual.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No milestones in this phase yet.</p>
                  ) : null}
                  {generated.map((milestone) => (
                    <label key={milestone.sourceKey} className="flex items-start gap-3 rounded-[10px] border border-border px-3 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(activeScenario.generatedMilestoneCompletion[milestone.sourceKey])}
                        onChange={() =>
                          updateActiveScenario((scenario) => ({
                            ...scenario,
                            generatedMilestoneCompletion: {
                              ...scenario.generatedMilestoneCompletion,
                              [milestone.sourceKey]: !scenario.generatedMilestoneCompletion[milestone.sourceKey],
                            },
                          }))
                        }
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-foreground">{milestone.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.detail}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-2">Suggested</p>
                      </div>
                    </label>
                  ))}
                  {manual.map((milestone) => (
                    <div key={milestone.id} className="rounded-[10px] border border-border px-3 py-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={milestone.done}
                          onChange={() =>
                            updateActiveScenario((scenario) => ({
                              ...scenario,
                              manualMilestones: scenario.manualMilestones.map((item) =>
                                item.id === milestone.id ? { ...item, done: !item.done } : item
                              ),
                            }))
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{milestone.title}</p>
                          {milestone.detail ? <p className="text-xs text-muted-foreground mt-1">{milestone.detail}</p> : null}
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-2">Custom</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveManualMilestone(milestone.id, "up")}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveManualMilestone(milestone.id, "down")}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => openMilestoneDraft(milestone)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              updateActiveScenario((scenario) => ({
                                ...scenario,
                                manualMilestones: scenario.manualMilestones.filter((item) => item.id !== milestone.id),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={eventSheetOpen} onOpenChange={setEventSheetOpen}>
        <SheetContent side={sheetSide} className={sheetSide === "right" ? "sm:max-w-lg" : ""}>
          <SheetHeader>
            <SheetTitle>{editingEventId ? "Edit custom event" : "Add custom event"}</SheetTitle>
            <SheetDescription>Set timing, cash impact, and notes so this event reflects real life.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4 grid grid-cols-1 gap-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="event-label">Label</Label>
              <Input id="event-label" value={eventDraft.label} onChange={(event) => setEventDraft((current) => ({ ...current, label: event.target.value }))} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-category">Category</Label>
                <select
                  id="event-category"
                  value={eventDraft.category}
                  onChange={(event) => setEventDraft((current) => ({ ...current, category: event.target.value as LifePathEventCategory }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {EVENT_CATEGORY_LABEL[category]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-risk">Risk</Label>
                <select
                  id="event-risk"
                  value={eventDraft.risk}
                  onChange={(event) => setEventDraft((current) => ({ ...current, risk: event.target.value as LifePathCustomEvent["risk"] }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                >
                  {(["stable", "risky", "crisis"] as const).map((risk) => (
                    <option key={risk} value={risk}>
                      {RISK_LABEL[risk]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-status">Status</Label>
                <select
                  id="event-status"
                  value={eventDraft.status}
                  onChange={(event) => setEventDraft((current) => ({ ...current, status: event.target.value as EventStatus }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                >
                  {EVENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {EVENT_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-target-date">Target completion date</Label>
                <Input
                  id="event-target-date"
                  type="date"
                  value={eventDraft.targetDate}
                  onChange={(event) => setEventDraft((current) => ({ ...current, targetDate: event.target.value }))}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start">Start month</Label>
                <Input id="event-start" type="number" min={1} value={String(eventDraft.startMonthOffset + 1)} onChange={(event) => setEventDraft((current) => ({ ...current, startMonthOffset: Math.max(0, Number(event.target.value || 1) - 1) }))} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-duration">Duration (months)</Label>
                <Input id="event-duration" type="number" min={1} value={String(eventDraft.durationMonths)} onChange={(event) => setEventDraft((current) => ({ ...current, durationMonths: Math.max(1, Number(event.target.value || 1)) }))} className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-income">Income delta / mo</Label>
                <Input id="event-income" type="number" step={500} value={String(eventDraft.monthlyIncomeDelta)} onChange={(event) => setEventDraft((current) => ({ ...current, monthlyIncomeDelta: Number(event.target.value || 0) }))} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="event-expense">Expense delta / mo</Label>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{formatMoney(eventDraft.monthlyExpenseDelta)}</span>
                </div>
                <input
                  id="event-expense-slider"
                  type="range"
                  min={0}
                  max={10000}
                  step={50}
                  value={eventDraft.monthlyExpenseDelta}
                  onChange={(event) => setEventDraft((current) => ({ ...current, monthlyExpenseDelta: Number(event.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#E8E8E8] accent-[#F5C518]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>$0</span>
                  <span>$10,000</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-one-time">One-time cash delta</Label>
                <Input id="event-one-time" type="number" step={500} value={String(eventDraft.oneTimeCashDelta)} onChange={(event) => setEventDraft((current) => ({ ...current, oneTimeCashDelta: Number(event.target.value || 0) }))} className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-notes">Notes</Label>
              <Textarea id="event-notes" value={eventDraft.notes} onChange={(event) => setEventDraft((current) => ({ ...current, notes: event.target.value }))} className="rounded-lg" />
            </div>
          </div>
          <SheetFooter className="border-t border-border">
            {editingEventId ? (
              <Button type="button" variant="outline" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10" onClick={deleteEvent}>
                Delete event
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setEventSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-lg" onClick={saveEventDraft}>
              Save event
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={scenarioDialogMode !== null} onOpenChange={(open) => !open && setScenarioDialogMode(null)}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{scenarioDialogMode === "rename" ? "Rename scenario" : "Create scenario"}</DialogTitle>
            <DialogDescription>
              {scenarioDialogMode === "rename"
                ? "Update the scenario name. Autosave will keep the rest of the plan intact."
                : "Start a new saved scenario from the current template."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Scenario name</Label>
            <Input id="scenario-name" value={scenarioNameInput} onChange={(event) => setScenarioNameInput(event.target.value)} className="rounded-lg" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setScenarioDialogMode(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={() => {
                if (scenarioDialogMode === "rename") {
                  updateActiveScenario((scenario) => ({ ...scenario, name: scenarioNameInput || scenario.name }));
                  setScenarioDialogMode(null);
                } else {
                  void handleCreateScenario();
                }
              }}
            >
              {scenarioDialogMode === "rename" ? "Save name" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteScenarioOpen} onOpenChange={setDeleteScenarioOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this scenario?</DialogTitle>
            <DialogDescription>
              This removes the saved scenario and its custom event history. Other scenarios stay untouched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setDeleteScenarioOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" className="rounded-lg" onClick={() => void handleDeleteScenario()}>
              Delete scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent showCloseButton className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMilestoneId ? "Edit manual step" : "Add manual step"}</DialogTitle>
            <DialogDescription>Use manual steps for commitments you want to track yourself.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">Title</Label>
              <Input id="milestone-title" value={milestoneDraft.title} onChange={(event) => setMilestoneDraft((current) => ({ ...current, title: event.target.value }))} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-phase">Phase</Label>
              <select
                id="milestone-phase"
                value={milestoneDraft.phase}
                onChange={(event) => setMilestoneDraft((current) => ({ ...current, phase: event.target.value as LifePathMilestonePhase }))}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              >
                {EVENT_PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {PHASE_LABEL[phase]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-detail">Detail</Label>
              <Textarea id="milestone-detail" value={milestoneDraft.detail} onChange={(event) => setMilestoneDraft((current) => ({ ...current, detail: event.target.value }))} className="rounded-lg" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setMilestoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-lg" onClick={saveManualMilestone}>
              Save step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={nodeEditOpen} onOpenChange={setNodeEditOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize branch values</DialogTitle>
            <DialogDescription>
              Adjust the income and expense impact to match your real situation. These values override the template defaults for this scenario only.
            </DialogDescription>
          </DialogHeader>
          {nodeEditId && (
            <div className="grid grid-cols-1 gap-4">
              <p className="text-sm font-semibold text-foreground">
                {template.nodes.find((n) => n.id === nodeEditId)?.label}
              </p>
              <div className="space-y-2">
                <Label htmlFor="node-income">Monthly income delta</Label>
                <Input id="node-income" type="number" step={100} value={String(nodeEditIncome)} onChange={(e) => setNodeEditIncome(Number(e.target.value || 0))} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-expense">Monthly expense delta</Label>
                <Input id="node-expense" type="number" step={50} value={String(nodeEditExpense)} onChange={(e) => setNodeEditExpense(Number(e.target.value || 0))} className="rounded-lg" />
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Net monthly impact: <span className={`font-semibold ${nodeEditIncome - nodeEditExpense >= 0 ? "text-[#F5C518]" : "text-destructive"}`}>{formatMoney(nodeEditIncome - nodeEditExpense)}</span></p>
              </div>
            </div>
          )}
          <DialogFooter>
            {nodeEditId && activeScenario?.nodeOverrides?.[nodeEditId] && (
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => {
                  updateActiveScenario((scenario) => {
                    const next = { ...scenario.nodeOverrides };
                    delete next[nodeEditId!];
                    return { ...scenario, nodeOverrides: next };
                  });
                  setNodeEditOpen(false);
                }}
              >
                Reset to default
              </Button>
            )}
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setNodeEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={() => {
                if (!nodeEditId) return;
                updateActiveScenario((scenario) => ({
                  ...scenario,
                  nodeOverrides: {
                    ...scenario.nodeOverrides,
                    [nodeEditId]: { monthlyIncomeDelta: nodeEditIncome, monthlyExpenseDelta: nodeEditExpense },
                  },
                }));
                setNodeEditOpen(false);
              }}
            >
              Save values
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
