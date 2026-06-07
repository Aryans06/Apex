# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Next.js 16 warning**: This version has breaking changes — APIs, conventions, and file structure may differ from training data. Check `node_modules/next/dist/docs/` before writing any Next.js-specific code. Heed deprecation notices.

# Apex ATS — Hackathon Project

AI-powered Applicant Tracking System built for the Indian tech ecosystem. Surfaces "hidden gems" — self-taught developers, career-switchers, and Tier-2/3 city candidates that keyword-based ATS systems filter out.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Auth**: Clerk (`@clerk/nextjs`)
- **Database**: SQLite via Prisma (`prisma/schema.prisma`, `prisma/dev.db`)
- **AI**: Google Gemini 2.5 Flash (`@google/genai`)
- **PDF parsing**: `pdf-parse`
- **Icons**: `lucide-react`

## Key Commands

```bash
npm run dev      # start dev server (port 3000)
npm run build    # production build
npm run lint     # eslint
npx prisma studio          # GUI for the SQLite database
npx prisma db push         # apply schema changes without migration
npx prisma generate        # regenerate Prisma client after schema changes
```

## Environment Variables

Required in `.env` or `.env.local`:

```
GEMINI_API_KEY=         # Google AI Studio key
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## Project Structure

```
src/
  app/
    page.tsx                          # Landing page
    dashboard/page.tsx                # Main recruiter dashboard
    dashboard/candidate/[id]/page.tsx # Candidate detail view
    profile/page.tsx                  # User profile
    sign-in/  sign-up/                # Clerk auth pages
    api/
      analyze/route.ts          # POST: parse resume PDF/text → Gemini → Prisma
      match/route.ts            # POST: rank candidates against a JD
      generate-assessment/route.ts  # POST: generate proof-of-work questions
      send-assessment/route.ts  # POST: email assessment questions via nodemailer
      candidates/route.ts       # GET: list all candidates from DB
      seed/route.ts             # POST: seed demo data
  components/
    CandidateCard.tsx           # Candidate list card with scores
    ProofOfWorkModal.tsx        # Modal to generate technical interview questions
  lib/
    db.ts                       # Prisma client singleton
    data.ts                     # Candidate TypeScript type definitions
    i18n.ts                     # Translation strings (en/hi/ta/bn/te)
    locale-context.tsx          # React context + LanguageSwitcher component
    utils.ts                    # Utility helpers
  proxy.ts                      # Clerk middleware (protects /dashboard and /profile)
prisma/
  schema.prisma                 # Candidate, Experience, Education models
```

## Data Model

Skills stored as comma-separated string; Experience bullets stored as JSON string — parse/join at API boundaries.

```
Candidate: id, name, role, summary, skills (csv), location, isProcessed,
           hiddenGemScore (0–100), adjacencyScore (0–100), trajectoryNotes,
           githubUrl, portfolioUrl
  → experiences: role, company, duration, description, bullets (JSON)
  → education:   degree, school, year
```

## AI Pipeline

All AI calls use `gemini-2.5-flash`. Three Gemini-backed endpoints:

1. **`/api/analyze`** — Parses resume → extracts structured JSON → persists to SQLite. Scores `hiddenGemScore` and `adjacencyScore` (0–100). Considers Indian context: Tier-1/2/3 cities, IIT vs self-taught, startup vs services.

2. **`/api/match`** — Given a JD + candidate pool → returns ranked list with `technicalFit` (40%), `trajectoryFit`/experience (25%), `culturalFit`/behavioral (25%), education (10%) = `overallScore`, multiplied by a title relevance factor. Skill groups are filtered to those mentioned in the JD text before scoring. Top 2 are `isShortlisted: true`.

3. **`/api/generate-assessment`** — Given a resume bullet claim → returns 3 deep technical proof-of-work questions with `intent` explanations. Has a mock fallback when `GEMINI_API_KEY` is missing.

## i18n

Custom lightweight system in `src/lib/i18n.ts`. Supported locales: `en`, `hi`, `ta`, `bn`, `te`. Use the `t(key, locale)` function. Add new keys to `TranslationKeys` type and all 5 locale objects. The `LocaleProvider` wraps dashboard; use `useLocale()` to get current locale.

## Important Quirks

- `pdf-parse` requires a `DOMMatrix` global polyfill at module level — already patched in `analyze/route.ts` and `match/route.ts`. Don't remove it.
- Gemini responses sometimes wrap JSON in markdown fences — all routes strip ` ```json ``` ` before `JSON.parse`.
- Hidden gem filter uses `hiddenGemScore > 80`. Candidate `c_001` is always included as a demo seed.
- `skills` is split/joined on `","` — no spaces around the delimiter.
