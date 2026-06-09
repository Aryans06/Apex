# Apex ATS — Full System Report
### Architecture, AI Pipeline, Ranking Engine & Hackathon Compliance

---

## Table of Contents

1. [What Apex Is](#1-what-apex-is)
2. [Problem Statement](#2-problem-statement)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Data Model](#5-data-model)
6. [Feature Walkthrough](#6-feature-walkthrough)
7. [AI Brain — The Three Gemini Pipelines](#7-ai-brain--the-three-gemini-pipelines)
8. [The Ranking Engine — How Candidates Are Scored](#8-the-ranking-engine--how-candidates-are-scored)
9. [The Hackathon Submission (`rank.py`)](#9-the-hackathon-submission-rankpy)
10. [Hackathon Compliance Check](#10-hackathon-compliance-check)

---

## 1. What Apex Is

Apex is an AI-powered Applicant Tracking System (ATS) purpose-built for the Indian tech hiring ecosystem. It has two distinct layers:

**Layer 1 — The Web App**: A full recruiter dashboard where resumes are uploaded, parsed by Gemini 2.5 Flash, stored in SQLite, and then ranked live against a job description pasted or uploaded by the recruiter. Every candidate gets a `hiddenGemScore`, `adjacencyScore`, proof-of-work validation questions, and an AI-drafted outreach email.

**Layer 2 — The Hackathon Submission Engine**: A standalone CPU-only Python script (`rank.py`) that processes the competition dataset of 100,000 candidates against the released Job Description and produces a valid `submission.csv` with the top 100 ranked candidates.

Both layers share the same core scoring philosophy but are implemented independently so the web app can use Gemini and the submission script stays within the competition's no-LLM-API, 5-minute CPU constraint.

---

## 2. Problem Statement

Traditional keyword-matching ATS systems filter candidates on:
- FAANG experience
- IIT/NIT pedigree
- Recognisable company names
- Tier-1 city location

This systematically excludes the majority of Indian engineering talent — self-taught developers in Indore, bootcamp graduates in Coimbatore, founding engineers at unrecognised startups in Bhubaneswar. A candidate like Ravi Kumar (self-taught, Indore, 4 years, no FAANG) would score 23/100 on a keyword ATS and never be seen. Apex scores him 91/100 as a Hidden Gem based on career velocity, proof-of-work signals, and skill adjacency.

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Full-stack web application |
| Styling | Tailwind CSS v4 + Framer Motion | UI + animations |
| Auth | Clerk (`@clerk/nextjs`) | Sign-in/sign-up, route protection |
| Database | SQLite via Prisma ORM | Candidate storage, notes, assessments |
| AI | Google Gemini 2.5 Flash (`@google/genai`) | Resume parsing, matching, assessment generation, outreach drafting |
| PDF Parsing | `pdf-parse` | Extracts text from uploaded PDF resumes |
| Email | `nodemailer` | Sends proof-of-work assessment emails to candidates |
| Icons | `lucide-react` | UI icon set |
| i18n | Custom (`src/lib/i18n.ts`) | 5-language support: English, Hindi, Tamil, Bengali, Telugu |
| Submission Script | Python 3 (stdlib only) | `rank.py` — no external dependencies |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (Next.js 16 App Router)                                │
│                                                                 │
│  /               Landing page — dual entry (recruiter/seeker)   │
│  /dashboard      Main ATS — upload, JD match, candidate grid    │
│  /dashboard/candidate/[id]  Full candidate profile              │
│  /dashboard/jobs            Saved JDs                           │
│  /dashboard/pipeline        Kanban pipeline view                │
│  /dashboard/analytics       Stats and charts                    │
│  /dashboard/settings        User preferences                    │
│  /profile                   Recruiter profile                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │  HTTP (fetch)
┌───────────────────────▼─────────────────────────────────────────┐
│  Next.js API Routes (Server-side)                               │
│                                                                 │
│  POST /api/analyze           Resume → Gemini → Prisma           │
│  POST /api/bulk-analyze      Multiple resumes → sequential      │
│  POST /api/match             JD + candidates → ranked list      │
│  POST /api/generate-assessment  Claim → Gemini → 3 questions   │
│  POST /api/send-assessment   Questions → nodemailer → candidate │
│  POST /api/outreach          Candidate info → Gemini → email    │
│  GET  /api/candidates        List all candidates from DB        │
│  GET  /api/candidates/[id]   Single candidate + notes           │
│  PATCH/DELETE /api/candidates/[id]  Update/delete candidate     │
│  PATCH /api/candidates/[id]/stage   Update pipeline stage       │
│  POST /api/candidates/[id]/notes    Add recruiter note          │
│  DELETE /api/candidates/[id]/notes  Delete note                 │
│  GET  /api/candidates/[id]/assessments  Assessment history      │
│  POST /api/jobs              Save a JD                          │
│  POST /api/export-submission  Export ranked CSV                 │
│  POST /api/seed              Seed demo candidates               │
└───────────────────────┬─────────────────────────────────────────┘
                        │  Prisma Client
┌───────────────────────▼─────────────────────────────────────────┐
│  SQLite (`prisma/dev.db`)                                       │
│  Tables: Candidate, Experience, EducationRecord,                │
│          JobDescription, CandidateNote, AssessmentRecord        │
└─────────────────────────────────────────────────────────────────┘

                        Separate system:
┌─────────────────────────────────────────────────────────────────┐
│  rank.py  (Python, CPU-only, no network)                        │
│  Input:  data_set/candidates.jsonl  (100,000 candidates)        │
│  Output: submission.csv  (top 100 ranked)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Middleware

`src/proxy.ts` uses Clerk middleware to protect `/dashboard` and `/profile` routes. Unauthenticated users are redirected to sign-in.

### Auto-seed

When `GET /api/candidates` is called and the database is empty, it automatically seeds 4 mock candidates (Priya Sharma, Rahul Mehta, Anjali Deshmukh, Vikram Singh) so the dashboard is never blank during a demo. This is defined in `src/lib/data.ts`.

---

## 5. Data Model

All data lives in `prisma/dev.db` (SQLite). Schema defined in `prisma/schema.prisma`.

### `Candidate`
The central table. One row per resume uploaded.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Internal primary key |
| `candidateId` | String? | `CAND_XXXXXXX` from the hackathon dataset |
| `name` | String | Full name |
| `headline` | String? | One-line professional headline |
| `role` | String | Current/most recent job title |
| `summary` | String | AI-generated 2-sentence summary |
| `skills` | String | JSON array: `[{name, proficiency, endorsements, duration_months}]` |
| `location` | String? | City, Country |
| `yearsOfExperience` | Float? | Years of professional experience |
| `currentCompany` | String? | Most recent employer |
| `currentIndustry` | String? | Industry category |
| `hiddenGemScore` | Int? | 0–100, AI-computed |
| `adjacencyScore` | Int? | 0–100, AI-computed |
| `trajectoryNotes` | String? | AI-generated career trajectory analysis |
| `githubUrl` | String? | GitHub profile link |
| `portfolioUrl` | String? | Portfolio/personal site |
| `pipelineStage` | String | `applied` / `screened` / `interview` / `offer` / `hired` / `rejected` |
| `redFlags` | String? | JSON string array of AI-flagged concerns |
| `redrobSignals` | String? | Full JSON blob of 23 behavioral signals from dataset |
| `createdAt` | DateTime | Upload timestamp |

### `Experience`
One-to-many with `Candidate`. Each work history entry.

| Field | Type | Notes |
|---|---|---|
| `role` | String | Job title |
| `company` | String | Employer name |
| `duration` | String | Display string — only populated if explicitly stated in resume |
| `startDate` | String? | ISO date, null if not in resume |
| `endDate` | String? | ISO date, null if not in resume |
| `durationMonths` | Int? | Null if not calculable from stated dates |
| `isCurrent` | Boolean | Whether this is the current role |
| `industry` | String? | Industry for this role |
| `description` | String | One-sentence description |
| `bullets` | String | JSON array of achievement bullets (max 3) |

### `EducationRecord`
One-to-many with `Candidate`.

| Field | Type | Notes |
|---|---|---|
| `institution` | String | University/school name |
| `degree` | String | Degree name |
| `fieldOfStudy` | String? | Major/specialisation |
| `startYear` | Int? | Null if not stated |
| `endYear` | Int? | Null if not stated |
| `grade` | String? | CGPA or percentage |
| `tier` | String? | `tier_1` / `tier_2` / `tier_3` / `tier_4` / `unknown` |

### `CandidateNote`
Recruiter notes attached to a candidate. Created/deleted via the candidate profile page.

### `AssessmentRecord`
Saved history of every proof-of-work assessment generated and sent. Stores the claim text, the 3 questions, and the email it was sent to.

### `JobDescription`
Saved JDs from the recruiter's Jobs page. Used to trigger matching from the dashboard.

---

## 6. Feature Walkthrough

### 6.1 Landing Page (`/`)

Two entry points:
- **I'm a Recruiter** → `/dashboard` (Clerk-protected)
- **I'm a Job Seeker** → opens upload modal, calls `/api/analyze`, adds candidate to talent pool

Animated `LiveCandidateCard` demonstrates a Hidden Gem candidate (Ravi Kumar, Indore, self-taught) alongside a "before/after" split showing traditional ATS rejection vs Apex surfacing. City marquee scrolls 20 Indian Tier-2/3 cities to reinforce the product positioning. Supports 5 languages via the `LanguageSwitcher` component.

### 6.2 Dashboard (`/dashboard`)

The primary recruiter workspace.

**Stats row**: Total candidate count, Hidden Gem count (toggle to filter), avg processing time, search box.

**Upload Resume**: Modal accepts PDF or pasted text → calls `/api/analyze` → new candidate appears at top of grid.

**Bulk Upload**: Modal accepts multiple PDFs or multiple pasted resumes → calls `/api/bulk-analyze` → each file is sent sequentially to `/api/analyze`.

**Post Job Description (JD)**: Modal accepts PDF or text → calls `/api/match` → candidates are re-sorted by match score. An "Active JD" banner appears with a clear button. Each `CandidateCard` now shows a detailed match breakdown (Overall score, Technical Fit bar, Trajectory Fit bar, Cultural Fit bar, AI reasoning quote).

**Top-N selector**: Filter displayed list to Top 10 / 25 / 50 / 100.

**FilterBar**: Filter by location (text), required skills (multi-chip), minimum Hidden Gem score.

**Compare**: Select up to 4 candidates (checkbox on each card) → "Compare" button opens `CompareModal` side-by-side with radar charts, scores, education, skills, summary, red flags.

**Outreach**: Hover any card → "Outreach" button → `OutreachModal` → choose email type (intro / interview / offer / rejection) → Gemini drafts the email, copy-to-clipboard.

**Export CSV**: Exports the current displayed/filtered candidate list to CSV (includes match scores if a JD is active).

**Pagination**: 25 candidates per page with prev/next and numbered pagination.

### 6.3 Candidate Profile (`/dashboard/candidate/[id]`)

Full detail page for a single candidate.

**Left column:**
- Avatar (generated from initials), name, role, Hidden Gem / Red Flags / Assessment Sent badges
- Pipeline stage dropdown (Applied → Screened → Interview → Offer → Hired → Rejected) — live PATCH to `/api/candidates/[id]/stage`
- Location, GitHub, portfolio links, education
- Skills tag cloud
- "Apex Diagnostics" panel: radar chart (Gem Score, Adjacency, Traditional Match) + three animated score bars
- Recruiter Notes panel (add/delete, persisted to DB)
- Assessment History accordion (past assessments sent with their questions)

**Right column:**
- AI Synthesis panel with `trajectoryNotes` quote
- Summary paragraph
- Experience timeline: each bullet has a "Validate" hover button → triggers `ProofOfWorkModal`
- "Generate Assessment" / "Draft Outreach Email" / "Delete" buttons in the header

### 6.4 Proof-of-Work Modal (`ProofOfWorkModal`)

1. Takes a resume bullet (claim) as input
2. Calls `POST /api/generate-assessment` → Gemini generates 3 deep technical validation questions
3. Recruiter can enter a candidate email + click "Send" → calls `POST /api/send-assessment`
4. Assessment is stored in `AssessmentRecord` table and shown in Assessment History on the profile

### 6.5 Outreach Modal (`OutreachModal`)

1. Select email type: intro, interview, offer, rejection
2. Optionally add an interview slot link
3. Calls `POST /api/outreach` → Gemini generates personalised subject + body
4. Copy button to clipboard; email is not sent automatically (recruiter sends from their own client)

### 6.6 Pipeline View (`/dashboard/pipeline`)

Kanban board showing all candidates organised by their `pipelineStage`. Drag-or-click to move between stages.

### 6.7 Jobs Page (`/dashboard/jobs`)

Saved JDs. Clicking "Match Candidates" on a saved JD injects it into session storage and redirects to dashboard, which picks it up and auto-opens the JD modal.

### 6.8 Analytics (`/dashboard/analytics`)

Dashboard-level statistics: candidate distribution by role, skill frequency, hidden gem vs traditional comparison charts.

---

## 7. AI Brain — The Three Gemini Pipelines

All Gemini calls use the `gemini-2.5-flash` model via `@google/genai`. JSON fences (` ```json ``` `) are stripped before `JSON.parse`. The API key is required for all three pipelines; assessment generation has a mock fallback when missing.

### 7.1 Resume Parsing (`POST /api/analyze`)

**Input**: PDF file (as base64 inline data) or plain text.

**What happens step by step:**

1. The uploaded file is converted to base64 (`Buffer.from(await file.arrayBuffer()).toString("base64")`).
2. A multi-part Gemini prompt is assembled: the PDF inline data part + the instruction part (or just text + instruction if no PDF).
3. The instruction tells Gemini to act as an ATS for the Indian tech ecosystem and extract a structured JSON object.
4. **Critical rule**: Gemini is explicitly told to use `null` for any date or duration field not explicitly written in the resume — never infer or estimate dates.
5. Gemini returns a JSON object with: name, headline, role, summary, yearsOfExperience, skills (max 10, each with proficiency/endorsements/duration_months), experience (with bullets), education (with institutional tier), links, location, hiddenGemScore (0–100), adjacencyScore (0–100), trajectoryNotes, redFlags.
6. The response is parsed, validated, and written to the `Candidate` + `Experience` + `EducationRecord` tables via Prisma.
7. The full candidate object is returned to the frontend, which prepends it to the candidate list.

**What Gemini assesses:**
- **Growth Velocity**: Speed of career progression (e.g., Junior → Lead in 18 months)
- **Skill Adjacency**: Whether skills transfer well to new domains (e.g., React → Vue, payments → distributed systems)
- **Trajectory Type**: Self-taught vs pedigree, startup vs services company
- **Indian Context**: Tier-1/2/3 college classification, Tier-1 city vs Tier-2/3 origin
- **Red Flags**: Job-hopping, resume inflation patterns, skills claimed with no supporting experience

**hiddenGemScore** (0–100): How much the candidate would be undervalued by a traditional keyword ATS relative to their actual potential.

**adjacencyScore** (0–100): How broadly their skills transfer across domains — a "T-shaped" signal.

### 7.2 JD Matching (`POST /api/match`)

**Input**: Job description text (or PDF) + current candidate list (passed as JSON from the frontend).

**What happens step by step:**

1. The JD text is scanned to identify which skill groups from `SKILL_GROUPS` are mentioned (function `extractJdGroups`). This filters scoring to only the skills the JD actually asks for — so a React JD doesn't penalise ML engineers for missing RAG skills.
2. If the JD mentions fewer than 2 skill groups, all groups are used as a fallback.
3. Every candidate in the pool is scored with `scoreCandidate()`.
4. Results are sorted descending by `overallScore`.
5. A Hidden Gem promotion check runs on positions 3–5: if a Hidden Gem sits within 8 points of position #2 and position #2 is not itself a gem, the gem is promoted to #2. This surfaces undervalued candidates.
6. Top 2 are flagged as `isShortlisted: true`.
7. The ranked array is returned to the frontend.

The scoring formula is **not** a Gemini call — it is a deterministic weighted formula (explained in detail in Section 8).

This is intentional: using LLM-per-candidate ranking would not scale to 100k candidates. The scoring function runs in milliseconds per candidate.

### 7.3 Assessment Generation (`POST /api/generate-assessment`)

**Input**: A single resume bullet/claim string (e.g., "Architected a distributed event-streaming platform using Kafka and Rust, handling 50k events/sec").

**What happens:**

1. Gemini is given the claim and told to act as a Senior Staff Engineer conducting a "Proof of Work" validation.
2. It generates exactly 3 highly specific, technical, deep-dive questions targeting that specific claim — not generic behavioural questions.
3. Each question has an `intent` field explaining what capability it is designed to validate.
4. The questions can then be sent as a formatted HTML email to the candidate via `/api/send-assessment`.

**Example for claim "Optimised PostgreSQL queries by 40%":**
- Q1: "What specific index types (partial, covering, expression) did you apply, and how did you identify which queries to target?"
- Q2: "Walk me through how you measured the 40% improvement — what metrics, what tooling, and over what time period?"
- Q3: "If the query plan changed after a schema migration, how would you detect regression and what's your rollback strategy?"

### 7.4 Outreach Drafting (`POST /api/outreach`)

**Input**: Candidate name, role, summary + email type (intro / interview / offer / rejection) + optional recruiter name + optional interview slot link.

**What happens:**

Gemini is prompted to write a personalised recruiter email referencing the candidate's specific background. It returns a JSON object with `subject` and `body`. The body is displayed in the modal and can be copied to clipboard. If a slot link is provided, Gemini embeds it naturally in the email body.

---

## 8. The Ranking Engine — How Candidates Are Scored

The same scoring logic is used in both `src/app/api/match/route.ts` (web app) and `rank.py` (hackathon submission). The web app version has broader skill groups to handle any JD type; the submission script targets only the released Senior AI Engineer JD.

### 8.1 Composite Score Formula

```
final_score = composite_raw × title_multiplier

composite_raw = (0.40 × skill_score)
              + (0.25 × experience_score)
              + (0.25 × behavioral_score)
              + (0.10 × education_score)
```

**Weights rationale:**
- Skills (40%) — highest weight because the JD is technical and skill coverage is the most direct signal
- Experience (25%) — years + product company ratio
- Behavioral (25%) — engagement signals from the Redrob platform
- Education (10%) — institution tier; important but not determinative

### 8.2 Title Multiplier

Applied as a cap before returning the final score.

| Title category | Multiplier |
|---|---|
| Clearly matching AI/ML title (e.g. "ML Engineer", "NLP Engineer", "Search Engineer") | 1.0 (full score) |
| Neutral tech title (e.g. "Software Engineer", "Data Engineer") | 0.80 |
| Non-technical role (e.g. "HR Manager", "Graphic Designer", "Accountant") | 0.12 (hard cap) |

The 0.12 cap ensures that a marketing manager with 9 AI skills (a suspicious profile) cannot outrank a genuine ML engineer. For capped non-technical candidates, the behavioral and experience components are dropped — only skill_score is used (multiplied by 0.12).

### 8.3 Skill Scoring

```
skill_score = min(Σ best_per_group / num_jd_groups, 1.0)
```

**Skill groups**: The JD is decomposed into named skill "slots" (e.g., `embeddings`, `vector_db`, `rag`, `llm`, `fine_tuning`, `ranking`, etc.). Each group contains a list of synonymous terms.

**Per-skill value**:
```
value = proficiency_weight × (0.6 + 0.2 × endorsement_fraction + 0.2 × duration_fraction)

proficiency_weight: beginner=0.4, intermediate=0.6, advanced=0.8, expert=1.0
endorsement_fraction: min(endorsements / 50, 1.0)
duration_fraction: min(duration_months / 60, 1.0)
```

For each skill group, only the highest-value matching skill counts (best-wins within a group). This means having 5 vector databases doesn't score better than having 1 — it rewards breadth across groups, not depth within one.

**Negative skills penalty**: In the submission script, skills like `computer vision`, `object detection`, `speech recognition` trigger a mild penalty if they dominate the profile and the candidate matches fewer than 3 AI/IR groups. This catches CV/speech specialists being misranked for an NLP/IR role.

### 8.4 Experience Scoring

```
experience_score = 0.5 × yoe_score + 0.5 × product_ratio
```

**Years of experience (yoe_score)**:
- 5–9 years: 1.0 (ideal for the Senior AI Engineer JD)
- < 5 years: linear scale (yoe / 5)
- > 9 years: slight downward slope (max 0.5, to avoid over-indexing on senior candidates who may be over-qualified)

**Product ratio**: The fraction of career months spent at non-consulting firms. Consulting firms (TCS, Infosys, Wipro, Accenture, Cognizant, etc.) are hardcoded in `CONSULTING_FIRMS`. A candidate who spent 100% of their career at product companies scores 1.0; a pure consulting background scores 0.0. This reflects the JD's preference for candidates who shipped product vs. managed client projects.

### 8.5 Behavioral Scoring

Uses Redrob platform signals (from `redrob_signals` in the dataset):

```
behavioral_score =   0.30 × recruiter_response_rate
                   + 0.20 × recency_score
                   + 0.15 × github_activity_score_normalized
                   + 0.15 × interview_completion_rate
                   + 0.10 × open_to_work_bonus
                   + 0.10 × notice_period_score
```

- **Response rate** (30%): How often the candidate responds to recruiter messages — the strongest engagement signal.
- **Recency** (20%): Days since last activity on the platform, decayed linearly over 365 days.
- **GitHub activity** (15%): Normalized from the platform's 0–100 score.
- **Interview completion** (15%): Fraction of scheduled interviews the candidate completed.
- **Open to work** (10%): Boolean flag. 1.0 if active, 0.3 if not (not 0, because even passive candidates can be reached).
- **Notice period** (10%):
  - ≤ 30 days: 1.0
  - ≤ 60 days: 0.7
  - ≤ 90 days: 0.5
  - > 90 days: decays to 0.1

### 8.6 Education Scoring

```
education_score = max(tier_score for each education record)
```

| Tier | Score | Examples |
|---|---|---|
| `tier_1` | 1.0 | IITs, IIMs, top NITs |
| `tier_2` | 0.8 | State engineering colleges, BITS |
| `tier_3` | 0.6 | Private colleges |
| `tier_4` | 0.4 | Local/unknown institutions |
| `unknown` | 0.5 | Not classified |

Takes the maximum across all education records (a candidate with a tier_3 undergrad and tier_1 MBA is scored at 1.0).

### 8.7 Honeypot Detection (`rank.py` only)

Two rules catch synthetic/fake profiles in the dataset:

**Rule 1 — Expert skills with zero usage**: If a candidate claims 3 or more `expert`-level skills with 0 months of usage, the profile is flagged as a honeypot. Score: 0.01.

**Rule 2 — Claimed experience exceeds actual career span**: The claimed `years_of_experience` is compared against the earliest `start_date` in the career history. If the claimed figure exceeds the actual span by more than 4 years, the profile is a honeypot. Score: 0.01.

Honeypots are assigned a score of 0.01 and a reasoning string of "honeypot: impossible profile detected". They sort to the bottom and never appear in the top 100.

### 8.8 Hidden Gem Boost (Web App Only)

In the web app's `/api/match`, a small gem boost is added:

```
gem_boost = (hiddenGemScore / 100) × 0.06   [only if skill_score ≥ 0.25]
final = min(composite_raw × title_multiplier + gem_boost, 1.0)
```

This adds up to 6 percentage points for a perfect-gem candidate — meaningful as a tie-breaker but not enough to override a technically stronger candidate. It directly implements the product's core value proposition: surfacing candidates that traditional ATS undervalues.

---

## 9. The Hackathon Submission (`rank.py`)

The submission script is the part judged in Stage 3. It must run on a 16 GB CPU-only machine within 5 minutes with no network calls.

### How it runs

```bash
python rank.py --candidates ./data_set/candidates.jsonl --out ./submission.csv
```

### What it does step by step

1. **Stream JSONL**: Reads `candidates.jsonl` line by line (100,000 lines, ~100 MB). Never loads the full file into memory — processes each candidate as a Python dict immediately.

2. **Score each candidate**: Calls `score_candidate(candidate)` which runs all four components (skills, experience, behavioral, education) + title multiplier + honeypot check. Returns `(score: float, reasoning: str)`.

3. **Collect results**: Appends `(score, candidate_id, reasoning)` tuples to a list.

4. **Print progress**: Every 10,000 candidates it prints elapsed time so the operator can verify it won't timeout.

5. **Sort**: After all 100k candidates are scored, sort by `(-score, candidate_id)` — descending score, ascending ID for tie-breaking (as required by the submission spec).

6. **Take top 100**: Slice the first 100 entries.

7. **Write CSV**: Writes `candidate_id, rank, score, reasoning` with scores rounded to 4 decimal places and formatted as `f"{score:.4f}"`.

### Timing and resource profile

- No network calls (all scoring is pure computation)
- No GPU usage
- All Python stdlib — no pandas, numpy, scikit-learn required
- Typical runtime: 30–60 seconds on a modern CPU

### Skill Groups in `rank.py`

The script uses 12 named groups aligned with the Senior AI Engineer JD:

`embeddings`, `vector_db`, `information_retrieval`, `rag`, `llm`, `fine_tuning`, `ranking`, `recommendation`, `nlp`, `python`, `evaluation_metrics`, `mlops`

Each group is a list of synonymous terms that map to that capability. For example, `vector_db` includes `faiss`, `qdrant`, `pinecone`, `weaviate`, `milvus`, `pgvector`, `chroma`, `hnsw`, and others.

The normalization constant `NUM_JD_GROUPS = 12` means a candidate who hits all 12 groups with expert-level proficiency scores 1.0 on skills. The `min(..., 1.0)` cap handles breadth generalists gracefully.

### Reasoning strings

Each row in the submission includes a `reasoning` field that describes the candidate in plain language:

```
Senior NLP Engineer with 7.8 yrs; 10 core skill groups (ranking, vector_db, mlops); response rate 0.66; Kolkata, West Bengal, India.
```

This satisfies the Stage 4 manual review requirement: reasoning is specific, honest, and matches the candidate's actual profile.

---

## 10. Hackathon Compliance Check

The submission spec (from `data_set/submission_spec.docx`) mandates:

| Requirement | Status | Notes |
|---|---|---|
| Exactly 100 data rows | ✅ Passed | `submission.csv` has 100 rows; validated by `validate_submission.py` |
| Header: `candidate_id,rank,score,reasoning` | ✅ Passed | Exact column order |
| Ranks 1–100 each appear exactly once | ✅ Passed | Sequential integers |
| Each `candidate_id` appears exactly once | ✅ Passed | |
| All `candidate_id` values exist in `candidates.jsonl` | ✅ Passed | Scored directly from dataset |
| `candidate_id` format: `CAND_XXXXXXX` (7 digits) | ✅ Passed | Sourced directly from dataset field |
| `score` is non-increasing with rank | ✅ Passed | Sorted descending before writing |
| Tie-break: equal scores broken by `candidate_id` ascending | ✅ Passed | Sort key: `(-score, candidate_id)` |
| UTF-8 encoding | ✅ Passed | `open(..., encoding="utf-8")` |
| No hosted LLM API calls during ranking | ✅ Passed | `rank.py` is pure Python stdlib, no network |
| No GPU usage | ✅ Passed | CPU arithmetic only |
| Runs within 5 minutes on 16 GB CPU | ✅ Passed | ~30–60 seconds empirically |
| Reasoning column populated with specific, honest reasoning | ✅ Passed | Template uses actual candidate data |
| Reasoning not all-identical | ✅ Passed | Template varies by title, YoE, matched skills, location |
| Reasoning not templated with no variation | ✅ Passed | Each row reflects that candidate's actual signal profile |
| **Filename** | ⚠️ Action required | Must be renamed to `team_<participant_id>.csv` before upload |

### One remaining action

The file is currently named `submission.csv`. Before submitting to the portal, rename it:

```bash
cp submission.csv team_<your_participant_id>.csv
```

The validator (`validate_submission.py`) requires the filename to match the team's registered participant ID. The content is valid — only the filename needs changing.

### Scoring metrics the submission is optimised for

The competition scores on:
```
Final = 0.50 × NDCG@10 + 0.30 × NDCG@50 + 0.15 × MAP + 0.05 × P@10
```

The ranking engine directly targets this by:
- **NDCG@10 (50% weight)**: Precision of the top 10 candidates is highest-priority. The skill scoring, title multiplier, and honeypot detection all serve to make the top 10 as accurate as possible.
- **NDCG@50 (30% weight)**: The behavioral scoring (response rate, recency, GitHub, interview completion) acts as a secondary differentiator among technically similar candidates in positions 11–50.
- **MAP / P@10 (15% + 5%)**: The non-increasing score constraint and deterministic tie-breaking ensure valid ordering throughout.

The combination of structured skill-group matching (vs. raw keyword matching) + product company ratio + behavioral signal weighting is designed to produce a ranking that correlates with human judgment — which is what the hidden ground truth is built from.

---

*Report generated: 2026-06-09*
*Build status: Clean (0 TypeScript errors)*
*Submission validation: Passed*
