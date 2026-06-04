import { NextResponse } from "next/server";

// Bulk analyze: accepts multiple files, calls /api/analyze for each sequentially
// Returns a streaming-friendly array of results
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const texts = formData.getAll("texts") as string[];

    const items: Array<{ file?: File; text?: string }> = [];
    for (const f of files) items.push({ file: f });
    for (const t of texts) if (t.trim()) items.push({ text: t });

    if (items.length === 0) {
      return NextResponse.json({ error: "No files or texts provided" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const results: Array<{ name: string; status: "ok" | "error"; data?: unknown; error?: string }> = [];

    for (const item of items) {
      const fd = new FormData();
      const label = item.file ? item.file.name : "text-resume";
      if (item.file) fd.append("file", item.file);
      if (item.text) fd.append("text", item.text);

      try {
        const res = await fetch(`${baseUrl}/api/analyze`, { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          results.push({ name: label, status: "error", error: err.error || "Analysis failed" });
        } else {
          const data = await res.json();
          results.push({ name: label, status: "ok", data });
        }
      } catch (err) {
        results.push({ name: label, status: "error", error: err instanceof Error ? err.message : "Network error" });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Bulk analyze error:", error);
    return NextResponse.json({ error: "Bulk analysis failed" }, { status: 500 });
  }
}
