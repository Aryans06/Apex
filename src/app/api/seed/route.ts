import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockCandidates } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const { dataset } = await req.json();

    const dataToSeed = dataset && Array.isArray(dataset) && dataset.length > 0 
      ? dataset 
      : mockCandidates;

    // Clear existing data for fresh seed
    await db.candidate.deleteMany();

    // Insert candidates
    for (const candidate of dataToSeed) {
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

    return NextResponse.json({ message: "Database seeded successfully", count: dataToSeed.length });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed" }, { status: 500 });
  }
}
