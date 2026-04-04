import Link from "next/link";
import { Shield, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">ShockPlan</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
          Your data is encrypted
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Hey! I&apos;m your ShockPlan Buddy.
          </h1>
          <p className="text-lg text-gray-600">
            When life throws you a curveball, I&apos;ll help you figure out what to do
            next — no jargon, no judgment, just real help.
          </p>

          <Link href="/onboarding">
            <Button size="lg" className="w-full text-base py-6 mt-4">
              Let&apos;s Get Started
            </Button>
          </Link>

          <p className="text-xs text-gray-400">
            No sign-up needed. No bank linking. Your data stays on your device.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid w-full max-w-md gap-3">
          <Card className="border-0 bg-white/80 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">AI Buddy</p>
                <p className="text-sm text-gray-500">
                  Talk through any financial crisis like texting a friend who knows finance
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Shock Readiness Score</p>
                <p className="text-sm text-gray-500">
                  See how prepared you are and exactly what to improve first
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <Heart className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Crisis Triage</p>
                <p className="text-sm text-gray-500">
                  Step-by-step guidance for car accidents, job loss, medical bills, and more
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-400">
        ShockPlan provides educational information, not financial advice.
        <br />
        We don&apos;t sell your data. Ever.
      </footer>
    </div>
  );
}
