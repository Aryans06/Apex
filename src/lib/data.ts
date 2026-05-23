export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
  bullets: string[];
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: {
    degree: string;
    school: string;
    year: string;
  };
  links: {
    github: string;
    portfolio?: string;
  };
  // Hidden gem fields
  isProcessed: boolean;
  hiddenGemScore?: number; // 0-100
  trajectoryNotes?: string;
  adjacencyScore?: number; // 0-100
}

export const mockCandidates: Candidate[] = [
  {
    id: "c_001",
    name: "Alex Rivera",
    role: "Senior Backend Engineer",
    summary: "Self-taught developer with a passion for high-performance distributed systems. I specialize in building highly scalable architectures from scratch.",
    skills: ["Rust", "Go", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "Redis"],
    experience: [
      {
        role: "Lead Systems Engineer",
        company: "DataFlow Inc. (Startup)",
        duration: "2022 - Present",
        description: "Promoted from Junior to Lead in 18 months. Redesigned the entire data ingestion pipeline.",
        bullets: [
          "Architected a distributed event-streaming platform using Kafka and Rust, handling 50k events/sec.",
          "Optimized PostgreSQL queries by 40%, implementing partial indexes and connection pooling.",
          "Mentored 3 junior engineers and led the migration from a monolithic Node.js app to microservices in Go."
        ]
      },
      {
        role: "Junior Developer",
        company: "Local Web Agency",
        duration: "2020 - 2022",
        description: "Built and maintained client websites and custom CRM solutions.",
        bullets: [
          "Developed custom inventory management APIs in Node.js.",
          "Automated server deployments using bash scripts and Docker."
        ]
      }
    ],
    education: {
      degree: "High School Diploma",
      school: "Central High",
      year: "2018"
    },
    links: {
      github: "github.com/arivera",
    },
    isProcessed: false
  },
  {
    id: "c_002",
    name: "Samantha Chen",
    role: "Software Engineer",
    summary: "Experienced software engineer with a background in enterprise web applications.",
    skills: ["Java", "Spring Boot", "React", "SQL", "AWS"],
    experience: [
      {
        role: "Software Engineer II",
        company: "MegaCorp Enterprise",
        duration: "2019 - Present",
        description: "Part of the core team maintaining the internal HR portal.",
        bullets: [
          "Developed new REST APIs using Java and Spring Boot for the employee directory.",
          "Maintained React frontend components for the leave management system.",
          "Participated in agile ceremonies and sprint planning."
        ]
      },
      {
        role: "Software Engineer I",
        company: "MegaCorp Enterprise",
        duration: "2016 - 2019",
        description: "Started as a new grad, working on bug fixes and minor features.",
        bullets: [
          "Fixed bugs in legacy Java applications.",
          "Wrote unit tests using JUnit."
        ]
      }
    ],
    education: {
      degree: "B.S. Computer Science",
      school: "State University",
      year: "2016"
    },
    links: {
      github: "github.com/schen",
    },
    isProcessed: false
  }
];
