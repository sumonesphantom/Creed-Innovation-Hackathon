"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System";

  return (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "sm"}
      onClick={cycle}
      className="gap-2 text-muted-foreground hover:text-foreground"
      aria-label={`Theme: ${label}. Click to change.`}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && <span className="text-xs">{label}</span>}
    </Button>
  );
}
