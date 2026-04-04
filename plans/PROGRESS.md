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

### Phase 4: AI Buddy Chat (DONE)
- [x] Chat UI with message bubbles (user + buddy styles)
- [x] Buddy avatar + typing indicator (animated dots)
- [x] Quick-action chips (6 pre-built prompts)
- [x] Calls POST /api/buddy with profile context
- [x] Messages in React state only (not persisted)
- [x] Auto-scroll, auto-resize textarea, Enter to send
- [x] Error handling with fallback messages

### Phase 5: Deploy + Test (~1 hr)
- [ ] Push to GitHub
- [ ] Deploy to Vercel with env vars
- [ ] Test full flow on mobile
- [ ] Share URL with team

### Phase 6: Crisis Event Flows (~2.5 hrs)
- [ ] Crisis data JSON for 4 events
- [ ] Event selection grid
- [ ] Timeline triage view (10min/24hr/7day)
- [ ] "Talk to Buddy" integration

### Phase 7: Emergency Budget Reset (~2 hrs)
- [ ] Normal + crisis mode budget calculator
- [ ] Bill priority ranker
- [ ] Cash flow timeline
- [ ] "What if" toggles

### Phase 8: Data Safety + My Data Page (~1.5 hrs)
- [ ] My Data page: view/export/delete
- [ ] Data badge on every page
- [ ] "Why?" popovers on score
- [ ] "How ShockPlan Works" section

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
