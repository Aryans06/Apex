import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_STAGES = ["applied", "screened", "interview", "offer", "hired", "rejected"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { stage } = await req.json();
    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    const updated = await db.candidate.update({
      where: { id },
      data: { pipelineStage: stage },
    });
    return NextResponse.json({ id: updated.id, pipelineStage: updated.pipelineStage });
  } catch (error) {
    console.error("Stage update error:", error);
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
  }
}
