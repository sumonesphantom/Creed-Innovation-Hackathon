import type { LucideIcon } from "lucide-react";
import { incomeRangeToMonthlyMid } from "@/lib/budget";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ScoreData {
    score: number;
    breakdown: { savings: number; insurance: number; awareness: number };
    calculatedAt: string; // ISO date string
}

export interface ProfileData {
    household: string;
    housing: string;
    incomeType: string;
    incomeRange: string;
    state: string;
    insurance: string[];
    dependents: number;
    canCover500: string;
}

export interface FlowPlanSummary {
    id: string;
    name: string;
    updatedAt: string;
}

export interface BuddyMessage {
    id: string;
    role: "user" | "buddy";
    content: string;
    createdAt: string;
}

export interface ProfileContextLabel {
    key: string;
    label: string;
}

export interface ActionItem {
    icon: LucideIcon;
    label: string;
    sub: string;
    href: string;
    gap: number; // points below threshold — used for priority sort
}

export interface InsightCardProps {
    title: string;
    value: string | number;
    sub?: string;
    accent?: boolean; // yellow border/indicator
    warning?: boolean; // yellow warning state
    href?: string;
    status: "loading" | "error" | "ready" | "empty";
    onRetry?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const NAV_DESTINATIONS = new Set([
    "/dashboard",
    "/buddy",
    "/crisis",
    "/budget",
    "/my-data",
]);

// ─── Pure Utility Functions ───────────────────────────────────────────────────

/**
 * Returns the color hex for a given score value.
 * < 30  → red (#ef4444)
 * 30–54 → amber (#f59e0b)
 * ≥ 55  → yellow accent (#F5C518)
 */
export function scoreColor(score: number): string {
    if (score < 30) return "#ef4444";
    if (score < 55) return "#f59e0b";
    return "#F5C518";
}

/**
 * Returns the resilience tier label for a given score value.
 * 0–29   → "At Risk"
 * 30–54  → "Developing"
 * 55–74  → "Building"
 * 75–100 → "Resilient"
 */
export function scoreLabel(score: number): string {
    if (score < 30) return "At Risk";
    if (score < 55) return "Developing";
    if (score < 75) return "Building";
    return "Resilient";
}

/**
 * Returns a human-readable relative time string from an ISO date string.
 * e.g. "just now", "3 days ago", "2 months ago"
 */
export function relativeTime(isoDate: string): string {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diffMs = now - then;

    if (diffMs < 0) return "just now";

    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return "just now";

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60)
        return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12)
        return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;

    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

/**
 * Returns the 3-month emergency fund target from an incomeRange string.
 * Returns null for unknown ranges.
 */
export function emergencyFundTarget(incomeRange: string): number | null {
    const mid = incomeRangeToMonthlyMid(incomeRange);
    if (mid === null) return null;
    return mid * 3;
}

/**
 * Returns profile context labels for the greeting area.
 * Only includes labels for fields that are set (non-empty / non-zero).
 */
export function buildProfileContext(
    profile: ProfileData,
): ProfileContextLabel[] {
    const labels: ProfileContextLabel[] = [];

    if (profile.incomeRange && profile.incomeRange.trim() !== "") {
        labels.push({ key: "incomeRange", label: profile.incomeRange });
    }

    if (profile.state && profile.state.trim() !== "") {
        labels.push({ key: "state", label: profile.state });
    }

    if (profile.dependents && profile.dependents > 0) {
        labels.push({
            key: "dependents",
            label: `${profile.dependents} dependent${profile.dependents === 1 ? "" : "s"}`,
        });
    }

    return labels;
}

/**
 * Returns data-driven action items sorted by gap size, max 4, no bare NavBar destinations.
 *
 * Gap logic:
 *   savings < 15   → savings item  (href: "/budget")
 *   insurance < 15 → insurance item (href: "/my-data")
 *   awareness < 30 → awareness item (href: "/buddy")
 *   flowPlans.length === 0 → flow plan item (href: "/flow")
 *
 * Items are sorted by descending gap value and capped at 4.
 */
export function deriveActionItems(
    breakdown: ScoreData["breakdown"],
    flowPlans: FlowPlanSummary[],
): ActionItem[] {
    // Lazy import to avoid circular deps — icons are resolved at call time
    // We use dynamic require-style imports via a factory to keep this file pure
    const { PiggyBank, Shield, Brain, GitBranch } = require("lucide-react") as {
        PiggyBank: LucideIcon;
        Shield: LucideIcon;
        Brain: LucideIcon;
        GitBranch: LucideIcon;
    };

    const items: ActionItem[] = [];

    if (breakdown.savings < 15) {
        items.push({
            icon: PiggyBank,
            label: "Boost your savings readiness",
            sub: "Your savings score has room to grow",
            href: "/budget",
            gap: 15 - breakdown.savings,
        });
    }

    if (breakdown.insurance < 15) {
        items.push({
            icon: Shield,
            label: "Review your insurance coverage",
            sub: "Improve your insurance protection score",
            href: "/my-data",
            gap: 15 - breakdown.insurance,
        });
    }

    if (breakdown.awareness < 30) {
        items.push({
            icon: Brain,
            label: "Build your awareness score",
            sub: "Engage with Buddy to earn awareness points",
            href: "/buddy",
            gap: 30 - breakdown.awareness,
        });
    }

    if (flowPlans.length === 0) {
        items.push({
            icon: GitBranch,
            label: "Create a life path plan",
            sub: "Map out your financial future",
            href: "/flow",
            gap: 10,
        });
    }

    // Sort by descending gap, cap at 4
    items.sort((a, b) => b.gap - a.gap);
    return items.slice(0, 4);
}
