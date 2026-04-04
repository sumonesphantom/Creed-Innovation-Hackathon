"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, Heart, Car, Home, CloudLightning,
  ChevronLeft, ChevronRight, MessageCircle, CheckCircle2,
  Clock, CalendarRange, Zap, AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  border: string;
  cardBg: string;
  accent: string;
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
    border: "border-amber-200 dark:border-amber-800",
    cardBg: "bg-linear-to-r from-amber-50/80 to-transparent dark:from-amber-900/10 dark:to-transparent",
    accent: "text-amber-700 dark:text-amber-300",
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
    iconColor: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    cardBg: "bg-linear-to-r from-red-50/80 to-transparent dark:from-red-900/10 dark:to-transparent",
    accent: "text-red-700 dark:text-red-300",
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
    border: "border-blue-200 dark:border-blue-800",
    cardBg: "bg-linear-to-r from-blue-50/80 to-transparent dark:from-blue-900/10 dark:to-transparent",
    accent: "text-blue-700 dark:text-blue-300",
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
    border: "border-purple-200 dark:border-purple-800",
    cardBg: "bg-linear-to-r from-purple-50/80 to-transparent dark:from-purple-900/10 dark:to-transparent",
    accent: "text-purple-700 dark:text-purple-300",
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
    iconColor: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    cardBg: "bg-linear-to-r from-yellow-50/80 to-transparent dark:from-yellow-900/10 dark:to-transparent",
    accent: "text-yellow-700 dark:text-yellow-300",
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
  { key: "tenMin" as const,      label: "First 10 min",   shortLabel: "10 min", icon: Zap,          description: "Do these right now" },
  { key: "twentyFourHr" as const, label: "First 24 hours", shortLabel: "24 hrs", icon: Clock,         description: "Handle today" },
  { key: "sevenDay" as const,    label: "First 7 days",   shortLabel: "7 days", icon: CalendarRange, description: "This week" },
];

function CrisisCard({ crisis, onSelect }: { crisis: CrisisType; onSelect: (c: CrisisType) => void }) {
  const { Icon } = crisis;
  return (
    <button onClick={() => onSelect(crisis)} className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
      <Card className={`border ${crisis.border} rounded-2xl transition-all group-hover:shadow-md group-active:scale-[0.99] overflow-hidden`}>
        <div className={`${crisis.cardBg}`}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${crisis.iconBg}`}>
              <Icon className={`h-5 w-5 ${crisis.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${crisis.accent}`}>{crisis.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{crisis.sub}</p>
            </div>
            <ChevronRight className={`h-4 w-4 shrink-0 ${crisis.iconColor} group-hover:translate-x-0.5 transition-transform`} />
          </CardContent>
        </div>
      </Card>
    </button>
  );
}

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

  function toggle(i: number) {
    setChecked((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((v, idx) => (idx === i ? !v : v)),
    }));
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${crisis.iconBg}`}>
          <Icon className={`h-5 w-5 ${crisis.iconColor}`} />
        </div>
        <div>
          <p className={`font-bold text-sm ${crisis.accent}`}>{crisis.label}</p>
          <p className="text-xs text-muted-foreground">{totalDone} of {totalSteps} total steps done</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="font-semibold text-foreground tabular-nums">{Math.round((totalDone / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden bg-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${crisis.barColor}`}
            style={{ width: `${(totalDone / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Timeline Tabs */}
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
                "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-all border",
                isActive
                  ? `${crisis.border} bg-card shadow-sm`
                  : "border-transparent bg-muted/50 hover:bg-muted",
              ].join(" ")}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? crisis.iconBg : "bg-muted"}`}>
                {tabComplete ? (
                  <CheckCircle2 className={`h-4 w-4 ${isActive ? crisis.iconColor : "text-emerald-500"}`} />
                ) : (
                  <TabIcon className={`h-4 w-4 ${isActive ? crisis.iconColor : "text-muted-foreground"}`} />
                )}
              </div>
              <span className={`text-xs font-bold ${isActive ? crisis.accent : "text-muted-foreground"}`}>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">{description}</span>
              <span className={`text-[10px] tabular-nums font-semibold ${tabComplete ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                {tabDone}/{tabSteps.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active tab context bar */}
      <div className={`rounded-xl px-4 py-2.5 border ${crisis.border} ${crisis.cardBg}`}>
        <p className={`text-xs font-semibold ${crisis.accent}`}>
          {TIMELINE_TABS.find((t) => t.key === activeTab)?.description} — {doneCount} of {steps.length} done
        </p>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-2.5">
        {steps.map((step, i) => {
          const done = currentChecked[i];
          return (
            <li key={`${activeTab}-${i}`}>
              <button onClick={() => toggle(i)} className="w-full text-left group rounded-2xl">
                <Card className={`${done ? crisis.border : "border-border"} rounded-2xl transition-all ${done ? crisis.cardBg : "bg-card"}`}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="shrink-0 mt-0.5">
                      {done ? (
                        <CheckCircle2 className={`h-5 w-5 ${crisis.iconColor}`} />
                      ) : (
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 text-[10px] font-bold ${crisis.border} ${crisis.accent}`}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-snug ${done ? "line-through opacity-40 text-foreground" : crisis.accent}`}>
                        {step.title}
                      </p>
                      {!done && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Talk to Buddy CTA */}
      <Link href="/buddy" className="block w-full mt-1">
        <Button className="w-full h-12 text-sm font-bold rounded-2xl gap-2.5 bg-linear-to-br from-primary to-primary/80 shadow-sm">
          <MessageCircle className="h-4 w-4" />
          Talk to my Buddy about {crisis.label.toLowerCase()}
        </Button>
      </Link>
      <p className="text-center text-xs text-muted-foreground pb-1">
        Your Buddy can walk you through each step in plain language.
      </p>
    </div>
  );
}

export default function CrisisPage() {
  const [selected, setSelected] = useState<CrisisType | null>(null);

  return (
    <AppShell>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        {!selected ? (
          <>
            <section className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                  {"What's happening?"}
                </h1>
              </div>
              <p className="text-base text-muted-foreground mt-1 ml-13">
                {"Select your situation and we'll walk you through it, step by step."}
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CRISES.map((crisis) => (
                <CrisisCard key={crisis.id} crisis={crisis} onSelect={setSelected} />
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
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
