"use client";

import { useEffect, useState, useRef } from "react";
import { Candidate } from "@/lib/data";
import { KanbanSquare, Loader2 } from "lucide-react";
import { CandidateAvatar } from "@/components/CandidateAvatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/Toast";

const STAGES = [
  { id: "applied",   label: "Applied",   color: "border-zinc-500/40",  dot: "bg-zinc-400" },
  { id: "screened",  label: "Screened",  color: "border-blue-500/40",  dot: "bg-blue-400" },
  { id: "interview", label: "Interview", color: "border-violet-500/40", dot: "bg-violet-400" },
  { id: "offer",     label: "Offer",     color: "border-amber-500/40",  dot: "bg-amber-400" },
  { id: "hired",     label: "Hired",     color: "border-emerald-500/40",dot: "bg-emerald-400" },
  { id: "rejected",  label: "Rejected",  color: "border-red-500/40",    dot: "bg-red-400" },
];

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((data) => setCandidates(data))
      .catch(() => toast("Failed to load candidates", "error"))
      .finally(() => setIsLoading(false));
  }, [toast]);

  const byStage = (stageId: string) =>
    candidates.filter((c) => (c.pipelineStage || "applied") === stageId);

  const handleDrop = async (stageId: string) => {
    const id = dragId.current;
    if (!id) return;
    const prev = candidates.find((c) => c.id === id)?.pipelineStage || "applied";
    if (prev === stageId) return;

    setCandidates((cs) => cs.map((c) => c.id === id ? { ...c, pipelineStage: stageId } : c));

    try {
      const res = await fetch(`/api/candidates/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageId }),
      });
      if (!res.ok) throw new Error();
      toast(`Moved to ${STAGES.find((s) => s.id === stageId)?.label}`, "success");
    } catch {
      setCandidates((cs) => cs.map((c) => c.id === id ? { ...c, pipelineStage: prev } : c));
      toast("Failed to update stage", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-violet-500/20 p-2 rounded-lg border border-violet-500/30">
          <KanbanSquare className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Drag candidates between stages</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = byStage(stage.id);
          return (
            <div
              key={stage.id}
              className={cn("shrink-0 w-[240px] flex flex-col rounded-xl border bg-secondary/10 overflow-hidden", stage.color)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Column header */}
              <div className="px-4 py-3 flex items-center gap-2 border-b border-border/50 bg-secondary/20">
                <div className={cn("w-2 h-2 rounded-full shrink-0", stage.dot)} />
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="ml-auto text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 flex flex-col gap-2 min-h-[200px]">
                {cards.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    draggable
                    onDragStart={() => { dragId.current = c.id; }}
                    onDragEnd={() => { dragId.current = null; }}
                    className="bg-background/60 border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CandidateAvatar name={c.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.role}</p>
                      </div>
                    </div>
                    {c.hiddenGemScore !== undefined && c.hiddenGemScore !== null && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${c.hiddenGemScore}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{c.hiddenGemScore}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {cards.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-border/50 rounded-lg py-8">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
