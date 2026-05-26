import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { claim } = await req.json();

    if (!claim) {
      return NextResponse.json({ error: "Missing claim" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found, returning mock response");
      return NextResponse.json({
        questions: [
          {
            q: `You mentioned: "${claim}". Can you walk me through the specific technical challenges you faced here?`,
            intent: "Verifies the candidate actually did the work rather than just participating."
          },
          {
            q: "What trade-offs did you have to consider when making this architectural decision?",
            intent: "Checks understanding of systems design and engineering trade-offs."
          },
          {
            q: "If you had to do this again with 10x the scale, what would break first and how would you fix it?",
            intent: "Validates deep understanding and foresight."
          }
        ]
      });
    }

    const prompt = `
      You are an elite, no-nonsense Senior Staff Engineer at a top-tier tech company.
      You are conducting a "Proof of Work" validation. 
      The candidate made the following claim on their resume:
      
      "${claim}"
      
      Your task is to generate exactly 3 highly specific, technical, and deep-dive interview questions 
      designed to verify if the candidate actually did this work themselves and understands the underlying mechanics.
      
      Do not ask generic behavioral questions (e.g., "What was the hardest part?").
      Ask questions about specific tools, potential bottlenecks, trade-offs, and internals relevant to the claim.
      
      Return ONLY a JSON array of objects with this exact structure:
      [
        {
          "q": "The specific technical question",
          "intent": "A brief explanation of what this question is trying to validate (e.g., 'Checks understanding of database internals.')"
        }
      ]
      
      Do not include any markdown formatting like \`\`\`json. Just return the raw JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = (response.text ?? "").trim();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    return NextResponse.json({ questions: JSON.parse(cleanText) });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate assessment" }, { status: 500 });
  }
}
