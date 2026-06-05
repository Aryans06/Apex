import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockCandidates } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const { dataset } = await req.json();

    const dataToSeed = dataset && Array.isArray(dataset) && dataset.length > 0
      ? dataset
      : mockCandidates;

    await db.candidate.deleteMany();

    for (const candidate of dataToSeed) {
      const skillsJson = Array.isArray(candidate.skills)
        ? JSON.stringify(
            candidate.skills[0] && typeof candidate.skills[0] === "object"
              ? candidate.skills
              : candidate.skills.map((s: string) => ({ name: s, proficiency: "intermediate", endorsements: 0, duration_months: 0 }))
          )
        : JSON.stringify([]);

      const educationArray = Array.isArray(candidate.education)
        ? candidate.education
        : candidate.education
          ? [{ institution: candidate.education.school || candidate.education.institution || "", degree: candidate.education.degree, endYear: parseInt(candidate.education.year) || undefined }]
          : [];

      await db.candidate.create({
        data: {
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
          adjacencyScore: candidate.adjacencyScore,
          githubUrl: candidate.links?.github,
          portfolioUrl: candidate.links?.portfolio,
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
              bullets: JSON.stringify(exp.bullets || [])
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
