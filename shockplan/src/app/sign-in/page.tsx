"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session) return null;

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

            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl py-6 text-base font-semibold gap-3 border-border hover:bg-accent"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </Button>

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
