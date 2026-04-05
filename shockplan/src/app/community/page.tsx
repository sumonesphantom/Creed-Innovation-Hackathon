"use client";

import { useCallback, useEffect, useState } from "react";
import { ThumbsUp, Loader2, Users, PenLine, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react";
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

type Comment = {
  _id: string;
  postId: string;
  content: string;
  upvotes: number;
  createdAt: string;
};

type Post = {
  _id: string;
  crisisType: string;
  state: string;
  content: string;
  upvotes: number;
  commentCount: number;
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

function CommentItem({
  comment,
  onUpvote,
}: {
  comment: Comment;
  onUpvote: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 py-3 border-t border-border/50 first:border-t-0">
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <button
          onClick={() => onUpvote(comment._id)}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs font-medium tabular-nums">{comment.upvotes}</span>
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(comment.createdAt)}</p>
      </div>
    </div>
  );
}

function PostCard({
  post,
  onUpvote,
}: {
  post: Post;
  onUpvote: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);
  const [upvotingCommentId, setUpvotingCommentId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/community/${post._id}/comments`);
      const data = await res.json() as { comments?: Comment[] };
      setComments(data.comments ?? []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [post._id]);

  const handleToggle = () => {
    if (!expanded && comments.length === 0) {
      void fetchComments();
    }
    setExpanded((v) => !v);
  };

  const handleSubmitComment = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const content = commentText.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json() as { comment?: Comment };
      if (data.comment) {
        setComments((prev) => [...prev, data.comment!]);
        setCommentCount((c) => c + 1);
        setCommentText("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    setUpvotingCommentId(commentId);
    try {
      const res = await fetch(`/api/community/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      const data = await res.json() as { comment?: Comment };
      if (data.comment) {
        setComments((prev) => prev.map((c) => c._id === commentId ? data.comment! : c));
      }
    } finally {
      setUpvotingCommentId(null);
    }
  };

  return (
    <Card className="rounded-[10px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden py-0 gap-0">
      <CardContent className="p-0">
        {/* Post body */}
        <div className="flex gap-3 p-4">
          {/* Upvote column */}
          <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
            <button
              onClick={() => onUpvote(post._id)}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors group"
            >
              <ChevronUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tabular-nums">{post.upvotes}</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {CRISIS_LABELS[post.crisisType] ?? post.crisisType}
              </Badge>
              {post.state && (
                <span className="text-[10px] text-muted-foreground">{post.state}</span>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">{formatRelativeTime(post.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{post.content}</p>

            {/* Comment toggle */}
            <button
              onClick={handleToggle}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{commentCount} {commentCount === 1 ? "comment" : "comments"}</span>
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Comments section */}
        {expanded && (
          <div className="border-t border-border/50 bg-muted/30 px-4 py-3 space-y-1">
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">No comments yet. Be the first to share your experience.</p>
            ) : (
              <div className="divide-y divide-border/30">
                {comments.map((c) => (
                  <CommentItem
                    key={c._id}
                    comment={c}
                    onUpvote={upvotingCommentId === c._id ? () => {} : handleUpvoteComment}
                  />
                ))}
              </div>
            )}

            {/* Add comment form */}
            <form onSubmit={handleSubmitComment} className="flex gap-2 pt-3 border-t border-border/40">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience or advice..."
                rows={2}
                maxLength={500}
                className="flex-1 text-sm resize-none min-h-0"
                disabled={submitting}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!commentText.trim() || submitting}
                className="self-end h-9 w-9 shrink-0"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
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
  const [showCompose, setShowCompose] = useState(false);

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
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, upvotes: data.post!.upvotes } : p)));
    } finally {
      setUpvotingId(null);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
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
      setShowCompose(false);
      if (data.post) {
        if (filter === "all" || filter === composeCrisis) {
          setPosts((prev) => [{ ...data.post!, commentCount: 0 }, ...prev]);
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
      <div className="relative w-full min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="relative space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card shrink-0">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-[28px] font-medium text-foreground tracking-[-0.02em]">
                  Community
                </h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Anonymous tips from people who&apos;ve been through a shock. No account needed.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={showCompose ? "secondary" : "default"}
              className="shrink-0 gap-1.5"
              onClick={() => setShowCompose((v) => !v)}
            >
              <PenLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{showCompose ? "Cancel" : "Post"}</span>
            </Button>
          </div>

          {/* Compose box */}
          {showCompose && (
            <Card className="rounded-[10px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden py-0 gap-0">
              <div className="h-1 w-full shrink-0 bg-primary" />
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-medium text-foreground tracking-tight">Share your experience</h2>
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
                      onChange={(e) => setComposeText(e.target.value)}
                      placeholder="What do you wish you knew? What actually helped?"
                      rows={3}
                      maxLength={500}
                      className="text-sm resize-none"
                      disabled={submitting}
                    />
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <Button type="submit" size="sm" disabled={submitting || composeText.trim().length === 0} className="w-full sm:w-auto">
                    {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Posting…</> : "Post to community"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {CRISIS_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setFilter(o.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  filter === o.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30",
                ].join(" ")}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No posts yet. Be the first to share.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpvote={upvotingId === post._id ? () => {} : handleUpvote}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
