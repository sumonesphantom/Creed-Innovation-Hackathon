import { MessageCircle, Shield, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageCircle,
    label: "AI Buddy",
    description:
      "Talk through any financial crisis like texting a friend who actually knows money.",
    iconColorClass: "text-[oklch(0.51_0.22_260)]",
    bgClass: "bg-[oklch(0.94_0.04_260)]",
    borderClass: "border-[oklch(0.87_0.06_260)]",
  },
  {
    icon: Shield,
    label: "Shock Readiness Score",
    description:
      "See how prepared you are today — and exactly what to improve first.",
    iconColorClass: "text-[oklch(0.52_0.17_150)]",
    bgClass: "bg-[oklch(0.94_0.05_150)]",
    borderClass: "border-[oklch(0.87_0.06_150)]",
  },
  {
    icon: Heart,
    label: "Crisis Triage",
    description:
      "Step-by-step guidance for job loss, medical bills, car accidents, and more.",
    iconColorClass: "text-[oklch(0.58_0.22_27)]",
    bgClass: "bg-[oklch(0.96_0.04_27)]",
    borderClass: "border-[oklch(0.91_0.05_27)]",
  },
] as const;

export function LandingFeatures() {
  return (
    <section
      className="px-6 pb-14 flex flex-col items-center gap-4 w-full max-w-md mx-auto"
      aria-label="Key features"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1 font-sans">
        What ShockPlan does
      </p>

      {features.map(({ icon: Icon, label, description, iconColorClass, bgClass, borderClass }) => (
        <Card
          key={label}
          className={`w-full border shadow-sm hover:shadow-md transition-shadow duration-200 bg-card ${borderClass}`}
        >
          <CardContent className="flex items-start gap-4 p-5">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${bgClass}`}>
              <Icon className={`h-5 w-5 ${iconColorClass}`} aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground text-sm font-sans">{label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5 font-sans">
                {description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
