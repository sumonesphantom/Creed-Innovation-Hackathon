"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function SignInPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            ShockPlan
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-border bg-card rounded-2xl">
          <CardContent className="p-8 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome to ShockPlan</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to save your profile, track your readiness score, and get personalized crisis guidance across all your devices.
              </p>
            </div>

            <a
              href="/auth/login?returnTo=/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full rounded-xl py-6 h-auto text-base font-semibold gap-3 border-border hover:bg-accent inline-flex items-center justify-center"
              )}
            >
              <Shield className="h-5 w-5" />
              Sign in with Auth0
            </a>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            <Link href="/onboarding" className="w-full">
              <Button
                variant="ghost"
                size="lg"
                className="w-full rounded-xl py-6 text-base text-muted-foreground"
              >
                Continue without an account
              </Button>
            </Link>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>We never sell your data. Your privacy is protected.</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
