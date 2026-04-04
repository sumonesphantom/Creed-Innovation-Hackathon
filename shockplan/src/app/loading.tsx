import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[35vh] flex flex-col items-center justify-center gap-3 text-muted-foreground bg-background px-4">
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <p className="text-sm">Loading…</p>
    </div>
  );
}
