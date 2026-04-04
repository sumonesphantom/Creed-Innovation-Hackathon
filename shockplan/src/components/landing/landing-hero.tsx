import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { DemoButton } from "@/components/landing/demo-button";

export function LandingHero() {
  return (
    <section className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-6 lg:px-12 pt-16 lg:pt-24 pb-12">
      {/* Left text */}
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-4 py-1.5 text-xs font-medium mb-6 border border-border/60">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          Free for underserved families
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance leading-[1.1]">
          Your{" "}
          <span className="text-primary">Financial Crisis</span>{" "}
          Buddy
        </h1>

        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md text-pretty">
          When life throws you a curveball — a job loss, a surprise bill, a car
          breakdown — ShockPlan helps you figure out your next move. No jargon, no
          judgment. Just real help.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link href="/sign-in" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base font-semibold py-6 px-8 rounded-2xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Get Started <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <DemoButton />
        </div>

        <p className="mt-5 text-xs text-muted-foreground/70">
          Sign in with Google or continue anonymously &middot; Your data stays with you
        </p>
      </div>

      {/* Right illustration card */}
      <div className="flex-1 flex justify-center max-w-md w-full">
        <div className="w-full bg-card rounded-3xl border border-border shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Shock Readiness</p>
              <p className="text-sm text-muted-foreground">Your score at a glance</p>
            </div>
          </div>
          {/* Mini score preview */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-20 h-20">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-primary"
                  strokeDasharray={`${2 * Math.PI * 34 * 0.62} ${2 * Math.PI * 34}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">62</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: "Savings", pct: 60, color: "bg-blue-500" },
                { label: "Insurance", pct: 32, color: "bg-amber-500" },
                { label: "Documents", pct: 88, color: "bg-green-500" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{label}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Chat preview */}
          <div className="bg-muted rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs">🤖</span>
              </div>
              <div className="bg-card rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-foreground">
                Hey! I see your insurance coverage is low. Want me to explain your options?
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
