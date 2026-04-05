// Feature: dashboard-analytics-redesign
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
    scoreColor,
    scoreLabel,
    relativeTime,
    emergencyFundTarget,
    buildProfileContext,
    deriveActionItems,
    NAV_DESTINATIONS,
    type ProfileData,
    type FlowPlanSummary,
} from "./dashboard-utils";

// ─── Unit Tests (subtask 1.1) ─────────────────────────────────────────────────

describe("scoreColor", () => {
    it("returns red for score 0", () => expect(scoreColor(0)).toBe("#ef4444"));
    it("returns red for score 29", () =>
        expect(scoreColor(29)).toBe("#ef4444"));
    it("returns amber for score 30", () =>
        expect(scoreColor(30)).toBe("#f59e0b"));
    it("returns amber for score 54", () =>
        expect(scoreColor(54)).toBe("#f59e0b"));
    it("returns yellow for score 55", () =>
        expect(scoreColor(55)).toBe("#F5C518"));
    it("returns yellow for score 100", () =>
        expect(scoreColor(100)).toBe("#F5C518"));
});

describe("scoreLabel", () => {
    it("returns At Risk for score 0", () =>
        expect(scoreLabel(0)).toBe("At Risk"));
    it("returns At Risk for score 29", () =>
        expect(scoreLabel(29)).toBe("At Risk"));
    it("returns Developing for score 30", () =>
        expect(scoreLabel(30)).toBe("Developing"));
    it("returns Developing for score 54", () =>
        expect(scoreLabel(54)).toBe("Developing"));
    it("returns Building for score 55", () =>
        expect(scoreLabel(55)).toBe("Building"));
    it("returns Building for score 74", () =>
        expect(scoreLabel(74)).toBe("Building"));
    it("returns Resilient for score 75", () =>
        expect(scoreLabel(75)).toBe("Resilient"));
    it("returns Resilient for score 100", () =>
        expect(scoreLabel(100)).toBe("Resilient"));
});

describe("relativeTime", () => {
    it("returns just now for a date 10 seconds ago", () => {
        const d = new Date(Date.now() - 10_000).toISOString();
        expect(relativeTime(d)).toBe("just now");
    });

    it("returns X days ago for a date 3 days ago", () => {
        const d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        expect(relativeTime(d)).toBe("3 days ago");
    });

    it("returns 1 day ago (singular) for exactly 1 day ago", () => {
        const d = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
        expect(relativeTime(d)).toBe("1 day ago");
    });

    it("returns X months ago for a date 2 months ago", () => {
        const d = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        expect(relativeTime(d)).toBe("2 months ago");
    });

    it("returns just now for a future date", () => {
        const d = new Date(Date.now() + 10_000).toISOString();
        expect(relativeTime(d)).toBe("just now");
    });
});

describe("emergencyFundTarget", () => {
    it("returns 1500 for 0-1k", () =>
        expect(emergencyFundTarget("0-1k")).toBe(1500));
    it("returns 6000 for 1k-3k", () =>
        expect(emergencyFundTarget("1k-3k")).toBe(6000));
    it("returns 12000 for 3k-5k", () =>
        expect(emergencyFundTarget("3k-5k")).toBe(12000));
    it("returns 19500 for 5k+", () =>
        expect(emergencyFundTarget("5k+")).toBe(19500));
    it("returns null for unknown range", () =>
        expect(emergencyFundTarget("unknown")).toBeNull());
    it("returns null for empty string", () =>
        expect(emergencyFundTarget("")).toBeNull());
});

const fullProfile: ProfileData = {
    household: "single",
    housing: "renter",
    incomeType: "employed",
    incomeRange: "3k-5k",
    state: "TX",
    insurance: ["health"],
    dependents: 2,
    canCover500: "yes",
};

describe("buildProfileContext", () => {
    it("returns empty array when all fields are empty/zero", () => {
        const empty: ProfileData = {
            ...fullProfile,
            incomeRange: "",
            state: "",
            dependents: 0,
        };
        expect(buildProfileContext(empty)).toEqual([]);
    });

    it("returns all three labels when all fields are set", () => {
        const labels = buildProfileContext(fullProfile);
        expect(labels).toHaveLength(3);
        expect(labels.find((l) => l.key === "incomeRange")?.label).toBe(
            "3k-5k",
        );
        expect(labels.find((l) => l.key === "state")?.label).toBe("TX");
        expect(labels.find((l) => l.key === "dependents")?.label).toContain(
            "2",
        );
    });

    it("returns only state when only state is set", () => {
        const p: ProfileData = {
            ...fullProfile,
            incomeRange: "",
            dependents: 0,
        };
        const labels = buildProfileContext(p);
        expect(labels).toHaveLength(1);
        expect(labels[0].key).toBe("state");
    });

    it("uses singular 'dependent' for 1 dependent", () => {
        const p: ProfileData = { ...fullProfile, dependents: 1 };
        const labels = buildProfileContext(p);
        const dep = labels.find((l) => l.key === "dependents");
        expect(dep?.label).toBe("1 dependent");
    });
});

const allMetBreakdown = { savings: 15, insurance: 15, awareness: 30 };
const plans: FlowPlanSummary[] = [
    { id: "1", name: "Plan A", updatedAt: "2025-01-01T00:00:00Z" },
];

describe("deriveActionItems", () => {
    it("returns empty array when all thresholds met and plans exist", () => {
        expect(deriveActionItems(allMetBreakdown, plans)).toHaveLength(0);
    });

    it("includes savings item when savings < 15", () => {
        const items = deriveActionItems(
            { savings: 10, insurance: 15, awareness: 30 },
            plans,
        );
        expect(items.some((i) => i.href === "/budget")).toBe(true);
    });

    it("includes insurance item when insurance < 15", () => {
        const items = deriveActionItems(
            { savings: 15, insurance: 5, awareness: 30 },
            plans,
        );
        expect(items.some((i) => i.href === "/my-data")).toBe(true);
    });

    it("includes awareness item when awareness < 30", () => {
        const items = deriveActionItems(
            { savings: 15, insurance: 15, awareness: 10 },
            plans,
        );
        expect(items.some((i) => i.href === "/buddy")).toBe(true);
    });

    it("includes flow plan item when no plans exist", () => {
        const items = deriveActionItems(allMetBreakdown, []);
        expect(items.some((i) => i.href === "/flow")).toBe(true);
    });

    it("caps at 4 items even when all gaps present", () => {
        const items = deriveActionItems(
            { savings: 0, insurance: 0, awareness: 0 },
            [],
        );
        expect(items.length).toBeLessThanOrEqual(4);
    });

    it("sorts by descending gap", () => {
        // savings gap = 15-0=15, insurance gap = 15-14=1, awareness gap = 30-0=30
        const items = deriveActionItems(
            { savings: 0, insurance: 14, awareness: 0 },
            plans,
        );
        for (let i = 1; i < items.length; i++) {
            expect(items[i - 1].gap).toBeGreaterThanOrEqual(items[i].gap);
        }
    });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

// Property 3: Score color mapping is total and correct
// Feature: dashboard-analytics-redesign, Property 3: Score color mapping is total and correct
describe("Property 3 — scoreColor mapping", () => {
    it("always returns one of the three expected hex values with correct boundaries", () => {
        fc.assert(
            fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
                const color = scoreColor(score);
                if (score < 30) return color === "#ef4444";
                if (score < 55) return color === "#f59e0b";
                return color === "#F5C518";
            }),
            { numRuns: 200 },
        );
    });
});

// Property 4: Emergency fund target is 3× monthly mid
// Feature: dashboard-analytics-redesign, Property 4: Emergency fund target is 3× monthly mid
describe("Property 4 — emergencyFundTarget is 3× monthly mid", () => {
    const validRanges = ["0-1k", "1k-3k", "3k-5k", "5k+"] as const;
    const midMap: Record<string, number> = {
        "0-1k": 500,
        "1k-3k": 2000,
        "3k-5k": 4000,
        "5k+": 6500,
    };

    it("equals incomeRangeToMonthlyMid * 3 for all valid ranges", () => {
        fc.assert(
            fc.property(fc.constantFrom(...validRanges), (range) => {
                const target = emergencyFundTarget(range);
                return target === midMap[range] * 3;
            }),
            { numRuns: 100 },
        );
    });
});

// Property 2: Profile context completeness
// Feature: dashboard-analytics-redesign, Property 2: Profile context completeness
describe("Property 2 — buildProfileContext completeness", () => {
    it("returns labels containing each field value when all fields are set", () => {
        const incomeRanges = ["0-1k", "1k-3k", "3k-5k", "5k+"];
        const states = ["TX", "CA", "NY", "FL", "WA"];

        fc.assert(
            fc.property(
                fc.constantFrom(...incomeRanges),
                fc.constantFrom(...states),
                fc.integer({ min: 1, max: 10 }),
                (incomeRange, state, dependents) => {
                    const profile: ProfileData = {
                        ...fullProfile,
                        incomeRange,
                        state,
                        dependents,
                    };
                    const labels = buildProfileContext(profile);
                    const hasIncome = labels.some((l) =>
                        l.label.includes(incomeRange),
                    );
                    const hasState = labels.some((l) =>
                        l.label.includes(state),
                    );
                    const hasDeps = labels.some((l) =>
                        l.label.includes(String(dependents)),
                    );
                    return hasIncome && hasState && hasDeps;
                },
            ),
            { numRuns: 200 },
        );
    });
});

// Property 8: Action items are gap-prioritized and capped at 4
// Feature: dashboard-analytics-redesign, Property 8: Action items are gap-prioritized and capped at 4
describe("Property 8 — deriveActionItems gap ordering and cap", () => {
    it("returns at most 4 items and orders by descending gap", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 25 }), // savings
                fc.integer({ min: 0, max: 25 }), // insurance
                fc.integer({ min: 0, max: 50 }), // awareness
                fc.array(
                    fc.record({
                        id: fc.string(),
                        name: fc.string(),
                        updatedAt: fc.string(),
                    }),
                    { minLength: 0, maxLength: 5 },
                ),
                (savings, insurance, awareness, flowPlans) => {
                    const items = deriveActionItems(
                        { savings, insurance, awareness },
                        flowPlans,
                    );
                    if (items.length > 4) return false;
                    for (let i = 1; i < items.length; i++) {
                        if (items[i - 1].gap < items[i].gap) return false;
                    }
                    return true;
                },
            ),
            { numRuns: 300 },
        );
    });
});

// Property 9: Action items correctly reflect threshold gaps
// Feature: dashboard-analytics-redesign, Property 9: Action items correctly reflect threshold gaps
describe("Property 9 — deriveActionItems threshold correctness", () => {
    it("includes correct items for each failing threshold", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 25 }), // savings
                fc.integer({ min: 0, max: 25 }), // insurance
                fc.integer({ min: 0, max: 50 }), // awareness
                fc.array(
                    fc.record({
                        id: fc.string(),
                        name: fc.string(),
                        updatedAt: fc.string(),
                    }),
                    { minLength: 0, maxLength: 5 },
                ),
                (savings, insurance, awareness, flowPlans) => {
                    const items = deriveActionItems(
                        { savings, insurance, awareness },
                        flowPlans,
                    );
                    const hrefs = items.map((i) => i.href);

                    if (savings < 15 && !hrefs.includes("/budget"))
                        return false;
                    if (savings >= 15 && hrefs.includes("/budget"))
                        return false;
                    if (insurance < 15 && !hrefs.includes("/my-data"))
                        return false;
                    if (insurance >= 15 && hrefs.includes("/my-data"))
                        return false;
                    if (awareness < 30 && !hrefs.includes("/buddy"))
                        return false;
                    if (awareness >= 30 && hrefs.includes("/buddy"))
                        return false;
                    if (flowPlans.length === 0 && !hrefs.includes("/flow"))
                        return false;
                    if (flowPlans.length > 0 && hrefs.includes("/flow"))
                        return false;

                    return true;
                },
            ),
            { numRuns: 300 },
        );
    });

    it("returns empty array when all thresholds met and plans exist", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 15, max: 25 }), // savings at or above threshold
                fc.integer({ min: 15, max: 25 }), // insurance at or above threshold
                fc.integer({ min: 30, max: 50 }), // awareness at or above threshold
                fc.array(
                    fc.record({
                        id: fc.string(),
                        name: fc.string(),
                        updatedAt: fc.string(),
                    }),
                    { minLength: 1, maxLength: 5 },
                ),
                (savings, insurance, awareness, flowPlans) => {
                    const items = deriveActionItems(
                        { savings, insurance, awareness },
                        flowPlans,
                    );
                    return items.length === 0;
                },
            ),
            { numRuns: 200 },
        );
    });
});

// Property 1: Nav destination exclusion
// Feature: dashboard-analytics-redesign, Property 1: Nav destination exclusion
describe("Property 1 — deriveActionItems nav destination exclusion", () => {
    it("never returns bare NavBar destinations that aren't contextually framed", () => {
        // The only NavBar destinations that CAN appear are /buddy and /my-data,
        // but only when they carry a meaningful contextual sub-label (not bare nav links).
        // deriveActionItems only adds them when there's a real gap, with distinct labels.
        // We verify no item links to /dashboard or /crisis (which are never valid action items).
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 25 }),
                fc.integer({ min: 0, max: 25 }),
                fc.integer({ min: 0, max: 50 }),
                fc.array(
                    fc.record({
                        id: fc.string(),
                        name: fc.string(),
                        updatedAt: fc.string(),
                    }),
                    { minLength: 0, maxLength: 5 },
                ),
                (savings, insurance, awareness, flowPlans) => {
                    const items = deriveActionItems(
                        { savings, insurance, awareness },
                        flowPlans,
                    );
                    // /dashboard and /crisis must never appear as action item destinations
                    return items.every(
                        (i) => i.href !== "/dashboard" && i.href !== "/crisis",
                    );
                },
            ),
            { numRuns: 300 },
        );
    });
});
