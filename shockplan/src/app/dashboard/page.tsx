"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReadinessScoreRing } from "@/components/readiness-score";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, AlertTriangle, Lock, TrendingUp,
  FileText, Heart, DollarSign
} from "lucide-react";

interface ScoreData {
  score: number;
  breakdown: {
    savings: number;
    insurance: number;
    documents: number;
    awareness: number;
  };
}

interface ProfileData {
  household: string;
  insurance: string[];
  canCover500: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceId = localStorage.getItem("shockplan_device_id");
    if (!deviceId) {
      router.push("/onboarding");
      return;
    }

    async function load() {
      try {
        // Fetch profile
        const profileRes = await fetch(`/api/profile?deviceId=${deviceId}`);
        if (!profileRes.ok) {
          router.push("/onboarding");
          return;
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Calculate score
        const scoreRes = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
        if (scoreRes.ok) {
          setScoreData(await scoreRes.json());
        }
      } catch {
        // Use cached profile if API fails
        const cached = localStorage.getItem("shockplan_profile");
        if (cached) setProfile(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading your dashboard...</div>
      </div>
    );
  }

  const greeting = profile?.household === "family"
    ? "Hey, fam!"
    : profile?.household === "couple"
    ? "Hey, you two!"
    : "Hey there!";

  // Build action items based on profile
  const actions: { label: string; href: string; icon: React.ReactNode; done: boolean }[] = [];

  if (!profile?.insurance?.length) {
    actions.push({
      label: "Learn about insurance options",
      href: "/buddy",
      icon: <Shield className="h-4 w-4 text-blue-500" />,
      done: false,
    });
  }
  if (profile?.canCover500 === "no" || profile?.canCover500 === "maybe") {
    actions.push({
      label: "Start an emergency budget plan",
      href: "/budget",
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      done: false,
    });
  }
  actions.push({
    label: "Upload important documents",
    href: "/vault",
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    done: false,
  });
  actions.push({
    label: "Explore a crisis scenario",
    href: "/crisis",
    icon: <Heart className="h-4 w-4 text-red-400" />,
    done: false,
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">ShockPlan</span>
        </div>
        <Badge variant="outline" className="text-[10px] gap-1">
          <Lock className="h-3 w-3" /> Encrypted
        </Badge>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
          <p className="text-sm text-gray-500">Here&apos;s where you stand.</p>
        </div>

        {/* Score */}
        {scoreData && (
          <ReadinessScoreRing
            score={scoreData.score}
            breakdown={scoreData.breakdown}
          />
        )}

        {/* Crisis CTA */}
        <Link href="/crisis">
          <Card className="bg-red-50 border-red-100 cursor-pointer hover:bg-red-100 transition-colors">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-semibold text-gray-900">I&apos;m in a crisis right now</p>
                <p className="text-xs text-gray-500">Get step-by-step help immediately</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Action Items */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Improve your score</h2>
          </div>
          <div className="space-y-2">
            {actions.map((action, i) => (
              <Link key={i} href={action.href}>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="flex items-center gap-3 p-3">
                    {action.icon}
                    <span className="text-sm text-gray-700">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <NavBar />
    </div>
  );
}
