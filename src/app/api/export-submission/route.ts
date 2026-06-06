import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Same scoring algorithm as rank.py and /api/match — keep in sync.

const SKILL_GROUPS: Record<string, string[]> = {
  embeddings: ["embedding", "embeddings", "sentence transformer", "sentence-transformer", "bge", "text embedding", "dense retrieval", "bi-encoder"],
  vector_db: ["faiss", "qdrant", "pinecone", "weaviate", "milvus", "opensearch", "elasticsearch", "vector search", "vector database", "vector store", "hnsw", "pgvector", "chroma"],
  information_retrieval: ["information retrieval", "bm25", "tfidf", "tf-idf", "sparse retrieval", "hybrid search", "hybrid retrieval", "semantic search", "neural search"],
  rag: ["rag", "retrieval augmented", "retrieval-augmented", "llamaindex", "llama index", "document retrieval"],
  llm: ["llm", "large language model", "gpt", "bert", "transformer", "language model", "huggingface", "llama", "mistral"],
  fine_tuning: ["fine-tuning", "fine tuning", "finetuning", "lora", "qlora", "peft", "rlhf", "instruction tuning", "sft"],
  ranking: ["ranking", "learning to rank", "reranking", "re-ranking", "ranker", "pointwise", "pairwise", "listwise"],
  recommendation: ["recommendation", "recommender", "collaborative filtering", "matrix factorization"],
  nlp: ["nlp", "natural language processing", "text classification", "named entity recognition", "ner", "sentiment analysis", "question answering"],
  python: ["python"],
  evaluation_metrics: ["ndcg", "mrr", "a/b testing", "offline evaluation", "evaluation framework"],
  mlops: ["mlflow", "weights & biases", "wandb", "bentoml", "model serving", "ml pipeline"],
};
const NUM_GROUPS = Object.keys(SKILL_GROUPS).length;
const NEGATIVE_TERMS = ["computer vision", "opencv", "image classification", "object detection", "cnn", "convolutional neural", "gan", "diffusion model", "speech recognition", "asr", "tts", "robotics"];
const CONSULTING_FIRMS = ["tcs", "tata consultancy", "infosys", "wipro", "accenture", "cognizant", "capgemini", "hcl technologies", "hcltech", "tech mahindra", "ltimindtree", "mphasis", "hexaware", "mindtree", "persistent systems"];
const NON_TECH_TITLES = ["hr manager", "human resources", "content writer", "graphic designer", "marketing manager", "sales executive", "sales manager", "accountant", "operations manager", "civil engineer", "mechanical engineer", "business analyst", "customer support", "product manager"];
const GOOD_TITLES = ["machine learning", "ml engineer", "ai engineer", "nlp engineer", "data scientist", "applied scientist", "research engineer", "search engineer", "ranking engineer", "retrieval", "recommendation", "deep learning", "llm"];
const PROFICIENCY_WEIGHT: Record<string, number> = { beginner: 0.4, intermediate: 0.6, advanced: 0.8, expert: 1.0 };
const TIER_SCORE: Record<string, number> = { tier_1: 1.0, tier_2: 0.8, tier_3: 0.6, tier_4: 0.4, unknown: 0.5 };

function scoreSkills(skills: any[]) {
  const best: Record<string, number> = {};
  let negCount = 0;
  for (const skill of skills) {
    const name = (skill.name || "").toLowerCase();
    const prof = PROFICIENCY_WEIGHT[skill.proficiency] ?? 0.6;
    const end = Math.min((skill.endorsements || 0) / 50, 1);
    const dur = Math.min((skill.duration_months || 0) / 60, 1);
    const val = prof * (0.6 + 0.2 * end + 0.2 * dur);
    if (NEGATIVE_TERMS.some(t => name.includes(t))) negCount++;
    for (const [group, terms] of Object.entries(SKILL_GROUPS)) {
      if (terms.some(t => name.includes(t) || t.includes(name))) {
        if (val > (best[group] ?? 0)) best[group] = val;
      }
    }
  }
  let score = Math.min(Object.values(best).reduce((a, b) => a + b, 0) / NUM_GROUPS, 1);
  if (negCount >= 4 && Object.keys(best).length < 3) score *= 0.4;
  return { score, matched: Object.keys(best) };
}

function scoreExperience(c: any) {
  const yoe = c.yearsOfExperience ?? 0;
  const yoeScore = yoe >= 5 && yoe <= 9 ? 1.0 : yoe < 5 ? yoe / 5 : Math.max(0.5, 1 - (yoe - 9) * 0.05);
  let total = 0, product = 0;
  for (const exp of c.experiences ?? []) {
    const m = exp.durationMonths ?? 0;
    total += m;
    if (!CONSULTING_FIRMS.some(f => (exp.company || "").toLowerCase().includes(f))) product += m;
  }
  return 0.5 * yoeScore + 0.5 * (total > 0 ? product / total : 0.5);
}

function scoreBehavioral(signals: any) {
  if (!signals) return 0.4;
  const recency = signals.last_active_date
    ? Math.max(0, 1 - (Date.now() - new Date(signals.last_active_date).getTime()) / (365 * 86400000))
    : 0.3;
  const github = Math.max(signals.github_activity_score ?? -1, 0) / 100;
  const notice = signals.notice_period_days ?? 90;
  const noticeScore = notice <= 30 ? 1.0 : notice <= 60 ? 0.7 : notice <= 90 ? 0.5 : Math.max(0.1, 1 - notice / 180);
  return Math.min(
    0.30 * (signals.recruiter_response_rate ?? 0)
    + 0.20 * recency
    + 0.15 * github
    + 0.15 * (signals.interview_completion_rate ?? 0.5)
    + 0.10 * (signals.open_to_work_flag ? 1.0 : 0.3)
    + 0.10 * noticeScore,
    1
  );
}

function scoreEducation(education: any[]) {
  if (!education?.length) return 0.5;
  return Math.max(...education.map(e => TIER_SCORE[e.tier ?? "unknown"] ?? 0.5));
}

function titleMultiplier(title: string) {
  const t = title.toLowerCase();
  if (NON_TECH_TITLES.some(bad => t.includes(bad))) return 0.12;
  if (GOOD_TITLES.some(good => t.includes(good))) return 1.0;
  return 0.80;
}

export async function GET() {
  try {
    const dbCandidates = await db.candidate.findMany({
      include: { experiences: true, education: true }
    });

    if (dbCandidates.length < 100) {
      return NextResponse.json(
        { error: `Not enough candidates in DB (${dbCandidates.length}). Need at least 100. Run the import script first.` },
        { status: 400 }
      );
    }

    const scored = dbCandidates.map(c => {
      const skills = (() => { try { return JSON.parse(c.skills); } catch { return []; } })();
      const signals = c.redrobSignals ? JSON.parse(c.redrobSignals) : null;
      const tMult = titleMultiplier(c.role);
      const yoe = c.yearsOfExperience ?? 0;
      const { score: skillScore, matched } = scoreSkills(skills);

      if (tMult <= 0.12) {
        return { id: c.candidateId || c.id, score: Math.round(tMult * skillScore * 10000) / 10000, reasoning: `${c.role} — capped for non-technical role.` };
      }

      const raw = 0.40 * skillScore + 0.25 * scoreExperience({ ...c, experiences: c.experiences }) + 0.25 * scoreBehavioral(signals) + 0.10 * scoreEducation(c.education);
      const score = Math.round(raw * tMult * 10000) / 10000;
      const resp = signals?.recruiter_response_rate ?? 0;
      const reasoning = `${c.role} with ${yoe.toFixed(1)} yrs; ${matched.length} AI core skills; response rate ${resp.toFixed(2)}.`;

      return { id: c.candidateId || c.id, score, reasoning };
    });

    // Sort: score desc, id asc for tie-break
    scored.sort((a, b) => b.score !== a.score ? b.score - a.score : a.id.localeCompare(b.id));
    const top100 = scored.slice(0, 100);

    const lines = ["candidate_id,rank,score,reasoning"];
    top100.forEach((r, i) => {
      const safReasoning = r.reasoning.replace(/"/g, '""');
      lines.push(`${r.id},${i + 1},${r.score.toFixed(4)},"${safReasoning}"`);
    });

    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=submission.csv",
      },
    });

  } catch (error) {
    console.error("Export submission error:", error);
    return NextResponse.json({ error: "Failed to generate submission" }, { status: 500 });
  }
}
