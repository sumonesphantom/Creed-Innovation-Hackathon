# ShockPlan — Your AI Financial Crisis Buddy

ShockPlan helps underserved families prepare for, navigate, and recover from financial shocks with AI-powered guidance, budgeting tools, and insurance education.

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas account (free M0 tier): https://cloud.mongodb.com
- Google Gemini API key (free): https://aistudio.google.com

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd Creed-Innovation-Hackathon/shockplan

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/shockplan
GEMINI_API_KEY=your-gemini-api-key-here
```

```bash
# 4. Run the dev server
npm run dev
```

Open http://localhost:3000

### Deploy to Vercel (free)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project → Select repo
3. Set root directory to `shockplan`
4. Add environment variables: `MONGODB_URI`, `GEMINI_API_KEY`
5. Deploy — you'll get a URL like `yourapp.vercel.app`

## What's Working Now

| Feature | Status | Route |
|---------|--------|-------|
| Landing page | Done | `/` |
| Onboarding wizard (7 steps) | Done | `/onboarding` |
| Dashboard + Readiness Score | Done | `/dashboard` |
| AI Buddy chat | Placeholder | `/buddy` |
| Crisis event triage | Placeholder | `/crisis` |
| Emergency budget tool | Placeholder | `/budget` |
| Document vault | Placeholder | `/vault` |
| Community feed | Placeholder | `/community` |
| My Data (privacy controls) | Placeholder | `/my-data` |

## Tech Stack

- **Frontend:** Next.js 16 + shadcn/ui + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas (free M0 tier)
- **AI:** Google Gemini API (free tier)
- **Hosting:** Vercel (free Hobby plan)

**Total cost: $0**

## Project Structure

```
shockplan/
├── src/
│   ├── app/              # Pages + API routes
│   ├── components/       # UI components (shadcn + custom)
│   ├── lib/              # MongoDB, Gemini, score algorithm, constants
│   └── types/            # TypeScript interfaces
├── plans/                # Build plans + progress tracking (in parent dir)
└── .env.local.example    # Environment template
```
