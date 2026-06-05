#!/usr/bin/env python3
"""
Redrob Hackathon — Candidate Ranker
Ranks the top 100 candidates from candidates.jsonl for the Senior AI Engineer JD.

Usage:
    python rank.py --candidates ./data_set/candidates.jsonl --out ./submission.csv

Constraints met:
  - No network calls
  - No GPU
  - Streams JSONL line-by-line (low memory)
  - Runs in ~30-60 seconds on CPU
"""

import argparse
import csv
import json
import time
from datetime import date, datetime

# ─── JD Skill Groups ─────────────────────────────────────────────────────────
# Each group = one "slot" in the JD skills inventory.
# Matching any term in a group fills that slot.

SKILL_GROUPS: dict[str, list[str]] = {
    "embeddings": [
        "embedding", "embeddings", "sentence transformer", "sentence-transformer",
        "sentence_transformer", "bge", "e5 embedding", "openai embedding",
        "word2vec", "text embedding", "dense retrieval", "bi-encoder",
        "cross-encoder", "semantic embedding", "text-embedding",
    ],
    "vector_db": [
        "faiss", "qdrant", "pinecone", "weaviate", "milvus", "opensearch",
        "elasticsearch", "vector search", "vector database", "vector store",
        "annoy", "scann", "hnsw", "pgvector", "chroma", "vespa",
    ],
    "information_retrieval": [
        "information retrieval", "bm25", "tfidf", "tf-idf", "sparse retrieval",
        "hybrid search", "hybrid retrieval", "semantic search", "neural search",
        "keyword search", "lucene",
    ],
    "rag": [
        "rag", "retrieval augmented", "retrieval-augmented", "llamaindex",
        "llama index", "llama_index", "document retrieval", "knowledge retrieval",
        "agentic rag",
    ],
    "llm": [
        "llm", "large language model", "gpt", "bert", "transformer",
        "language model", "huggingface", "hugging face", "transformers",
        "llama", "mistral", "gemini", "phi", "anthropic", "openai api",
    ],
    "fine_tuning": [
        "fine-tuning", "fine tuning", "finetuning", "lora", "qlora", "peft",
        "rlhf", "instruction tuning", "sft", "adapter tuning",
        "parameter efficient", "dpo",
    ],
    "ranking": [
        "ranking", "learning to rank", "reranking", "re-ranking", "ranker",
        "pointwise", "pairwise", "listwise", "lambdamart", "learning-to-rank",
    ],
    "recommendation": [
        "recommendation", "recommender", "collaborative filtering",
        "matrix factorization", "content-based filtering", "two-tower",
    ],
    "nlp": [
        "nlp", "natural language processing", "text classification",
        "named entity recognition", "ner", "sentiment analysis",
        "question answering", "text generation", "language understanding",
        "nlu", "nli", "text mining",
    ],
    "python": ["python"],
    "evaluation_metrics": [
        "ndcg", "mrr", "map@", "a/b testing", "a/b test", "offline evaluation",
        "evaluation framework", "ranking evaluation", "online experiment",
        "ab testing", "statistical significance",
    ],
    "mlops": [
        "mlflow", "weights & biases", "wandb", "bentoml", "ray serve",
        "kubeflow", "model serving", "triton", "torchserve", "kfserving",
        "feature store", "ml pipeline",
    ],
}

NUM_JD_GROUPS = len(SKILL_GROUPS)

# Skills that signal a CV/speech primary — mild penalty if these dominate
NEGATIVE_SKILL_TERMS = [
    "computer vision", "opencv", "image classification", "object detection",
    "cnn", "convolutional neural", "image segmentation", "gan",
    "diffusion model", "stable diffusion", "speech recognition", "asr",
    "tts", "text to speech", "text-to-speech", "robotics", "point cloud",
    "lidar", "slam",
]

# Known consulting / body-shop firms (lower-cased substrings)
CONSULTING_FIRMS = frozenset({
    "tcs", "tata consultancy", "infosys", "wipro", "accenture",
    "cognizant", "capgemini", "hcl technologies", "hcltech", "tech mahindra",
    "ltimindtree", "lti mindtree", "l&t infotech", "mphasis", "hexaware",
    "mindtree", "persistent systems", "niit technologies", "birlasoft",
    "zensar", "cyient", "kpit", "mastech", "syntel",
})

# Non-technical roles that are JD mismatches
NON_TECH_TITLE_TERMS = frozenset({
    "hr manager", "human resources", "content writer", "content strategist",
    "graphic designer", "marketing manager", "marketing executive",
    "sales executive", "sales manager", "accountant", "finance",
    "operations manager", "civil engineer", "mechanical engineer",
    "electrical engineer", "chemical engineer", "business analyst",
    "customer support", "customer success", "product manager",
    "ui designer", "ux designer",
})

# Title terms that signal strong AI/ML fit
GOOD_TITLE_TERMS = [
    "machine learning", "ml engineer", "ai engineer", "nlp engineer",
    "data scientist", "applied scientist", "research engineer",
    "search engineer", "ranking engineer", "retrieval", "recommendation",
    "deep learning", "llm", "ai researcher",
]

PROFICIENCY_WEIGHT = {
    "beginner": 0.4,
    "intermediate": 0.6,
    "advanced": 0.8,
    "expert": 1.0,
}

TIER_SCORE = {
    "tier_1": 1.0,
    "tier_2": 0.8,
    "tier_3": 0.6,
    "tier_4": 0.4,
    "unknown": 0.5,
}

TODAY = date.today()


# ─── Honeypot Detection ───────────────────────────────────────────────────────

def is_honeypot(candidate: dict) -> bool:
    # Rule 1: multiple "expert" skills with 0 usage months
    expert_zero = sum(
        1 for s in candidate.get("skills", [])
        if s.get("proficiency") == "expert" and s.get("duration_months", 1) == 0
    )
    if expert_zero >= 3:
        return True

    # Rule 2: claimed years_of_experience far exceeds actual career span
    claimed_yoe = float(candidate["profile"].get("years_of_experience", 0))
    starts = []
    for role in candidate.get("career_history", []):
        try:
            starts.append(datetime.strptime(role["start_date"], "%Y-%m-%d").date())
        except (ValueError, KeyError):
            pass
    if starts:
        earliest = min(starts)
        actual_span = (TODAY - earliest).days / 365.25
        if claimed_yoe > actual_span + 4:
            return True

    return False


# ─── Skill Scoring ────────────────────────────────────────────────────────────

def score_skills(skills: list[dict]) -> tuple[float, list[str]]:
    """Returns (score 0-1, matched group names)."""
    best_per_group: dict[str, float] = {}
    negative_count = 0

    for skill in skills:
        name_lower = skill.get("name", "").lower().strip()
        prof = PROFICIENCY_WEIGHT.get(skill.get("proficiency", "intermediate"), 0.6)
        endorsements = min(skill.get("endorsements", 0) / 50.0, 1.0)
        duration = min(skill.get("duration_months", 0) / 60.0, 1.0)
        # Value = proficiency × weighted quality modifier
        value = prof * (0.6 + 0.2 * endorsements + 0.2 * duration)

        for neg in NEGATIVE_SKILL_TERMS:
            if neg in name_lower:
                negative_count += 1
                break

        for group, terms in SKILL_GROUPS.items():
            for term in terms:
                if term in name_lower or name_lower in term:
                    if value > best_per_group.get(group, 0.0):
                        best_per_group[group] = value
                    break

    raw = sum(best_per_group.values())
    score = min(raw / NUM_JD_GROUPS, 1.0)

    # Penalty: CV/speech dominant with very few AI/IR skills
    if negative_count >= 4 and len(best_per_group) < 3:
        score *= 0.4

    return score, list(best_per_group.keys())


# ─── Experience Scoring ───────────────────────────────────────────────────────

def score_experience(candidate: dict) -> float:
    yoe = float(candidate["profile"].get("years_of_experience", 0))

    # Ideal: 5-9 years for the JD
    if 5.0 <= yoe <= 9.0:
        yoe_score = 1.0
    elif yoe < 5.0:
        yoe_score = yoe / 5.0
    else:
        yoe_score = max(0.5, 1.0 - (yoe - 9.0) * 0.05)

    # Product company ratio
    total_months = sum(r.get("duration_months", 0) for r in candidate.get("career_history", []))
    product_months = 0
    for role in candidate.get("career_history", []):
        months = role.get("duration_months", 0)
        company_lower = role.get("company", "").lower()
        if not any(firm in company_lower for firm in CONSULTING_FIRMS):
            product_months += months

    product_ratio = (product_months / total_months) if total_months > 0 else 0.5

    return 0.5 * yoe_score + 0.5 * product_ratio


# ─── Behavioral Scoring ───────────────────────────────────────────────────────

def score_behavioral(signals: dict) -> float:
    response_rate = float(signals.get("recruiter_response_rate", 0.0))

    # Recency of last activity
    try:
        last_active = datetime.strptime(signals.get("last_active_date", ""), "%Y-%m-%d").date()
        days_since = (TODAY - last_active).days
        recency = max(0.0, 1.0 - days_since / 365.0)
    except ValueError:
        recency = 0.3

    # GitHub score (-1 = no account → treat as 0)
    github_raw = float(signals.get("github_activity_score", -1))
    github = max(github_raw, 0.0) / 100.0

    interview_rate = float(signals.get("interview_completion_rate", 0.5))
    open_to_work = 1.0 if signals.get("open_to_work_flag", False) else 0.3

    notice = int(signals.get("notice_period_days", 90))
    if notice <= 30:
        notice_score = 1.0
    elif notice <= 60:
        notice_score = 0.7
    elif notice <= 90:
        notice_score = 0.5
    else:
        notice_score = max(0.1, 1.0 - notice / 180.0)

    return min(
        0.30 * response_rate
        + 0.20 * recency
        + 0.15 * github
        + 0.15 * interview_rate
        + 0.10 * open_to_work
        + 0.10 * notice_score,
        1.0,
    )


# ─── Education Scoring ───────────────────────────────────────────────────────

def score_education(education: list[dict]) -> float:
    if not education:
        return 0.5
    return max(TIER_SCORE.get(e.get("tier", "unknown"), 0.5) for e in education)


# ─── Title Multiplier ────────────────────────────────────────────────────────

def title_multiplier(title: str) -> float:
    title_lower = title.lower()
    # Hard cap for clearly non-technical roles
    for bad in NON_TECH_TITLE_TERMS:
        if bad in title_lower:
            return 0.12
    # Boost for directly relevant titles
    for good in GOOD_TITLE_TERMS:
        if good in title_lower:
            return 1.0
    # Neutral tech titles (software engineer, backend, data engineer, etc.)
    return 0.80


# ─── Composite Score ─────────────────────────────────────────────────────────

def score_candidate(candidate: dict) -> tuple[float, str]:
    if is_honeypot(candidate):
        return 0.01, "honeypot: impossible profile detected"

    profile = candidate["profile"]
    title = profile.get("current_title", "Unknown")
    t_mult = title_multiplier(title)
    yoe = float(profile.get("years_of_experience", 0))

    skill_score, matched_groups = score_skills(candidate.get("skills", []))

    if t_mult <= 0.12:
        # Non-technical title: score is capped; don't reward signal components
        final = round(t_mult * skill_score, 6)
        reasoning = (
            f"{title} with {yoe:.1f} yrs; "
            f"{len(matched_groups)} relevant skills; "
            f"capped — non-technical title for AI Engineer JD."
        )
        return final, reasoning

    exp_score = score_experience(candidate)
    behavioral = score_behavioral(candidate.get("redrob_signals", {}))
    edu_score = score_education(candidate.get("education", []))

    raw = (
        0.40 * skill_score
        + 0.25 * exp_score
        + 0.25 * behavioral
        + 0.10 * edu_score
    )
    final = round(raw * t_mult, 6)

    # Reasoning string
    signals = candidate.get("redrob_signals", {})
    resp = float(signals.get("recruiter_response_rate", 0))
    top3 = ", ".join(matched_groups[:3]) if matched_groups else "none"
    location = profile.get("location", "")
    country = profile.get("country", "")
    loc_str = f"{location}, {country}".strip(", ")

    reasoning = (
        f"{title} with {yoe:.1f} yrs; "
        f"{len(matched_groups)} core skill groups ({top3}); "
        f"response rate {resp:.2f}; "
        f"{loc_str}."
    )
    return final, reasoning


# ─── Main ────────────────────────────────────────────────────────────────────

def rank(candidates_path: str, out_path: str) -> None:
    t0 = time.time()
    all_scored: list[tuple[float, str, str]] = []  # (score, cid, reasoning)

    with open(candidates_path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            candidate = json.loads(line)
            score, reasoning = score_candidate(candidate)
            all_scored.append((score, candidate["candidate_id"], reasoning))

            if (i + 1) % 10000 == 0:
                elapsed = time.time() - t0
                print(f"  Processed {i + 1:,} candidates in {elapsed:.1f}s")

    # Round to 4dp (CSV precision) then sort: score desc, cid asc for tie-break
    all_scored = [(round(s, 4), cid, reas) for s, cid, reas in all_scored]
    all_scored.sort(key=lambda x: (-x[0], x[1]))
    top_100 = all_scored[:100]

    with open(out_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["candidate_id", "rank", "score", "reasoning"])
        for rank_pos, (score, cid, reasoning) in enumerate(top_100, start=1):
            writer.writerow([cid, rank_pos, f"{score:.4f}", reasoning])

    elapsed = time.time() - t0
    print(f"\nDone. {len(all_scored):,} candidates scored in {elapsed:.1f}s")
    print(f"Top 100 written to: {out_path}")
    print(f"\nTop 5 preview:")
    for i, (score, cid, reasoning) in enumerate(top_100[:5], 1):
        print(f"  {i}. {cid} ({score:.4f}) — {reasoning[:80]}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Redrob hackathon candidate ranker")
    parser.add_argument("--candidates", required=True, help="Path to candidates.jsonl")
    parser.add_argument("--out", required=True, help="Output submission CSV path")
    args = parser.parse_args()
    rank(args.candidates, args.out)
