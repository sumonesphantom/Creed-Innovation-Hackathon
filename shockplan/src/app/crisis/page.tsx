"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, Heart, Car, Home,
  CloudLightning, ChevronLeft, ChevronRight, MessageCircle, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";

// ─── Crisis Data ───────────────────────────────────────────────────────────────

type Step = { title: string; description: string };

type CrisisType = {
  id: string;
  label: string;
  sub: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  border: string;
  accent: string;
  steps: Step[];
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
    accent: "text-amber-700 dark:text-amber-300",
    steps: [
      { title: "File for unemployment benefits", description: "Apply online at your state's unemployment website within 1 week of losing your job. You may be eligible for partial income replacement while you search for work." },
      { title: "Notify your landlord or mortgage servicer", description: "Call them now — most have hardship programs. Getting ahead of it gives you more options and can prevent eviction or foreclosure proceedings." },
      { title: "Pause non-essential subscriptions", description: "Cancel or pause streaming, gym, and app subscriptions right away to conserve cash while you look for work." },
      { title: "Check SNAP and food assistance eligibility", description: "Loss of income often qualifies you for food stamps (SNAP). Apply at benefits.gov or your local DHS office." },
      { title: "Rebuild your network and job search", description: "Let friends, former coworkers, and community members know you are looking. Most jobs are found through people you already know." },
    ],
  },
  {
    id: "medical-bills",
    label: "Medical Bills",
    sub: "Unexpected health costs",
    Icon: Heart,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    accent: "text-red-700 dark:text-red-300",
    steps: [
      { title: "Request an itemized bill", description: "Ask the hospital billing department for a line-by-line breakdown. Errors are common and can total hundreds or thousands of dollars." },
      { title: "Ask about financial assistance programs", description: "Hospitals that receive federal funding are required to offer charity care. Ask specifically for the 'financial assistance' or 'charity care' application." },
      { title: "Negotiate a payment plan", description: "Most providers will set up a 0% interest payment plan. Even $25/month keeps accounts from going to collections." },
      { title: "Check if you qualify for Medicaid retroactively", description: "In many states, Medicaid can cover bills from up to 3 months before your application date. Apply even if you think you earn too much." },
      { title: "Contact a medical billing advocate", description: "Nonprofit patient advocates and hospital social workers can negotiate on your behalf for free. Ask to speak to a patient advocate." },
    ],
  },
  {
    id: "car-accident",
    label: "Car Accident",
    sub: "Collision or vehicle damage",
    Icon: Car,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    accent: "text-blue-700 dark:text-blue-300",
    steps: [
      { title: "File a police report if you haven't yet", description: "A police report is required by most insurance companies and may be needed if there is any dispute about fault." },
      { title: "Notify your insurance company within 24 hours", description: "Call your insurer's claims line immediately. Delays can complicate or reduce your claim payout." },
      { title: "Document everything with photos", description: "Photograph the damage, the scene, and any injuries. Keep all medical receipts, tow receipts, and rental car records together." },
      { title: "Ask about rental car or transportation aid", description: "Your auto policy may cover a rental while your car is being repaired. Check your policy or ask your claims adjuster." },
      { title: "Seek a medical evaluation even if you feel okay", description: "Some injuries like whiplash appear days later. A documented medical visit protects you both legally and health-wise." },
    ],
  },
  {
    id: "eviction",
    label: "Eviction Notice",
    sub: "Threatened with losing housing",
    Icon: Home,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    accent: "text-purple-700 dark:text-purple-300",
    steps: [
      { title: "Do not ignore the notice — respond in writing", description: "You have legal rights. Responding in writing to your landlord creates a paper trail and often buys you critical time." },
      { title: "Contact an eviction legal aid clinic immediately", description: "Many cities offer free legal help for tenants facing eviction. Search 'eviction help [your city]' or call 211." },
      { title: "Apply for emergency rental assistance", description: "Federal and local emergency rental assistance programs (ERAP) can pay past-due rent directly to landlords. Apply at your local housing authority." },
      { title: "Review your lease for landlord violations", description: "If your landlord failed to make repairs or gave improper notice, you may have grounds to pause or dismiss the eviction." },
      { title: "Arrange a temporary housing backup", description: "Reach out to family, friends, or local shelters now — not as a last resort. Having a plan reduces panic and keeps you safer." },
    ],
  },
  {
    id: "natural-disaster",
    label: "Natural Disaster",
    sub: "Storm, flood, fire, or earthquake",
    Icon: CloudLightning,
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    accent: "text-yellow-700 dark:text-yellow-300",
    steps: [
      { title: "Confirm your household is physically safe", description: "Do not return to a damaged home until cleared by authorities. Carbon monoxide, gas leaks, and structural damage can be invisible." },
      { title: "Apply for FEMA disaster assistance", description: "Go to DisasterAssistance.gov or call 1-800-621-FEMA. You may qualify for rental assistance, home repair funds, and crisis counseling." },
      { title: "File a homeowners or renters insurance claim", description: "Call your insurer's 24/7 claims line. Take photos or video of all damage before any cleanup or repairs begin." },
      { title: "Register with local emergency management", description: "Local emergency managers can connect you with food, water, temporary shelter, and recovery resources specific to your area." },
      { title: "Watch out for contractor scams", description: "Predatory contractors target disaster areas. Verify licenses, get multiple estimates, and never pay the full amount upfront." },
    ],
  },
];

// ─── Crisis Card ─────────────────────────────────────────────────────────────

function CrisisCard({ crisis, onSelect }: { crisis: CrisisType; onSelect: (c: CrisisType) => void }) {
  const { Icon } = crisis;
  return (
    <button
      onClick={() => onSelect(crisis)}
      className="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <Card className={`${crisis.border} rounded-2xl transition-all group-hover:shadow-md group-active:scale-[0.99] bg-card`}>
        <CardContent className="flex items-center gap-4 p-4">
          <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${crisis.iconBg}`}>
            <Icon className={`h-5 w-5 ${crisis.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">{crisis.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{crisis.sub}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    </button>
  );
}

// ─── Step List ─────────────────────────────────────────────────────────────────

function StepList({ crisis, onBack }: { crisis: CrisisType; onBack: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => Array(crisis.steps.length).fill(false));
  const { Icon } = crisis;
  const doneCount = checked.filter(Boolean).length;

  function toggle(i: number) {
    setChecked((prev) => { const next = [...prev]; next[i] = !next[i]; return next; });
  }

  return (
    <div className="flex flex-col gap-4 w-full">
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
          <p className="font-bold text-foreground text-sm">{crisis.label}</p>
          <p className="text-xs text-muted-foreground">{doneCount} of {crisis.steps.length} steps done</p>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full overflow-hidden bg-border">
        <div
          className="h-full rounded-full transition-all duration-500 bg-primary"
          style={{ width: `${(doneCount / crisis.steps.length) * 100}%` }}
        />
      </div>

      <ol className="flex flex-col gap-3">
        {crisis.steps.map((step, i) => {
          const done = checked[i];
          return (
            <li key={i}>
              <button onClick={() => toggle(i)} className="w-full text-left group rounded-2xl">
                <Card className={`${done ? crisis.border : "border-border"} rounded-2xl transition-all bg-card`}>
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
                      <p className={`text-sm font-bold leading-snug ${done ? "line-through opacity-40" : crisis.accent}`}>
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

      <Link href="/buddy" className="block w-full mt-1">
        <Button className="w-full h-12 text-sm font-bold rounded-2xl gap-2.5">
          <MessageCircle className="h-4 w-4" />
          Talk to my Buddy
        </Button>
      </Link>
      <p className="text-center text-xs text-muted-foreground pb-1">
        Your Buddy can walk you through each step in plain language.
      </p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CrisisPage() {
  const [selected, setSelected] = useState<CrisisType | null>(null);

  return (
    <AppShell>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8">
        {!selected ? (
          <>
            <section className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                {"What's happening?"}
              </h1>
              <p className="text-base text-muted-foreground mt-1">
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
            <StepList crisis={selected} onBack={() => setSelected(null)} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
