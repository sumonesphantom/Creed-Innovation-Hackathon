"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const DEMO_DEVICE_ID = "demo-user-shockplan-2024";

const DEMO_PROFILE = {
  deviceId: DEMO_DEVICE_ID,
  household: "family",
  housing: "rent",
  income: "hourly",
  insurance: ["health"],
  state: "AZ",
  canCover500: "maybe",
};

export function DemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    setLoading(true);
    try {
      localStorage.setItem("shockplan_device_id", DEMO_DEVICE_ID);

      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEMO_PROFILE),
      });

      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full sm:w-auto text-base py-6 px-8 rounded-2xl"
      onClick={handleDemo}
      disabled={loading}
    >
      {loading ? "Loading demo…" : "View Demo"}
    </Button>
  );
}
