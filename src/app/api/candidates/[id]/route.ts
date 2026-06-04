import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await db.candidate.findUnique({
      where: { id },
      include: { experiences: true, education: true, notes: { orderBy: { createdAt: "desc" } } },
    });
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: c.id,
      name: c.name,
      role: c.role,
      summary: c.summary,
      skills: c.skills.split(",").map((s) => s.trim()).filter(Boolean),
      location: c.location,
      isProcessed: c.isProcessed,
      hiddenGemScore: c.hiddenGemScore,
      trajectoryNotes: c.trajectoryNotes,
      adjacencyScore: c.adjacencyScore,
      pipelineStage: c.pipelineStage,
      redFlags: c.redFlags ? JSON.parse(c.redFlags) : [],
      createdAt: c.createdAt,
      links: { github: c.githubUrl || "", portfolio: c.portfolioUrl || undefined },
      experience: c.experiences.map((e) => ({
        role: e.role, company: e.company, duration: e.duration,
        description: e.description, bullets: JSON.parse(e.bullets),
      })),
      education: c.education
        ? { degree: c.education.degree, school: c.education.school, year: c.education.year }
        : { degree: "", school: "", year: "" },
      notes: c.notes.map((n) => ({ id: n.id, content: n.content, createdAt: n.createdAt })),
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
