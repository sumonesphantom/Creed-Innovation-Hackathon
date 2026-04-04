"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, Loader2, Lock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "insurance", label: "Insurance" },
  { id: "id", label: "ID" },
  { id: "lease", label: "Lease" },
  { id: "medical", label: "Medical" },
  { id: "financial", label: "Financial" },
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
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

async function recalculateScore(deviceId: string) {
  const hasUsedBudget =
    typeof window !== "undefined" &&
    localStorage.getItem("shockplan_used_budget") === "1";
  await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      hasUsedBudget,
      hasCompletedCrisisFlow: false,
      hasVisitedBenefits: false,
    }),
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
    const deviceId =
      typeof window !== "undefined"
        ? localStorage.getItem("shockplan_device_id") || ""
        : "";
    if (!deviceId) {
      setItems([]);
      setLoading(false);
      setError("Complete onboarding to use the vault.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/vault?deviceId=${encodeURIComponent(deviceId)}`
      );
      const data = (await res.json()) as { items?: VaultRow[]; error?: string };
      if (!res.ok) {
        setError(data.error || "Could not load vault");
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("Could not load vault");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        body: JSON.stringify({
          deviceId,
          category: active,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
        }),
      });
      const data = (await res.json()) as { item?: VaultRow; error?: string };
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      if (data.item) {
        setItems((prev) => [data.item!, ...prev]);
      }
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
      const res = await fetch(
        `/api/vault?id=${encodeURIComponent(id)}&deviceId=${encodeURIComponent(deviceId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Could not delete");
        return;
      }
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

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Document Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store references to policies, IDs, and records. Metadata is saved so
            your readiness score can reflect what you have on file.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant={active === c.id ? "default" : "outline"}
                size="sm"
                className="rounded-full h-9"
                onClick={() => setActive(c.id)}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">
                {CATEGORIES.find((c) => c.id === active)?.label ?? "Documents"}
              </h2>
              <div>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => void handleFileChange(e)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl gap-2"
                  disabled={uploading || !!error?.includes("onboarding")}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No files in this category yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {filtered.map((row) => (
                  <li
                    key={row._id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {row.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {row.fileType} · {formatUploadedAt(row.uploadedAt)}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-2 gap-1 rounded-md text-[10px] font-normal border-primary/30"
                        >
                          <Lock className="h-3 w-3 text-primary" aria-hidden />
                          Encrypted
                        </Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 self-end sm:self-center rounded-xl text-destructive hover:text-destructive"
                      disabled={deletingId === row._id}
                      onClick={() => void handleDelete(row._id)}
                      aria-label="Delete"
                    >
                      {deletingId === row._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
