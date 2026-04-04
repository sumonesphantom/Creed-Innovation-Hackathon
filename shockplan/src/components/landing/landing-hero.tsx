import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-4 py-1.5 text-xs font-medium mb-8 border border-border/60">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        Free for underserved families
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight max-w-sm mx-auto font-sans">
        Hey! I&apos;m your{" "}
        <span className="text-primary">ShockPlan</span>{" "}
        Buddy.
      </h1>

      <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto text-pretty font-sans">
        When life throws you a curveball — a job loss, a surprise bill, a car
        breakdown — I&apos;ll help you figure out your next move. No jargon, no
        judgment. Just real help.
      </p>

      <Link href="/onboarding" className="mt-8 w-full max-w-xs">
        <Button
          size="lg"
          className="w-full text-base font-semibold py-6 rounded-2xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-sans"
        >
          Let&apos;s Get Started
        </Button>
      </Link>

      <p className="mt-4 text-xs text-muted-foreground/70 font-sans">
        No sign-up needed &middot; No bank linking &middot; Your data stays with you
      </p>
    </section>
  );
}
