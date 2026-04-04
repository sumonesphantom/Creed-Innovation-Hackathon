"use client";

import { useCallback, useEffect, useState } from "react";
import { ThumbsUp, Loader2, Users, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";

const CRISIS_OPTIONS = [
  { id: "all",              label: "All" },
  { id: "job-loss",         label: "Job Loss" },
  { id: "medical-bills",    label: "Medical Bills" },
  { id: "car-accident",     label: "Car Accident" },
  { id: "eviction",         label: "Eviction" },
  { id: "natural-disaster", label: "Natural Disaster" },
] as const;

const CRISIS_LABELS: Record<string, string> = {
  "job-loss":         "Job Loss",
  "medical-bills":    "Medical Bills",
  "car-accident":     "Car Accident",
  eviction:           "Eviction",
  "natural-disaster": "Natural Disaster",
};

type Post = {
  _id: string;
  crisisType: string;
  state: string;
  content: string;
  upvotes: number;
  createdAt: string;
};

function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function readProfileState(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("shockplan_profile");
    if (!raw) return "";
    const p = JSON.parse(raw) as { state?: string };
    return typeof p.state === "string" ? p.state.trim() : "";
  } catch { return ""; }
}

export default function CommunityPage() {
  const [filter, setFilter] = useState<string>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvotingId, setUpvotingId] = useState<string | null>(null);
  const [composeCrisis, setComposeCrisis] = useState<string>("job-loss");
  const [composeText, setComposeText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async (showLoading: boolean) => {
    if (showLoading) setLoading(true);
    setError(null);
    const q = filter === "all" ? "" : `?crisisType=${encodeURIComponent(filter)}`;
    try {
      const res = await fetch(`/api/community${q}`);
      const data = (await res.json()) as { posts?: Post[]; error?: string };
      if (!res.ok) { setError(data.error || "Could not load posts"); setPosts([]); return; }
      setPosts(data.posts ?? []);
    } catch {
      setError("Could not load posts"); setPosts([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void fetchPosts(true); }, [fetchPosts]);

  async function handleUpvote(postId: string) {
    setUpvotingId(postId);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = (await res.json()) as { post?: Post; error?: string };
      if (!res.ok || !data.post) return;
      setPosts((prev) => prev.map((p) => (p._id === postId ? data.post! : p)));
    } finally {
      setUpvotingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = composeText.trim();
    if (content.length < 1 || content.length > 500) return;
    setSubmitting(true);
    try {
      const state = readProfileState();
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crisisType: composeCrisis, content, ...(state ? { state } : {}) }),
      });
      const data = (await res.json()) as { post?: Post; error?: string };
      if (!res.ok) { setError(data.error || "Could not post"); return; }
      setError(null);
      setComposeText("");
      if (data.post) {
        if (filter === "all" || filter === composeCrisis) {
          setPosts((prev) => [data.post!, ...prev]);
        } else {
          await fetchPosts(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="relative w-full min-h-screen max-w-3xl mx-auto px-6 lg:px-8 py-6 lg:py-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div
            className="absolute top-0 right-0 w-2/3 h-2/3 opacity-40 dark:opacity-10"
            style={{ background: "radial-gradient(ellipse at top right, #FEFAE8 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card shrink-0">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-[28px] font-medium text-foreground tracking-[-0.02em]">
                Community
              </h1>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Anonymous tips from people who have been through a shock. No account needed to share.
              </p>
            </div>
          </div>

          <Card className="rounded-[10px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden py-0 gap-0">
            <div className="h-1 w-full shrink-0 bg-[#F5C518]" />
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-medium text-foreground tracking-tight">Share your experience</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="crisis" className="text-xs font-medium text-muted-foreground">Crisis type</Label>
                  <select
                    id="crisis"
                    value={composeCrisis}
                    onChange={(e) => setComposeCrisis(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {CRISIS_OPTIONS.filter((o) => o.id !== "all").map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="body" className="text-xs font-medium text-muted-foreground">Your tip</Label>
                    <span className={`text-[10px] tabular-nums ${composeText.length > 450 ? "text-destructive" : "text-muted-foreground"}`}>
                      {composeText.length}/500
                    </span>
                  </div>
                  <Textarea
                    id="body"
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value.slice(0, 500))}
                    placeholder="I wish I had known…"
                    rows={4}
                    className="rounded-lg resize-none min-h-[100px] focus:ring-2 focus:ring-primary/40"
                    maxLength={500}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting || composeText.trim().length < 1}
                  className="rounded-lg gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Posting…</>
                  ) : (
                    "Post anonymously"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Filter by crisis</p>
            <div className="flex flex-wrap gap-2">
              {CRISIS_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setFilter(o.id)}
                  className={[
                    "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    filter === o.id
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40",
                  ].join(" ")}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-[10px] px-4 py-3" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading posts…</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-12 h-12 rounded-lg border border-border bg-card flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No posts yet for this filter. Be the first to share!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {posts.map((p) => (
                <li key={p._id}>
                  <Card className="rounded-[10px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                    <CardContent className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#1A1A1A] text-white">
                            {CRISIS_LABELS[p.crisisType] ?? p.crisisType}
                          </span>
                          {p.state && (
                            <Badge variant="outline" className="rounded-full text-[10px] h-5 font-normal border-border">
                              {p.state}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{formatRelativeTime(p.createdAt)}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap border-l-2 border-[#E8E8E8] pl-3">
                        {p.content}
                      </p>
                      <div className="flex items-center pt-0.5">
                        <button
                          type="button"
                          className={[
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            upvotingId === p._id
                              ? "text-muted-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted",
                          ].join(" ")}
                          disabled={upvotingId === p._id}
                          onClick={() => void handleUpvote(p._id)}
                        >
                          {upvotingId === p._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ThumbsUp className="h-3.5 w-3.5" />
                          )}
                          <span className="tabular-nums">{p.upvotes}</span>
                          <span>helpful</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
