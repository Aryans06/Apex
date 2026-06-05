# Apex ATS

AI-powered Applicant Tracking System built for the Indian tech ecosystem. Surfaces **hidden gems** — self-taught developers, career-switchers, and Tier-2/3 city candidates that keyword-based ATS systems routinely filter out.

---

## Features

- **Resume parsing** — Upload PDF or paste plain text; Gemini extracts structured data automatically.
- **Hidden gem scoring** — Each candidate receives a `hiddenGemScore` and `adjacencyScore` (0–100) that reward non-traditional backgrounds.
- **JD matching** — Rank candidates against a job description with weighted scores: technical fit (40%), trajectory fit (35%), cultural fit (25%).
- **Proof-of-work questions** — Generate deep technical interview questions derived from specific resume claims.
- **Bulk upload** — Analyze multiple resumes in one shot.
- **Candidate comparison** — Side-by-side radar chart comparison across candidates.
- **Outreach** — Send assessment questions to candidates via email.
- **i18n** — UI available in English, Hindi, Tamil, Bengali, and Telugu.
- **Export** — Export submission packages for shortlisted candidates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion |
| Auth | Clerk (`@clerk/nextjs`) |
| Database | SQLite via Prisma |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| PDF parsing | `pdf-parse` |
| Icons | `lucide-react` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API key
- A [Clerk](https://clerk.com/) application (publishable key + secret key)

### Installation

```bash
git clone <repo-url>
cd ats-hackathon
npm install
```

### Environment Variables

Create a `.env.local` file in the `ats-hackathon/` directory:

```env
GEMINI_API_KEY=          # Google AI Studio key
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### Database Setup

```bash
npx prisma db push       # create the SQLite database from schema
npx prisma generate      # generate the Prisma client
```

### Run

```bash
npm run dev              # starts dev server at http://localhost:3000
```

---

## Key Commands

```bash
npm run dev              # start dev server (port 3000)
npm run build            # production build
npm run lint             # ESLint

npx prisma studio        # GUI for the SQLite database
npx prisma db push       # apply schema changes without a migration
npx prisma generate      # regenerate Prisma client after schema changes
```

---

## Project Structure

```
src/
  app/
    page.tsx                            # Landing page
    dashboard/page.tsx                  # Main recruiter dashboard
    dashboard/candidate/[id]/page.tsx   # Candidate detail view
    profile/page.tsx                    # User profile
    sign-in/  sign-up/                  # Clerk auth pages
    api/
      analyze/route.ts                  # POST: parse resume PDF/text → Gemini → Prisma
      bulk-analyze/route.ts             # POST: analyze multiple resumes at once
      match/route.ts                    # POST: rank candidates against a JD
      generate-assessment/route.ts      # POST: generate proof-of-work questions
      send-assessment/route.ts          # POST: email assessment via nodemailer
      candidates/route.ts               # GET: list all candidates from DB
      jobs/route.ts                     # Jobs management
      outreach/route.ts                 # POST: outreach to candidates
      export-submission/route.ts        # POST: export shortlist package
      seed/route.ts                     # POST: seed demo data
  components/
    ApexLogo.tsx
    BulkUploadModal.tsx
    CandidateAvatar.tsx
    CandidateCard.tsx                   # Candidate list card with scores
    CompareModal.tsx                    # Side-by-side radar chart comparison
    FilterBar.tsx
    OutreachModal.tsx
    ProofOfWorkModal.tsx                # Generate technical interview questions
    RadarChart.tsx
    Sidebar.tsx
    SkeletonCard.tsx
    Toast.tsx
  lib/
    db.ts                               # Prisma client singleton
    data.ts                             # Candidate TypeScript types
    i18n.ts                             # Translation strings (en/hi/ta/bn/te)
    locale-context.tsx                  # React context + LanguageSwitcher
    utils.ts                            # Utility helpers
  proxy.ts                              # Clerk middleware (protects /dashboard, /profile)
prisma/
  schema.prisma                         # Candidate, Experience, Education models
  dev.db                                # SQLite database (gitignored)
```

---

## Data Model

```
Candidate
  id, name, role, summary
  skills            — comma-separated string (no spaces around delimiter)
  location
  isProcessed
  hiddenGemScore    — 0–100, rewards non-traditional backgrounds
  adjacencyScore    — 0–100, rewards transferable-skill proximity
  trajectoryNotes
  githubUrl, portfolioUrl

  → experiences: role, company, duration, description, bullets (JSON string)
  → education:   degree, school, year
```

---

## AI Pipeline

All AI calls use `gemini-2.5-flash`.

| Endpoint | What it does |
|---|---|
| `/api/analyze` | Parses a resume, extracts structured JSON, persists to SQLite. Scores `hiddenGemScore` and `adjacencyScore` with Indian-context awareness (Tier-1/2/3 cities, IIT vs self-taught, startup vs services). |
| `/api/match` | Ranks candidates against a JD. Returns `technicalFit` (40%) + `trajectoryFit` (35%) + `culturalFit` (25%) = `overallScore`. Top 2 are `isShortlisted: true`. |
| `/api/generate-assessment` | Given a resume bullet claim, returns 3 deep proof-of-work questions with `intent` explanations. Falls back to mock data when `GEMINI_API_KEY` is absent. |

---

## i18n

Custom lightweight system in [src/lib/i18n.ts](src/lib/i18n.ts). Supported locales: `en`, `hi`, `ta`, `bn`, `te`.

- Use `t(key, locale)` to look up a string.
- Add new keys to the `TranslationKeys` type and all 5 locale objects.
- Wrap pages with `LocaleProvider`; access the current locale with `useLocale()`.

---

## Deployment

The easiest path is [Vercel](https://vercel.com/new). Set the same environment variables from `.env.local` in your Vercel project settings, then push to deploy.

> **Note:** The default `DATABASE_URL=file:./dev.db` uses a local SQLite file and won't persist across Vercel serverless function invocations. For production, swap in a persistent database (e.g. Turso, PlanetScale, Neon).
