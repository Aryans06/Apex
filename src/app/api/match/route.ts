import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { jobDescription, candidates } = await req.json();

    if (!jobDescription || !candidates || candidates.length === 0) {
      return NextResponse.json({ error: "Missing job description or candidates" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock fallback for demo without API key
      const mockRanked = candidates.map((c: any, i: number) => ({
        candidateId: c.id,
        overallScore: Math.max(95 - i * 15, 20),
        technicalFit: Math.max(90 - i * 12, 15),
        trajectoryFit: Math.max(92 - i * 10, 25),
        culturalFit: Math.max(88 - i * 8, 30),
        reasoning: `Mock analysis: ${c.name} shows ${i === 0 ? 'exceptional' : i === 1 ? 'strong' : 'moderate'} alignment with the role requirements.`,
        isShortlisted: i < 2,
      }));
      return NextResponse.json({ rankings: mockRanked });
    }

    // Build candidate summaries for Gemini
    const candidateSummaries = candidates.map((c: any) => 
      `ID: ${c.id} | Name: ${c.name} | Role: ${c.role} | Skills: ${c.skills.join(", ")} | Summary: ${c.summary} | Experience: ${c.experience.map((e: any) => `${e.role} at ${e.company} (${e.duration}): ${e.bullets.join("; ")}`).join(" | ")} | Education: ${c.education.degree} from ${c.education.school}`
    ).join("\n\n");

    const prompt = `
      You are an expert AI recruiter for the Indian tech ecosystem. 
      Your job is to DEEPLY UNDERSTAND a job description and then rank candidates by semantic fit — 
      not just keyword matching, but understanding what the role TRULY needs.
      
      ## Job Description:
      """
      ${jobDescription}
      """
      
      ## Candidate Pool:
      ${candidateSummaries}
      
      ## Your Task:
      1. First, parse the JD to understand: hard requirements, nice-to-haves, cultural signals, team dynamics, and growth expectations.
      2. For EACH candidate, score them on:
         - technicalFit (0-100): How well do their skills and experience match the technical needs? Consider skill adjacency (e.g. Rust experience is strong signal for Go roles).
         - trajectoryFit (0-100): Does their career trajectory suggest they can grow into this role? Fast promotions, increasing scope, and self-driven learning count heavily.
         - culturalFit (0-100): Do their background signals (startup vs enterprise, self-taught vs formal, team lead experience) match the JD's cultural needs?
      3. Compute overallScore as a weighted average: technical 40%, trajectory 35%, cultural 25%.
      4. Mark the top 2 candidates as shortlisted.
      5. Provide a 2-sentence reasoning for each candidate explaining WHY they scored the way they did.
      
      Return ONLY a JSON object with this structure:
      {
        "rankings": [
          {
            "candidateId": "c_001",
            "overallScore": 92,
            "technicalFit": 88,
            "trajectoryFit": 96,
            "culturalFit": 90,
            "reasoning": "Specific 2-sentence explanation.",
            "isShortlisted": true
          }
        ]
      }
      
      Sort by overallScore descending. Do not include markdown formatting. Return raw JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = (response.text ?? "").trim();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanText));
    
  } catch (error) {
    console.error("Gemini Match API Error:", error);
    return NextResponse.json({ error: "Failed to match candidates" }, { status: 500 });
  }
}
