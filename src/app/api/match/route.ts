import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── JD Skill Groups (same algorithm as rank.py) ─────────────────────────────

const SKILL_GROUPS: Record<string, string[]> = {
  embeddings: ["embedding", "embeddings", "sentence transformer", "sentence-transformer", "bge", "text embedding", "dense retrieval", "bi-encoder", "semantic embedding"],
  vector_db: ["faiss", "qdrant", "pinecone", "weaviate", "milvus", "opensearch", "elasticsearch", "vector search", "vector database", "vector store", "hnsw", "pgvector", "chroma"],
  information_retrieval: ["information retrieval", "bm25", "tfidf", "tf-idf", "sparse retrieval", "hybrid search", "hybrid retrieval", "semantic search", "neural search", "lucene"],
  rag: ["rag", "retrieval augmented", "retrieval-augmented", "llamaindex", "llama index", "document retrieval"],
  llm: ["llm", "large language model", "gpt", "bert", "transformer", "language model", "huggingface", "hugging face", "llama", "mistral"],
  fine_tuning: ["fine-tuning", "fine tuning", "finetuning", "lora", "qlora", "peft", "rlhf", "instruction tuning", "sft"],
  ranking: ["ranking", "learning to rank", "reranking", "re-ranking", "ranker", "pointwise", "pairwise", "listwise"],
  recommendation: ["recommendation", "recommender", "collaborative filtering", "matrix factorization", "content-based filtering"],
  nlp: ["nlp", "natural language processing", "text classification", "named entity recognition", "ner", "sentiment analysis", "question answering", "nlu"],
  python: ["python"],
  evaluation_metrics: ["ndcg", "mrr", "a/b testing", "a/b test", "offline evaluation", "evaluation framework", "online experiment"],
  mlops: ["mlflow", "weights & biases", "wandb", "bentoml", "ray serve", "model serving", "triton", "ml pipeline"],
};

const NUM_GROUPS = Object.keys(SKILL_GROUPS).length;

const NEGATIVE_TERMS = ["computer vision", "opencv", "image classification", "object detection", "cnn", "convolutional neural", "gan", "diffusion model", "speech recognition", "asr", "tts", "robotics"];

const CONSULTING_FIRMS = new Set(["tcs", "tata consultancy", "infosys", "wipro", "accenture", "cognizant", "capgemini", "hcl technologies", "hcltech", "tech mahindra", "ltimindtree", "lti mindtree", "mphasis", "hexaware", "mindtree", "persistent systems"]);

const NON_TECH_TITLES = new Set(["hr manager", "human resources", "content writer", "graphic designer", "marketing manager", "marketing executive", "sales executive", "sales manager", "accountant", "operations manager", "civil engineer", "mechanical engineer", "electrical engineer", "business analyst", "customer support", "product manager", "ui designer", "ux designer"]);

const GOOD_TITLES = ["machine learning", "ml engineer", "ai engineer", "nlp engineer", "data scientist", "applied scientist", "research engineer", "search engineer", "ranking engineer", "retrieval", "recommendation", "deep learning", "llm"];

const PROFICIENCY_WEIGHT: Record<string, number> = { beginner: 0.4, intermediate: 0.6, advanced: 0.8, expert: 1.0 };
const TIER_SCORE: Record<string, number> = { tier_1: 1.0, tier_2: 0.8, tier_3: 0.6, tier_4: 0.4, unknown: 0.5 };

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function scoreSkills(skills: any[]): { score: number; matched: string[] } {
  const best: Record<string, number> = {};
  let negCount = 0;
  for (const skill of skills) {
    const name = (skill.name || "").toLowerCase();
    const prof = PROFICIENCY_WEIGHT[skill.proficiency] ?? 0.6;
    const endorsements = Math.min((skill.endorsements || 0) / 50, 1);
    const duration = Math.min((skill.duration_months || 0) / 60, 1);
    const value = prof * (0.6 + 0.2 * endorsements + 0.2 * duration);
    if (NEGATIVE_TERMS.some(t => name.includes(t))) negCount++;
    for (const [group, terms] of Object.entries(SKILL_GROUPS)) {
      if (terms.some(t => name.includes(t) || t.includes(name))) {
        if (value > (best[group] ?? 0)) best[group] = value;
      }
    }
  }
  let score = Math.min(Object.values(best).reduce((a, b) => a + b, 0) / NUM_GROUPS, 1);
  if (negCount >= 4 && Object.keys(best).length < 3) score *= 0.4;
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
  if (!signals) return 0.4;
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

function scoreCandidate(c: any): { overallScore: number; technicalFit: number; trajectoryFit: number; culturalFit: number; reasoning: string } {
  const title = c.role ?? "Unknown";
  const tMult = titleMultiplier(title);
  const yoe = c.yearsOfExperience ?? 0;

  const { score: skillScore, matched } = scoreSkills(c.skills ?? []);
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
  const final = Math.round(raw * tMult * 100);

  const reasoning = `${title} with ${yoe.toFixed(1)} yrs; ${matched.length} core skill groups (${top3}); response rate ${resp.toFixed(2)}.`;

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

    const rankings = candidates
      .map(c => ({ candidateId: c.id, ...scoreCandidate(c) }))
      .sort((a, b) => b.overallScore - a.overallScore);

    // Mark top 2 as shortlisted
    rankings.forEach((r, i) => (r as any).isShortlisted = i < 2);

    return NextResponse.json({ rankings });

  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json({ error: "Failed to match candidates" }, { status: 500 });
  }
}
