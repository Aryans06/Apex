import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { candidateName, candidateRole, candidateSummary, emailType, recruiterName } = await req.json();

    if (!candidateName || !emailType) {
      return NextResponse.json({ error: "candidateName and emailType required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const typeInstructions: Record<string, string> = {
      intro: "Write a warm, personalized recruiter outreach email inviting this candidate to explore an opportunity. Reference their specific background.",
      rejection: "Write a professional, empathetic rejection email that is respectful and keeps the door open for future opportunities. Do not be generic.",
      offer: "Write an enthusiastic offer extension email congratulating the candidate and expressing genuine excitement about having them join.",
      interview: "Write a concise interview invitation email with a professional but friendly tone, asking for their availability.",
    };

    const prompt = `You are a senior recruiter writing a ${emailType} email.

Candidate: ${candidateName}
Role: ${candidateRole || "Software Engineer"}
Background: ${candidateSummary || "Experienced developer"}
Recruiter name: ${recruiterName || "The Hiring Team"}

${typeInstructions[emailType] || typeInstructions.intro}

Return ONLY a JSON object with these fields:
{
  "subject": "Email subject line",
  "body": "Full email body with proper line breaks (use \\n)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = (response.text ?? "").trim().replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Outreach API error:", error);
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 });
  }
}
