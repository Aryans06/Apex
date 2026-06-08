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

  // ── General JDs calibrated to the actual candidate pool ──────────────────

  {
    title: "Java / Spring Boot Engineer",
    content: `We are looking for a Java Engineer to build and scale enterprise-grade backend services used by millions of users across India.

Responsibilities:
- Design and develop microservices using Java and Spring Boot
- Build and consume REST and gRPC APIs for internal and external integrations
- Write optimised SQL queries and manage schemas in MySQL or PostgreSQL
- Participate in code reviews, design discussions, and sprint planning
- Work with the DevOps team to deploy services on AWS or Azure using Docker and Kubernetes

Requirements:
- 2–5 years of backend development experience in Java
- Strong command of Spring Boot, Spring MVC, and Spring Data JPA
- Proficiency in SQL and relational database design
- Hands-on experience with REST API development and gRPC
- Familiarity with Docker, Kubernetes, and cloud platforms (AWS or Azure)
- Understanding of unit testing with JUnit and Mockito
- Knowledge of Kafka or message queues is a plus`,
  },
  {
    title: "Node.js Backend Engineer – APIs & Integrations",
    content: `We need a Node.js Backend Engineer to build reliable, high-throughput APIs and third-party integrations for our SaaS platform.

Responsibilities:
- Build scalable REST and GraphQL APIs using Node.js and Express or NestJS
- Integrate third-party services via gRPC and webhooks
- Design efficient data models in MongoDB and PostgreSQL
- Own the performance and reliability of backend services in production
- Collaborate with frontend and mobile engineers to define API contracts

Requirements:
- 2–4 years of Node.js backend development experience
- Strong understanding of REST API design and GraphQL schema design
- Experience with both SQL (PostgreSQL, MySQL) and NoSQL (MongoDB, Redis) databases
- Familiarity with gRPC and event-driven patterns
- Comfortable with Docker and CI/CD pipelines (GitHub Actions or Jenkins)
- Bonus: experience with Kafka or message queue systems`,
  },
  {
    title: "Cloud & Infrastructure Engineer – AWS / GCP",
    content: `We are growing our platform engineering team and need a Cloud Engineer to own our multi-cloud infrastructure across AWS and GCP.

Responsibilities:
- Provision and manage cloud infrastructure on AWS and GCP using Terraform and Helm
- Administer Kubernetes clusters and optimise resource utilisation
- Set up and improve CI/CD pipelines using GitHub Actions or Jenkins
- Monitor infrastructure health using Grafana, Prometheus, and cloud-native tooling
- Work closely with the security team to enforce IAM policies and compliance standards

Requirements:
- 3+ years of experience in cloud infrastructure or DevOps
- Hands-on with AWS services (EC2, RDS, S3, Lambda, ECS) and/or GCP (Cloud Run, GKE)
- Strong Terraform skills for infrastructure as code
- Kubernetes and Helm administration experience
- Familiarity with Azure is a bonus
- Scripting skills in Python or Bash
- Comfortable with Docker, container registries, and image optimisation`,
  },
  {
    title: "Data Platform Engineer – Spark & Airflow",
    content: `We are building the data foundation for a fast-growing analytics platform and need a Data Platform Engineer to own our batch and streaming pipelines.

Responsibilities:
- Build and maintain ETL and ELT pipelines using Apache Spark and Apache Beam
- Orchestrate workflows with Apache Airflow and ensure pipeline reliability
- Work with Hadoop HDFS and cloud storage for large-scale data processing
- Integrate with Kafka streams for real-time data ingestion
- Collaborate with analytics and ML teams to surface clean, well-modelled datasets

Requirements:
- 3+ years of data engineering experience
- Proficiency in Python and PySpark; Scala Spark experience is a plus
- Hands-on experience with Airflow for workflow orchestration
- Experience with ETL patterns, data warehousing, and SQL optimisation
- Familiarity with Hadoop ecosystem (HDFS, Hive, HBase)
- Experience with Apache Beam or Dataflow is a strong plus
- Working knowledge of cloud platforms: AWS, GCP, or Azure`,
  },
  {
    title: "Full Stack Engineer – Node.js & React",
    content: `We are looking for a Full Stack Engineer who can move seamlessly across frontend and backend to ship complete product features.

Responsibilities:
- Build React and TypeScript frontends with Tailwind CSS, delivering responsive and performant UIs
- Develop backend APIs in Node.js with REST and GraphQL interfaces
- Manage state using Redux or Zustand; integrate with real-time features via WebSockets
- Write unit and integration tests using Jest and React Testing Library
- Participate in sprint planning, feature scoping, and technical design discussions

Requirements:
- 2–5 years of full-stack development experience
- Strong proficiency in React, TypeScript, and Tailwind CSS
- Backend experience in Node.js (Express or NestJS)
- Working knowledge of SQL databases (PostgreSQL or MySQL)
- Comfortable with GraphQL, REST API design, and JWT-based authentication
- Familiarity with Docker, Git workflows, and basic CI/CD
- Bonus: Next.js experience and familiarity with gRPC`,
  },
  {
    title: "QA Engineer – Test Automation",
    content: `We are investing in quality and need a QA Engineer to build and maintain our automated testing infrastructure across web and API layers.

Responsibilities:
- Design and implement end-to-end test suites using Playwright or Selenium
- Write API test automation using Postman/Newman or Pytest
- Build regression and smoke test pipelines integrated with CI/CD (GitHub Actions or Jenkins)
- Collaborate with developers during sprint to define test cases for new features
- Track, document, and triage defects; ensure test coverage meets release standards

Requirements:
- 2–4 years of QA or test automation experience
- Hands-on with Playwright, Selenium, or Cypress for UI test automation
- Experience with API testing tools (Postman, RestAssured, or Pytest)
- Familiarity with Java or Python for writing test scripts
- Understanding of CI/CD pipelines and how testing integrates into the delivery process
- Experience with Jira or similar tools for defect tracking
- Knowledge of performance testing (JMeter, k6) is a bonus`,
  },
];

export async function GET() {
  try {
    let jobs = await db.jobDescription.findMany({
      orderBy: { createdAt: "desc" },
    });

    const existingTitles = new Set(jobs.map((j) => j.title));
    const missing = SEED_JDS.filter((j) => !existingTitles.has(j.title));
    if (missing.length > 0) {
      await db.jobDescription.createMany({ data: missing });
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
