"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User, Users, Baby, Home, Building, HelpCircle,
  Briefcase, Laptop, Clock, Pause, Armchair,
  Car, Heart, Shield, ChevronRight, ChevronLeft, Lock,
} from "lucide-react";
import { HOUSEHOLD_TYPES, HOUSING_TYPES, INCOME_TYPES, INSURANCE_TYPES, US_STATES } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";

const iconMap: Record<string, React.ReactNode> = {
  User: <User className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  Baby: <Baby className="h-6 w-6" />,
  Home: <Home className="h-6 w-6" />,
  Building: <Building className="h-6 w-6" />,
  HelpCircle: <HelpCircle className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  Laptop: <Laptop className="h-6 w-6" />,
  Clock: <Clock className="h-6 w-6" />,
  Pause: <Pause className="h-6 w-6" />,
  Armchair: <Armchair className="h-6 w-6" />,
  Car: <Car className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
};

const TOTAL_STEPS = 7;

interface ProfileData {
  deviceId: string;
  household: string;
  housing: string;
  incomeType: string;
  state: string;
  insurance: string[];
  dependents: number;
  canCover500: string;
  language: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    deviceId: "",
    household: "",
    housing: "",
    incomeType: "",
    state: "",
    insurance: [],
    dependents: 0,
    canCover500: "",
    language: "en",
  });

  useEffect(() => {
    let id = localStorage.getItem("shockplan_device_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("shockplan_device_id", id);
    }
    setProfile((p) => ({ ...p, deviceId: id! }));
  }, []);

  const update = (field: string, value: string | string[] | number) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const toggleInsurance = (id: string) => {
    setProfile((p) => ({
      ...p,
      insurance: p.insurance.includes(id)
        ? p.insurance.filter((i) => i !== id)
        : [...p.insurance, id],
    }));
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      localStorage.setItem("shockplan_profile", JSON.stringify(profile));
      router.push("/dashboard");
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const progressPercent = ((step + 1) / (TOTAL_STEPS + 1)) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle collapsed />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Stored on your device
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </header>

      {/* Content + Navigation together so buttons stay near content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          <div>
            {step === 0 && <WelcomeStep userName={user?.name} />}
            {step === 1 && (
              <SelectStep
                title="Who's in your household?"
                why="We use this to tailor advice for your family size."
                options={HOUSEHOLD_TYPES}
                value={profile.household}
                onSelect={(v) => update("household", v)}
              />
            )}
            {step === 2 && (
              <SelectStep
                title="Where do you live?"
                why="This helps us show the right insurance info."
                options={HOUSING_TYPES}
                value={profile.housing}
                onSelect={(v) => update("housing", v)}
              />
            )}
            {step === 3 && (
              <SelectStep
                title="How do you earn?"
                why="We adjust budget tools for your income type."
                options={INCOME_TYPES}
                value={profile.incomeType}
                onSelect={(v) => update("incomeType", v)}
              />
            )}
            {step === 4 && (
              <InsuranceStep selected={profile.insurance} onToggle={toggleInsurance} />
            )}
            {step === 5 && (
              <StateStep value={profile.state} onSelect={(v) => update("state", v)} />
            )}
            {step === 6 && (
              <ComfortStep value={profile.canCover500} onSelect={(v) => update("canCover500", v)} />
            )}
          </div>

          {/* Navigation — directly below content */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={prev} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <Button onClick={next} className="flex-1">
                {step === 0 ? "Let's Go" : "Next"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={saveProfile} disabled={saving} className="flex-1">
                {saving ? "Saving..." : "See My Dashboard"}
              </Button>
            )}
            {step > 0 && step < TOTAL_STEPS - 1 && (
              <Button variant="ghost" onClick={next} className="text-muted-foreground text-sm">
                Skip
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function WelcomeStep({ userName }: { userName?: string | null }) {
  const firstName = userName?.split(" ")[0];
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center space-y-4 py-12">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
        {firstName ? `Hey ${firstName}!` : "Hey!"} I&apos;m your ShockPlan Buddy.
      </h1>
      <p className="text-muted-foreground max-w-md">
        Let me learn a little about you so I can help better.
        Skip anything you want — I&apos;ll still be here.
      </p>
      <Badge variant="outline" className="text-xs gap-1">
        <Lock className="h-3 w-3" /> Everything stays on your device
      </Badge>
    </div>
  );
}

function SelectStep({
  title, why, options, value, onSelect,
}: {
  title: string;
  why: string;
  options: readonly { id: string; label: string; icon: string }[];
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{why}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <Card
            key={opt.id}
            className={`cursor-pointer transition-all ${
              value === opt.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-accent"
            }`}
            onClick={() => onSelect(opt.id)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={value === opt.id ? "text-primary" : "text-muted-foreground"}>
                {iconMap[opt.icon] || <HelpCircle className="h-6 w-6" />}
              </div>
              <span className="font-medium text-foreground">{opt.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InsuranceStep({
  selected, onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">What coverage do you have?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We show insurance education relevant to you. Select all that apply.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INSURANCE_TYPES.map((ins) => (
          <Card
            key={ins.id}
            className={`cursor-pointer transition-all ${
              selected.includes(ins.id)
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-accent"
            }`}
            onClick={() => onToggle(ins.id)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={selected.includes(ins.id) ? "text-primary" : "text-muted-foreground"}>
                {iconMap[ins.icon] || <Shield className="h-6 w-6" />}
              </div>
              <span className="font-medium text-foreground">{ins.label}</span>
              {selected.includes(ins.id) && (
                <Badge className="ml-auto bg-primary/10 text-primary">Selected</Badge>
              )}
            </CardContent>
          </Card>
        ))}
        <Card
          className={`cursor-pointer transition-all ${
            selected.length === 0 ? "ring-2 ring-destructive bg-destructive/5" : "hover:bg-accent"
          }`}
          onClick={() => {
            if (selected.length > 0) {
              selected.forEach((s) => onToggle(s));
            }
          }}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium text-foreground">None / Not sure</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StateStep({
  value, onSelect,
}: {
  value: string;
  onSelect: (state: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">What state are you in?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Benefits and aid programs vary by state. This stays on your device.
        </p>
      </div>
      <select
        value={value}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-border bg-card text-foreground px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">Select your state</option>
        {US_STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

function ComfortStep({
  value, onSelect,
}: {
  value: string;
  onSelect: (v: string) => void;
}) {
  const options = [
    { id: "yes", label: "Yes, I could handle it" },
    { id: "maybe", label: "Maybe, it would be tight" },
    { id: "no", label: "No, that would be a crisis" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Could you handle a $500 surprise expense today?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          No judgment — this helps us set realistic goals together.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => (
          <Card
            key={opt.id}
            className={`cursor-pointer transition-all ${
              value === opt.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-accent"
            }`}
            onClick={() => onSelect(opt.id)}
          >
            <CardContent className="flex items-center justify-center gap-2 p-4 text-center">
              <span className="font-medium text-foreground">{opt.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        1 in 3 Americans would say the same. You&apos;re not alone.
      </p>
    </div>
  );
}
