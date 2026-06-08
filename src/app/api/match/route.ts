import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── JD Skill Groups (same algorithm as rank.py) ─────────────────────────────

const SKILL_GROUPS: Record<string, string[]> = {
  // ── AI / ML ──────────────────────────────────────────────────────────────
  embeddings: ["embedding", "embeddings", "sentence transformer", "sentence-transformer", "bge", "text embedding", "dense retrieval", "bi-encoder", "semantic embedding"],
  vector_db: ["faiss", "qdrant", "pinecone", "weaviate", "milvus", "opensearch", "elasticsearch", "vector search", "vector database", "vector store", "hnsw", "pgvector", "chroma"],
  information_retrieval: ["information retrieval", "bm25", "tfidf", "tf-idf", "sparse retrieval", "hybrid search", "hybrid retrieval", "semantic search", "neural search", "lucene"],
  rag: ["rag", "retrieval augmented", "retrieval-augmented", "llamaindex", "llama index", "document retrieval"],
  llm: ["llm", "large language model", "gpt", "bert", "transformer", "language model", "huggingface", "hugging face", "llama", "mistral", "gemini", "anthropic", "openai"],
  fine_tuning: ["fine-tuning", "fine tuning", "finetuning", "lora", "qlora", "peft", "rlhf", "instruction tuning", "sft", "dpo"],
  ranking: ["ranking", "learning to rank", "reranking", "re-ranking", "ranker", "pointwise", "pairwise", "listwise"],
  recommendation: ["recommendation", "recommender", "collaborative filtering", "matrix factorization", "content-based filtering", "two-tower"],
  nlp: ["nlp", "natural language processing", "text classification", "named entity recognition", "ner", "sentiment analysis", "question answering", "nlu", "text mining"],
  evaluation_metrics: ["ndcg", "mrr", "a/b testing", "a/b test", "offline evaluation", "evaluation framework", "online experiment", "statistical significance"],
  mlops: ["mlflow", "weights & biases", "wandb", "bentoml", "ray serve", "model serving", "triton", "ml pipeline", "kubeflow", "feature store"],
  // ── Web / Full-Stack ─────────────────────────────────────────────────────
  frontend: ["react", "vue", "angular", "svelte", "next.js", "nextjs", "nuxt", "gatsby", "tailwind", "css", "html", "typescript", "javascript", "redux", "webpack", "vite", "jquery", "web components"],
  backend: ["node.js", "nodejs", "express", "fastapi", "django", "flask", "spring boot", "spring", "golang", "go lang", "rust", "java", "scala", "c#", ".net", "grpc", "rest api", "graphql", "laravel", "rails", "ruby on rails", "php", "asp.net"],
  database: ["postgresql", "mysql", "mongodb", "redis", "sqlite", "dynamodb", "cassandra", "firebase", "supabase", "sql", "nosql", "prisma orm", "sequelize", "typeorm", "data modeling"],
  // ── Cloud & DevOps ───────────────────────────────────────────────────────
  cloud_devops: ["aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "github actions", "jenkins", "helm", "ansible", "serverless", "cloud functions", "lambda", "ecs", "cloud run"],
  system_design: ["distributed systems", "kafka", "message queue", "rabbitmq", "event-driven", "microservices", "api design", "system design", "load balancing", "caching", "pub/sub", "grpc"],
  // ── Mobile ───────────────────────────────────────────────────────────────
  mobile: ["react native", "flutter", "swift", "kotlin", "android", "ios", "expo", "jetpack compose", "swiftui", "xcode", "mobile development"],
  // ── General Engineering ──────────────────────────────────────────────────
  python: ["python"],
  testing_quality: ["unit testing", "integration testing", "jest", "pytest", "cypress", "selenium", "playwright", "tdd", "bdd", "e2e testing", "test automation"],
};

// Normalisation constant: kept at 12 (≈ strong-specialist depth) so adding
// more domain groups doesn't deflate AI/ML or web candidates' scores — the
// min(..., 1) cap handles generalists who hit many groups.
const NUM_GROUPS = 12;

const CONSULTING_FIRMS = new Set(["tcs", "tata consultancy", "infosys", "wipro", "accenture", "cognizant", "capgemini", "hcl technologies", "hcltech", "tech mahindra", "ltimindtree", "lti mindtree", "mphasis", "hexaware", "mindtree", "persistent systems"]);

const NON_TECH_TITLES = new Set(["hr manager", "human resources", "content writer", "graphic designer", "marketing manager", "marketing executive", "sales executive", "sales manager", "accountant", "operations manager", "civil engineer", "mechanical engineer", "electrical engineer", "chemical engineer", "customer support", "finance manager"]);

const GOOD_TITLES = [
  // AI / ML
  "machine learning", "ml engineer", "ai engineer", "nlp engineer", "data scientist",
  "applied scientist", "research engineer", "search engineer", "ranking engineer",
  "retrieval", "recommendation", "deep learning", "llm", "ai researcher",
  // Software engineering
  "software engineer", "software developer", "full stack", "fullstack",
  "frontend engineer", "frontend developer", "backend engineer", "backend developer",
  "web developer", "web engineer",
  // Infra / Cloud / Mobile
  "devops", "site reliability", "sre", "platform engineer", "cloud engineer",
  "infrastructure engineer", "mobile engineer", "android developer", "ios developer",
  "flutter developer", "react native",
  // Data
  "data engineer", "analytics engineer", "data platform",
];

const PROFICIENCY_WEIGHT: Record<string, number> = { beginner: 0.4, intermediate: 0.6, advanced: 0.8, expert: 1.0 };
const TIER_SCORE: Record<string, number> = { tier_1: 1.0, tier_2: 0.8, tier_3: 0.6, tier_4: 0.4, unknown: 0.5 };

// ─── JD parsing ───────────────────────────────────────────────────────────────

/**
 * Scan the JD text and return the subset of SKILL_GROUPS that are mentioned.
 * Falls back to all groups when the JD is empty or matches nothing (so the
 * ranker still works when no JD text is supplied).
 */
function extractJdGroups(jd: string): Record<string, string[]> {
  if (!jd.trim()) return SKILL_GROUPS;
  const jdLower = jd.toLowerCase();
  const active: Record<string, string[]> = {};
  for (const [group, terms] of Object.entries(SKILL_GROUPS)) {
    if (terms.some(t => jdLower.includes(t))) {
      active[group] = terms;
    }
  }
  return Object.keys(active).length >= 2 ? active : SKILL_GROUPS;
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function scoreSkills(skills: any[], activeGroups: Record<string, string[]>): { score: number; matched: string[] } {
  const best: Record<string, number> = {};
  const norm = Math.max(Object.keys(activeGroups).length, NUM_GROUPS);
  for (const skill of skills) {
    const name = (skill.name || "").toLowerCase();
    const prof = PROFICIENCY_WEIGHT[skill.proficiency] ?? 0.6;
    const endorsements = Math.min((skill.endorsements || 0) / 50, 1);
    const duration = Math.min((skill.duration_months || 0) / 60, 1);
    const value = prof * (0.6 + 0.2 * endorsements + 0.2 * duration);
    for (const [group, terms] of Object.entries(activeGroups)) {
      // Only allow reverse containment for longer terms to avoid false matches
      // (e.g. "go" matching inside "golang", "ai" matching inside "faiss").
      if (terms.some(t => name.includes(t) || (t.length >= 5 && t.includes(name)))) {
        if (value > (best[group] ?? 0)) best[group] = value;
      }
    }
  }
  const score = Math.min(Object.values(best).reduce((a, b) => a + b, 0) / norm, 1);
  return { score, matched: Object.keys(best) };
}

function scoreExperience(c: any): number {
  const yoe = c.yearsOfExperience ?? 0;
  const yoeScore = yoe >= 5 && yoe <= 9 ? 1.0 : yoe < 5 ? yoe / 5 : Math.max(0.5, 1 - (yoe - 9) * 0.05);
  let totalMonths = 0, productMonths = 0;
  for (const exp of c.experiences ?? []) {
    const months = exp.durationMonths ?? 0;
    totalMonths += months;
    if (![...CONSULTING_FIRMS].some(f => (exp.company || "").toLowerCase().includes(f))) productMonths += months;
  }
  const productRatio = totalMonths > 0 ? productMonths / totalMonths : 0.5;
  return 0.5 * yoeScore + 0.5 * productRatio;
}

function scoreBehavioral(signals: any): number {
  if (!signals) return 0.5;
  const responseRate = signals.recruiter_response_rate ?? 0;
  const lastActive = signals.last_active_date ?? "";
  let recency = 0.3;
  if (lastActive) {
    const daysAgo = (Date.now() - new Date(lastActive).getTime()) / 86400000;
    recency = Math.max(0, 1 - daysAgo / 365);
  }
  const github = Math.max(signals.github_activity_score ?? -1, 0) / 100;
  const interview = signals.interview_completion_rate ?? 0.5;
  const openToWork = signals.open_to_work_flag ? 1.0 : 0.3;
  const notice = signals.notice_period_days ?? 90;
  const noticeScore = notice <= 30 ? 1.0 : notice <= 60 ? 0.7 : notice <= 90 ? 0.5 : Math.max(0.1, 1 - notice / 180);
  return Math.min(0.30 * responseRate + 0.20 * recency + 0.15 * github + 0.15 * interview + 0.10 * openToWork + 0.10 * noticeScore, 1);
}

function scoreEducation(education: any[]): number {
  if (!education?.length) return 0.5;
  return Math.max(...education.map(e => TIER_SCORE[e.tier ?? "unknown"] ?? 0.5));
}

function titleMultiplier(title: string): number {
  const t = title.toLowerCase();
  if ([...NON_TECH_TITLES].some(bad => t.includes(bad))) return 0.12;
  if (GOOD_TITLES.some(good => t.includes(good))) return 1.0;
  return 0.80;
}

function scoreCandidate(c: any, activeGroups: Record<string, string[]>): { overallScore: number; technicalFit: number; trajectoryFit: number; culturalFit: number; reasoning: string } {
  const title = c.role ?? "Unknown";
  const tMult = titleMultiplier(title);
  const yoe = c.yearsOfExperience ?? 0;

  const { score: skillScore, matched } = scoreSkills(c.skills ?? [], activeGroups);
  const signals = c.redrobSignals ? (typeof c.redrobSignals === "string" ? JSON.parse(c.redrobSignals) : c.redrobSignals) : null;
  const resp = signals?.recruiter_response_rate ?? 0;
  const top3 = matched.slice(0, 3).join(", ") || "none";

  if (tMult <= 0.12) {
    const score = Math.round(tMult * skillScore * 100);
    return { overallScore: score, technicalFit: Math.round(skillScore * 100), trajectoryFit: 20, culturalFit: 20, reasoning: `${title} — capped for non-technical role.` };
  }

  const expScore = scoreExperience(c);
  const behavioral = scoreBehavioral(signals);
  const eduScore = scoreEducation(c.education ?? []);
  const raw = 0.40 * skillScore + 0.25 * expScore + 0.25 * behavioral + 0.10 * eduScore;

  // Hidden gem boost: kicks in when baseline technical fit exists (skillScore ≥ 0.25).
  // Adds up to +6 points for a score-100 gem — meaningful as a tie-breaker without
  // overriding the primary signal for clearly stronger candidates.
  const gemScore = Math.min((c.hiddenGemScore ?? 0) / 100, 1);
  const gemBoost = skillScore >= 0.25 ? gemScore * 0.06 : 0;
  const isGem = (c.hiddenGemScore ?? 0) > 80;

  const final = Math.round(Math.min(raw * tMult + gemBoost, 1) * 100);

  const gemNote = isGem && skillScore >= 0.25 ? ` Hidden gem (score ${c.hiddenGemScore}).` : "";
  const reasoning = `${title} with ${yoe.toFixed(1)} yrs; ${matched.length} core skill groups (${top3}); response rate ${resp.toFixed(2)}.${gemNote}`;

  return {
    overallScore: Math.min(final, 100),
    technicalFit: Math.min(Math.round(skillScore * 100), 100),
    trajectoryFit: Math.min(Math.round(expScore * 100), 100),
    culturalFit: Math.min(Math.round(behavioral * 100), 100),
    reasoning,
  };
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const textInput = formData.get("text") as string | null;
    const candidatesStr = formData.get("candidates") as string | null;

    if (!textInput?.trim() && !candidatesStr) {
      return NextResponse.json({ error: "Missing job description" }, { status: 400 });
    }

    // Use provided candidate list or fall back to all DB candidates
    let candidates: any[];
    if (candidatesStr) {
      try {
        candidates = JSON.parse(candidatesStr);
      } catch {
        return NextResponse.json({ error: "Invalid candidates JSON" }, { status: 400 });
      }
    } else {
      const dbCandidates = await db.candidate.findMany({
        include: { experiences: true, education: true }
      });
      candidates = dbCandidates.map(c => ({
        ...c,
        skills: (() => { try { return JSON.parse(c.skills); } catch { return []; } })(),
        redrobSignals: c.redrobSignals ? JSON.parse(c.redrobSignals) : null,
      }));
    }

    if (!candidates.length) {
      return NextResponse.json({ error: "No candidates to match" }, { status: 400 });
    }

    const activeGroups = extractJdGroups(textInput ?? "");

    const candidateMap = new Map(candidates.map(c => [c.id, c]));

    const rankings = candidates
      .map(c => ({ candidateId: c.id, ...scoreCandidate(c, activeGroups) }))
      .sort((a, b) => b.overallScore - a.overallScore);

    // Shortlist top 2, but if a hidden gem sits just outside (positions 3–5)
    // within 8 points of #2, promote it over the non-gem at #2.
    const shortlistCutoff = 2;
    const runner = rankings[1];
    const runnerIsGem = (candidateMap.get(runner?.candidateId)?.hiddenGemScore ?? 0) > 80;
    if (!runnerIsGem) {
      const gemIdx = rankings.slice(2, 5).findIndex(r => {
        const gem = candidateMap.get(r.candidateId)?.hiddenGemScore ?? 0;
        return gem > 80 && runner.overallScore - r.overallScore <= 8;
      });
      if (gemIdx !== -1) {
        const actualIdx = gemIdx + 2;
        [rankings[1], rankings[actualIdx]] = [rankings[actualIdx], rankings[1]];
      }
    }

    rankings.forEach((r, i) => (r as any).isShortlisted = i < shortlistCutoff);

    return NextResponse.json({ rankings });

  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json({ error: "Failed to match candidates" }, { status: 500 });
  }
}
