"use client";

import Link from "next/link";
import { TrendingUp, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CardSkeleton } from "@/components/dashboard/card-skeleton";
import {
    ScoreData,
    scoreColor,
    scoreLabel,
    relativeTime,
} from "@/lib/dashboard-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreCardProps {
    scoreData: ScoreData | null;
    status: "loading" | "error" | "ready" | "no-score";
    onRetry: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_MESSAGES: Record<string, string> = {
    "At Risk": "Every step forward builds your safety net.",
    "Developing": "You're building momentum — keep going.",
    "Building": "Strong foundation. Push toward Resilient.",
    "Resilient": "Outstanding — you're financially resilient.",
};

const SCORE_WHY: Record<"Savings" | "Insurance" | "Awareness", string> = {
    Savings:
        "Points from your answer about covering a $500 surprise: yes is strongest, maybe is partial, no is lowest.",
    Insurance:
        "Up to 5 points per insurance type you said you have (auto, renters, health, life, etc.), with a bonus when you have several kinds of coverage.",
    Awareness:
        "Points when you use crisis flows, the budget tool, benefits page, and other awareness-building parts of the app (up to 50).",
};

// Monochrome + yellow theme: dark → gray → yellow hierarchy
const CATEGORY_COLORS: Record<
    "Savings" | "Insurance" | "Awareness",
    { bar: string; dot: string }
> = {
    Savings: {
        bar: "bg-[#1A1A1A] dark:bg-gray-200",
        dot: "bg-[#1A1A1A] dark:bg-gray-200",
    },
    Insurance: {
        bar: "bg-gray-500 dark:bg-gray-400",
        dot: "bg-gray-500 dark:bg-gray-400",
    },
    Awareness: { bar: "bg-[#F5C518]", dot: "bg-[#F5C518]" },
};

// ─── ReadinessRing ────────────────────────────────────────────────────────────

function ReadinessRing({ scoreData }: { scoreData: ScoreData }) {
    const { score, breakdown } = scoreData;
    const radius = 84;
    const stroke = 10;
    const r = radius - stroke / 2;
    const circumference = 2 * Math.PI * r;
    const color = scoreColor(score);
    const tier = scoreLabel(score);

    const [displayScore, setDisplayScore] = useState(0);
    const [animOffset, setAnimOffset] = useState(circumference);

    useEffect(() => {
        // Animate score counter
        const duration = 900;
        const steps = 36;
        const interval = duration / steps;
        const increment = score / steps;
        let current = 0;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.round(increment * step), score);
            setDisplayScore(current);
            setAnimOffset(circumference - (current / 100) * circumference);
            if (step >= steps) clearInterval(timer);
        }, interval);
        return () => clearInterval(timer);
    }, [score, circumference]);

    const rows: Array<{
        label: "Savings" | "Insurance" | "Awareness";
        value: number;
        max: number;
    }> = [
        { label: "Savings", value: breakdown.savings, max: 25 },
        { label: "Insurance", value: breakdown.insurance, max: 25 },
        { label: "Awareness", value: breakdown.awareness, max: 50 },
    ];

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Ring */}
            <div className="relative flex items-center justify-center">
                <svg
                    width={radius * 2}
                    height={radius * 2}
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    role="img"
                    aria-label={`Readiness score: ${score} out of 100, ${tier} tier`}
                >
                    <circle
                        cx={radius}
                        cy={radius}
                        r={r}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        className="text-border"
                    />
                    <circle
                        cx={radius}
                        cy={radius}
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={animOffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${radius} ${radius})`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-5xl font-light leading-none tabular-nums"
                        style={{ color }}
                    >
                        {displayScore}
                    </span>
                    <span
                        className="text-[10px] font-bold uppercase tracking-widest mt-2 px-2.5 py-0.5 rounded-full"
                        style={{ color, backgroundColor: `${color}22` }}
                    >
                        {tier}
                    </span>
                </div>
            </div>

            {/* Tier motivational message */}
            {TIER_MESSAGES[tier] && (
                <p className="text-xs text-center text-muted-foreground italic -mt-1">
                    {TIER_MESSAGES[tier]}
                </p>
            )}

            {/* Breakdown bars */}
            <div className="w-full flex flex-col gap-2.5">
                {rows.map(({ label, value, max }) => {
                    const pct = Math.round((value / max) * 100);
                    const colors = CATEGORY_COLORS[label];
                    return (
                        <div key={label} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground items-center">
                                <span className="inline-flex items-center gap-1.5">
                                    <span
                                        className={`w-2 h-2 rounded-full ${colors.dot}`}
                                    />
                                    {label}
                                    <Popover>
                                        <PopoverTrigger
                                            className="inline-flex rounded-md p-0.5 text-muted-foreground/50 hover:text-foreground"
                                            aria-label={`Why ${label}`}
                                        >
                                            <HelpCircle className="h-3 w-3" />
                                        </PopoverTrigger>
                                        <PopoverContent className="text-xs w-72">
                                            {SCORE_WHY[label]}
                                        </PopoverContent>
                                    </Popover>
                                </span>
                                <span className="tabular-nums font-semibold text-foreground">
                                    {value} / {max}
                                </span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${colors.bar}`}
                                    style={{
                                        width: `${pct}%`,
                                        transition: "width 0.7s ease",
                                    }}
                                    role="progressbar"
                                    aria-valuenow={value}
                                    aria-valuemin={0}
                                    aria-valuemax={max}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── ScoreCard ────────────────────────────────────────────────────────────────

export function ScoreCard({ scoreData, status, onRetry }: ScoreCardProps) {
    return (
        <div
            className="w-full rounded-[10px] bg-card border border-border overflow-hidden
                       shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
        >
            {/* Yellow accent strip at top */}
            <div className="h-1.5 w-full bg-[#F5C518]" />
            <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Shock Readiness
                    </p>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        / 100
                    </span>
                </div>

                {/* Loading */}
                {status === "loading" && (
                    <div className="space-y-6 w-full">
                        <div className="flex justify-center">
                            <div className="w-42 h-42 rounded-full bg-muted animate-pulse" />
                        </div>
                        <CardSkeleton lines={3} />
                    </div>
                )}

                {/* Error */}
                {status === "error" && (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Could not load your score. Check your connection and
                            try again.
                        </p>
                        <Button
                            type="button"
                            variant="secondary"
                            className="rounded-full px-5"
                            onClick={onRetry}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* No score yet */}
                {status === "no-score" && (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <div className="w-14 h-14 rounded-[10px] bg-[#F5C518]/15 flex items-center justify-center">
                            <TrendingUp className="h-7 w-7 text-[#B8940E]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                No score yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Complete onboarding to see your personalized
                                readiness score.
                            </p>
                        </div>
                        <Link
                            href="/onboarding"
                            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold
                                       bg-[#1A1A1A] text-white hover:bg-[#333] dark:bg-white dark:text-[#1A1A1A]
                                       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518]"
                        >
                            Start onboarding
                        </Link>
                    </div>
                )}

                {/* Ready */}
                {status === "ready" && scoreData && (
                    <>
                        <ReadinessRing scoreData={scoreData} />
                        <p className="text-[10px] text-muted-foreground text-center mt-3">
                            Updated {relativeTime(scoreData.calculatedAt)}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
