# ShockPlan Assessment

**Score: 8.5 / 10** — Okay, go for it.

---

## The Ups

1. **Clear market gap.** No existing app combines crisis-triggered budgeting + insurance education + benefits discovery + document vault in one flow. Every competitor listed does one slice well. Nobody owns the "life just hit me, now what?" moment.

2. **Strong market tailwinds.** The financial wellness market is growing from $2.66B (2025) to $3.03B (2026) at 13.8% CAGR. And the Fed's 2024 data shows 31% of US adults can't cover a $500 surprise expense — the target user base is massive.

3. **Perfect hackathon alignment.** State Farm literally has a page called "Create a Financial Emergency Plan" — this app productizes their own advice. Judges will see direct brand relevance. It hits all four criteria: innovation (combined flow), technical execution (very buildable), accessibility (multilingual, no bank linking), real-world impact (underserved communities).

4. **No direct competitor.** Searched for "ShockPlan" and event-driven financial crisis apps — nothing matches this exact concept. BrightPlan and Fearless Finance do life-event planning, but they target employed/middle-class users with advisors, not crisis recovery for underserved populations.

5. **Feasible MVP.** Rules engine + document upload + static content + simple budget math. No need for bank API integrations, ML models, or complex infrastructure for a demo.

---

## The Lows

1. **Breadth risk.** Combining 6 features (event triage, budget reset, insurance explainer, benefits finder, document vault, recovery plan). At a hackathon, doing 6 things at 60% quality loses to doing 2 things at 95% quality. **Mitigation:** Pick 2-3 features to fully polish, stub the rest.

2. **Insurance content liability.** Explaining insurance in plain English is great, but anything that looks like advice could make judges nervous (especially State Farm judges). **Mitigation:** Clear disclaimers, frame as "education" not "recommendation."

3. **Benefits finder is hard to keep accurate.** Government aid programs change constantly, vary by state/county, and have complex eligibility rules. **Mitigation:** For MVP, curate links for 2-3 states max and be transparent about coverage.

4. **Retention question.** Crisis apps have a usage problem — people only open them when something bad happens. Judges might ask about ongoing engagement. **Mitigation:** Add the preparedness/readiness angle (document vault, insurance checkup reminders) as the "before crisis" hook.

5. **Crowded adjacent space.** While nobody does the exact combo, budgeting apps (YNAB, Mint successors), benefit finders (USAGov), and document vaults (Know Your Stuff) all exist. Need to clearly articulate why the combination matters more than the sum of parts.

---

## Feasibility Verdict

**Highly feasible for a hackathon MVP.** The core tech is straightforward:
- Event selection → conditional logic tree (no AI needed, though AI can enhance)
- Budget planner → basic math with inputs
- Insurance explainer → static content with good UX
- Document vault → file upload + local/cloud storage
- Benefits finder → curated database, not a live API

No need for bank integrations, complex ML, or real-time data feeds. A team of 3-4 can build a compelling demo in 24-48 hours.

---

## Recommendation

Build it, but **ruthlessly scope the MVP**. For the demo, nail these three:
1. **Event-driven onboarding** (the "wow" moment — pick your crisis, get a personalized flow)
2. **Emergency budget reset** (interactive, shows immediate value)
3. **Plain-English insurance explainer** (directly relevant to State Farm)

Stub the document vault and benefits finder as clickable prototypes. That's enough to win.

**The strongest framing line for the submission:**
> "ShockPlan helps underserved families recover from financial shocks by combining emergency budgeting, insurance education, benefits discovery, and claim-ready document storage in one accessible app."

---

## Market Research Sources

- [Financial Wellness Program Market Report 2026](https://www.thebusinessresearchcompany.com/report/financial-wellness-program-global-market-report)
- [State Farm - Create a Financial Emergency Plan](https://www.statefarm.com/simple-insights/financial/create-a-financial-emergency-plan)
- [Ready.gov Financial Preparedness](https://www.ready.gov/financial-preparedness)
- [CNBC Best Budgeting Apps 2026](https://www.cnbc.com/select/best-budgeting-apps/)
- [BrightPlan Financial Wellness](https://www.brightplan.com/)
- [State Farm Hackathon for Good](https://newsroom.statefarm.com/hackathon-for-good/)

---

## Existing Competitor Landscape

| Competitor | Strength | Gap |
|------------|----------|-----|
| SaverLife | Engagement/habit-building, AI navigator, savings tools | Not crisis/insurance focused |
| Mission Asset Fund Lending Circles | Community credit-building, 0% interest | Solves specific credit problem only |
| CFPB Financial Well-Being tool | 10-question diagnostic score | Diagnostic only, no action orchestration |
| Ready.gov EFFAK | Emergency document preparedness | Document-first, no education or triage |
| Know Your Stuff | Home inventory for claims | Document-first, no broader financial guidance |
| FDIC Money Smart / Banzai | Gamified financial education | Learning-first, not actionable in a crisis |
| USAGov Benefit Finder | Government benefits discovery | Point tool, not a full recovery journey |
| NerdWallet / Prudential | Calculators and tools | Point tools, one question at a time |
