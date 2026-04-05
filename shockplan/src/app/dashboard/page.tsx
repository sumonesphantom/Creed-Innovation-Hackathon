"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProfileGreeting } from "@/components/dashboard/profile-greeting";
import { ScoreCard } from "@/components/dashboard/score-card";
import { InsightCardsSection } from "@/components/dashboard/insight-cards";
import { ActionItems } from "@/components/dashboard/action-items";
import type {
    ScoreData,
    ProfileData,
    FlowPlanSummary,
    BuddyMessage,
} from "@/lib/dashboard-utils";

// ─── State shape ──────────────────────────────────────────────────────────────

type FetchState<T> = { status: "loading" | "error" | "ready"; data: T | null };

// ─── CrisisCTA ────────────────────────────────────────────────────────────────

function CrisisCTA() {
    return (
        <Link
            href="/crisis"
            className="block w-full group rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518]"
        >
            <div className="flex items-center gap-3 w-full rounded-[10px] px-4 py-3 bg-[#1A1A1A] dark:bg-[#111] group-hover:bg-[#242424] transition-all">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 shrink-0">
                    <AlertTriangle
                        className="h-4 w-4 text-[#F5C518]"
                        aria-hidden="true"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">
                        {"I'm in a crisis right now"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Get step-by-step help immediately
                    </p>
                </div>
                <ChevronRight
                    className="h-4 w-4 text-[#F5C518] shrink-0 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                />
            </div>
        </Link>
    );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { user } = useUser();

    const [scoreState, setScoreState] = useState<FetchState<ScoreData>>({
        status: "loading",
        data: null,
    });
    const [profileState, setProfileState] = useState<FetchState<ProfileData>>({
        status: "loading",
        data: null,
    });
    const [flowState, setFlowState] = useState<FetchState<FlowPlanSummary[]>>({
        status: "loading",
        data: null,
    });
    const [buddyState, setBuddyState] = useState<FetchState<BuddyMessage[]>>({
        status: "loading",
        data: null,
    });

    // Track whether profile returned 404 (full-page empty state)
    const [profileNotFound, setProfileNotFound] = useState(false);

    // ── Fetch helpers ──────────────────────────────────────────────────────────

    const fetchScore = useCallback(async () => {
        if (typeof window === "undefined") return;
        const deviceId = localStorage.getItem("shockplan_device_id") ?? "";
        const hasUsedBudget =
            localStorage.getItem("shockplan_used_budget") === "1";

        setScoreState((s) => ({ ...s, status: "loading" }));
        try {
            const res = await fetch("/api/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceId,
                    hasUsedBudget,
                    hasCompletedCrisisFlow: false,
                    hasVisitedBenefits: false,
                }),
            });
            if (!res.ok) {
                setScoreState({ status: "error", data: null });
                return;
            }
            const data = (await res.json()) as ScoreData;
            setScoreState({ status: "ready", data });
        } catch {
            setScoreState({ status: "error", data: null });
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        setProfileState((s) => ({ ...s, status: "loading" }));
        try {
            const res = await fetch("/api/profile");
            if (res.status === 404) {
                setProfileNotFound(true);
                setProfileState({ status: "error", data: null });
                return;
            }
            if (!res.ok) {
                setProfileState({ status: "error", data: null });
                return;
            }
            const data = (await res.json()) as ProfileData;
            setProfileState({ status: "ready", data });
        } catch {
            setProfileState({ status: "error", data: null });
        }
    }, []);

    const fetchFlowPlans = useCallback(async () => {
        setFlowState((s) => ({ ...s, status: "loading" }));
        try {
            const res = await fetch("/api/flow-plans");
            if (!res.ok) {
                setFlowState({ status: "error", data: null });
                return;
            }
            const data = (await res.json()) as { items: FlowPlanSummary[] };
            setFlowState({ status: "ready", data: data.items ?? [] });
        } catch {
            setFlowState({ status: "error", data: null });
        }
    }, []);

    const fetchBuddy = useCallback(async () => {
        setBuddyState((s) => ({ ...s, status: "loading" }));
        try {
            const res = await fetch("/api/buddy");
            if (!res.ok) {
                setBuddyState({ status: "error", data: null });
                return;
            }
            const data = (await res.json()) as { messages: BuddyMessage[] };
            setBuddyState({ status: "ready", data: data.messages ?? [] });
        } catch {
            setBuddyState({ status: "error", data: null });
        }
    }, []);

    // ── Parallel fetch on mount ────────────────────────────────────────────────

    useEffect(() => {
        void Promise.all([
            fetchScore(),
            fetchProfile(),
            fetchFlowPlans(),
            fetchBuddy(),
        ]);
    }, [fetchScore, fetchProfile, fetchFlowPlans, fetchBuddy]);

    // ── Re-fetch score on page re-focus ───────────────────────────────────────

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") void fetchScore();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () =>
            document.removeEventListener("visibilitychange", onVisible);
    }, [fetchScore]);

    // ── Full-page onboarding empty state (profile 404) ────────────────────────

    if (profileNotFound) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
                    <div className="w-16 h-16 rounded-[10px] bg-[#F5C518]/15 flex items-center justify-center">
                        <AlertTriangle
                            className="h-8 w-8 text-[#B8940E]"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-light text-foreground">
                            Complete your onboarding
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Set up your profile to unlock your personalized
                            financial resilience dashboard.
                        </p>
                    </div>
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold
                                   bg-[#1A1A1A] text-white hover:bg-[#333] dark:bg-white dark:text-[#1A1A1A]
                                   transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518]"
                    >
                        Get started
                    </Link>
                </div>
            </AppShell>
        );
    }

    // ── Derive score card status ───────────────────────────────────────────────

    const scoreCardStatus: "loading" | "error" | "ready" | "no-score" =
        scoreState.status === "loading"
            ? "loading"
            : scoreState.status === "error"
              ? "error"
              : scoreState.data
                ? "ready"
                : "no-score";

    // ── Insight card statuses ─────────────────────────────────────────────────

    const profileCardStatus =
        profileState.status === "loading"
            ? ("loading" as const)
            : profileState.status === "error"
              ? ("error" as const)
              : ("ready" as const);

    const flowCardStatus =
        flowState.status === "loading"
            ? ("loading" as const)
            : flowState.status === "error"
              ? ("error" as const)
              : ("ready" as const);

    const buddyCardStatus =
        buddyState.status === "loading"
            ? ("loading" as const)
            : buddyState.status === "error"
              ? ("error" as const)
              : ("ready" as const);

    // ── Action items status ───────────────────────────────────────────────────

    const actionStatus: "loading" | "error" | "ready" =
        scoreState.status === "loading" || flowState.status === "loading"
            ? "loading"
            : scoreState.status === "error"
              ? "error"
              : "ready";

    return (
        <AppShell>
            {/* Page wrapper with yellow radial tint background */}
            <div className="relative w-full min-h-screen">
                <div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    aria-hidden="true"
                >
                    <div
                        className="absolute top-0 right-0 w-2/3 h-2/3 opacity-50 dark:opacity-10"
                        style={{
                            background:
                                "radial-gradient(ellipse at top right, #FEFAE8 0%, transparent 65%)",
                        }}
                    />
                </div>

                <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-6 pt-6 lg:pt-8 pb-8">
                    {/* ── Greeting ── */}
                    <section className="mb-5">
                        <ProfileGreeting
                            profile={profileState.data}
                            userName={user?.name ?? undefined}
                        />
                    </section>

                    {/* ── Main grid ── */}
                    {/* Mobile: 1 col | Tablet (≥768px): 2 col | Desktop (≥1024px): 5 col */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-3">
                        {/* Left column: score card + crisis CTA */}
                        <div className="md:col-span-1 lg:col-span-2 space-y-3">
                            <ScoreCard
                                scoreData={scoreState.data}
                                status={scoreCardStatus}
                                onRetry={() => void fetchScore()}
                            />
                            <CrisisCTA />
                        </div>

                        {/* Right column: insight cards + action items */}
                        <div className="md:col-span-1 lg:col-span-3 space-y-3">
                            {/* Insight cards */}
                            <InsightCardsSection
                                profile={profileState.data}
                                flowPlans={flowState.data ?? []}
                                messages={buddyState.data ?? []}
                                profileStatus={profileCardStatus}
                                flowStatus={flowCardStatus}
                                buddyStatus={buddyCardStatus}
                                onRetryProfile={() => void fetchProfile()}
                                onRetryFlow={() => void fetchFlowPlans()}
                                onRetryBuddy={() => void fetchBuddy()}
                            />

                            {/* Action items */}
                            <ActionItems
                                breakdown={scoreState.data?.breakdown ?? null}
                                flowPlans={flowState.data ?? []}
                                status={actionStatus}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
