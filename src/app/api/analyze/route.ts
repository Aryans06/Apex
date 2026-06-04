import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;

    let resumeText = textInput || "";
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
- "skills": Max 8 most relevant skills.
- "redFlags": Array of strings, each under 10 words. Max 4 flags. Only include if genuinely suspicious (unexplained gaps >1yr, job-hopping every <6mo, vague bullets with no metrics, title inflation). Empty array if clean resume.

Look for: Growth Velocity, Skill Adjacency, Trajectory (self-taught vs pedigree), Indian context (Tier-1/2/3, IIT vs bootcamp vs self-taught).

Return ONLY this JSON structure, no markdown:
{
  "name": "Name",
  "role": "Current/recent role",
  "summary": "Brief 2-sentence summary",
  "skills": ["skill1", "skill2"],
  "experience": [{"role": "Title", "company": "Company", "duration": "2020-2023", "description": "Brief desc", "bullets": ["Short achievement"]}],
  "education": {"degree": "Degree", "school": "School", "year": "Year"},
  "links": {"github": "url or empty"},
  "location": "City, Country",
  "hiddenGemScore": 0-100,
  "adjacencyScore": 0-100,
  "trajectoryNotes": "Brief 2-sentence explanation of score",
  "redFlags": ["Flag description if any"]
}`;

    // Build the request parts
    const parts: any[] = [];

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
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let candidateData;
    try {
      candidateData = JSON.parse(cleanText);
    } catch {
      console.error("Failed to parse Gemini output:", cleanText.substring(0, 500));
      throw new Error("Invalid JSON from AI");
    }

    // Persist to DB
    const savedCandidate = await db.candidate.create({
      data: {
        name: candidateData.name || "Unknown Candidate",
        role: candidateData.role || "Software Engineer",
        summary: (candidateData.summary || "").substring(0, 300),
        skills: Array.isArray(candidateData.skills) ? candidateData.skills.slice(0, 8).join(",") : "",
        location: candidateData.location,
        isProcessed: true,
        hiddenGemScore: candidateData.hiddenGemScore,
        trajectoryNotes: (candidateData.trajectoryNotes || "").substring(0, 300),
        adjacencyScore: candidateData.adjacencyScore,
        redFlags: JSON.stringify(Array.isArray(candidateData.redFlags) ? candidateData.redFlags.slice(0, 4) : []),
        githubUrl: candidateData.links?.github,
        portfolioUrl: candidateData.links?.portfolio,
        experiences: {
          create: (candidateData.experience || []).slice(0, 4).map((exp: any) => ({
            role: exp.role || "",
            company: exp.company || "",
            duration: exp.duration || "",
            description: (exp.description || "").substring(0, 200),
            bullets: JSON.stringify((exp.bullets || []).slice(0, 3))
          }))
        },
        education: candidateData.education ? {
          create: {
            degree: candidateData.education.degree || "",
            school: candidateData.education.school || "",
            year: candidateData.education.year || ""
          }
        } : undefined
      },
      include: {
        experiences: true,
        education: true
      }
    });

    const formatted = {
      id: savedCandidate.id,
      name: savedCandidate.name,
      role: savedCandidate.role,
      summary: savedCandidate.summary,
      skills: savedCandidate.skills.split(",").filter(Boolean),
      location: savedCandidate.location,
      isProcessed: savedCandidate.isProcessed,
      hiddenGemScore: savedCandidate.hiddenGemScore,
      trajectoryNotes: savedCandidate.trajectoryNotes,
      adjacencyScore: savedCandidate.adjacencyScore,
      links: {
        github: savedCandidate.githubUrl || "",
        portfolio: savedCandidate.portfolioUrl || undefined
      },
      experience: savedCandidate.experiences.map(e => ({
        role: e.role,
        company: e.company,
        duration: e.duration,
        description: e.description,
        bullets: JSON.parse(e.bullets)
      })),
      education: savedCandidate.education ? {
        degree: savedCandidate.education.degree,
        school: savedCandidate.education.school,
        year: savedCandidate.education.year
      } : { degree: "", school: "", year: "" }
    };

    return NextResponse.json(formatted);
    
  } catch (error) {
    console.error("Analyze API Error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
