import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }
    const note = await db.candidateNote.create({
      data: { candidateId: id, content: content.trim() },
    });
    return NextResponse.json({ id: note.id, content: note.content, createdAt: note.createdAt });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await params;
    const { noteId } = await req.json();
    if (!noteId) return NextResponse.json({ error: "noteId required" }, { status: 400 });
    await db.candidateNote.delete({ where: { id: noteId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
