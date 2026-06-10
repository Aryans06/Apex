import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockCandidates } from "@/lib/data";
import { computeAdjacencyScore } from "@/lib/adjacency";

// Normalizes either dataset format (profile + career_history) or mock format into a common shape
function normalizeCandidate(c: any) {
  if (c.profile && c.career_history) {
    return {
      candidateId: c.candidate_id || undefined,
      name: c.profile.anonymized_name || "Unknown Candidate",
      headline: c.profile.headline || null,
      role: c.profile.current_title || "Software Engineer",
      summary: c.profile.summary || "",
      location: c.profile.location || null,
      country: c.profile.country || null,
      yearsOfExperience: c.profile.years_of_experience ?? null,
      currentCompany: c.profile.current_company || null,
      currentCompanySize: c.profile.current_company_size || null,
      currentIndustry: c.profile.current_industry || null,
      skills: c.skills || [],
      experience: (c.career_history || []).map((h: any) => ({
        role: h.title || "",
        company: h.company || "",
        duration: h.start_date ? `${h.start_date.slice(0, 7)} - ${h.end_date ? h.end_date.slice(0, 7) : "Present"}` : "",
        startDate: h.start_date || null,
        endDate: h.end_date || null,
        durationMonths: h.duration_months ?? null,
        isCurrent: h.is_current ?? false,
        industry: h.industry || null,
        companySize: h.company_size || null,
        description: h.description || "",
        bullets: h.description ? [h.description] : [],
      })),
      education: (c.education || []).map((e: any) => ({
        institution: e.institution || "",
        degree: e.degree || "",
        fieldOfStudy: e.field_of_study || null,
        startYear: e.start_year ?? null,
        endYear: e.end_year ?? null,
        grade: e.grade || null,
        tier: e.tier || null,
      })),
      links: { github: "", portfolio: "" },
      isProcessed: true,
      hiddenGemScore: c.hiddenGemScore ?? null,
      adjacencyScore: c.adjacencyScore ?? null,
      trajectoryNotes: c.trajectoryNotes || null,
      redrobSignals: c.redrob_signals || c.redrobSignals || null,
    };
  }
  // Mock / already-normalized format
  return c;
}

export async function POST(req: Request) {
  try {
    const { dataset } = await req.json();

    const raw = dataset && Array.isArray(dataset) && dataset.length > 0
      ? dataset
      : mockCandidates;

    const dataToSeed = raw.map(normalizeCandidate);

    await db.candidate.deleteMany();

    for (const candidate of dataToSeed) {
      const skillObjs = Array.isArray(candidate.skills)
        ? (candidate.skills[0] && typeof candidate.skills[0] === "object"
            ? candidate.skills
            : candidate.skills.map((s: string) => ({ name: s, proficiency: "intermediate", endorsements: 0, duration_months: 0 })))
        : [];
      const skillsJson = JSON.stringify(skillObjs);

      const educationArray = Array.isArray(candidate.education)
        ? candidate.education
        : candidate.education
          ? [{ institution: (candidate.education as any).school || (candidate.education as any).institution || "", degree: (candidate.education as any).degree, endYear: parseInt((candidate.education as any).year) || undefined }]
          : [];

      await db.candidate.create({
        data: {
          candidateId: candidate.candidateId || undefined,
          name: candidate.name,
          role: candidate.role,
          headline: candidate.headline,
          summary: candidate.summary,
          skills: skillsJson,
          location: candidate.location,
          country: candidate.country,
          isProcessed: candidate.isProcessed ?? true,
          yearsOfExperience: candidate.yearsOfExperience,
          currentCompany: candidate.currentCompany,
          currentCompanySize: candidate.currentCompanySize,
          currentIndustry: candidate.currentIndustry,
          hiddenGemScore: candidate.hiddenGemScore,
          trajectoryNotes: candidate.trajectoryNotes,
          adjacencyScore: computeAdjacencyScore(skillObjs),
          githubUrl: candidate.links?.github || null,
          portfolioUrl: candidate.links?.portfolio || null,
          redrobSignals: candidate.redrobSignals ? JSON.stringify(candidate.redrobSignals) : undefined,
          experiences: {
            create: (candidate.experience || []).map((exp: any) => ({
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
              bullets: JSON.stringify(exp.bullets?.length ? exp.bullets : exp.description ? [exp.description] : [])
            }))
          },
          education: {
            create: educationArray.map((ed: any) => ({
              institution: ed.institution || ed.school || "",
              degree: ed.degree || "",
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

    return NextResponse.json({ message: "Database seeded successfully", count: dataToSeed.length });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed" }, { status: 500 });
  }
}
