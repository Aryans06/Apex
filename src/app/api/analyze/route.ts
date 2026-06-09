import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type GeminiPart =
  | { text: string; inlineData?: never }
  | { inlineData: { mimeType: string; data: string }; text?: never };

interface RawSkill {
  name?: string;
  proficiency?: string;
  endorsements?: number;
  duration_months?: number;
}

interface RawExperience {
  role?: string;
  company?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  durationMonths?: number;
  isCurrent?: boolean;
  industry?: string;
  description?: string;
  bullets?: string[];
}

interface RawEducation {
  institution?: string;
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  year?: string;
  grade?: string;
  tier?: string;
}

interface GeminiResumeResponse {
  name?: string;
  headline?: string;
  role?: string;
  summary?: string;
  yearsOfExperience?: number;
  currentCompany?: string;
  currentIndustry?: string;
  skills?: (RawSkill | string)[];
  experience?: RawExperience[];
  education?: RawEducation | RawEducation[];
  links?: { github?: string; portfolio?: string };
  location?: string;
  hiddenGemScore?: number;
  adjacencyScore?: number;
  trajectoryNotes?: string;
  redFlags?: string[];
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;

    const resumeText = textInput || "";
    let pdfBase64: string | null = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      pdfBase64 = buffer.toString("base64");
    }

    if (!resumeText.trim() && !pdfBase64) {
      return NextResponse.json({ error: "Missing resume text or file" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const instruction = `You are an ATS for the Indian tech ecosystem. Analyze this resume and return a JSON object.

IMPORTANT: Keep ALL text fields SHORT and CONCISE.
- "summary": Max 2 short sentences (under 30 words total).
- "trajectoryNotes": Max 2 short sentences (under 30 words total).
- "description" in experience: Max 1 sentence (under 15 words).
- "bullets" in experience: Max 3 bullets, each under 15 words.
- "skills": Max 10 most relevant skills with proficiency estimate.
- "redFlags": Array of strings, each under 10 words. Max 4 flags. Empty array if clean.

CRITICAL DATE RULE: Use null for ANY date or duration field NOT explicitly written in the resume.
- Never infer, guess, or estimate startDate, endDate, startYear, endYear, or durationMonths.
- For "duration", use only the exact text from the resume (e.g. "3 years", "2021–2023"). If no duration text exists, use null.
- For "yearsOfExperience", use only a figure explicitly stated or trivially summed from stated durations; otherwise use null.

Look for: Growth Velocity, Skill Adjacency, Trajectory (self-taught vs pedigree), Indian context (Tier-1/2/3).
For institution tier: tier_1 = IITs, IIMs, NITs top-tier; tier_2 = state engineering colleges, BITS; tier_3 = private colleges; tier_4 = unknown/local.

Return ONLY this JSON structure, no markdown:
{
  "name": "Full Name",
  "headline": "One-line professional headline",
  "role": "Current/recent job title",
  "summary": "Brief 2-sentence summary",
  "yearsOfExperience": 5.5,
  "currentCompany": "Company name",
  "currentIndustry": "Industry",
  "skills": [
    {"name": "Python", "proficiency": "advanced", "endorsements": 0, "duration_months": 36}
  ],
  "experience": [
    {"role": "Title", "company": "Company", "duration": "exact text from resume or null", "startDate": null, "endDate": null, "durationMonths": null, "isCurrent": false, "industry": "FinTech", "description": "Brief desc", "bullets": ["Short achievement"]}
  ],
  "education": [
    {"institution": "University Name", "degree": "B.Tech Computer Science", "fieldOfStudy": "CS", "startYear": null, "endYear": null, "grade": "8.5 CGPA", "tier": "tier_2"}
  ],
  "links": {"github": "url or empty", "portfolio": "url or empty"},
  "location": "City, Country",
  "hiddenGemScore": 0-100,
  "adjacencyScore": 0-100,
  "trajectoryNotes": "Brief 2-sentence explanation",
  "redFlags": ["Flag if any"]
}

Proficiency scale: beginner | intermediate | advanced | expert
duration_months: estimate only from explicitly stated durations; use 0 if unknown.`;

    const parts: GeminiPart[] = [];

    if (pdfBase64) {
      parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
    }

    if (resumeText.trim()) {
      parts.push({ text: `Resume Text:\n${resumeText}` });
    }

    parts.push({ text: instruction });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
    });

    const text = (response.text ?? "").trim();
    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let d: GeminiResumeResponse;
    try {
      d = JSON.parse(cleanText) as GeminiResumeResponse;
    } catch {
      console.error("Failed to parse Gemini output:", cleanText.substring(0, 500));
      throw new Error("Invalid JSON from AI");
    }

    const skills = Array.isArray(d.skills)
      ? d.skills.slice(0, 10).map((s: RawSkill | string) =>
          typeof s === "string"
            ? { name: s, proficiency: "intermediate", endorsements: 0, duration_months: 0 }
            : { name: s.name || s, proficiency: s.proficiency || "intermediate", endorsements: s.endorsements || 0, duration_months: s.duration_months || 0 }
        )
      : [];

    const saved = await db.candidate.create({
      data: {
        name: d.name || "Unknown Candidate",
        headline: d.headline || null,
        role: d.role || "Software Engineer",
        summary: (d.summary || "").substring(0, 400),
        skills: JSON.stringify(skills),
        location: d.location || null,
        isProcessed: true,
        yearsOfExperience: typeof d.yearsOfExperience === "number" ? d.yearsOfExperience : null,
        currentCompany: d.currentCompany || null,
        currentIndustry: d.currentIndustry || null,
        hiddenGemScore: d.hiddenGemScore ?? null,
        trajectoryNotes: (d.trajectoryNotes || "").substring(0, 400) || null,
        adjacencyScore: d.adjacencyScore ?? null,
        redFlags: JSON.stringify(Array.isArray(d.redFlags) ? d.redFlags.slice(0, 4) : []),
        githubUrl: d.links?.github || null,
        portfolioUrl: d.links?.portfolio || null,
        experiences: {
          create: (d.experience || []).slice(0, 6).map((exp: RawExperience) => ({
            role: exp.role || "",
            company: exp.company || "",
            duration: exp.duration || "",
            startDate: exp.startDate || null,
            endDate: exp.endDate || null,
            durationMonths: exp.durationMonths ?? null,
            isCurrent: exp.isCurrent ?? false,
            industry: exp.industry || null,
            description: (exp.description || "").substring(0, 300),
            bullets: JSON.stringify((exp.bullets || []).slice(0, 3))
          }))
        },
        education: {
          create: (Array.isArray(d.education) ? d.education : d.education ? [d.education] : [])
            .slice(0, 3)
            .map((ed: RawEducation): Prisma.EducationRecordCreateWithoutCandidateInput => ({
              institution: ed.institution || ed.school || "",
              degree: ed.degree || "",
              fieldOfStudy: ed.fieldOfStudy || null,
              startYear: ed.startYear ?? null,
              endYear: ed.endYear ?? (ed.year ? parseInt(ed.year) : null),
              grade: ed.grade || null,
              tier: ed.tier || null
            }))
        }
      },
      include: { experiences: true, education: true }
    });

    return NextResponse.json({
      id: saved.id,
      candidateId: saved.candidateId,
      name: saved.name,
      headline: saved.headline,
      role: saved.role,
      summary: saved.summary,
      skills: JSON.parse(saved.skills),
      location: saved.location,
      isProcessed: saved.isProcessed,
      yearsOfExperience: saved.yearsOfExperience,
      currentCompany: saved.currentCompany,
      currentIndustry: saved.currentIndustry,
      hiddenGemScore: saved.hiddenGemScore,
      trajectoryNotes: saved.trajectoryNotes,
      adjacencyScore: saved.adjacencyScore,
      redFlags: saved.redFlags ? JSON.parse(saved.redFlags) : [],
      links: { github: saved.githubUrl || "", portfolio: saved.portfolioUrl || undefined },
      experience: saved.experiences.map(e => ({
        role: e.role, company: e.company, duration: e.duration,
        startDate: e.startDate, endDate: e.endDate, durationMonths: e.durationMonths,
        isCurrent: e.isCurrent, industry: e.industry,
        description: e.description, bullets: JSON.parse(e.bullets)
      })),
      education: saved.education.map(ed => ({
        id: ed.id, institution: ed.institution, degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy, startYear: ed.startYear,
        endYear: ed.endYear, grade: ed.grade, tier: ed.tier
      }))
    });

  } catch (error) {
    console.error("Analyze API Error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
