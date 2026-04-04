"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Download,
  Trash2,
  Database,
  Smartphone,
  Cloud,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  clearAllShockPlanLocal,
  getShockPlanLocalSnapshot,
  parseJsonSafe,
} from "@/lib/local-data";

type ProfileRow = { label: string; value: string };

function formatProfileValue(key: string, v: unknown): string {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <h2 className="text-base font-medium text-foreground tracking-tight">{label}</h2>
    </div>
  );
}

export default function MyDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serverProfile, setServerProfile] = useState<Record<string, unknown> | null>(null);
  const [serverScore, setServerScore] = useState<Record<string, unknown> | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localKeys, setLocalKeys] = useState<Record<string, string | null>>({});

  useEffect(() => { setLocalKeys(getShockPlanLocalSnapshot()); }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setFetchError(null);
      const deviceId = typeof window !== "undefined" ? localStorage.getItem("shockplan_device_id") || "" : "";
      try {
        const [pRes, sRes] = await Promise.all([
          fetch(`/api/profile?deviceId=${encodeURIComponent(deviceId)}`),
          fetch(`/api/score?deviceId=${encodeURIComponent(deviceId)}`),
        ]);
        if (cancelled) return;
        if (pRes.ok) setServerProfile((await pRes.json()) as Record<string, unknown>);
        else setServerProfile(null);
        if (sRes.ok) setServerScore((await sRes.json()) as Record<string, unknown>);
        else setServerScore(null);
        if (!pRes.ok && pRes.status !== 404) setFetchError("Could not load server profile. You can still export local data.");
      } catch {
        if (!cancelled) setFetchError("Network error while loading server data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const profileRows: ProfileRow[] = (() => {
    const src = serverProfile;
    if (!src) return [];
    const skip = new Set(["_id", "__v"]);
    const labels: Record<string, string> = {
      deviceId: "Device ID", userId: "User ID", household: "Household", housing: "Housing",
      incomeType: "Income type", incomeRange: "Income range", state: "State", insurance: "Insurance",
      dependents: "Dependents", canCover500: "$500 comfort", language: "Language",
      createdAt: "Created", updatedAt: "Updated",
    };
    return Object.entries(src)
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) => ({ label: labels[k] ?? k, value: formatProfileValue(k, v) }));
  })();

  async function handleExport() {
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    const snapshot = getShockPlanLocalSnapshot();
    const parsedLocal: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(snapshot)) {
      parsedLocal[k] = typeof v === "string" ? parseJsonSafe(v) : v;
    }
    let flowPlans: unknown[] | null = null;
    try {
      const flowRes = await fetch(`/api/flow-plans?deviceId=${encodeURIComponent(deviceId)}`);
      if (flowRes.ok) { const flowData = (await flowRes.json()) as { items?: unknown[] }; flowPlans = flowData.items ?? []; }
    } catch { flowPlans = null; }
    const payload = { exportedAt: new Date().toISOString(), serverProfile, serverScore, flowPlans, localStorage: parsedLocal };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shockplan-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const deviceId = localStorage.getItem("shockplan_device_id") || "";
      const res = await fetch(`/api/profile?deviceId=${encodeURIComponent(deviceId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      clearAllShockPlanLocal();
      setDeleteOpen(false);
      router.push("/onboarding");
    } catch {
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div className="relative w-full min-h-screen max-w-4xl mx-auto px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div
            className="absolute top-0 right-0 w-2/3 h-2/3 opacity-40 dark:opacity-10"
            style={{ background: "radial-gradient(ellipse at top right, #FEFAE8 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative space-y-5">
          {/* Header */}
          <section>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card shrink-0">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-[28px] font-medium text-foreground tracking-[-0.02em]">
                  My Data
                </h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Your data belongs to you. See what we store, download a copy, or delete it anytime.
                </p>
              </div>
            </div>
          </section>

          {/* Where data lives */}
          <section>
            <SectionHeader icon={Database} label="Where your data lives" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="border border-border bg-card rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] py-0 gap-0">
                <CardContent className="p-4 sm:p-5 flex gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-[#1A1A1A] shrink-0">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">On this device</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Preferences and a cached copy of your profile in your browser (localStorage). Clearing site data removes it.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-border bg-card rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] py-0 gap-0">
                <CardContent className="p-4 sm:p-5 flex gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-muted shrink-0">
                    <Cloud className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">On ShockPlan servers</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      If you completed onboarding or signed in, your profile and score are stored in our database so you can use the app across sessions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Server profile */}
          <section>
            <SectionHeader icon={Database} label="Data we hold about you" />
            {fetchError && (
              <p className="text-sm text-foreground mb-3 bg-muted/40 border border-border rounded-[10px] px-4 py-2.5">
                {fetchError}
              </p>
            )}
            <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden py-0 gap-0">
              <div className="h-1 w-full shrink-0 bg-[#F5C518]" />
              <CardContent className="p-0">
                {loading ? (
                  <p className="p-5 text-sm text-muted-foreground">Loading…</p>
                ) : serverProfile && profileRows.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {profileRows.map((row, i) => (
                      <li
                        key={row.label}
                        className={`flex flex-col sm:flex-row sm:items-center gap-1 px-5 py-3 text-sm ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                      >
                        <span className="font-medium text-muted-foreground sm:w-44 shrink-0 text-xs">{row.label}</span>
                        <span className="text-foreground wrap-break-word font-normal">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-5 text-sm text-muted-foreground">
                    No server profile found yet. Complete onboarding or sign in to sync data.
                  </p>
                )}
                {serverScore && (
                  <div className="border-t border-border px-5 py-4 bg-muted/15 space-y-2">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Readiness score</span>
                    <p className="text-foreground tabular-nums text-3xl font-light">
                      {String(serverScore.score ?? "—")}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/ 100</span>
                    </p>
                    {serverScore.breakdown != null && typeof serverScore.breakdown === "object" && !Array.isArray(serverScore.breakdown) ? (
                      <ul className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                        {Object.entries(serverScore.breakdown as Record<string, number>).map(([k, v]) => (
                          <li key={k} className="flex justify-between gap-2">
                            <span className="capitalize">{k}</span>
                            <span className="text-foreground tabular-nums font-medium">{v}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Local storage */}
          <section>
            <SectionHeader icon={Smartphone} label="On this device (localStorage)" />
            <Card className="border border-border rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] py-0 gap-0">
              <CardContent className="p-4 sm:p-5">
                {Object.keys(localKeys).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ShockPlan keys in localStorage.</p>
                ) : (
                  <ul className="space-y-2 text-xs font-mono break-all">
                    {Object.entries(localKeys).map(([k, v]) => (
                      <li key={k} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                        <span className="text-foreground font-medium">{k}</span>
                        <span className="text-muted-foreground block mt-0.5 whitespace-pre-wrap">
                          {v && v.length > 200 ? `${v.slice(0, 200)}…` : v ?? "null"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {/* How it works */}
          <section>
            <SectionHeader icon={BookOpen} label="How ShockPlan works" />
            <Card className="border border-border bg-card rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] py-0 gap-0">
              <CardContent className="p-4 sm:p-5 space-y-3 text-sm text-muted-foreground">
                <p className="text-foreground font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  ShockPlan is built around transparency.
                </p>
                <ul className="space-y-2.5 pl-6 list-disc">
                  <li>The readiness score uses your onboarding answers (savings comfort, insurance, and whether you have used key tools). The formula is fixed and visible in the app.</li>
                  <li>The AI Buddy sends your message and profile context to Google Gemini to generate a reply. Conversations are not stored on our servers unless we add that feature later.</li>
                  <li>We do not sell your data or use it for ads. Export gives you a JSON file you can keep or audit.</li>
                  <li>Deleting data removes your profile and score from our database and clears ShockPlan data in this browser. You can go through onboarding again anytime.</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border border-border bg-card rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] py-0 gap-0">
              <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-border bg-[#FEFAE8] flex items-center justify-center">
                  <Download className="h-6 w-6 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Export data</p>
                  <p className="text-xs text-muted-foreground mt-1">Download your full data as a JSON file.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg mt-1 w-full" onClick={handleExport}>
                  Download JSON
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] sm:col-span-2 py-0 gap-0">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                    <Trash2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Delete all data</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Removes your profile and score from our servers and clears ShockPlan data in this browser. This cannot be undone.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete data
                </Button>
              </CardContent>
            </Card>
          </div>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent showCloseButton className="sm:max-w-md rounded-[10px]">
              <DialogHeader>
                <DialogTitle>Delete all your data?</DialogTitle>
                <DialogDescription>
                  This removes your ShockPlan profile and score from our database and clears saved data in this browser. You will be sent to onboarding to start fresh.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-end border-0 bg-transparent p-0 pt-2">
                <Button type="button" variant="outline" className="rounded-lg" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" className="rounded-lg" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting…" : "Delete everything"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AppShell>
  );
}
