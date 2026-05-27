import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockCandidates } from "@/lib/data";

export async function GET() {
  try {
    let candidates = await db.candidate.findMany({
      include: { experiences: true, education: true }
    });

    // Auto-seed for hackathon demo if empty
    if (candidates.length === 0) {
      console.log("Database empty, auto-seeding mock candidates...");
      for (const candidate of mockCandidates) {
        await db.candidate.create({
          data: {
            name: candidate.name,
            role: candidate.role,
            summary: candidate.summary,
            skills: candidate.skills.join(","),
            location: candidate.location,
            isProcessed: candidate.isProcessed,
            hiddenGemScore: candidate.hiddenGemScore,
            trajectoryNotes: candidate.trajectoryNotes,
            adjacencyScore: candidate.adjacencyScore,
            githubUrl: candidate.links?.github,
            portfolioUrl: candidate.links?.portfolio,
            experiences: {
              create: candidate.experience.map((exp: any) => ({
                role: exp.role,
                company: exp.company,
                duration: exp.duration,
                description: exp.description,
                bullets: JSON.stringify(exp.bullets)
              }))
            },
            education: candidate.education ? {
              create: {
                degree: candidate.education.degree,
                school: candidate.education.school,
                year: candidate.education.year
              }
            } : undefined
          }
        });
      }
      candidates = await db.candidate.findMany({
        include: { experiences: true, education: true }
      });
    }

    const formatted = candidates.map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      summary: c.summary,
      skills: c.skills.split(",").map(s => s.trim()).filter(Boolean),
      location: c.location,
      isProcessed: c.isProcessed,
      hiddenGemScore: c.hiddenGemScore,
      trajectoryNotes: c.trajectoryNotes,
      adjacencyScore: c.adjacencyScore,
      links: {
        github: c.githubUrl || "",
        portfolio: c.portfolioUrl || undefined
      },
      experience: c.experiences.map(e => ({
        role: e.role,
        company: e.company,
        duration: e.duration,
        description: e.description,
        bullets: JSON.parse(e.bullets)
      })),
      education: c.education ? {
        degree: c.education.degree,
        school: c.education.school,
        year: c.education.year
      } : { degree: "", school: "", year: "" }
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch candidates error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}
