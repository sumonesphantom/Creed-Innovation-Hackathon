const PREFIX = "shockplan_";

export function getShockPlanLocalSnapshot(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      out[key] = localStorage.getItem(key);
    }
  }
  return out;
}

export function clearAllShockPlanLocal(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  for (const k of keys) {
    localStorage.removeItem(k);
  }
}

export function parseJsonSafe(raw: string | null): unknown {
  if (raw == null || raw === "") return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}
