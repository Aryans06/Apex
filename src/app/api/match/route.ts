import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;
    const candidatesStr = formData.get("candidates") as string | null;

    let jobDescription = textInput || "";
    let pdfBase64: string | null = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      pdfBase64 = buffer.toString("base64");
    }

    if (!jobDescription.trim() && !pdfBase64) {
      return NextResponse.json({ error: "Missing job description" }, { status: 400 });
    }

    if (!candidatesStr) {
      return NextResponse.json({ error: "Missing candidates" }, { status: 400 });
    }

    let candidates;
    try {
      candidates = JSON.parse(candidatesStr);
    } catch {
      return NextResponse.json({ error: "Invalid candidates JSON" }, { status: 400 });
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: "No candidates to match" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    // Build candidate summaries for Gemini
    const candidateSummaries = candidates.map((c: any) => 
      `ID: ${c.id} | ${c.name} | ${c.role} | Skills: ${c.skills.join(", ")} | ${c.summary}`
    ).join("\n");

    const instruction = `You are an AI recruiter for the Indian tech ecosystem. Rank these candidates against the job description.

IMPORTANT: Keep "reasoning" to exactly 1-2 SHORT sentences (under 25 words). Be direct.

Score each candidate on technicalFit (0-100), trajectoryFit (0-100), culturalFit (0-100).
overallScore = technical 40% + trajectory 35% + cultural 25%.
Mark top 2 as shortlisted.

Candidates:
${candidateSummaries}

Return ONLY this JSON, no markdown:
{"rankings": [{"candidateId": "id", "overallScore": 85, "technicalFit": 80, "trajectoryFit": 90, "culturalFit": 85, "reasoning": "Brief reason.", "isShortlisted": true}]}

Sort by overallScore descending.`;

    // Build request parts
    const parts: any[] = [];

    if (pdfBase64) {
      parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
    }

    if (jobDescription.trim()) {
      parts.push({ text: `Job Description:\n${jobDescription}` });
    }

    parts.push({ text: instruction });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
    });

    const text = (response.text ?? "").trim();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanText));
    
  } catch (error) {
    console.error("Gemini Match API Error:", error);
    return NextResponse.json({ error: "Failed to match candidates" }, { status: 500 });
  }
}
