// One-off seeder: loads N real candidates from data_set/candidates.jsonl into the
// database, normalized to the same shape the app uses. Idempotent — skips any
// candidateId already present. Run:  node scripts/seed-dataset.mjs [count]
import { PrismaClient } from "@prisma/client";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const db = new PrismaClient();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSONL = join(ROOT, "data_set", "candidates.jsonl");
const COUNT = parseInt(process.argv[2] || "50", 10);

// Mirror of src/lib/adjacency.ts (kept inline so this script needs no transpile).
const DOMAINS = {
  ai_ml: ["embedding", "vector", "faiss", "qdrant", "pinecone", "weaviate", "milvus", "rag", "retrieval", "llm", "large language model", "gpt", "bert", "transformer", "fine-tuning", "fine tuning", "lora", "peft", "nlp", "natural language", "mlops", "mlflow", "recommendation", "ranking", "pytorch", "tensorflow", "scikit", "machine learning", "deep learning", "hugging face", "huggingface", "langchain", "llamaindex", "semantic search", "information retrieval", "computer vision", "speech recognition"],
  frontend: ["react", "vue", "angular", "svelte", "next.js", "nextjs", "nuxt", "gatsby", "tailwind", "css", "html", "redux", "webpack", "vite", "javascript", "typescript", "jquery"],
  backend: ["node", "express", "fastapi", "django", "flask", "spring", "golang", "go ", "rust", "java", "scala", "c#", ".net", "graphql", "rest api", "rest apis", "rails", "ruby", "php", "laravel", "microservices", "grpc"],
  database: ["postgres", "mysql", "mongodb", "redis", "sqlite", "dynamodb", "cassandra", "snowflake", "bigquery", "sql", "nosql", "etl", "dbt", "spark", "airflow", "databricks", "apache beam", "data modeling", "data warehouse"],
  cloud_devops: ["aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "jenkins", "ansible", "helm", "serverless", "lambda", "cloud run", "github actions"],
  mobile: ["react native", "flutter", "swift", "kotlin", "android", "ios", "expo", "jetpack compose", "swiftui"],
};
function computeAdjacencyScore(skills) {
  const hit = new Set();
  for (const s of skills) {
    const name = typeof s?.name === "string" ? s.name.toLowerCase() : "";
    if (!name) continue;
    for (const [domain, terms] of Object.entries(DOMAINS)) {
      if (hit.has(domain)) continue;
      if (terms.some((t) => name.includes(t))) hit.add(domain);
    }
  }
  const raw = Math.round((hit.size / 5) * 100);
  return Math.min(100, Math.max(15, raw));
}

function toCreateInput(c) {
  const p = c.profile || {};
  const skills = Array.isArray(c.skills) ? c.skills : [];
  return {
    candidateId: c.candidate_id || undefined,
    name: p.anonymized_name || "Unknown Candidate",
    headline: p.headline || null,
    role: p.current_title || "Software Engineer",
    summary: p.summary || "",
    skills: JSON.stringify(skills),
    location: p.location || null,
    country: p.country || null,
    isProcessed: true,
    yearsOfExperience: p.years_of_experience ?? null,
    currentCompany: p.current_company || null,
    currentCompanySize: p.current_company_size || null,
    currentIndustry: p.current_industry || null,
    hiddenGemScore: null, // Gemini-analysis output; not present in raw dataset
    trajectoryNotes: null,
    adjacencyScore: computeAdjacencyScore(skills),
    redrobSignals: c.redrob_signals ? JSON.stringify(c.redrob_signals) : undefined,
    experiences: {
      create: (c.career_history || []).map((h) => ({
        role: h.title || "",
        company: h.company || "",
        duration: h.start_date ? `${h.start_date.slice(0, 7)} - ${h.end_date ? h.end_date.slice(0, 7) : "Present"}` : "",
        startDate: h.start_date || null,
        endDate: h.end_date || null,
        durationMonths: h.duration_months ?? null,
        isCurrent: h.is_current ?? false,
        industry: h.industry || null,
        companySize: h.company_size || null,
        description: h.description || "",
        bullets: JSON.stringify(h.description ? [h.description] : []),
      })),
    },
    education: {
      create: (c.education || []).map((e) => ({
        institution: e.institution || "",
        degree: e.degree || "",
        fieldOfStudy: e.field_of_study || null,
        startYear: e.start_year ?? null,
        endYear: e.end_year ?? null,
        grade: e.grade || null,
        tier: e.tier || null,
      })),
    },
  };
}

async function main() {
  // Read the first COUNT candidates from the JSONL.
  const picked = [];
  const rl = createInterface({ input: createReadStream(JSONL), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    picked.push(JSON.parse(line));
    if (picked.length >= COUNT) break;
  }
  rl.close();

  // Skip any already in the DB (idempotent re-runs).
  const ids = picked.map((c) => c.candidate_id).filter(Boolean);
  const existing = new Set(
    (await db.candidate.findMany({ where: { candidateId: { in: ids } }, select: { candidateId: true } })).map((r) => r.candidateId)
  );

  let inserted = 0;
  for (const c of picked) {
    if (c.candidate_id && existing.has(c.candidate_id)) continue;
    await db.candidate.create({ data: toCreateInput(c) });
    inserted++;
  }

  const total = await db.candidate.count();
  console.log(`Inserted ${inserted} new candidate(s). Skipped ${picked.length - inserted} already present.`);
  console.log(`Total candidates in DB: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
