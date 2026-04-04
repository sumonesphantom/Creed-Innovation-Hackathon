"use client";

import { useCallback, useEffect, useState } from "react";
import { ThumbsUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";

const CRISIS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "job-loss", label: "Job Loss" },
  { id: "medical-bills", label: "Medical Bills" },
  { id: "car-accident", label: "Car Accident" },
  { id: "eviction", label: "Eviction" },
  { id: "natural-disaster", label: "Natural Disaster" },
] as const;

const CRISIS_LABELS: Record<string, string> = {
  "job-loss": "Job Loss",
  "medical-bills": "Medical Bills",
  "car-accident": "Car Accident",
  eviction: "Eviction",
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
  } catch {
    return "";
  }
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

  const fetchPosts = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      setError(null);
      const q =
        filter === "all" ? "" : `?crisisType=${encodeURIComponent(filter)}`;
      try {
        const res = await fetch(`/api/community${q}`);
        const data = (await res.json()) as { posts?: Post[]; error?: string };
        if (!res.ok) {
          setError(data.error || "Could not load posts");
          setPosts([]);
          return;
        }
        setPosts(data.posts ?? []);
      } catch {
        setError("Could not load posts");
        setPosts([]);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    void fetchPosts(true);
  }, [fetchPosts]);

  async function handleUpvote(postId: string) {
    setUpvotingId(postId);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = (await res.json()) as {
        post?: Post;
        error?: string;
      };
      if (!res.ok || !data.post) {
        return;
      }
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? data.post! : p))
      );
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
        body: JSON.stringify({
          crisisType: composeCrisis,
          content,
          ...(state ? { state } : {}),
        }),
      });
      const data = (await res.json()) as { post?: Post; error?: string };
      if (!res.ok) {
        setError(data.error || "Could not post");
        return;
      }
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
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Community
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anonymous tips from people who have been through a shock. No account
            needed to share.
          </p>
        </div>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Share your experience
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="crisis" className="text-xs">
                  Crisis type
                </Label>
                <select
                  id="crisis"
                  value={composeCrisis}
                  onChange={(e) => setComposeCrisis(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm"
                >
                  {CRISIS_OPTIONS.filter((o) => o.id !== "all").map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <Label htmlFor="body" className="text-xs">
                    Your tip
                  </Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {composeText.length}/500
                  </span>
                </div>
                <Textarea
                  id="body"
                  value={composeText}
                  onChange={(e) =>
                    setComposeText(e.target.value.slice(0, 500))
                  }
                  placeholder="I wish I had known…"
                  rows={4}
                  className="rounded-xl resize-none min-h-[100px]"
                  maxLength={500}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || composeText.trim().length < 1}
                className="rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting
                  </>
                ) : (
                  "Post anonymously"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filter
          </p>
          <div className="flex flex-wrap gap-2">
            {CRISIS_OPTIONS.map((o) => (
              <Button
                key={o.id}
                type="button"
                variant={filter === o.id ? "default" : "outline"}
                size="sm"
                className="rounded-full h-9"
                onClick={() => setFilter(o.id)}
              >
                {o.label}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading posts…</span>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No posts yet for this filter.
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p._id}>
                <Card className="rounded-2xl border-border">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-lg">
                          {CRISIS_LABELS[p.crisisType] ?? p.crisisType}
                        </Badge>
                        {p.state ? (
                          <span className="text-xs text-muted-foreground">
                            {p.state}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(p.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {p.content}
                    </p>
                    <div className="flex items-center pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl gap-1.5 h-9 text-muted-foreground hover:text-foreground"
                        disabled={upvotingId === p._id}
                        onClick={() => void handleUpvote(p._id)}
                      >
                        {upvotingId === p._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4" />
                        )}
                        <span className="tabular-nums">{p.upvotes}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
