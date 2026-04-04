"use client";

import { getScoreMessage } from "@/lib/score";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";

interface ScoreBreakdown {
  savings: number;
  insurance: number;
  documents: number;
  awareness: number;
}

export function ReadinessScoreRing({
  score,
  breakdown,
}: {
  score: number;
  breakdown: ScoreBreakdown;
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score <= 30 ? "#ef4444" : score <= 50 ? "#f59e0b" : score <= 70 ? "#3b82f6" : "#22c55e";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative">
        <svg width="180" height="180" className="-rotate-90">
          <circle
            cx="90" cy="90" r={radius}
            fill="none" stroke="#e5e7eb" strokeWidth="12"
          />
          <circle
            cx="90" cy="90" r={radius}
            fill="none" stroke={color} strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">out of 100</span>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-600 text-center max-w-xs">
        {getScoreMessage(score)}
      </p>

      {/* Breakdown */}
      <div className="w-full max-w-xs space-y-2">
        <BreakdownRow label="Savings" value={breakdown.savings} max={25} tip="Based on your ability to cover a $500 surprise expense." />
        <BreakdownRow label="Insurance" value={breakdown.insurance} max={25} tip="5 points per coverage type (auto, renters, health, life). Bonus at 3+." />
        <BreakdownRow label="Documents" value={breakdown.documents} max={25} tip="5 points per document category uploaded to your vault." />
        <BreakdownRow label="Awareness" value={breakdown.awareness} max={25} tip="Points for using crisis flows, budget tools, and benefits page." />
      </div>
    </div>
  );
}

function BreakdownRow({
  label, value, max, tip,
}: {
  label: string; value: number; max: number; tip: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-10 text-right">{value}/{max}</span>
      <Popover>
        <PopoverTrigger
          className="inline-flex rounded-md p-0.5 text-muted-foreground hover:text-foreground"
          aria-label={`Why ${label}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </PopoverTrigger>
        <PopoverContent className="text-xs w-56">{tip}</PopoverContent>
      </Popover>
    </div>
  );
}
