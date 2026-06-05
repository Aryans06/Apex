export interface Skill {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  endorsements: number;
  duration_months: number;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  durationMonths?: number;
  isCurrent?: boolean;
  industry?: string;
  companySize?: string;
  description: string;
  bullets: string[];
}

export interface EducationRecord {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  tier?: "tier_1" | "tier_2" | "tier_3" | "tier_4" | "unknown";
}

export interface RedrobSignals {
  profile_completeness_score: number;
  signup_date: string;
  last_active_date: string;
  open_to_work_flag: boolean;
  profile_views_received_30d: number;
  applications_submitted_30d: number;
  recruiter_response_rate: number;
  avg_response_time_hours: number;
  skill_assessment_scores: Record<string, number>;
  connection_count: number;
  endorsements_received: number;
  notice_period_days: number;
  expected_salary_range_inr_lpa: { min: number; max: number };
  preferred_work_mode: "remote" | "hybrid" | "onsite" | "flexible";
  willing_to_relocate: boolean;
  github_activity_score: number;
  search_appearance_30d: number;
  saved_by_recruiters_30d: number;
  interview_completion_rate: number;
  offer_acceptance_rate: number;
  verified_email: boolean;
  verified_phone: boolean;
  linkedin_connected: boolean;
}

export interface Candidate {
  id: string;
  candidateId?: string;
  name: string;
  headline?: string;
  role: string;
  summary: string;
  skills: Skill[];
  experience: Experience[];
  education: EducationRecord[];
  links: {
    github: string;
    portfolio?: string;
  };
  location?: string;
  country?: string;
  isProcessed: boolean;
  yearsOfExperience?: number;
  currentCompany?: string;
  currentCompanySize?: string;
  currentIndustry?: string;
  hiddenGemScore?: number;
  trajectoryNotes?: string;
  adjacencyScore?: number;
  pipelineStage?: string;
  redFlags?: string[];
  redrobSignals?: RedrobSignals;
  createdAt?: string;
  notes?: { id: string; content: string; createdAt: string }[];
}

// Mock candidates kept for fallback seeding (skills updated to structured format)
export const mockCandidates: Candidate[] = [
  {
    id: "c_001",
    name: "Priya Sharma",
    role: "Senior Backend Engineer",
    summary: "Self-taught developer from Nagpur with a passion for high-performance distributed systems. Built scalable fintech infrastructure from scratch.",
    skills: [
      { name: "Rust", proficiency: "advanced", endorsements: 12, duration_months: 24 },
      { name: "Go", proficiency: "advanced", endorsements: 8, duration_months: 18 },
      { name: "PostgreSQL", proficiency: "advanced", endorsements: 15, duration_months: 36 },
      { name: "Kafka", proficiency: "intermediate", endorsements: 5, duration_months: 18 },
      { name: "Kubernetes", proficiency: "intermediate", endorsements: 4, duration_months: 12 },
    ],
    experience: [
      {
        role: "Lead Systems Engineer",
        company: "PayPulse (Startup)",
        duration: "2022 - Present",
        isCurrent: true,
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
    education: [
      { institution: "Nagpur University", degree: "B.C.A", fieldOfStudy: "Computer Applications", endYear: 2018, tier: "tier_3" }
    ],
    links: { github: "github.com/priyasharma" },
    location: "Bengaluru, India",
    isProcessed: true,
    hiddenGemScore: 94,
    adjacencyScore: 88,
    trajectoryNotes: "Exceptional growth velocity. Self-taught, tier-3 college, reached Lead Engineer at a fintech startup in 4 years."
  },
  {
    id: "c_002",
    name: "Rahul Mehta",
    role: "Software Engineer II",
    summary: "Experienced software engineer with a background in enterprise web applications.",
    skills: [
      { name: "Java", proficiency: "advanced", endorsements: 20, duration_months: 48 },
      { name: "Spring Boot", proficiency: "advanced", endorsements: 18, duration_months: 48 },
      { name: "React", proficiency: "intermediate", endorsements: 10, duration_months: 24 },
      { name: "SQL", proficiency: "intermediate", endorsements: 8, duration_months: 48 },
      { name: "AWS", proficiency: "beginner", endorsements: 3, duration_months: 12 },
    ],
    experience: [
      {
        role: "Software Engineer II",
        company: "Infosys",
        duration: "2021 - Present",
        isCurrent: true,
        description: "Part of the core team maintaining the internal HR portal.",
        bullets: [
          "Developed new REST APIs using Java and Spring Boot for the employee directory.",
          "Maintained React frontend components for the leave management system."
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
    education: [
      { institution: "IIT Bombay", degree: "B.Tech Computer Science", fieldOfStudy: "Computer Science", endYear: 2019, tier: "tier_1" }
    ],
    links: { github: "github.com/rahulm" },
    location: "Mumbai, India",
    isProcessed: true,
    hiddenGemScore: 40,
    adjacencyScore: 50,
    trajectoryNotes: "Standard trajectory. Good pedigree but slower progression and consulting-heavy stack."
  },
  {
    id: "c_003",
    name: "Anjali Deshmukh",
    role: "Frontend Architect",
    summary: "Pixel-perfect frontend engineer focusing on accessibility and design systems.",
    skills: [
      { name: "TypeScript", proficiency: "expert", endorsements: 25, duration_months: 36 },
      { name: "React", proficiency: "expert", endorsements: 30, duration_months: 48 },
      { name: "Next.js", proficiency: "advanced", endorsements: 15, duration_months: 24 },
      { name: "Tailwind CSS", proficiency: "advanced", endorsements: 12, duration_months: 24 },
      { name: "Figma", proficiency: "intermediate", endorsements: 8, duration_months: 18 },
    ],
    experience: [
      {
        role: "Senior Frontend Engineer",
        company: "CRED",
        duration: "2022 - Present",
        isCurrent: true,
        description: "Leading the transition to a unified design system.",
        bullets: [
          "Built a component library used by 50+ engineers.",
          "Reduced bundle size by 30% through dynamic imports.",
          "Mentored junior engineers on accessibility best practices."
        ]
      }
    ],
    education: [
      { institution: "Masai School", degree: "Bootcamp Graduate", fieldOfStudy: "Full Stack Development", endYear: 2020, tier: "unknown" }
    ],
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
    skills: [
      { name: "Python", proficiency: "advanced", endorsements: 18, duration_months: 36 },
      { name: "Django", proficiency: "advanced", endorsements: 14, duration_months: 36 },
      { name: "Vue.js", proficiency: "intermediate", endorsements: 6, duration_months: 18 },
      { name: "Docker", proficiency: "intermediate", endorsements: 8, duration_months: 24 },
      { name: "AWS", proficiency: "intermediate", endorsements: 5, duration_months: 18 },
    ],
    experience: [
      {
        role: "Founding Engineer",
        company: "HealthTech Startup",
        duration: "2021 - Present",
        isCurrent: true,
        description: "First technical hire, built the MVP from scratch.",
        bullets: [
          "Architected HIPAA-compliant backend using Django and AWS.",
          "Built real-time chat feature using WebSockets.",
          "Set up CI/CD pipelines using GitHub Actions."
        ]
      }
    ],
    education: [
      { institution: "NIT Trichy", degree: "B.Tech IT", fieldOfStudy: "Information Technology", endYear: 2020, tier: "tier_1" }
    ],
    links: { github: "github.com/vikrams" },
    location: "Hyderabad, India",
    isProcessed: true,
    hiddenGemScore: 65,
    adjacencyScore: 80,
    trajectoryNotes: "Solid founding engineer experience taking a product from 0 to 1."
  }
];
