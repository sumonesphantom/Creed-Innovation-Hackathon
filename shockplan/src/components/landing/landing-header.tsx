"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingHeader() {
  const { user } = useUser();

  return (
    <header className="w-full flex items-center justify-between px-6 lg:px-12 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border/50">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          ShockPlan
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? (
          <Link href="/dashboard">
            <Button size="sm" className="rounded-xl">
              Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/sign-in">
            <Button variant="outline" size="sm" className="rounded-xl">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
