// Skill adjacency = how broadly a candidate's skills transfer ACROSS distinct
// engineering domains (a "T-shaped" signal). This is computed deterministically
// from the parsed skill list — it is NOT an LLM guess — so the score is
// reproducible and comparable across candidates.
//
// Note: all AI/ML sub-skills collapse into a single `ai_ml` domain on purpose.
// A deep ML specialist who knows embeddings + RAG + LLMs + MLOps spans many
// sub-skills but only ONE domain, so they should read as a specialist (low
// adjacency), not as broadly cross-domain.

const DOMAINS: Record<string, string[]> = {
  ai_ml: [
    "embedding", "vector", "faiss", "qdrant", "pinecone", "weaviate", "milvus",
    "rag", "retrieval", "llm", "large language model", "gpt", "bert",
    "transformer", "fine-tuning", "fine tuning", "lora", "peft", "nlp",
    "natural language", "mlops", "mlflow", "recommendation", "ranking",
    "pytorch", "tensorflow", "scikit", "machine learning", "deep learning",
    "hugging face", "huggingface", "langchain", "llamaindex", "semantic search",
    "information retrieval", "computer vision", "speech recognition",
  ],
  frontend: [
    "react", "vue", "angular", "svelte", "next.js", "nextjs", "nuxt", "gatsby",
    "tailwind", "css", "html", "redux", "webpack", "vite", "javascript",
    "typescript", "jquery",
  ],
  backend: [
    "node", "express", "fastapi", "django", "flask", "spring", "golang", "go ",
    "rust", "java", "scala", "c#", ".net", "graphql", "rest api", "rest apis",
    "rails", "ruby", "php", "laravel", "microservices", "grpc",
  ],
  database: [
    "postgres", "mysql", "mongodb", "redis", "sqlite", "dynamodb", "cassandra",
    "snowflake", "bigquery", "sql", "nosql", "etl", "dbt", "spark", "airflow",
    "databricks", "apache beam", "data modeling", "data warehouse",
  ],
  cloud_devops: [
    "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ci/cd",
    "jenkins", "ansible", "helm", "serverless", "lambda", "cloud run",
    "github actions",
  ],
  mobile: [
    "react native", "flutter", "swift", "kotlin", "android", "ios", "expo",
    "jetpack compose", "swiftui",
  ],
};

const FULL_BREADTH = 5; // spanning 5+ distinct domains → maxed-out adjacency

interface ParsedSkill {
  name?: unknown;
}

/** Count how many distinct engineering domains the candidate's skills span. */
export function countDomainsSpanned(skills: ParsedSkill[]): number {
  const hit = new Set<string>();
  for (const skill of skills) {
    const name = typeof skill.name === "string" ? skill.name.toLowerCase() : "";
    if (!name) continue;
    for (const [domain, terms] of Object.entries(DOMAINS)) {
      if (hit.has(domain)) continue;
      if (terms.some((t) => name.includes(t))) hit.add(domain);
    }
  }
  return hit.size;
}

/**
 * Deterministic 0–100 adjacency score from domain breadth.
 *  1 domain → 20 (pure specialist)   ·   3 → 60   ·   5+ → 100
 * Floored at 15 so any parsed candidate has a non-zero baseline.
 */
export function computeAdjacencyScore(skills: ParsedSkill[]): number {
  const domains = countDomainsSpanned(skills);
  const raw = Math.round((domains / FULL_BREADTH) * 100);
  return Math.min(100, Math.max(15, raw));
}
