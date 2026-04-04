"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 bg-background">
      <h1 className="text-xl font-bold text-foreground text-center">Something went wrong</h1>
      <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        <Button type="button" onClick={() => reset()} className="rounded-xl">
          Try again
        </Button>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
