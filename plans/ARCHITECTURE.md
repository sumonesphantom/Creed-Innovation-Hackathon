
# ShockPlan — Architecture & 2-Day Build Plan

> **Goal:** Deployable by end of Day 1 night. Polished by end of Day 2.
> **Cost:** $0 (all free tiers)

---

## Free Stack (zero cost)

| Layer | Tool | Free Tier Limits | Why |
|-------|------|-----------------|-----|
| Frontend | Next.js + shadcn/ui | Vercel Hobby: 100GB bandwidth, 1M edge req | Best DX, instant deploy |
| UI Components | shadcn/ui | Unlimited (open source) | Beautiful, accessible, fast |
| Backend API | **Next.js API Routes** | Runs on same Vercel deploy | No separate server needed! |
| Database | MongoDB Atlas M0 | 512MB storage, 100 connections | Free forever, easy setup |
| AI Buddy | Google Gemini API | 1500 req/day, 1M tokens/min, FREE | Best free tier of any LLM |
| Auth (optional) | NextAuth.js | Free (open source) | Optional, app works without |
| Hosting | Vercel | Free Hobby plan | One-click deploy from GitHub |
| Image Storage | Vercel Blob | 1GB free | Document vault photos |

### Key Decision: Next.js API Routes Instead of Separate Node.js Backend

**Why:** Same codebase, same deploy, zero extra hosting cost, faster to build. MongoDB is still your database — you just call it from API routes instead of Express.

---

## Project Structure

```
shockplan/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing / welcome page
│   ├── globals.css               # Tailwind + shadcn styles
│   │
│   ├── onboarding/               # Profile setup flow
│   │   └── page.tsx              # Multi-step onboarding wizard
│   │
│   ├── dashboard/                # Main user dashboard
│   │   └── page.tsx              # Readiness score + quick actions
│   │
│   ├── buddy/                    # AI Buddy chat
│   │   └── page.tsx              # Chat interface
│   │
│   ├── crisis/                   # Crisis event selection + flow
│   │   ├── page.tsx              # Event picker
│   │   └── [event]/              # Dynamic route per event type
│   │       └── page.tsx          # Event-specific triage flow
│   │
│   ├── budget/                   # Emergency budget reset
│   │   └── page.tsx              # Budget calculator
│   │
│   ├── vault/                    # Document vault (stub)
│   │   └── page.tsx              # Upload + encrypted storage
│   │
│   ├── community/                # Crisis Circles (stub)
│   │   └── page.tsx              # Anonymous community feed
│   │
│   ├── my-data/                  # Data transparency page
│   │   └── page.tsx              # Show/export/delete all data
│   │
│   └── api/                      # Backend API routes
│       ├── buddy/
│       │   └── route.ts          # POST — AI buddy chat (calls Gemini)
│       ├── profile/
│       │   └── route.ts          # GET/POST/DELETE — user profile CRUD
│       ├── score/
│       │   └── route.ts          # GET/POST — readiness score calc
│       ├── budget/
│       │   └── route.ts          # POST — budget calculations
│       ├── community/
│       │   └── route.ts          # GET/POST — community posts
│       └── vault/
│           └── route.ts          # POST/DELETE — document metadata
│
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn components (auto-generated)
│   ├── buddy-chat.tsx            # Chat message bubbles + input
│   ├── onboarding-steps.tsx      # Step-by-step profile wizard
│   ├── readiness-score.tsx       # Circular score display + breakdown
│   ├── crisis-card.tsx           # Event selection cards
│   ├── budget-table.tsx          # Budget editor with priorities
│   ├── data-badge.tsx            # "Your data is encrypted" trust badge
│   ├── why-button.tsx            # Transparency "Why?" popover
│   └── nav-bar.tsx               # Bottom navigation
│
├── lib/                          # Shared logic
│   ├── mongodb.ts                # MongoDB connection singleton
│   ├── gemini.ts                 # Gemini API client + buddy system prompt
│   ├── score.ts                  # Readiness score algorithm
│   ├── encryption.ts             # Client-side AES-256 helpers
│   ├── crisis-data.ts            # Static crisis triage flows (JSON)
│   └── constants.ts              # App-wide constants
│
├── types/                        # TypeScript types
│   └── index.ts                  # User, Profile, Score, Crisis, etc.
│
├── public/                       # Static assets
│   └── icons/                    # Crisis event icons
│
├── .env.local                    # Secrets (never committed)
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Database Schema (MongoDB)

### Collection: `profiles`
```json
{
  "_id": "ObjectId",
  "deviceId": "string",            // Anonymous device identifier (no email needed)
  "household": "single | couple | family | multi-gen",
  "housing": "rent | own | family | other",
  "incomeType": "salary | gig | hourly | unemployed | retired",
  "incomeRange": "0-1k | 1k-3k | 3k-5k | 5k+",
  "state": "string",
  "insurance": ["auto", "renters", "homeowners", "health", "life"],
  "dependents": "number",
  "canCover500": "yes | maybe | no",
  "language": "en | es",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Collection: `scores`
```json
{
  "_id": "ObjectId",
  "deviceId": "string",
  "score": "number (0-100)",
  "breakdown": {
    "savings": "number (0-25)",
    "insurance": "number (0-25)",
    "documents": "number (0-25)",
    "awareness": "number (0-25)"
  },
  "calculatedAt": "Date"
}
```

### Collection: `community_posts`
```json
{
  "_id": "ObjectId",
  "crisisType": "string",
  "state": "string",
  "content": "string (max 500 chars)",
  "upvotes": "number",
  "createdAt": "Date"
  // NO deviceId — fully anonymous
}
```

### Collection: `vault_metadata`
```json
{
  "_id": "ObjectId",
  "deviceId": "string",
  "fileName": "string",
  "fileType": "string",
  "category": "insurance | id | receipt | photo | other",
  "uploadedAt": "Date"
  // Actual files in Vercel Blob, encrypted client-side before upload
}
```

> **NOTE:** No names, emails, addresses, SSNs, or bank info are ever stored. The `deviceId` is a random UUID generated on first app open — not tied to any identity.

---

## AI Buddy System Prompt

```
You are ShockPlan Buddy — a warm, friendly financial companion who helps
people navigate unexpected life events. You are NOT a financial advisor.

PERSONALITY:
- Talk like a caring, knowledgeable friend — casual, warm, supportive
- Use "we" and "let's" — you're in this together
- Keep sentences short. Break complex topics into 2-3 sentence chunks.
- Use simple everyday language. NO jargon. If you must use a term like
  "deductible," immediately explain it in plain words.
- Never judge. Never guilt-trip. Never say "you should have..."
- Celebrate small wins: "That's a great first step!"
- If you don't know something, say so honestly and suggest where to look.

RULES:
- You provide EDUCATION and INFORMATION only. Never give specific financial advice.
- Never recommend specific insurance companies, products, or investments.
- Never ask for SSN, bank account numbers, or sensitive personal data.
- Always remind users that professional advice may be helpful for complex situations.
- Stay focused on the user's current crisis or question. Don't ramble.
- If the user seems distressed, acknowledge their feelings first before giving info.

USER CONTEXT (injected per request):
- Household type, housing, income type, insurance status, state, dependents
- Current crisis event (if any)
- Readiness score and breakdown

Respond in the user's preferred language (English or Spanish).
```

---

## Readiness Score Algorithm

**Total: 100 points across 4 categories (25 each)**

### Savings (25 pts)
| `canCover500` | Points |
|---------------|--------|
| `"yes"` | 25 |
| `"maybe"` | 12 |
| `"no"` | 0 |

### Insurance (25 pts)
- 5 pts per coverage type held (auto, renters/homeowners, health, life)
- +5 bonus if has 3+ types
- Max 25

### Documents (25 pts)
- 5 pts per vault category with at least one document
- Categories: insurance policy, government ID, lease/mortgage, medical, financial
- Max 25

### Awareness (25 pts)
- 10 pts if user has completed at least one crisis flow
- 10 pts if user has used the budget tool
- 5 pts if user has visited the benefits/resources page
- Max 25

---

## 2-Day Build Phases

---

### DAY 1 — Deploy by Night

---

#### Phase 1: Scaffold + Deploy (2 hours)
**Hour 0-2 | GOAL: Empty app live on Vercel**

- [ ] `npx create-next-app@latest shockplan --typescript --tailwind --app`
- [ ] `npx shadcn@latest init`
- [ ] Install shadcn components: `button, card, input, badge, dialog, popover, progress, tabs, textarea, avatar, separator, sheet`
- [ ] Set up MongoDB Atlas M0 cluster ([cloud.mongodb.com](https://cloud.mongodb.com) — free, no credit card)
- [ ] Get Gemini API key ([aistudio.google.com](https://aistudio.google.com) — free, no credit card)
- [ ] Create `.env.local` with `MONGODB_URI` and `GEMINI_API_KEY`
- [ ] Create `lib/mongodb.ts` (connection singleton)
- [ ] Push to GitHub
- [ ] Connect repo to Vercel, add env vars, deploy
- [ ] Verify: app loads on `your-app.vercel.app`

**Deliverable:** Live URL with Next.js default page

---

#### Phase 2: Onboarding + Profile (2.5 hours)
**Hour 2-4.5 | GOAL: User can create a profile**

- [ ] Create `types/index.ts` with all TypeScript interfaces
- [ ] Build onboarding wizard (7 steps, one question per screen)
  - Friendly intro screen with Buddy greeting
  - Each step: question + "why we ask" text + skip button
  - Visual: icons for each option, not just text
- [ ] Build API route: `POST /api/profile` (save to MongoDB)
- [ ] Build API route: `GET /api/profile?deviceId=xxx`
- [ ] Generate `deviceId` on first visit, store in `localStorage`
- [ ] Store profile locally AND in MongoDB
- [ ] After onboarding → redirect to dashboard

**Deliverable:** Full onboarding flow saving to DB

---

#### Phase 3: Dashboard + Readiness Score (2 hours)
**Hour 4.5-6.5 | GOAL: Personalized dashboard with score**

- [ ] Build `readiness-score.tsx` component (circular progress + number)
- [ ] Build score breakdown component with "Why?" buttons
- [ ] Build API route: `POST /api/score` (calculate from profile data)
- [ ] Build dashboard page layout:
  - Greeting: *"Hey [household type]! Here's where you stand."*
  - Readiness Score (big, central)
  - Score breakdown (tappable categories)
  - "I'm in a crisis" button (prominent)
  - "Improve my score" action list
- [ ] Bottom nav bar: Home | Buddy | Crisis | Budget | More

**Deliverable:** Dashboard with live readiness score

---

#### Phase 4: AI Buddy Chat (2.5 hours)
**Hour 6.5-9 | GOAL: Working AI buddy conversation**

- [ ] Create `lib/gemini.ts`:
  - Gemini API client (`@google/generative-ai` package)
  - Buddy system prompt (from above)
  - Function to inject user profile context into prompt
- [ ] Build API route: `POST /api/buddy`
  - Receives: message, deviceId
  - Fetches user profile from MongoDB
  - Injects profile context into system prompt
  - Calls Gemini API
  - Returns buddy response
  - Does NOT store conversation (privacy)
- [ ] Build buddy chat UI:
  - Message bubbles (user = right, buddy = left)
  - Buddy avatar with friendly icon
  - Text input + send button
  - Typing indicator while waiting for API
  - Welcome message on first open
  - Messages stored in React state only (cleared on page close)
- [ ] Add quick-action chips: *"What's a deductible?" "Help me budget" "I lost my job"*

**Deliverable:** Working AI buddy that knows user's profile

---

#### Phase 5: Deploy + Test (1 hour)
**Hour 9-10 | GOAL: Everything live and working**

- [ ] `git push` → auto-deploys to Vercel
- [ ] Test full flow: onboarding → dashboard → buddy chat
- [ ] Fix any API route issues (env vars, CORS, etc.)
- [ ] Test on mobile browser (responsive check)
- [ ] Share URL with team for testing

**Deliverable:** LIVE APP — onboarding, dashboard, score, AI buddy all working

> **Total Day 1: ~10 hours**

---

### DAY 2 — Polish + Remaining Features

---

#### Phase 6: Crisis Event Flows (2.5 hours)
**Hour 0-2.5 | GOAL: Event-driven triage system**

- [ ] Create `lib/crisis-data.ts` with structured triage data:
  - Each event has: name, icon, description, immediate_actions (10 min / 24 hr / 7 day), insurance_relevant, common_costs, benefits_to_check
- [ ] Build crisis selection page (grid of event cards with icons)
- [ ] Build dynamic crisis flow page `[event]/page.tsx`:
  - Timeline view: 10 min → 24 hr → 7 day steps
  - Checkboxes for completed steps
  - Personalized based on profile (insurance status changes the flow)
  - "Talk to Buddy about this" button (opens chat with crisis context)
- [ ] Build at least 4 event flows:
  - Car accident
  - Job loss
  - Medical bill
  - Storm damage

**Deliverable:** Full crisis triage for 4 life events

---

#### Phase 7: Emergency Budget Reset (2 hours)
**Hour 2.5-4.5 | GOAL: Interactive budget calculator**

- [ ] Build budget page with two modes:
  - **Normal mode:** Income input (pre-filled), expense categories, visual bar chart
  - **Crisis mode:** "I'm in a crisis" toggle activates crisis mode
    - Bill priority ranker (drag or tap to reorder)
    - Shows: "Pay these first" → "Defer these" → "Cut these"
    - "Cash on hand" input → shows how many days/weeks it covers
    - Week-by-week cash flow timeline
- [ ] Build API route: `POST /api/budget` (calculations)
- [ ] "What if" toggles: *"What if I skip this bill?" "What if I pick up extra work?"*

**Deliverable:** Working budget tool with crisis mode

---

#### Phase 8: Data Safety + My Data Page (1.5 hours)
**Hour 4.5-6 | GOAL: Visible trust and transparency**

- [ ] Build my-data page:
  - Shows all stored profile data in plain English
  - "Where is my data?" section
  - Export button: downloads all data as JSON
  - Delete button: removes all data from MongoDB + clears localStorage
  - Confirmation dialog before delete
- [ ] Add `data-badge.tsx` component (lock icon + "Encrypted" text) on every page header
- [ ] Add "Why?" popovers to readiness score factors
- [ ] Add "Why we ask" text to each onboarding step
- [ ] Build "How ShockPlan Works" explainer section

**Deliverable:** Full transparency + data control page

---

#### Phase 9: Community Feed Stub (1 hour)
**Hour 6-7 | GOAL: Clickable community feature**

- [ ] Build community page with:
  - Filter by crisis type
  - Anonymous post cards with upvote button
  - "Share your experience" input (max 500 chars)
  - No login required to post
- [ ] Build API routes: `GET/POST /api/community`
- [ ] Seed 10-15 example posts for demo

**Deliverable:** Working anonymous community feed

---

#### Phase 10: Document Vault Stub (1 hour)
**Hour 7-8 | GOAL: Clickable vault feature**

- [ ] Build vault page with:
  - Category tabs: Insurance | ID | Lease | Medical | Financial
  - Upload button per category
  - Uploaded file list with delete option
  - "Encrypted" badge on every item
- [ ] Connect uploads to readiness score (documents category)

**Deliverable:** Basic document upload working

---

#### Phase 11: Polish + Demo Prep (2 hours)
**Hour 8-10 | GOAL: Demo-ready app**

- [ ] Responsive check on mobile (primary demo device)
- [ ] Add loading states and error handling
- [ ] Add page transitions / micro-animations (framer-motion if time)
- [ ] Add Spanish language toggle (even if only buddy chat supports it via Gemini)
- [ ] Final Vercel deploy
- [ ] Prepare demo account with pre-filled profile for smooth 60-second walkthrough
- [ ] Test the full demo flow end-to-end 3 times
- [ ] Prepare backup: screenshots/screen recording in case of live demo failure

**Deliverable:** POLISHED, DEMO-READY APP

> **Total Day 2: ~10 hours**

---

## Environment Variables

```bash
# .env.local (never commit this file)
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/shockplan
GEMINI_API_KEY=your-gemini-api-key-from-aistudio
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Packages to Install

```bash
# Core (included with create-next-app)
next react react-dom typescript @types/react @types/node

# UI (shadcn components installed via CLI)
tailwindcss @tailwindcss/postcss postcss

# Database
mongodb mongoose

# AI
@google/generative-ai

# Utilities
uuid                    # Generate anonymous device IDs
crypto-js               # Client-side AES encryption (for vault)
lucide-react            # Icons (comes with shadcn)
framer-motion           # Animations (optional, Day 2)
```

---

## Cost Breakdown: $0

| Service | Plan | Cost | Limit |
|---------|------|------|-------|
| Vercel | Hobby (free) | $0 | 100GB bandwidth, 1M requests |
| MongoDB Atlas | M0 (free) | $0 | 512MB storage, 100 connections |
| Google Gemini API | Free tier | $0 | 1500 req/day, 1M tokens/min |
| Vercel Blob | Free tier | $0 | 1GB storage |
| GitHub | Free | $0 | Unlimited repos |
| Domain | .vercel.app | $0 | Auto-generated subdomain |
| **TOTAL** | | **$0** | |

> **Note on Vercel Hobby:** It's for "non-commercial, personal" use — perfect for a hackathon demo. If this becomes a real product later, upgrade to Pro ($20/mo).

> **Note on Gemini free tier:** 1500 requests/day is plenty for a hackathon demo. If you hit limits during heavy testing, Gemini 2.5 Flash is also free and faster.

---

## Deploy Checklist (Day 1 Night)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project → Select repo
3. Add environment variables: `MONGODB_URI`, `GEMINI_API_KEY`
4. Deploy → get URL (`yourapp.vercel.app`)
5. Test on phone browser
6. Share with team

**That's it.** Vercel auto-deploys on every `git push` after this.

---

## Risk Mitigation

| Risk | Fix |
|------|-----|
| Gemini API rate limit during demo | Cache common responses. Pre-seed buddy with 5-6 scripted fallback responses for demo scenarios |
| MongoDB Atlas cold start (first request slow) | Add a `/api/health` route that pings DB on app load to warm it up |
| Vercel function cold starts | Functions have ~1-2 second cold starts. Not an issue for demo (Vercel doesn't sleep like Render) |
| Demo fails live | Record a backup video walkthrough on Day 2 evening. Have screenshots ready |
| Team member blocked | Clear phase ownership. Each phase can be done by one person independently |

---

## Parallel Work Split (if 2+ people)

| Person A (Frontend-heavy) | Person B (Backend + AI) | Person C (Content + Polish) |
|--------------------------|------------------------|---------------------------|
| Phase 1: Scaffold (together) | Phase 1: DB + API keys (together) | |
| Phase 2: Onboarding UI | Phase 2: API routes + DB schema | |
| Phase 3: Dashboard UI | Phase 4: Gemini integration | |
| Phase 6: Crisis flow UI | Phase 4: Buddy chat API | Phase 6: Crisis data content |
| Phase 7: Budget UI | Phase 7: Budget API | Phase 9: Community seed posts |
| Phase 10: Vault stub | Phase 8: My Data page | Phase 8: Transparency copy |
| Phase 11: Polish | Phase 11: Demo prep | Phase 11: Pitch deck / demo script |
