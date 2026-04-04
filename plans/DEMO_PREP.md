# ShockPlan — demo and backup checklist

Use this for a live hackathon demo or recording.

## Environment

- Copy `shockplan/.env.local.example` to `.env.local` and set `MONGODB_URI`, `GEMINI_API_KEY`, and Auth0 variables (see [ARCHITECTURE.md](ARCHITECTURE.md)).
- Auth0 Application: **Regular Web App** with callback `http://localhost:3000/auth/callback` (and production URLs when deployed).
- Deploy: connect the repo to Vercel, add the same env vars, redeploy after changes.

## Demo path (~60 seconds)

1. Open the app landing page, then **Sign in** (optional) or continue anonymously.
2. Complete **onboarding** (or use an existing profile with `shockplan_device_id` in localStorage).
3. **Dashboard** — show live Shock Readiness Score and breakdown popovers.
4. **Crisis** — pick an event, open timeline tabs.
5. **Buddy** — send one short message (Gemini must be configured).
6. **Budget** — toggle crisis mode or adjust a line (optional).
7. **Vault** — upload one file reference in a category (metadata only in stub).
8. **Community** — filter posts, upvote, or add a short anonymous tip.
9. **My Data** — export JSON and mention delete flow without executing delete live.

## Demo account (Auth0)

- Create a test user in the Auth0 Dashboard (**User Management** → **Users** → **Create user**) with a password you can type quickly.
- Use a dedicated email/password for the demo so Universal Login is predictable.
- After first sign-in, complete onboarding once so the dashboard score is populated.

## Backup if live demo fails

- Record a **screen capture** of the flow above (OBS, QuickTime, or Windows Game Bar) before the event.
- Export **screenshots** of dashboard, crisis, buddy, vault, and community.
- Keep a **JSON export** from My Data as a sample (no real PII).

## Smoke test (3 passes)

Before presenting, run through the demo path three times: cold start, signed-in path, and anonymous path to confirm MongoDB and Gemini respond.
