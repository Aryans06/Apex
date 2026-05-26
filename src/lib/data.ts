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
  location?: string;
  isProcessed: boolean;
  hiddenGemScore?: number;
  trajectoryNotes?: string;
  adjacencyScore?: number;
}

export const mockCandidates: Candidate[] = [
  {
    id: "c_001",
    name: "Priya Sharma",
    role: "Senior Backend Engineer",
    summary: "Self-taught developer from Nagpur with a passion for high-performance distributed systems. Built scalable fintech infrastructure from scratch.",
    skills: ["Rust", "Go", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "Redis"],
    experience: [
      {
        role: "Lead Systems Engineer",
        company: "PayPulse (Startup)",
        duration: "2022 - Present",
        description: "Promoted from Junior to Lead in 18 months. Redesigned the entire payments ingestion pipeline.",
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
      degree: "B.C.A",
      school: "Nagpur University",
      year: "2018"
    },
    links: { github: "github.com/priyasharma" },
    location: "Bengaluru, India",
    isProcessed: true,
    hiddenGemScore: 94,
    adjacencyScore: 88,
    trajectoryNotes: "Exceptional growth velocity. Transitioned from standard Node.js to architecting high-throughput distributed systems in Rust in just 18 months. High skill adjacency for Senior Platform roles."
  },
  {
    id: "c_002",
    name: "Rahul Mehta",
    role: "Software Engineer II",
    summary: "Experienced software engineer with a background in enterprise web applications.",
    skills: ["Java", "Spring Boot", "React", "SQL", "AWS"],
    experience: [
      {
        role: "Software Engineer II",
        company: "Infosys",
        duration: "2021 - Present",
        description: "Part of the core team maintaining the internal HR portal.",
        bullets: [
          "Developed new REST APIs using Java and Spring Boot for the employee directory.",
          "Maintained React frontend components for the leave management system.",
          "Participated in agile ceremonies and sprint planning."
        ]
      },
      {
        role: "Systems Engineer",
        company: "TCS",
        duration: "2019 - 2021",
        description: "Started as a new grad, working on bug fixes and minor features.",
        bullets: [
          "Fixed bugs in legacy Java applications.",
          "Wrote unit tests using JUnit."
        ]
      }
    ],
    education: {
      degree: "B.Tech Computer Science",
      school: "IIT Bombay",
      year: "2019"
    },
    links: { github: "github.com/rahulm" },
    location: "Mumbai, India",
    isProcessed: true,
    hiddenGemScore: 40,
    adjacencyScore: 50,
    trajectoryNotes: "Standard trajectory. Good pedigree but slower progression and standard enterprise tech stack."
  },
  {
    id: "c_003",
    name: "Anjali Deshmukh",
    role: "Frontend Architect",
    summary: "Pixel-perfect frontend engineer focusing on accessibility and design systems.",
    skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Figma"],
    experience: [
      {
        role: "Senior Frontend Engineer",
        company: "CRED",
        duration: "2022 - Present",
        description: "Leading the transition to a unified design system.",
        bullets: [
          "Built a component library used by 50+ engineers.",
          "Reduced bundle size by 30% through dynamic imports.",
          "Mentored junior engineers on accessibility best practices."
        ]
      }
    ],
    education: {
      degree: "Bootcamp Graduate",
      school: "Masai School",
      year: "2020"
    },
    links: { github: "github.com/anjalid", portfolio: "anjali.design" },
    location: "Pune, India",
    isProcessed: true,
    hiddenGemScore: 88,
    adjacencyScore: 75,
    trajectoryNotes: "Strong bootcamp grad trajectory. Reached Senior Frontend Engineer at a top-tier startup in 2 years."
  },
  {
    id: "c_004",
    name: "Vikram Singh",
    role: "Fullstack Developer",
    summary: "Product-minded engineer who loves taking ideas from zero to one.",
    skills: ["Python", "Django", "Vue.js", "Docker", "AWS"],
    experience: [
      {
        role: "Founding Engineer",
        company: "HealthTech Startup",
        duration: "2021 - Present",
        description: "First technical hire, built the MVP from scratch.",
        bullets: [
          "Architected HIPAA-compliant backend using Django and AWS.",
          "Built real-time chat feature using WebSockets.",
          "Set up CI/CD pipelines using GitHub Actions."
        ]
      }
    ],
    education: {
      degree: "B.Tech IT",
      school: "NIT Trichy",
      year: "2020"
    },
    links: { github: "github.com/vikrams" },
    location: "Hyderabad, India",
    isProcessed: true,
    hiddenGemScore: 65,
    adjacencyScore: 80,
    trajectoryNotes: "Solid founding engineer experience taking a product from 0 to 1."
  }
];
