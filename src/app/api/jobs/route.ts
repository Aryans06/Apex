import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SEED_JDS = [
  {
    title: "Senior ML Engineer – LLM & RAG Systems",
    content: `We are hiring a Senior ML Engineer to lead development of production-grade LLM and Retrieval-Augmented Generation (RAG) systems at scale.

Responsibilities:
- Design and deploy RAG pipelines using embeddings, vector databases (Faiss, Qdrant, Pinecone), and re-ranking models
- Fine-tune open-source LLMs (Llama, Mistral) using LoRA/QLoRA for domain-specific tasks
- Build semantic search and hybrid retrieval systems combining BM25 and dense embeddings
- Evaluate models using NDCG, MRR, and custom offline evaluation frameworks
- Collaborate with product teams to ship AI features end-to-end

Requirements:
- 4+ years in ML engineering with hands-on experience in NLP and LLM systems
- Strong Python skills; proficiency with HuggingFace Transformers, LangChain, or LlamaIndex
- Experience with vector databases and embedding models (sentence-transformers, BGE)
- Familiarity with MLflow, W&B for experiment tracking
- Bonus: experience with information retrieval, learning-to-rank, or recommendation systems`,
  },
  {
    title: "Senior Backend Engineer – Distributed Systems",
    content: `We are looking for a Senior Backend Engineer to build high-throughput, fault-tolerant backend services powering our core platform.

Responsibilities:
- Design and own microservices using Go or Node.js with gRPC and REST APIs
- Build event-driven architectures using Kafka and message queues
- Optimize PostgreSQL and Redis for high-read and high-write workloads
- Implement distributed caching, load balancing, and horizontal scaling strategies
- Lead technical design reviews and mentor junior engineers

Requirements:
- 5+ years of backend engineering experience
- Deep expertise in Go or Node.js; strong understanding of system design principles
- Proven experience with Kafka, distributed systems, and API design
- Hands-on with PostgreSQL, Redis, and database optimization
- Experience with Docker, Kubernetes, and CI/CD pipelines
- Strong grasp of data modeling and SQL`,
  },
  {
    title: "Full Stack Engineer – React & FastAPI",
    content: `Join our product team as a Full Stack Engineer to build user-facing features across the entire stack.

Responsibilities:
- Build responsive, accessible frontend interfaces using React and TypeScript
- Develop backend APIs using FastAPI (Python) or Node.js with Express
- Collaborate with designers to implement pixel-perfect UIs using Tailwind CSS
- Write integration and end-to-end tests using Playwright and Pytest
- Maintain and evolve our PostgreSQL data models via Prisma or SQLAlchemy

Requirements:
- 3+ years of full-stack development experience
- Proficient in React, TypeScript, and modern CSS (Tailwind)
- Backend experience with FastAPI, Django, or Node.js/Express
- Comfortable with REST API design and GraphQL
- Experience with relational databases (PostgreSQL or MySQL)
- Familiarity with Docker and GitHub Actions for CI/CD`,
  },
  {
    title: "DevOps / Site Reliability Engineer",
    content: `We are hiring a DevOps / SRE to own our cloud infrastructure, reliability, and deployment pipelines.

Responsibilities:
- Manage and scale infrastructure on AWS (ECS, Lambda, RDS, CloudFront) using Terraform
- Build and maintain Kubernetes clusters and Helm chart deployments
- Design CI/CD pipelines using GitHub Actions and Jenkins
- Implement observability: metrics, logs, and alerting using Prometheus, Grafana, and PagerDuty
- Drive incident response, post-mortems, and reliability improvements

Requirements:
- 4+ years in DevOps, SRE, or Platform Engineering
- Deep experience with AWS or GCP; strong Terraform and IaC skills
- Kubernetes (k8s) administration and Helm expertise
- Proficiency with Docker and container orchestration
- Experience with CI/CD tooling (GitHub Actions, Jenkins)
- Scripting proficiency in Python or Bash
- Understanding of networking, load balancing, and serverless architectures`,
  },
  {
    title: "Data Engineer – Python & Spark",
    content: `We are building out our data platform and need a Data Engineer to design and maintain robust data pipelines at scale.

Responsibilities:
- Build scalable batch and streaming data pipelines using Apache Spark and Kafka
- Design and maintain data warehouse schemas on BigQuery or Redshift
- Orchestrate workflows using Apache Airflow or Prefect
- Implement data quality checks and monitoring across ingestion pipelines
- Collaborate with data scientists and analysts to deliver clean, well-modeled datasets

Requirements:
- 3+ years of data engineering experience
- Strong Python; hands-on experience with PySpark or Scala Spark
- Proficiency in SQL and data modeling (star schema, medallion architecture)
- Experience with Kafka or other streaming platforms
- Familiarity with Airflow for pipeline orchestration
- Exposure to cloud data warehouses: BigQuery, Redshift, or Snowflake
- Experience with dbt is a strong plus`,
  },
  {
    title: "Android Engineer – Kotlin & Jetpack Compose",
    content: `We are looking for an Android Engineer to build delightful, performant mobile experiences for millions of users.

Responsibilities:
- Build and maintain Android features using Kotlin and Jetpack Compose
- Architect app layers using MVVM, Clean Architecture, and Hilt for DI
- Integrate REST and GraphQL APIs; implement offline-first patterns with Room
- Write unit and UI tests using JUnit, Espresso, and MockK
- Collaborate with iOS, backend, and design teams in a cross-functional setup

Requirements:
- 3+ years of Android development experience
- Strong Kotlin skills and deep familiarity with Jetpack Compose
- Experience with Android architecture components (ViewModel, LiveData, Flow)
- Knowledge of mobile CI/CD using Fastlane or GitHub Actions
- Understanding of performance profiling and memory optimization on Android
- Bonus: experience with React Native or Flutter for cross-platform development`,
  },
  {
    title: "Frontend Engineer – React & TypeScript",
    content: `We are hiring a Frontend Engineer to craft fast, accessible, and visually polished user interfaces.

Responsibilities:
- Build component libraries and feature UIs in React with TypeScript
- Implement state management using Redux Toolkit or Zustand
- Optimize rendering performance: code splitting, lazy loading, memoization
- Write comprehensive tests using Jest and Cypress
- Collaborate with design on implementing complex interactions using Framer Motion

Requirements:
- 3+ years of frontend engineering experience
- Expert-level React and TypeScript; strong CSS and responsive design skills
- Experience with Webpack or Vite; familiarity with Next.js or Gatsby
- Proficient in writing unit and E2E tests (Jest, Cypress, Playwright)
- Eye for design and ability to implement UIs faithfully from Figma
- Bonus: experience with WebSockets, WebRTC, or canvas-based rendering`,
  },
  {
    title: "NLP / Search Engineer – Information Retrieval",
    content: `We are scaling our search and discovery platform and need an NLP / Search Engineer with deep retrieval expertise.

Responsibilities:
- Own end-to-end search relevance: query understanding, retrieval, and re-ranking
- Build hybrid retrieval systems combining BM25 (Elasticsearch/Lucene) and dense embeddings
- Train and evaluate learning-to-rank models (pointwise, pairwise, listwise)
- Implement NLP pipelines: named entity recognition, text classification, and semantic similarity
- Run A/B tests and offline evaluations using NDCG and MRR metrics

Requirements:
- 3+ years in NLP, search, or recommendation engineering
- Strong Python; experience with HuggingFace, spaCy, or NLTK
- Hands-on with Elasticsearch or OpenSearch for full-text search
- Understanding of embedding models, bi-encoders, and cross-encoders for semantic search
- Experience measuring ranking quality with NDCG, MRR, or MAP
- Bonus: experience with recommendation systems (collaborative filtering, two-tower models)`,
  },
];

export async function GET() {
  try {
    let jobs = await db.jobDescription.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (jobs.length === 0) {
      await db.jobDescription.createMany({ data: SEED_JDS });
      jobs = await db.jobDescription.findMany({ orderBy: { createdAt: "desc" } });
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "title and content required" }, { status: 400 });
    }
    const job = await db.jobDescription.create({ data: { title, content } });
    return NextResponse.json(job);
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.jobDescription.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
