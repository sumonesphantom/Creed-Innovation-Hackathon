# ShockPlan Build Progress

## Completed

### Phase 1: Scaffold + Deploy (DONE)
- [x] Next.js app with TypeScript + Tailwind + App Router
- [x] shadcn/ui with 12 components
- [x] MongoDB connection singleton (`lib/mongodb.ts`)
- [x] Gemini AI client with Buddy system prompt (`lib/gemini.ts`)
- [x] Readiness score algorithm (`lib/score.ts`)
- [x] Mongoose models (`lib/models.ts`)
- [x] Constants — states, insurance, crisis events (`lib/constants.ts`)
- [x] TypeScript interfaces (`types/index.ts`)
- [x] API routes: `/api/profile`, `/api/buddy`, `/api/score`, `/api/health`
- [x] Landing page with hero + feature cards
- [x] Placeholder pages for all routes
- [x] `.env.local.example` template
- [x] `.gitignore` at repo root
- [ ] **TODO: Set up MongoDB Atlas M0 + Gemini API key in `.env.local`**
- [ ] **TODO: Push to GitHub + connect to Vercel**

### Phase 2: Onboarding + Profile (DONE)
- [x] 7-step onboarding wizard with progress bar
- [x] Welcome screen with buddy greeting
- [x] Household type selection (icons + cards)
- [x] Housing type selection
- [x] Income type selection
- [x] Insurance coverage multi-select
- [x] State dropdown (all 50 states)
- [x] $500 comfort check
- [x] "Why we ask" text on every step
- [x] Skip button on every step
- [x] "Stored on your device" trust badge
- [x] Anonymous deviceId via UUID (localStorage)
- [x] Profile saves to MongoDB via POST /api/profile
- [x] Profile cached in localStorage
- [x] Redirects to /dashboard after save

---

## Next Up

### Phase 3: Dashboard + Readiness Score (DONE)
- [x] Readiness score circular ring component with animated SVG
- [x] Score breakdown bars with "Why?" popover buttons
- [x] Dashboard layout: personalized greeting, score, crisis CTA, action list
- [x] Bottom nav bar (Home | Buddy | Crisis | Budget | More)
- [x] Fetch profile + calculate score on load
- [x] Redirects to /onboarding if no deviceId
- [x] Encrypted badge in header
- [x] Action items adapt to profile (no insurance → suggest learning)

### Phase 3.5: UI Modernization + Dark Mode (DONE)
- [x] Theme provider with light/dark/system toggle (localStorage persisted)
- [x] Dark mode CSS tokens (blue-tinted brand colors)
- [x] Responsive sidebar nav for desktop (lg+), bottom nav for mobile
- [x] Mobile hamburger menu with sidebar overlay
- [x] Landing page: 2-column hero, feature grid, wider max-w-5xl layout
- [x] Dashboard: 2-column layout (score left, actions right), max-w-6xl
- [x] Onboarding: centered max-w-3xl card, 2-column option grids on sm+
- [x] Crisis page: 2-column card grid, max-w-4xl, Tailwind dark classes
- [x] Budget page: side-by-side input/summary columns, max-w-6xl
- [x] My Data page: 3-column card grid (privacy, export, delete)
- [x] All pages use AppShell component (no more inline headers/bottom navs)

### Phase 4: AI Buddy Chat (DONE)
- [x] Chat UI with message bubbles (user + buddy styles)
- [x] Buddy avatar + typing indicator (animated dots)
- [x] Quick-action chips (6 pre-built prompts)
- [x] Calls POST /api/buddy with profile context
- [x] Messages in React state only (not persisted)
- [x] Auto-scroll, auto-resize textarea, Enter to send
- [x] Error handling with fallback messages

### Phase 5: Auth + Deploy (DONE)
- [x] Auth0 via `@auth0/nextjs-auth0` (Auth0Client + middleware; `/auth/login`, `/auth/callback`, `/auth/logout`)
- [x] User model in MongoDB (email, name, image, provider)
- [x] Sign-in page with Auth0 Universal Login + anonymous fallback
- [x] Auth0 provider wrapping entire app (`Auth0Provider` via `SessionProvider` wrapper)
- [x] Personalized greetings (dashboard, buddy, onboarding) using session name
- [x] User avatar + sign-out in sidebar
- [x] API routes updated: profile, buddy, score all support userId (auth) + deviceId (anonymous)
- [x] Profile migration: anonymous deviceId profiles auto-link to user account on sign-in
- [x] Landing page shows Sign In / Dashboard based on auth state
- [x] `.env.local.example` updated with AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET, APP_BASE_URL
- [ ] **TODO: Create Auth0 Regular Web Application + set callback/logout URLs**
- [ ] **TODO: Add Auth0 env vars to `.env.local`**
- [ ] **TODO: Push to GitHub + deploy to Vercel with env vars**
- [ ] **TODO: Add production callback URL to Auth0 application**

### Phase 6: Crisis Event Flows (DONE)
- [x] Crisis data for 5 events (job loss, medical bills, car accident, eviction, natural disaster)
- [x] Event selection grid (2-column on desktop, dark mode compatible)
- [x] Timeline triage view with 3 tabs: First 10 min / First 24 hrs / First 7 days
- [x] Per-tab step checklist with progress tracking
- [x] Overall progress bar across all timeline phases
- [x] Tab completion indicators (checkmark when all steps done)
- [x] "Talk to Buddy" integration (context-aware link per crisis type)
- [x] Responsive design with short labels on mobile, full labels on desktop

### Phase 7: Emergency Budget Reset (~2 hrs)
- [x] Normal + crisis mode budget calculator
- [x] Bill priority ranker
- [x] Cash flow timeline
- [x] "What if" toggles

### Phase 7.5: Flow of Life — Visual Path Planner (~3 hrs)
- [x] Interactive timeline/flow canvas where users map out their financial life path
- [x] Branching decision nodes (e.g., "Keep current job" vs "Switch careers" vs "Go back to school")
- [x] Each branch shows projected financial impact (savings, expenses, timeline to stability)
- [x] Visual flow lines connecting life events with color-coded outcomes (green = stable, yellow = risky, red = crisis)
- [x] "What-if" alternate path exploration — see how different choices play out over 6mo/1yr/5yr
- [x] Pre-built templates: "Recovering from job loss", "Building first emergency fund", "Getting out of debt"
- [x] Integration with Buddy — ask AI to suggest paths based on your profile
- [x] Drag-and-drop or tap-to-add life events (new job, baby, move, medical event, etc.)
- [x] Timeline zoom: month view, year view, 5-year view
- [x] Share/export path as image for accountability

### Phase 8: Data Safety + My Data Page (~1.5 hrs)
- [x] My Data page: view/export/delete
- [x] Data badge on every page
- [x] "Why?" popovers on score
- [x] "How ShockPlan Works" section

### Phase 9: Community Feed Stub (~1 hr)
- [ ] Anonymous post feed
- [ ] Filter by crisis type
- [ ] Upvote + seed posts

### Phase 10: Document Vault Stub (~1 hr)
- [ ] Category tabs + upload
- [ ] Connect to readiness score

### Phase 11: Polish + Demo Prep (~2 hrs)
- [ ] Responsive mobile check
- [ ] Loading states + error handling
- [ ] Demo account + backup recording
