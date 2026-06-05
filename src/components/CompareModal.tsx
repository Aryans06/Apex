"use client";

import { Candidate } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MapPin, GraduationCap, AlertTriangle } from "lucide-react";
import { CandidateAvatar } from "@/components/CandidateAvatar";
import { RadarChart } from "@/components/RadarChart";
import { cn } from "@/lib/utils";

interface CompareModalProps {
  candidates: Candidate[];
  onClose: () => void;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

export function CompareModal({ candidates, onClose }: CompareModalProps) {
  if (candidates.length < 2) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-lg">Candidate Comparison</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            <div className="grid p-6 gap-6" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(0, 1fr))` }}>
              {candidates.map((c) => {
                const isGem = c.hiddenGemScore && c.hiddenGemScore > 80;
                const hasFlags = c.redFlags && c.redFlags.length > 0;
                return (
                  <div key={c.id} className={cn("flex flex-col gap-5 p-4 rounded-xl border", isGem ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/10")}>
                    {/* Identity */}
                    <div className="flex flex-col items-center text-center gap-3">
                      <CandidateAvatar name={c.name} size="lg" />
                      <div>
                        <h3 className="font-bold text-base">{c.name}</h3>
                        <p className="text-sm text-muted-foreground">{c.role}</p>
                        {c.location && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" /> {c.location}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {isGem && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                            <Sparkles className="w-2.5 h-2.5" /> Hidden Gem
                          </span>
                        )}
                        {hasFlags && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <AlertTriangle className="w-2.5 h-2.5" /> Red Flags
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Radar */}
                    <div className="flex justify-center">
                      <RadarChart
                        size={180}
                        data={[
                          { label: "Gem", value: c.hiddenGemScore ?? 0, color: "#60a5fa" },
                          { label: "Adjacency", value: c.adjacencyScore ?? 0, color: "#34d399" },
                          { label: "Experience", value: Math.min(c.experience.length * 25, 100), color: "#a78bfa" },
                        ]}
                      />
                    </div>

                    {/* Scores */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scores</p>
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Hidden Gem</p>
                          <ScoreBar value={c.hiddenGemScore ?? 0} color="bg-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Skill Adjacency</p>
                          <ScoreBar value={c.adjacencyScore ?? 0} color="bg-purple-400" />
                        </div>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Education</p>
                      <div className="flex items-start gap-2 text-xs text-foreground/80">
                        <GraduationCap className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{c.education[0]?.degree}, {c.education[0]?.institution} ({c.education[0]?.endYear})</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {c.skills.map((s) => (
                          <span key={s.name} className="text-[10px] bg-secondary border border-border px-2 py-0.5 rounded">{s.name}</span>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{c.summary}</p>
                    </div>

                    {/* Red flags */}
                    {hasFlags && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Red Flags</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {c.redFlags!.map((f, i) => (
                            <li key={i} className="text-xs text-amber-300/80">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Trajectory notes */}
                    {c.trajectoryNotes && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">AI Trajectory</p>
                        <p className="text-xs text-primary/80 italic">&quot;{c.trajectoryNotes}&quot;</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
