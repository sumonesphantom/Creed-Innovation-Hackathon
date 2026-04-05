"use client";

import Link from "next/link";
import { TrendingUp, CheckCircle, ChevronRight } from "lucide-react";
import { CardSkeleton } from "@/components/dashboard/card-skeleton";
import type { ScoreData, FlowPlanSummary } from "@/lib/dashboard-utils";
import { deriveActionItems } from "@/lib/dashboard-utils";

interface ActionItemsProps {
    breakdown: ScoreData["breakdown"] | null;
    flowPlans: FlowPlanSummary[];
    status: "loading" | "error" | "ready";
}

export function ActionItems({
    breakdown,
    flowPlans,
    status,
}: ActionItemsProps) {
    const resolvedBreakdown = breakdown ?? {
        savings: 0,
        insurance: 0,
        awareness: 0,
    };
    const items = deriveActionItems(resolvedBreakdown, flowPlans);

    return (
        <section aria-label="Improve your score">
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp
                    className="w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                />
                <h2 className="text-sm font-semibold text-foreground">
                    Improve your score
                </h2>
            </div>

            {/* Loading state */}
            {status === "loading" && (
                <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                        >
                            <CardSkeleton lines={1} height="h-8" />
                        </div>
                    ))}
                </div>
            )}

            {/* Ready state — no items (all thresholds met) */}
            {status === "ready" && items.length === 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                    <CheckCircle
                        className="w-5 h-5 text-[#F5C518] shrink-0"
                        aria-label="All thresholds met"
                    />
                    <p className="text-sm font-semibold text-foreground">
                        You&apos;re on track
                    </p>
                    <p className="text-xs text-muted-foreground ml-1">
                        All score areas are meeting their targets.
                    </p>
                </div>
            )}

            {/* Ready state — action items */}
            {status === "ready" && items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const iconBg =
                            index % 2 === 0 ? "bg-[#1A1A1A]" : "bg-[#F5C518]";
                        const iconColor =
                            index % 2 === 0 ? "text-white" : "text-[#1A1A1A]";

                        return (
                            <Link
                                key={item.href + item.label}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-card border border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#F5C518]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518] group"
                                aria-label={item.label}
                            >
                                {/* Icon */}
                                <span
                                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${iconBg}`}
                                    aria-hidden="true"
                                >
                                    <Icon className={`w-4 h-4 ${iconColor}`} />
                                </span>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {item.sub}
                                    </p>
                                </div>

                                {/* Points badge */}
                                {item.gap > 0 && (
                                    <span className="text-[10px] font-bold text-[#1A1A1A] bg-[#F5C518] px-1.5 py-0.5 rounded-full shrink-0 tabular-nums">
                                        +{item.gap} pts
                                    </span>
                                )}

                                {/* Chevron */}
                                <ChevronRight
                                    className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform"
                                    aria-hidden="true"
                                />
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
