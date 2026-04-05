"use client";

import Link from "next/link";
import {
    AlertTriangle,
    CheckCircle,
    MessageCircle,
    GitBranch,
    DollarSign,
    Shield,
    PiggyBank,
    ArrowRight,
} from "lucide-react";
import { CardSkeleton } from "@/components/dashboard/card-skeleton";
import type {
    ProfileData,
    FlowPlanSummary,
    BuddyMessage,
} from "@/lib/dashboard-utils";
import { emergencyFundTarget, relativeTime } from "@/lib/dashboard-utils";

// ─── Shared card wrapper ──────────────────────────────────────────────────────

const BASE_CARD =
    "rounded-[10px] bg-card border border-[#E8E8E8] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-4 group transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#D0D0D0]";
const ACCENT_CARD =
    "rounded-[10px] bg-card border border-[#F5C518] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-4 group transition-all hover:shadow-[0_4px_16px_rgba(245,197,24,0.2)] hover:border-[#F5C518]";
const LINK_CARD =
    "block rounded-[10px] bg-card border border-[#E8E8E8] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-4 group transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#D0D0D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518]";
const LINK_ACCENT_CARD =
    "block rounded-[10px] bg-card border border-[#F5C518] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-4 group transition-all hover:shadow-[0_4px_16px_rgba(245,197,24,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518]";

type CardStatus = "loading" | "error" | "ready" | "empty";

interface ErrorStateProps {
    onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs text-destructive">Failed to load data.</p>
            <button
                onClick={onRetry}
                className="text-xs underline text-muted-foreground hover:text-foreground"
                aria-label="Retry loading this card"
            >
                Retry
            </button>
        </div>
    );
}

function IconBadge({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: "default" | "warning" | "success" | "yellow";
}) {
    const bg = {
        default: "bg-[#F5F5F5] dark:bg-[#2A2A2A]",
        warning: "bg-[#F5C518]/15",
        success: "bg-green-100 dark:bg-green-900/30",
        yellow: "bg-[#F5C518]/20",
    }[variant];
    return (
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${bg}`}>
            {children}
        </div>
    );
}

// ─── EmergencyFundCard ────────────────────────────────────────────────────────

interface EmergencyFundCardProps {
    incomeRange: string;
    status: CardStatus;
    onRetry: () => void;
}

export function EmergencyFundCard({
    incomeRange,
    status,
    onRetry,
}: EmergencyFundCardProps) {
    if (status === "loading") {
        return (
            <div className={BASE_CARD}>
                <CardSkeleton lines={2} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={BASE_CARD}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                    Emergency Fund Target
                </p>
                <ErrorState onRetry={onRetry} />
            </div>
        );
    }

    const target = emergencyFundTarget(incomeRange);
    const formatted =
        target !== null ? `$${target.toLocaleString("en-US")}` : "—";

    return (
        <Link href="/budget" className={LINK_CARD}>
            <div className="flex items-start gap-2.5 mb-2">
                <IconBadge variant="yellow">
                    <DollarSign className="w-4 h-4 text-[#B8940E]" />
                </IconBadge>
                <p className="text-xs font-medium text-muted-foreground pt-1.5 leading-none">
                    Emergency Fund
                </p>
            </div>
            <p className="text-2xl font-light tabular-nums">{formatted}</p>
            <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-muted-foreground">3-month cushion</p>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-[#F5C518] group-hover:translate-x-0.5 transition-all" />
            </div>
        </Link>
    );
}

// ─── InsuranceCard ────────────────────────────────────────────────────────────

interface InsuranceCardProps {
    insurance: string[];
    status: CardStatus;
    onRetry: () => void;
}

export function InsuranceCard({
    insurance,
    status,
    onRetry,
}: InsuranceCardProps) {
    if (status === "loading") {
        return (
            <div className={BASE_CARD}>
                <CardSkeleton lines={2} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={BASE_CARD}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                    Insurance
                </p>
                <ErrorState onRetry={onRetry} />
            </div>
        );
    }

    const hasGap = insurance.length === 0;

    return (
        <Link
            href="/my-data"
            className={hasGap ? LINK_ACCENT_CARD : LINK_CARD}
        >
            <div className="flex items-start gap-2.5 mb-2">
                <IconBadge variant={hasGap ? "warning" : "default"}>
                    {hasGap ? (
                        <AlertTriangle className="w-4 h-4 text-[#F5C518]" />
                    ) : (
                        <Shield className="w-4 h-4 text-muted-foreground" />
                    )}
                </IconBadge>
                <p className="text-xs font-medium text-muted-foreground pt-1.5 leading-none">
                    {hasGap ? "Insurance Gap" : "Coverage"}
                </p>
            </div>
            {hasGap ? (
                <>
                    <p className="text-sm text-[#F5C518] font-medium">No coverage on file</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-muted-foreground">Add coverage →</p>
                        <ArrowRight className="w-3 h-3 text-[#F5C518] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {insurance.slice(0, 3).map((type) => (
                            <span
                                key={type}
                                className="text-[10px] font-medium bg-muted text-foreground rounded-full px-2 py-0.5"
                            >
                                {type}
                            </span>
                        ))}
                        {insurance.length > 3 && (
                            <span className="text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                                +{insurance.length - 3}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-end mt-1.5">
                        <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-[#F5C518] group-hover:translate-x-0.5 transition-all" />
                    </div>
                </>
            )}
        </Link>
    );
}

// ─── FlowPlansCard ────────────────────────────────────────────────────────────

interface FlowPlansCardProps {
    flowPlans: FlowPlanSummary[];
    status: CardStatus;
    onRetry: () => void;
}

export function FlowPlansCard({
    flowPlans,
    status,
    onRetry,
}: FlowPlansCardProps) {
    if (status === "loading") {
        return (
            <div className={BASE_CARD}>
                <CardSkeleton lines={2} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={BASE_CARD}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                    Flow Plans
                </p>
                <ErrorState onRetry={onRetry} />
            </div>
        );
    }

    if (flowPlans.length === 0) {
        return (
            <Link href="/flow" className={LINK_CARD}>
                <div className="flex items-start gap-2.5 mb-2">
                    <IconBadge variant="default">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                    </IconBadge>
                    <p className="text-xs font-medium text-muted-foreground pt-1.5 leading-none">
                        Flow Plans
                    </p>
                </div>
                <p className="text-sm text-muted-foreground">No plans yet</p>
                <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-[#F5C518] font-medium">Create a plan</p>
                    <ArrowRight className="w-3 h-3 text-[#F5C518] group-hover:translate-x-0.5 transition-transform" />
                </div>
            </Link>
        );
    }

    const sorted = [...flowPlans].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    const mostRecent = sorted[0];

    return (
        <Link href="/flow" className={LINK_CARD}>
            <div className="flex items-start gap-2.5 mb-2">
                <IconBadge variant="default">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                </IconBadge>
                <p className="text-xs font-medium text-muted-foreground pt-1.5 leading-none">
                    Flow Plans
                </p>
            </div>
            <p className="text-2xl font-light tabular-nums">
                {flowPlans.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                    {flowPlans.length === 1 ? "plan" : "plans"}
                </span>
            </p>
            <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-muted-foreground truncate max-w-[80%]">
                    {mostRecent.name}
                </p>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-[#F5C518] group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
        </Link>
    );
}

// ─── BuddyActivityCard ────────────────────────────────────────────────────────

interface BuddyActivityCardProps {
    messages: BuddyMessage[];
    status: CardStatus;
    onRetry: () => void;
}

export function BuddyActivityCard({
    messages,
    status,
    onRetry,
}: BuddyActivityCardProps) {
    if (status === "loading") {
        return (
            <div className={BASE_CARD}>
                <CardSkeleton lines={2} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={BASE_CARD}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                    Buddy Activity
                </p>
                <ErrorState onRetry={onRetry} />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <Link href="/buddy" className={LINK_CARD}>
                <div className="flex items-start gap-2.5 mb-2">
                    <IconBadge variant="default">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    </IconBadge>
                    <p className="text-xs font-medium text-muted-foreground pt-1.5 leading-none">
                        Buddy
                    </p>
                </div>
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-[#F5C518] font-medium">Start a conversation</p>
                    <ArrowRight className="w-3 h-3 text-[#F5C518] group-hover:translate-x-0.5 transition-transform" />
                </div>
            </Link>
        );
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const preview = lastUserMsg
        ? lastUserMsg.content.length > 48
            ? lastUserMsg.content.slice(0, 48) + "…"
            : lastUserMsg.content
        : relativeTime(messages[messages.length - 1].createdAt);

    return (
        <Link href="/buddy" className={LINK_CARD}>
            <div className="flex items-start gap-2.5 mb-2">
                <IconBadge variant="default">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                </IconBadge>
                <p className="text-xs font-medium text-muted-foreground pt-1.5 leading-none">
                    Buddy
                </p>
            </div>
            <p className="text-2xl font-light tabular-nums">
                {messages.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                    {messages.length === 1 ? "message" : "messages"}
                </span>
            </p>
            <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-muted-foreground truncate max-w-[80%] italic">
                    &ldquo;{preview}&rdquo;
                </p>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-[#F5C518] group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
        </Link>
    );
}

// ─── SavingsStatusCard ────────────────────────────────────────────────────────

interface SavingsStatusCardProps {
    canCover500: string;
    status: CardStatus;
    onRetry: () => void;
}

export function SavingsStatusCard({
    canCover500,
    status,
    onRetry,
}: SavingsStatusCardProps) {
    if (status === "loading") {
        return (
            <div className={BASE_CARD}>
                <CardSkeleton lines={2} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={BASE_CARD}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                    Savings Status
                </p>
                <ErrorState onRetry={onRetry} />
            </div>
        );
    }

    const isAlert = canCover500 === "no";

    return (
        <Link href="/budget" className={isAlert ? LINK_ACCENT_CARD : LINK_CARD}>
            <div className="flex items-start gap-2.5 mb-2">
                <IconBadge variant={isAlert ? "warning" : "success"}>
                    {isAlert ? (
                        <PiggyBank className="w-4 h-4 text-[#F5C518]" />
                    ) : (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                </IconBadge>
                <p className="text-xs font-medium text-muted-foreground pt-1.5 leading-none">
                    {isAlert ? "Savings Alert" : "Savings Ready"}
                </p>
            </div>
            {isAlert ? (
                <p className="text-sm text-[#F5C518] font-medium">
                    Can&apos;t cover a $500 emergency
                </p>
            ) : (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Ready for a $500 emergency
                </p>
            )}
            <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-muted-foreground">
                    {isAlert ? "See budget tips" : "View your budget"}
                </p>
                <ArrowRight className={`w-3 h-3 group-hover:translate-x-0.5 transition-all ${isAlert ? "text-[#F5C518]" : "text-muted-foreground/50 group-hover:text-[#F5C518]"}`} />
            </div>
        </Link>
    );
}

// ─── InsightCardsSection ──────────────────────────────────────────────────────

interface InsightCardsSectionProps {
    profile: ProfileData | null;
    flowPlans: FlowPlanSummary[];
    messages: BuddyMessage[];
    profileStatus: CardStatus;
    flowStatus: CardStatus;
    buddyStatus: CardStatus;
    onRetryProfile: () => void;
    onRetryFlow: () => void;
    onRetryBuddy: () => void;
}

export function InsightCardsSection({
    profile,
    flowPlans,
    messages,
    profileStatus,
    flowStatus,
    buddyStatus,
    onRetryProfile,
    onRetryFlow,
    onRetryBuddy,
}: InsightCardsSectionProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <EmergencyFundCard
                incomeRange={profile?.incomeRange ?? ""}
                status={profileStatus}
                onRetry={onRetryProfile}
            />
            <InsuranceCard
                insurance={profile?.insurance ?? []}
                status={profileStatus}
                onRetry={onRetryProfile}
            />
            <FlowPlansCard
                flowPlans={flowPlans}
                status={flowStatus}
                onRetry={onRetryFlow}
            />
            <BuddyActivityCard
                messages={messages}
                status={buddyStatus}
                onRetry={onRetryBuddy}
            />
            <SavingsStatusCard
                canCover500={profile?.canCover500 ?? ""}
                status={profileStatus}
                onRetry={onRetryProfile}
            />
        </div>
    );
}
