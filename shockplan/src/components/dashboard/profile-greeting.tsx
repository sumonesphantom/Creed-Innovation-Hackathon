"use client";

import Link from "next/link";
import { buildProfileContext, type ProfileData } from "@/lib/dashboard-utils";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

interface ProfileGreetingProps {
    profile: ProfileData | null;
    userName: string | undefined;
}

export function ProfileGreeting({ profile, userName }: ProfileGreetingProps) {
    const firstName = userName?.split(" ")[0];
    const greeting = getGreeting();

    if (!profile) {
        return (
            <div className="space-y-1">
                <h1 className="text-4xl font-light">
                    {firstName ? `${greeting}, ${firstName}` : greeting}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Ready to take control of your financial future?{" "}
                    <Link
                        href="/onboarding"
                        className="underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                        Complete your onboarding
                    </Link>{" "}
                    to get started.
                </p>
            </div>
        );
    }

    const contextLabels = buildProfileContext(profile);

    return (
        <div className="space-y-2">
            <h1 className="text-4xl font-light">
                {firstName ? `${greeting}, ${firstName}` : greeting}
            </h1>
            {contextLabels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {contextLabels.map(({ key, label }) => (
                        <span
                            key={key}
                            className="bg-muted text-foreground rounded-full px-2.5 py-0.5 text-xs font-medium"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
