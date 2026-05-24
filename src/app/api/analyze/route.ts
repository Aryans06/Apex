import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Candidate } from "@/lib/data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Missing resume text" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback response for hackathon demo if no API key is provided
      const fallbackCandidate: Candidate = {
        id: "c_" + Math.random().toString(36).substr(2, 9),
        name: "Demo Candidate (No API Key)",
        role: "Senior Software Engineer",
        summary: "This is a mock response because GEMINI_API_KEY is not set.",
        skills: ["JavaScript", "React", "Node.js"],
        experience: [
          {
            role: "Developer",
            company: "Tech Corp",
            duration: "2020 - 2023",
            description: "Built web applications.",
            bullets: ["Wrote code", "Fixed bugs"]
          }
        ],
        education: {
          degree: "B.S. CS",
          school: "Demo University",
          year: "2020"
        },
        links: { github: "github.com/demo" },
        isProcessed: true,
        hiddenGemScore: 45,
        adjacencyScore: 50,
        trajectoryNotes: "Standard trajectory detected."
      };
      return NextResponse.json(fallbackCandidate);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      You are an elite Applicant Tracking System designed to find "Hidden Gems".
      Analyze the following resume text and output a JSON representation of the candidate.
      
      Look specifically for:
      1. Growth Velocity: Did they get promoted quickly? Did their scope increase fast?
      2. Skill Adjacency: Do their tools/languages indicate strong foundational engineering (e.g. Rust/C++) even if they don't match standard web dev keywords?
      3. Trajectory: Is this person a self-taught underdog who built complex things, or a standard pedigree candidate?
      
      Resume Text:
      """
      ${resumeText}
      """
      
      Return ONLY a JSON object with this exact structure:
      {
        "id": "generate a random string like c_123",
        "name": "Candidate Name",
        "role": "Most recent or most prominent role",
        "summary": "A 2-sentence summary of their profile",
        "skills": ["Array", "of", "skills"],
        "experience": [
          {
            "role": "Job Title",
            "company": "Company Name",
            "duration": "e.g., 2020 - 2023",
            "description": "Short description of the role",
            "bullets": ["Achievement 1", "Achievement 2"]
          }
        ],
        "education": {
          "degree": "Degree name",
          "school": "School name",
          "year": "Graduation year"
        },
        "links": {
          "github": "Any github/portfolio link found, or empty string"
        },
        "isProcessed": true,
        "hiddenGemScore": number between 0 and 100 (Score highly if they show rapid growth or complex systems work without traditional pedigree),
        "adjacencyScore": number between 0 and 100,
        "trajectoryNotes": "A 2-3 sentence explanation of WHY they got this hidden gem score. Be specific."
      }
      
      Do not include any markdown formatting like \`\`\`json. Just return the raw JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean up potential markdown wrapper
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanText));
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}
