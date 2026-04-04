"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataBadge({
  collapsed,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/my-data"
      title="View where your data lives and export or delete it"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors",
        className
      )}
    >
      <Lock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      {!collapsed && (
        <span className="text-xs font-medium tracking-tight">Encrypted</span>
      )}
    </Link>
  );
}
