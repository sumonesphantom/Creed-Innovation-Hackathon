"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, Heart, Car, Home, CloudLightning,
  ChevronLeft, ChevronRight, MessageCircle, CheckCircle2,
  Clock, CalendarRange, Zap, AlertTriangle,
  GitBranch, DollarSign,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

type TimelineStep = { title: string; description: string };

type Timeline = {
  tenMin: TimelineStep[];
  twentyFourHr: TimelineStep[];
  sevenDay: TimelineStep[];
};

type CrisisType = {
  id: string;
  label: string;
  sub: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accentText: string;
  barColor: string;
  timeline: Timeline;
};

const CRISES: CrisisType[] = [
  {
    id: "job-loss",
    label: "Job Loss",
    sub: "Laid off or let go",
    Icon: Briefcase,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    accentText: "text-amber-700 dark:text-amber-300",
    barColor: "bg-amber-500",
    timeline: {
      tenMin: [
        { title: "Breathe — you will get through this", description: "Take 5 minutes. This is a shock, and it's okay to feel overwhelmed. Don't make any big decisions right now." },
        { title: "Save any termination documents", description: "Screenshot or photograph your termination letter, final pay stub, and benefits info before you lose access to company systems." },
        { title: "Check your last paycheck date", description: "Know when your final paycheck and any severance will arrive. Ask HR in writing if unclear." },
      ],
      twentyFourHr: [
        { title: "File for unemployment benefits", description: "Apply online at your state's unemployment website. You may be eligible for partial income replacement while you search." },
        { title: "Review your health insurance options", description: "You have 60 days for COBRA, but it's expensive. Check Healthcare.gov for marketplace plans — job loss is a qualifying event." },
        { title: "Pause non-essential subscriptions", description: "Cancel or pause streaming, gym, and app subscriptions to conserve cash immediately." },
        { title: "Notify your landlord or mortgage servicer", description: "Call them now — most have hardship programs. Getting ahead of it prevents eviction or foreclosure." },
      ],
      sevenDay: [
        { title: "Check SNAP and food assistance eligibility", description: "Loss of income often qualifies you for food stamps (SNAP). Apply at benefits.gov or your local DHS office." },
        { title: "Create an emergency budget", description: "Use ShockPlan's budget tool to see exactly where your money needs to go. Cut to essentials only." },
        { title: "Rebuild your network and start job searching", description: "Let friends, former coworkers, and community members know. Most jobs are found through people you already know." },
        { title: "Look into retraining or certification programs", description: "Many states offer free career training for displaced workers. Check your state workforce agency." },
      ],
    },
  },
  {
    id: "medical-bills",
    label: "Medical Bills",
    sub: "Unexpected health costs",
    Icon: Heart,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500 dark:text-red-400",
    accentText: "text-red-700 dark:text-red-300",
    barColor: "bg-red-500",
    timeline: {
      tenMin: [
        { title: "Don't panic — medical debt is negotiable", description: "Unlike most debt, medical bills can almost always be reduced, put on payment plans, or forgiven entirely." },
        { title: "Do NOT put it on a credit card", description: "Hospital payment plans are usually 0% interest. Credit cards are 20%+. Keep your options open." },
        { title: "Save all documents and bills", description: "Photograph or scan every bill, EOB (Explanation of Benefits), and correspondence. You'll need these." },
      ],
      twentyFourHr: [
        { title: "Request an itemized bill", description: "Call billing and ask for a line-by-line breakdown. Errors are common and can total hundreds or thousands." },
        { title: "Ask about financial assistance programs", description: "Hospitals receiving federal funding must offer charity care. Ask for the 'financial assistance' application." },
        { title: "Check if you qualify for Medicaid retroactively", description: "In many states, Medicaid covers bills from up to 3 months before your application. Apply even if you think you earn too much." },
      ],
      sevenDay: [
        { title: "Negotiate a payment plan", description: "Most providers will set up a 0% interest plan. Even $25/month keeps accounts from going to collections." },
        { title: "Contact a medical billing advocate", description: "Nonprofit patient advocates can negotiate on your behalf for free. Ask to speak to a patient advocate at the hospital." },
        { title: "Review your insurance EOB carefully", description: "Compare the hospital bill to your insurance EOB. Discrepancies are common and can save you hundreds." },
        { title: "Look into medical debt forgiveness programs", description: "Organizations like RIP Medical Debt and Dollar For help eliminate medical debt for qualifying patients." },
      ],
    },
  },
  {
    id: "car-accident",
    label: "Car Accident",
    sub: "Collision or vehicle damage",
    Icon: Car,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    accentText: "text-blue-700 dark:text-blue-300",
    barColor: "bg-blue-500",
    timeline: {
      tenMin: [
        { title: "Check for injuries — call 911 if needed", description: "Your safety comes first. If anyone is hurt, call 911 immediately. Move to a safe location if possible." },
        { title: "Document the scene with photos", description: "Photograph all vehicle damage, the scene, license plates, insurance cards, and any visible injuries." },
        { title: "Exchange information with the other driver", description: "Get their name, phone, insurance company, policy number, and driver's license number. Give them yours." },
      ],
      twentyFourHr: [
        { title: "File a police report", description: "A police report is required by most insurers and protects you in fault disputes. Get the report number." },
        { title: "Notify your insurance company", description: "Call your insurer's claims line. Delays can complicate or reduce your payout." },
        { title: "Seek medical evaluation even if you feel okay", description: "Whiplash and concussions can appear days later. A documented visit protects you legally and health-wise." },
      ],
      sevenDay: [
        { title: "Get repair estimates", description: "Get 2-3 estimates from certified body shops. Your insurer may have preferred shops but you have the right to choose." },
        { title: "Ask about rental car coverage", description: "Your auto policy may cover a rental while your car is repaired. Check with your claims adjuster." },
        { title: "Track all expenses and lost wages", description: "Keep receipts for everything: towing, rental car, medical visits, missed work. These are all claimable." },
        { title: "Don't accept a quick settlement", description: "Insurance companies may offer a fast lowball settlement. Wait until you know the full extent of damage and injuries." },
      ],
    },
  },
  {
    id: "eviction",
    label: "Eviction Notice",
    sub: "Threatened with losing housing",
    Icon: Home,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    accentText: "text-purple-700 dark:text-purple-300",
    barColor: "bg-purple-500",
    timeline: {
      tenMin: [
        { title: "Read the notice carefully — know your rights", description: "An eviction notice is NOT the same as an eviction. You have legal rights and time to respond. Don't leave yet." },
        { title: "Note the deadline and type of notice", description: "Is it 'pay or quit'? 'Cure or quit'? 'Unconditional quit'? The type determines your options and timeline." },
        { title: "Photograph the notice and your unit's condition", description: "Document everything. If your landlord hasn't maintained the unit, that may be relevant to your defense." },
      ],
      twentyFourHr: [
        { title: "Respond in writing to your landlord", description: "A written response creates a paper trail and often buys critical time. Keep a copy of everything." },
        { title: "Contact an eviction legal aid clinic", description: "Many cities offer free legal help for tenants. Search 'eviction help [your city]' or call 211." },
        { title: "Apply for emergency rental assistance", description: "ERAP programs can pay past-due rent directly to landlords. Apply at your local housing authority immediately." },
      ],
      sevenDay: [
        { title: "Review your lease for landlord violations", description: "If your landlord failed to make repairs or gave improper notice, you may have grounds to pause the eviction." },
        { title: "Gather evidence of payments and communications", description: "Bank statements, receipts, text messages, emails — anything showing your payment history or landlord's failures." },
        { title: "Arrange a temporary housing backup plan", description: "Reach out to family, friends, or local shelters now — not as a last resort. Having a plan reduces panic." },
        { title: "Attend your court date — do NOT skip it", description: "If you don't show up, the judge will rule against you automatically. Show up, even if you can't afford a lawyer." },
      ],
    },
  },
  {
    id: "natural-disaster",
    label: "Natural Disaster",
    sub: "Storm, flood, fire, or earthquake",
    Icon: CloudLightning,
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-500",
    accentText: "text-yellow-700 dark:text-yellow-300",
    barColor: "bg-yellow-500",
    timeline: {
      tenMin: [
        { title: "Confirm your household is physically safe", description: "Do not return to a damaged home until cleared by authorities. Gas leaks and structural damage can be invisible." },
        { title: "Account for all family members", description: "Text or call everyone. If someone is missing, contact local emergency services immediately." },
        { title: "Grab essential documents if safely accessible", description: "IDs, insurance cards, medications. Only if it's safe — documents can be replaced, you cannot." },
      ],
      twentyFourHr: [
        { title: "Apply for FEMA disaster assistance", description: "Go to DisasterAssistance.gov or call 1-800-621-FEMA. You may qualify for rental aid, home repair funds, and crisis counseling." },
        { title: "File a homeowners or renters insurance claim", description: "Call your insurer's 24/7 claims line. Take photos/video of ALL damage before any cleanup begins." },
        { title: "Register with local emergency management", description: "They connect you with food, water, temporary shelter, and recovery resources specific to your area." },
      ],
      sevenDay: [
        { title: "Document all damage thoroughly", description: "Photograph and video everything. Make detailed lists of damaged items with estimated values for insurance claims." },
        { title: "Watch out for contractor scams", description: "Predatory contractors target disaster areas. Verify licenses, get multiple estimates, never pay full amount upfront." },
        { title: "Apply for SBA disaster loans if needed", description: "The Small Business Administration offers low-interest disaster loans to homeowners, renters, and businesses." },
        { title: "Check for local and state disaster relief programs", description: "Many states and cities offer additional grants, temporary housing, and utility assistance after declared disasters." },
      ],
    },
  },
];

const TIMELINE_TABS = [
  { key: "tenMin" as const,       label: "First 10 min",   shortLabel: "10 min", icon: Zap,           description: "Do right now" },
  { key: "twentyFourHr" as const, label: "First 24 hours", shortLabel: "24 hrs", icon: Clock,          description: "Handle today" },
  { key: "sevenDay" as const,     label: "First 7 days",   shortLabel: "7 days", icon: CalendarRange,  description: "This week" },
];

// ── Crisis selection card ─────────────────────────────────────────────────────
function CrisisCard({ crisis, onSelect }: { crisis: CrisisType; onSelect: (c: CrisisType) => void }) {
  const { Icon } = crisis;
  return (
    <button
      onClick={() => onSelect(crisis)}
      className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518] rounded-[10px]"
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-[10px] bg-card border border-border
                   shadow-[0_1px_4px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                   transition-all duration-150"
      >
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${crisis.iconBg}`}>
          <Icon className={`h-4 w-4 ${crisis.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight">{crisis.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{crisis.sub}</p>
        </div>
        <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform`} />
      </div>
    </button>
  );
}

// ── Timeline triage view ──────────────────────────────────────────────────────
function TimelineTriage({ crisis, onBack }: { crisis: CrisisType; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"tenMin" | "twentyFourHr" | "sevenDay">("tenMin");
  const [checked, setChecked] = useState<Record<string, boolean[]>>({
    tenMin: Array(crisis.timeline.tenMin.length).fill(false),
    twentyFourHr: Array(crisis.timeline.twentyFourHr.length).fill(false),
    sevenDay: Array(crisis.timeline.sevenDay.length).fill(false),
  });

  const { Icon } = crisis;
  const steps = crisis.timeline[activeTab];
  const currentChecked = checked[activeTab];
  const doneCount = currentChecked.filter(Boolean).length;
  const totalDone = Object.values(checked).flat().filter(Boolean).length;
  const totalSteps = Object.values(crisis.timeline).flat().length;
  const overallPct = Math.round((totalDone / totalSteps) * 100);

  function toggle(i: number) {
    setChecked((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((v, idx) => (idx === i ? !v : v)),
    }));
  }

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Back + identity strip ── */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border
                     hover:bg-muted transition-colors shrink-0"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${crisis.iconBg}`}>
          <Icon className={`h-4 w-4 ${crisis.iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight">{crisis.label}</p>
          <p className="text-[11px] text-muted-foreground">
            {totalDone} of {totalSteps} steps done
          </p>
        </div>
      </div>

      {/* ── Overall progress bar ── */}
      <div className="bg-card border border-border rounded-[10px] px-4 py-3
                      shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Overall progress</span>
          <span className="font-semibold text-foreground tabular-nums">{overallPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden bg-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${crisis.barColor}`}
            style={{ width: `${(totalDone / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Timeline tabs ── */}
      <div className="grid grid-cols-3 gap-2">
        {TIMELINE_TABS.map(({ key, label, shortLabel, icon: TabIcon, description }) => {
          const isActive = activeTab === key;
          const tabSteps = crisis.timeline[key];
          const tabDone = checked[key].filter(Boolean).length;
          const tabComplete = tabDone === tabSteps.length;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                "flex flex-col items-center gap-1.5 rounded-[10px] px-2 py-3 text-center transition-all border",
                isActive
                  ? "bg-[#1A1A1A] dark:bg-white border-[#1A1A1A] dark:border-white"
                  : "border-border bg-card hover:bg-muted",
              ].join(" ")}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg
                               ${isActive ? "bg-white/15 dark:bg-black/10" : "bg-muted"}`}>
                {tabComplete ? (
                  <CheckCircle2 className={`h-3.5 w-3.5 ${isActive ? "text-[#F5C518]" : "text-emerald-500"}`} />
                ) : (
                  <TabIcon className={`h-3.5 w-3.5 ${isActive ? "text-white dark:text-[#1A1A1A]" : "text-muted-foreground"}`} />
                )}
              </div>
              <span className={`text-xs font-semibold leading-tight
                                ${isActive ? "text-white dark:text-[#1A1A1A]" : "text-muted-foreground"}`}>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </span>
              <span className={`text-[10px] hidden sm:block
                                ${isActive ? "text-white/60 dark:text-black/50" : "text-muted-foreground"}`}>
                {description}
              </span>
              <span className={`text-[10px] tabular-nums font-semibold
                                ${tabComplete
                                  ? "text-emerald-500"
                                  : isActive
                                    ? "text-white/70 dark:text-black/60"
                                    : "text-muted-foreground"}`}>
                {tabDone}/{tabSteps.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active tab label ── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-foreground">
          {TIMELINE_TABS.find((t) => t.key === activeTab)?.label}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {doneCount} / {steps.length} done
        </span>
      </div>

      {/* ── Steps ── */}
      <ol className="flex flex-col gap-2">
        {steps.map((step, i) => {
          const done = currentChecked[i];
          return (
            <li key={`${activeTab}-${i}`}>
              <button
                onClick={() => toggle(i)}
                className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518] rounded-[10px]"
              >
                <div
                  className={[
                    "flex items-start gap-3 px-4 py-3 rounded-[10px] border transition-all duration-150",
                    done
                      ? "bg-[#FEFAE8] dark:bg-yellow-900/10 border-[#F5C518]/30"
                      : "bg-card border-border shadow-[0_1px_4px_rgba(0,0,0,0.05)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
                  ].join(" ")}
                >
                  {/* Step indicator */}
                  <div className="shrink-0 mt-0.5">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-[#F5C518]" />
                    ) : (
                      <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2
                                        border-border text-[10px] font-bold text-muted-foreground`}>
                        {i + 1}
                      </span>
                    )}
                  </div>
                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug
                                   ${done ? "line-through opacity-40 text-foreground" : "text-foreground"}`}>
                      {step.title}
                    </p>
                    {!done && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ── Action CTAs ── */}
      <div className="flex flex-col gap-2 mt-1">
        <Link href="/buddy" className="block w-full">
          <div className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[10px]
                          bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]
                          hover:bg-[#333] dark:hover:bg-gray-100
                          transition-colors font-semibold text-sm">
            <MessageCircle className="h-4 w-4" />
            Talk to my Buddy about {crisis.label.toLowerCase()}
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/flow?crisis=${crisis.id}`} className="block w-full">
            <div className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[10px]
                            bg-[#F5C518] text-[#111111]
                            hover:bg-[#F5C518]/90
                            transition-colors font-semibold text-sm">
              <GitBranch className="h-4 w-4" />
              Plan my recovery
            </div>
          </Link>
          <Link href="/budget" className="block w-full">
            <div className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[10px]
                            border border-border bg-card text-foreground
                            hover:bg-muted
                            transition-colors font-semibold text-sm">
              <DollarSign className="h-4 w-4" />
              Crisis budget
            </div>
          </Link>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground pb-1">
        Use these tools together for a complete financial recovery plan.
      </p>

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CrisisPage() {
  const [selected, setSelected] = useState<CrisisType | null>(null);

  return (
    <AppShell>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 lg:pt-8 pb-8">
        {!selected ? (
          <>
            {/* Header */}
            <section className="mb-5">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 shrink-0">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-light text-foreground tracking-tight">
                  {"What's happening?"}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-12">
                {"Select your situation and we'll walk you through it, step by step."}
              </p>
            </section>

            {/* Crisis cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CRISES.map((crisis) => (
                <CrisisCard key={crisis.id} crisis={crisis} onSelect={setSelected} />
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Everything here is private. No data leaves your device without your permission.
            </p>
          </>
        ) : (
          <div className="max-w-2xl">
            <TimelineTriage crisis={selected} onBack={() => setSelected(null)} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
