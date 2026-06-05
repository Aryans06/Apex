import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockCandidates } from "@/lib/data";

function parseSkills(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw.split(",").filter(Boolean).map((s: string) => ({
      name: s.trim(), proficiency: "intermediate", endorsements: 0, duration_months: 0
    }));
  }
}

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
            headline: candidate.headline,
            summary: candidate.summary,
            skills: JSON.stringify(candidate.skills),
            location: candidate.location,
            country: candidate.country,
            isProcessed: candidate.isProcessed,
            yearsOfExperience: candidate.yearsOfExperience,
            currentCompany: candidate.currentCompany,
            currentIndustry: candidate.currentIndustry,
            hiddenGemScore: candidate.hiddenGemScore,
            trajectoryNotes: candidate.trajectoryNotes,
            adjacencyScore: candidate.adjacencyScore,
            githubUrl: candidate.links?.github,
            portfolioUrl: candidate.links?.portfolio,
            experiences: {
              create: candidate.experience.map(exp => ({
                role: exp.role,
                company: exp.company,
                duration: exp.duration,
                startDate: exp.startDate,
                endDate: exp.endDate,
                durationMonths: exp.durationMonths,
                isCurrent: exp.isCurrent ?? false,
                industry: exp.industry,
                companySize: exp.companySize,
                description: exp.description,
                bullets: JSON.stringify(exp.bullets)
              }))
            },
            education: {
              create: candidate.education.map(ed => ({
                institution: ed.institution,
                degree: ed.degree,
                fieldOfStudy: ed.fieldOfStudy,
                startYear: ed.startYear,
                endYear: ed.endYear,
                grade: ed.grade,
                tier: ed.tier
              }))
            }
          }
        });
      }
      candidates = await db.candidate.findMany({
        include: { experiences: true, education: true }
      });
    }

    const formatted = candidates.map(c => ({
      id: c.id,
      candidateId: c.candidateId,
      name: c.name,
      headline: c.headline,
      role: c.role,
      summary: c.summary,
      skills: parseSkills(c.skills),
      location: c.location,
      country: c.country,
      isProcessed: c.isProcessed,
      yearsOfExperience: c.yearsOfExperience,
      currentCompany: c.currentCompany,
      currentIndustry: c.currentIndustry,
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
        startDate: e.startDate,
        endDate: e.endDate,
        durationMonths: e.durationMonths,
        isCurrent: e.isCurrent,
        industry: e.industry,
        description: e.description,
        bullets: JSON.parse(e.bullets)
      })),
      education: c.education.map(ed => ({
        id: ed.id,
        institution: ed.institution,
        degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy,
        startYear: ed.startYear,
        endYear: ed.endYear,
        grade: ed.grade,
        tier: ed.tier
      })),
      redrobSignals: c.redrobSignals ? JSON.parse(c.redrobSignals) : undefined
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch candidates error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}
