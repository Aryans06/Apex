import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const records = await db.assessmentRecord.findMany({
      where: { candidateId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      records.map((r) => ({
        id: r.id,
        claim: r.claim,
        questions: JSON.parse(r.questions),
        sentToEmail: r.sentToEmail,
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error("Fetch assessments error:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}
