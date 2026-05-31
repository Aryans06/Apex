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

    if (file) {
      if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
        (global as any).DOMMatrix = class DOMMatrix {};
      }
      const pdfParse = require("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdfParse(buffer);
      resumeText += "\n" + data.text;
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Missing resume text or file" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const prompt = `
      You are an elite Applicant Tracking System designed to find "Hidden Gems" in the Indian tech ecosystem.
      Analyze the following resume text and output a JSON representation of the candidate.
      
      Look specifically for:
      1. Growth Velocity: Did they get promoted quickly? Did their scope increase fast?
      2. Skill Adjacency: Do their tools/languages indicate strong foundational engineering (e.g. Rust/C++) even if they don't match standard web dev keywords?
      3. Trajectory: Is this person a self-taught underdog who built complex things, or a standard pedigree candidate?
      4. Indian Context: Consider Tier-1/2/3 city backgrounds, IIT/NIT vs bootcamp vs self-taught, startup vs service company experience.
      
      Resume Text:
      """
      ${resumeText}
      """
      
      Return ONLY a JSON object with this exact structure:
      {
        "id": "generate a random string like c_abc123",
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
        "location": "City, Country",
        "isProcessed": true,
        "hiddenGemScore": number between 0 and 100,
        "adjacencyScore": number between 0 and 100,
        "trajectoryNotes": "A 2-3 sentence explanation of WHY they got this hidden gem score. Be specific."
      }
      
      Do not include any markdown formatting like \`\`\`json. Just return the raw JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = (response.text ?? "").trim();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let candidateData;
    try {
      candidateData = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini output:", cleanText);
      throw new Error("Invalid JSON from AI");
    }

    // Persist to DB
    const savedCandidate = await db.candidate.create({
      data: {
        name: candidateData.name || "Unknown Candidate",
        role: candidateData.role || "Software Engineer",
        summary: candidateData.summary || "",
        skills: Array.isArray(candidateData.skills) ? candidateData.skills.join(",") : "",
        location: candidateData.location,
        isProcessed: true,
        hiddenGemScore: candidateData.hiddenGemScore,
        trajectoryNotes: candidateData.trajectoryNotes,
        adjacencyScore: candidateData.adjacencyScore,
        githubUrl: candidateData.links?.github,
        portfolioUrl: candidateData.links?.portfolio,
        experiences: {
          create: (candidateData.experience || []).map((exp: any) => ({
            role: exp.role || "",
            company: exp.company || "",
            duration: exp.duration || "",
            description: exp.description || "",
            bullets: JSON.stringify(exp.bullets || [])
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
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}
