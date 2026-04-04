import { Shield } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-5 bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border/50">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground font-sans">
          ShockPlan
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
        <span
          className="inline-block h-2 w-2 rounded-full bg-[oklch(0.62_0.18_150)] shadow-[0_0_6px_oklch(0.62_0.18_150/0.5)]"
          aria-hidden="true"
        />
        <span>Your data is encrypted</span>
      </div>
    </header>
  );
}
