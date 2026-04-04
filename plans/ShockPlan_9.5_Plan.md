# ShockPlan 9.5 Plan — Your AI Financial Crisis Buddy

> **Pitch:** "ShockPlan is a friendly, transparent AI buddy that helps underserved families prepare for, navigate, and recover from life's financial shocks — combining warm conversational guidance, personalized user profiles, proactive risk scoring, emergency budgeting, plain-English insurance education, and community support in one accessible, multilingual app where your data never leaves your control."

---

## Design Philosophy: Buddy, Not Coach

**Why "Buddy" instead of "Coach":**
Insurance and financial tools feel cold, corporate, intimidating. They use jargon, hide fees in fine print, and make people feel judged for not knowing things. ShockPlan is the opposite.

> A coach tells you what to do. A buddy walks with you through it.

### Buddy Personality Principles
- First-name basis, casual tone: *"Hey! Let's figure this out together."*
- Never assumes knowledge: *"A deductible is basically the amount you pay before insurance kicks in. Think of it like a cover charge."*
- Never judges: *"No savings? That's more common than you'd think. 1 in 3 Americans are in the same spot. Let's work with what you have."*
- Celebrates small wins: *"You uploaded your lease! That's one less thing to worry about if something happens."*
- Uses everyday analogies, not finance-speak
- Admits what it doesn't know: *"I'm not sure about that specific program in your county — here's where you can check directly."*
- Never pushes products: *"Here's what renters insurance does. Whether you get it is totally up to you."*

### Example Conversations

**User:** "I just lost my job and I'm freaking out"
**Buddy:** "I hear you — that's a really stressful situation and you're not alone in this. Let's take it one step at a time. First things first: do you have any income still coming in, like a final paycheck or side gig? That'll help us figure out your next 30 days together."

**User:** "What's a deductible?"
**Buddy:** "Good question! A deductible is the amount you pay out of your own pocket before your insurance starts covering things. Like if your deductible is $500 and you have $2,000 in damage, you pay the first $500 and insurance handles the rest. Make sense?"

**User:** "I don't have any insurance"
**Buddy:** "That's okay — a lot of people don't, and there's no shame in that. Let me show you what options might make sense for your situation, and what they'd actually cost. No pressure, just info so you can decide."

### Anti-Patterns (things the Buddy NEVER does)
- Never uses corporate jargon: no "optimize your portfolio" or "risk mitigation strategies"
- Never guilt-trips: no "you should have had an emergency fund"
- Never upsells or pushes any specific product or company
- Never pretends to be a licensed advisor
- Never makes promises about outcomes
- Never collects data without explaining exactly why

---

## Core Principle: Radical Transparency

Most financial apps hide how they work. ShockPlan shows everything.

### Transparency Commitments

**1. "Why am I seeing this?"**
Every recommendation, score factor, and suggestion has a visible "Why?" button.
> Readiness Score shows 45/100 → User taps "Why?" → sees exact breakdown:
> - Emergency savings: 10/25 (you said you could maybe cover $500)
> - Insurance coverage: 5/25 (no renters or life insurance detected)
> - Document readiness: 15/25 (you uploaded 3 of 8 key documents)
> - Benefits awareness: 15/25 (you've explored 2 of 5 relevant programs)

**2. "What happens with my answer?"**
Before every profile question, a small line explains what the data is used for.
> *"We ask about your housing type so we can show you the right insurance info. This stays on your phone."*

**3. "How does the AI work?"**
Dedicated "How ShockPlan Works" page in plain English:
- "Our AI buddy reads your profile to give you personalized answers"
- "It's trained to educate, not advise — think Wikipedia, not a financial advisor"
- "It doesn't remember your conversations after you close the app (unless you choose to save them)"
- "It never sends your personal info to advertisers or third parties"

**4. Open scoring formula**
The Shock Readiness Score formula is fully visible, not a black box. Users can see exactly how each answer affects their score.

**5. No dark patterns**
- No "limited time" urgency tricks
- No guilt-based nudges
- No hiding the "skip" or "no thanks" option
- Uninstall removes everything — no zombie data

---

## Core Principle: Data Safety & Privacy

> **"Your data is yours. Period."**

### Architecture: Local-First, Zero-Trust

#### 1. Local Storage by Default
- All user profile data stored on-device using encrypted local storage
- No server-side database stores personal information by default
- The app works 100% offline for all features except the AI buddy chat and community feed
- Documents/photos stored in encrypted local storage, never uploaded without explicit consent

#### 2. Encryption
- **At rest:** AES-256 encryption on all local data
- **In transit:** TLS 1.3 for any data sent to AI API or cloud sync
- **Document vault:** Client-side encryption before any upload (zero-knowledge — server can't read files even if breached)

#### 3. AI Conversation Privacy
- Conversations with the buddy are sent to the AI API for processing but **NOT stored on any server**
- API configured with zero data retention
- User profile context is injected into the AI prompt but stripped of direct identifiers
- **What the AI sees:** "User is a renter, gig worker, family of 3, Arizona, no auto insurance"
- **What the AI never sees:** name, address, SSN, bank accounts, exact income

#### 4. No Data Monetization
- ShockPlan never sells, shares, or monetizes user data
- No ad tracking, no analytics that identify individuals
- No third-party SDKs that harvest data (no Facebook SDK, no Google Analytics)

#### 5. User Control
- **"My Data" page** shows exactly what's stored and where
- **One-tap export:** download all your data as a readable file
- **One-tap delete:** permanently erase everything, locally and in any cloud sync
- **Granular permissions:** choose what to sync, what stays local-only
- **No account required:** the app works without sign-up, email, or phone number

#### 6. Optional Cloud Sync
- End-to-end encrypted: only the user's device can decrypt
- Zero-knowledge architecture: server stores encrypted blobs, cannot read contents
- Sync can be turned off at any time; cloud copy deleted immediately
- Clear explanation before enabling: *"This will store an encrypted copy of your data on our server so you can access it from another device. We cannot read it. You can delete it anytime."*

#### 7. Document Vault Security
- Photos and documents encrypted on-device before storage
- If cloud-synced: encrypted before upload, server stores only encrypted blobs
- No OCR or scanning of documents on server side
- Metadata stripped from photos before storage (no GPS, no timestamps leaking)

### Data Safety Trust Signals (visible in the app)
- Lock icon on every screen with data: *"Your data is encrypted on your device"*
- *"No account needed"* prominently on onboarding
- *"We don't sell your data. Ever."* in the footer of every page
- Privacy badge on AI chat: *"This conversation is not stored"*
- Before every profile question: one-line explanation of why it's asked and where it goes
- *"My Data"* page accessible from main menu (not buried in settings)
- Delete button is big, red, and easy to find — not hidden behind 5 menus

---

## Core Features (6 total)

### 1. AI Crisis Buddy (Conversational)

The centerpiece of the app. A warm, friendly AI buddy that walks users through their crisis like a knowledgeable friend.

**How it works:**
- User describes their situation in plain language
- Buddy responds with step-by-step guidance, personalized to their profile
- Tone is warm, casual, non-judgmental — like texting a friend who happens to know finance
- Supports English and Spanish
- Responses constrained to education-only (no financial advice liability)

**Technical approach:**
- Claude or Gemini API with a carefully crafted "Buddy" system prompt
- System prompt defines personality: friendly, casual, empathetic, never judgmental
- System prompt constrains to education, crisis triage, and resource navigation
- Context-aware: pulls from user profile, readiness score, and selected crisis event
- API configured with zero data retention
- User profile injected without personal identifiers
- Soft disclaimer in onboarding (not on every message):
  > *"ShockPlan Buddy gives educational info to help you understand your options. It's not a financial advisor and can't give personalized financial advice."*

**Buddy system prompt core principles:**
- Use "we" and "let's" language: *"Let's figure out your next steps"*
- Keep sentences short and scannable
- Break complex topics into 2-3 sentence chunks
- Always offer a "want me to explain more?" follow-up
- If unsure, say so honestly and point to a real resource

---

### 2. User Profile & Personalization

Every user gets a personalized profile that shapes their entire experience. The app adapts to who they are, not just what happened to them.

**Onboarding flow (friendly, not interrogative):**
- Screen 1: *"Hey! I'm your ShockPlan Buddy. Let me learn a little about you so I can help better. Skip anything you want — I'll still be here."*
- Screen 2: Household — *"Who's in your household?"* (visual icons: just me / me + partner / family with kids / multi-generational)
- Screen 3: Housing — *"Where do you live?"* (rent / own / with family / other)
- Screen 4: Income — *"How do you earn?"* (salary / gig-freelance / hourly / not working right now / retired)
- Screen 5: Insurance — *"What coverage do you have?"* (checkboxes: auto / renters / homeowners / health / life / not sure / none)
- Screen 6: Location — *"What state are you in?"* (dropdown — for benefits matching)
- Screen 7: Comfort check — *"Could you handle a $500 surprise expense today?"* (yes / maybe / no)
- Each screen shows: why we're asking + where data goes + "skip" button

**How personalization changes the experience:**

| Feature | Without Profile | With Profile |
|---------|----------------|--------------|
| AI Buddy | Generic advice | Tailored to income type, insurance status, location |
| Budget | Empty form | Pre-filled with income range, household size |
| Insurance explainer | Shows everything | Prioritizes relevant coverage (renter vs homeowner) |
| Benefits finder | All states | Filtered by state, income bracket, household size |
| Recovery plan | Generic steps | Adjusted difficulty ($5/week vs $50/week) |
| Crisis triage | Full checklist | Skips steps already covered (has insurance → jump to "file claim") |

**Profile privacy:**
- All data stored locally on device with AES-256 encryption
- No bank account linking required
- No account/email/phone required
- Optional encrypted cloud sync
- Users can skip any question — the app still works, just less personalized
- One-tap data export and deletion

---

### 3. Shock Readiness Score (Proactive)

On first use (after profile setup), generate a personalized **"Shock Readiness Score"** from 0-100.

**Friendly score ranges:**
| Score | Message |
|-------|---------|
| 0-30 | "Let's build your safety net — here's where to start" |
| 31-50 | "You've got a foundation — let's strengthen it" |
| 51-70 | "You're getting prepared — a few more steps to go" |
| 71-90 | "Looking solid! Here's how to close the gaps" |
| 91-100 | "You're ready for almost anything!" |

**Scoring factors (fully visible — no black box):**
- Emergency savings buffer (can you cover $500? $1000?)
- Insurance coverage gaps (auto, renters, health, life)
- Document readiness (do you have key documents backed up?)
- Household vulnerability (dependents, single income, gig work)
- Benefits awareness (do you know what you qualify for?)

**Each action item links directly to the relevant app feature:**
- "Your document readiness is low" → opens document vault
- "You have no renters insurance" → opens insurance explainer

---

### 4. Event-Driven Crisis Onboarding

When a crisis hits, the user selects their event and gets a personalized guided flow.

**Supported life events (MVP):**
- Car accident / vehicle damage
- Job loss / income reduction
- Medical emergency / unexpected medical bill
- Storm / natural disaster damage
- Death in the family
- Rent spike / housing emergency
- Major home or appliance repair

**Each event triggers:**
- Buddy activates: *"I'm sorry you're dealing with this. Let's take it step by step."*
- Immediate action checklist (next 10 minutes / 24 hours / 7 days)
- Personalized based on user profile (insurance status, income type, location)
- Budget impact calculator
- Relevant benefits and resources

---

### 5. Emergency Budget Reset

Interactive budget tool that responds to the user's crisis.

**Features:**
- Pre-filled from user profile (income type, household size)
- **"Crisis mode" toggle:** shows what to cut, what to prioritize, what to defer
- **Bill priority ranker:** rent → utilities → food → insurance → minimum payments → everything else
- **Cash flow timeline:** visual week-by-week view of money in vs money out
- **Irregular income support** for gig workers
- **"What if" scenarios:** what if I defer this bill? What if I pick up extra shifts?
- **Buddy integration:** "Want me to walk you through this budget?"

---

### 6. Community Feed — "Crisis Circles" (Stub for MVP)

Inspired by MAF's Lending Circles, but for knowledge and mutual aid.

**MVP version:**
- Anonymous community feed: *"I just went through [event]. Here's what I wish I knew."*
- Tips tagged by crisis type and location
- Upvote system so best advice rises
- No personal data shared — posts are fully anonymous

**Future version:**
- Opt-in local matching: connect users in the same zip code
- Verified community organizations and nonprofits as contributors
- Integration with local mutual aid networks

---

## Stubbed Features (clickable but minimal for demo)

- **Document Vault:** encrypted upload of photos, receipts, policy numbers, household inventory
- **Benefits/Relief Finder:** curated links filtered by state (Arizona focus for demo)
- **Recovery Plan:** weekly micro-steps to rebuild after crisis

---

## Scoring Breakdown (Why this is 9.5)

| Criteria | What we deliver |
|----------|----------------|
| **Innovation** | AI buddy (not coach!) + personalized profiles + proactive scoring + radical transparency = genuinely new |
| **Technical execution** | LLM with buddy personality, zero-knowledge encryption, local-first architecture, adaptive UX |
| **Accessibility** | Multilingual, conversational (lower literacy barrier), no bank linking, no account needed, friendly tone |
| **Real-world impact** | Helps BEFORE + DURING + AFTER crisis, personalized to each user's reality, builds trust with underserved users |
| **State Farm alignment** | Risk scoring = insurance awareness funnel, insurance education baked in, trust-building = brand differentiation |

---

## Demo Flow (60-second pitch walkthrough)

1. Open app → friendly welcome: *"Hey! I'm your ShockPlan Buddy."*
2. Quick profile setup (4-5 taps: renter, gig worker, no insurance, Arizona, family of 3) → Each screen shows why data is needed and where it's stored
3. See personalized dashboard with Shock Readiness Score: **32/100** → Tap "Why?" → see exact breakdown, fully transparent
4. Tap "I'm in a crisis now" → select "Car accident"
5. Buddy activates: *"I'm sorry about the accident. Let's figure this out together. I see you don't have auto insurance — here's what you can do right now..."*
6. Buddy walks through step-by-step triage personalized to their profile, in a warm conversational tone
7. Tap "Adjust my budget" → crisis budget mode shows week-by-week cash flow
8. Show "My Data" page: *"Here's everything we know about you. It's encrypted on your phone. Delete it anytime."*
9. Show community feed: real tips from others who went through the same thing
10. End: *"ShockPlan felt like talking to a friend who actually understood my situation."*

---

## Market Context & Research Sources

- **Market size:** Financial wellness market growing from $2.66B (2025) to $3.03B (2026) at 13.8% CAGR
- **User need:** 31% of US adults can't cover a $500 emergency (Federal Reserve, 2024)
- **AI trend:** Conversational AI market projected to grow from $12.24B (2024) to $61.69B by 2032
- **Trust gap:** Underserved communities have valid, historical reasons to distrust financial institutions — transparency and data safety are not optional, they are the product.

### Sources
- [World Economic Forum - AI-Powered Financial Inclusion](https://www.weforum.org/stories/2025/12/this-is-what-the-new-frontier-of-ai-powered-financial-inclusion-looks-like/)
- [HOPE AI Initiative](https://www.blacklensnews.com/stories/2026/jan/04/introducing-hope-ai-an-era-of-equity-is-here/)
- [Commonwealth - Financial AI for Good](https://buildcommonwealth.org/our-work/financial-ai/)
- [Coach mAIa - MIT Solve](https://solve.mit.edu/solutions/92248)
- [AI Financial Coach Guide 2026](https://www.whistl.app/blog-ai-financial-coach-complete-guide-2026.html)
- [Conversational AI Market Trends 2026](https://masterofcode.com/blog/conversational-ai-trends)
- [State Farm - Emergency Financial Plan](https://www.statefarm.com/simple-insights/financial/create-a-financial-emergency-plan)
- [Financial Wellness Program Market 2026](https://www.thebusinessresearchcompany.com/report/financial-wellness-program-global-market-report)
