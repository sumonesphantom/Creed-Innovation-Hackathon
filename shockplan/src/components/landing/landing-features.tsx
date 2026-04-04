import { MessageCircle, Shield, Heart, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageCircle,
    label: "AI Buddy",
    description:
      "Talk through any financial crisis like texting a friend who actually knows money.",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    icon: Shield,
    label: "Shock Readiness Score",
    description:
      "See how prepared you are today — and exactly what to improve first.",
    iconColor: "text-[oklch(0.52_0.17_150)]",
    iconBg: "bg-[oklch(0.52_0.17_150/0.1)]",
  },
  {
    icon: Heart,
    label: "Crisis Triage",
    description:
      "Step-by-step guidance for job loss, medical bills, car accidents, and more.",
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  {
    icon: DollarSign,
    label: "Emergency Budget",
    description:
      "Reset your budget in minutes when income drops. Know what to pay first.",
    iconColor: "text-[oklch(0.58_0.18_80)]",
    iconBg: "bg-[oklch(0.58_0.18_80/0.1)]",
  },
] as const;

export function LandingFeatures() {
  return (
    <section
      className="px-6 lg:px-12 pb-16 w-full max-w-5xl mx-auto"
      aria-label="Key features"
    >
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
          What ShockPlan does
        </p>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Everything you need in a crisis
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map(({ icon: Icon, label, description, iconColor, iconBg }) => (
          <Card
            key={label}
            className="border border-border shadow-sm hover:shadow-md transition-shadow bg-card"
          >
            <CardContent className="flex items-start gap-4 p-5 lg:p-6">
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm lg:text-base">{label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
