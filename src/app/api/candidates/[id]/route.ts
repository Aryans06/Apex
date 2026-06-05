import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseSkills(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw.split(",").filter(Boolean).map((s: string) => ({
      name: s.trim(), proficiency: "intermediate", endorsements: 0, duration_months: 0
    }));
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await db.candidate.findUnique({
      where: { id },
      include: {
        experiences: true,
        education: true,
        notes: { orderBy: { createdAt: "desc" } }
      },
    });
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
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
      currentCompanySize: c.currentCompanySize,
      currentIndustry: c.currentIndustry,
      hiddenGemScore: c.hiddenGemScore,
      trajectoryNotes: c.trajectoryNotes,
      adjacencyScore: c.adjacencyScore,
      pipelineStage: c.pipelineStage,
      redFlags: c.redFlags ? JSON.parse(c.redFlags) : [],
      redrobSignals: c.redrobSignals ? JSON.parse(c.redrobSignals) : undefined,
      createdAt: c.createdAt,
      links: { github: c.githubUrl || "", portfolio: c.portfolioUrl || undefined },
      experience: c.experiences.map(e => ({
        role: e.role,
        company: e.company,
        duration: e.duration,
        startDate: e.startDate,
        endDate: e.endDate,
        durationMonths: e.durationMonths,
        isCurrent: e.isCurrent,
        industry: e.industry,
        companySize: e.companySize,
        description: e.description,
        bullets: JSON.parse(e.bullets),
      })),
      education: c.education.map(ed => ({
        id: ed.id,
        institution: ed.institution,
        degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy,
        startYear: ed.startYear,
        endYear: ed.endYear,
        grade: ed.grade,
        tier: ed.tier,
      })),
      notes: c.notes.map(n => ({ id: n.id, content: n.content, createdAt: n.createdAt })),
    });
  } catch (error) {
    console.error("Fetch candidate error:", error);
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.candidate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete candidate error:", error);
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
  }
}
