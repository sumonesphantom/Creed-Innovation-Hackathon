"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, Loader2, Lock, FileText, FolderLock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "insurance", label: "Insurance",  icon: "🛡️" },
  { id: "id",        label: "ID",          icon: "🪪" },
  { id: "lease",     label: "Lease",       icon: "🏠" },
  { id: "medical",   label: "Medical",     icon: "🏥" },
  { id: "financial", label: "Financial",   icon: "💰" },
] as const;

type VaultRow = {
  _id: string;
  fileName: string;
  fileType: string;
  category: string;
  uploadedAt: string;
};

function formatUploadedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch { return iso; }
}

async function recalculateScore(deviceId: string) {
  const hasUsedBudget = typeof window !== "undefined" && localStorage.getItem("shockplan_used_budget") === "1";
  await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, hasUsedBudget, hasCompletedCrisisFlow: false, hasVisitedBenefits: false }),
  });
}

export default function VaultPage() {
  const [active, setActive] = useState<string>(CATEGORIES[0].id);
  const [items, setItems] = useState<VaultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const deviceId = typeof window !== "undefined" ? localStorage.getItem("shockplan_device_id") || "" : "";
    if (!deviceId) { setItems([]); setLoading(false); setError("Complete onboarding to use the vault."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vault?deviceId=${encodeURIComponent(deviceId)}`);
      const data = (await res.json()) as { items?: VaultRow[]; error?: string };
      if (!res.ok) { setError(data.error || "Could not load vault"); setItems([]); return; }
      setItems(data.items ?? []);
    } catch {
      setError("Could not load vault"); setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    if (!deviceId) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, category: active, fileName: file.name, fileType: file.type || "application/octet-stream" }),
      });
      const data = (await res.json()) as { item?: VaultRow; error?: string };
      if (!res.ok) { setError(data.error || "Upload failed"); return; }
      if (data.item) setItems((prev) => [data.item!, ...prev]);
      await recalculateScore(deviceId);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const deviceId = localStorage.getItem("shockplan_device_id") || "";
    if (!deviceId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/vault?id=${encodeURIComponent(id)}&deviceId=${encodeURIComponent(deviceId)}`, { method: "DELETE" });
      if (!res.ok) { const data = (await res.json()) as { error?: string }; setError(data.error || "Could not delete"); return; }
      setItems((prev) => prev.filter((x) => x._id !== id));
      setError(null);
      await recalculateScore(deviceId);
    } catch {
      setError("Could not delete");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = items.filter((i) => i.category === active);
  const activeCategory = CATEGORIES.find((c) => c.id === active);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
            <FolderLock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Document Vault</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Store references to policies, IDs, and records. Metadata is saved so your readiness score reflects what you have on file.
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            All document metadata is encrypted. Only file names and types are stored — never file contents.
          </p>
        </div>

        {/* Category tabs */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c.id)}
                className={[
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  active === c.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/50",
                ].join(" ")}
              >
                <span>{c.icon}</span>
                {c.label}
                {active === c.id && (
                  <span className="ml-0.5 bg-white/25 text-xs px-1.5 rounded-full">
                    {items.filter((i) => i.category === c.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Files card */}
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-primary to-primary/30" />
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>{activeCategory?.icon}</span>
                {activeCategory?.label ?? "Documents"}
                <span className="text-xs font-normal text-muted-foreground">({filtered.length} file{filtered.length !== 1 ? "s" : ""})</span>
              </h2>
              <div>
                <input ref={inputRef} type="file" className="hidden" onChange={(e) => void handleFileChange(e)} />
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl gap-2 h-9 text-xs font-semibold"
                  disabled={uploading || !!error?.includes("onboarding")}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploading ? "Uploading…" : "Upload file"}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3" role="alert">
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading vault…</span>
              </div>
            ) : filtered.length === 0 ? (
              /* Upload prompt / empty state */
              <button
                className="w-full flex flex-col items-center gap-3 py-10 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/3 transition-all"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || !!error?.includes("onboarding")}
                type="button"
              >
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">No files yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click to upload a {activeCategory?.label.toLowerCase()} document</p>
                </div>
              </button>
            ) : (
              <ul className="space-y-2.5">
                {filtered.map((row) => (
                  <li
                    key={row._id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{row.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">{formatUploadedAt(row.uploadedAt)}</p>
                        <Badge
                          variant="outline"
                          className="gap-1 rounded-md text-[10px] font-medium border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 shrink-0"
                        >
                          <Lock className="h-2.5 w-2.5" aria-hidden />
                          Encrypted
                        </Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 rounded-lg h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      disabled={deletingId === row._id}
                      onClick={() => void handleDelete(row._id)}
                      aria-label="Delete"
                    >
                      {deletingId === row._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
