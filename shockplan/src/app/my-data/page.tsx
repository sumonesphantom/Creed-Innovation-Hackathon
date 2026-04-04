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

export default function MyDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serverProfile, setServerProfile] = useState<Record<string, unknown> | null>(null);
  const [serverScore, setServerScore] = useState<Record<string, unknown> | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localKeys, setLocalKeys] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setLocalKeys(getShockPlanLocalSnapshot());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setFetchError(null);
      const deviceId =
        typeof window !== "undefined"
          ? localStorage.getItem("shockplan_device_id") || ""
          : "";
      try {
        const [pRes, sRes] = await Promise.all([
          fetch(`/api/profile?deviceId=${encodeURIComponent(deviceId)}`),
          fetch(`/api/score?deviceId=${encodeURIComponent(deviceId)}`),
        ]);
        if (cancelled) return;
        if (pRes.ok) {
          setServerProfile((await pRes.json()) as Record<string, unknown>);
        } else {
          setServerProfile(null);
        }
        if (sRes.ok) {
          setServerScore((await sRes.json()) as Record<string, unknown>);
        } else {
          setServerScore(null);
        }
        if (!pRes.ok && pRes.status !== 404) {
          setFetchError("Could not load server profile. You can still export local data.");
        }
      } catch {
        if (!cancelled) setFetchError("Network error while loading server data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const profileRows: ProfileRow[] = (() => {
    const src = serverProfile;
    if (!src) return [];
    const skip = new Set(["_id", "__v"]);
    const labels: Record<string, string> = {
      deviceId: "Device ID",
      userId: "User ID",
      household: "Household",
      housing: "Housing",
      incomeType: "Income type",
      incomeRange: "Income range",
      state: "State",
      insurance: "Insurance",
      dependents: "Dependents",
      canCover500: "$500 comfort",
      language: "Language",
      createdAt: "Created",
      updatedAt: "Updated",
    };
    return Object.entries(src)
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) => ({
        label: labels[k] ?? k,
        value: formatProfileValue(k, v),
      }));
  })();

  function handleExport() {
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    const snapshot = getShockPlanLocalSnapshot();
    const parsedLocal: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(snapshot)) {
      parsedLocal[k] = typeof v === "string" ? parseJsonSafe(v) : v;
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      serverProfile,
      serverScore,
      localStorage: parsedLocal,
    };
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
      const res = await fetch(`/api/profile?deviceId=${encodeURIComponent(deviceId)}`, {
        method: "DELETE",
      });
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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">My Data</h1>
          </div>
          <p className="text-base text-muted-foreground mt-2">
            Your data belongs to you. See what we store, download a copy, or delete it anytime.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight">Where your data lives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-border bg-card rounded-2xl">
              <CardContent className="p-5 flex gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">On this device</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preferences and a cached copy of your profile in your browser (localStorage). Clearing site data removes it.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card rounded-2xl">
              <CardContent className="p-5 flex gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 shrink-0">
                  <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">On ShockPlan servers</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    If you completed onboarding or signed in, your profile and score are stored in our database so you can use the app across sessions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-bold text-foreground tracking-tight mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            Data we hold about you
          </h2>
          {fetchError && (
            <p className="text-sm text-amber-600 dark:text-amber-500 mb-3">{fetchError}</p>
          )}
          <Card className="border border-border rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <p className="p-5 text-sm text-muted-foreground">Loading…</p>
              ) : serverProfile && profileRows.length > 0 ? (
                <ul className="divide-y divide-border">
                  {profileRows.map((row) => (
                    <li
                      key={row.label}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 px-5 py-3 text-sm"
                    >
                      <span className="font-medium text-muted-foreground sm:w-48 shrink-0">{row.label}</span>
                      <span className="text-foreground break-words">{row.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-5 text-sm text-muted-foreground">
                  No server profile found yet. Complete onboarding or sign in to sync data. Local keys are listed below.
                </p>
              )}
              {serverScore && (
                <div className="border-t border-border px-5 py-3 text-sm space-y-1">
                  <span className="font-medium text-muted-foreground">Readiness score</span>
                  <p className="text-foreground tabular-nums text-lg font-bold">
                    {String(serverScore.score ?? "—")} / 100
                  </p>
                  {serverScore.breakdown != null &&
                  typeof serverScore.breakdown === "object" &&
                  !Array.isArray(serverScore.breakdown) ? (
                    <ul className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1">
                      {Object.entries(serverScore.breakdown as Record<string, number>).map(([k, v]) => (
                        <li key={k}>
                          {k}: <span className="text-foreground tabular-nums">{v}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-bold text-foreground tracking-tight mb-3">On this device (localStorage)</h2>
          <Card className="border border-border rounded-2xl">
            <CardContent className="p-5">
              {Object.keys(localKeys).length === 0 ? (
                <p className="text-sm text-muted-foreground">No ShockPlan keys in localStorage.</p>
              ) : (
                <ul className="space-y-2 text-xs font-mono break-all">
                  {Object.entries(localKeys).map(([k, v]) => (
                    <li key={k}>
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-foreground block mt-0.5 whitespace-pre-wrap">
                        {v && v.length > 200 ? `${v.slice(0, 200)}…` : v ?? "null"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-bold text-foreground tracking-tight mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            How ShockPlan works
          </h2>
          <Card className="border border-border bg-muted/30 rounded-2xl">
            <CardContent className="p-5 space-y-3 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">
                ShockPlan is built around transparency: you should always understand what you are seeing and what happens with your answers.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  The readiness score uses your onboarding answers (savings comfort, insurance, documents, and whether you have used key tools). The formula is fixed and visible in the app.
                </li>
                <li>
                  The AI Buddy sends your message and profile context to Google Gemini to generate a reply. Conversations are not stored on our servers unless we add that feature later.
                </li>
                <li>
                  We do not sell your data or use it for ads. Export gives you a JSON file you can keep or audit.
                </li>
                <li>
                  Deleting data removes your profile, score, and vault metadata from our database for this account and clears ShockPlan data from this browser. You can go through onboarding again anytime.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-border bg-card rounded-2xl">
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <p className="font-bold text-foreground">Export data</p>
              <p className="text-sm text-muted-foreground">
                Download server profile, score, and localStorage snapshot as one JSON file.
              </p>
              <Button variant="outline" size="sm" className="rounded-xl mt-2" onClick={handleExport}>
                Download JSON
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card rounded-2xl sm:col-span-2 lg:col-span-2">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <div className="flex items-start gap-3 text-left">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Delete all data</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Removes your profile, score, and vault records from our servers and clears ShockPlan data in this browser. This cannot be undone.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                onClick={() => setDeleteOpen(true)}
              >
                Delete data
              </Button>
            </CardContent>
          </Card>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent showCloseButton className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete all your data?</DialogTitle>
              <DialogDescription>
                This removes your ShockPlan profile, score, and vault metadata from our database and clears saved data in this browser. You will be sent to onboarding to start fresh.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end border-0 bg-transparent p-0 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete everything"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
