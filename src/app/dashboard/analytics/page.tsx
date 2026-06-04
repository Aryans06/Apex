"use client";

import { useEffect, useState } from "react";
import { Candidate } from "@/lib/data";
import { BarChart3, Loader2, Users, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { RadarChart } from "@/components/RadarChart";

const STAGES = ["applied", "screened", "interview", "offer", "hired", "rejected"];
const STAGE_LABELS: Record<string, string> = {
  applied: "Applied", screened: "Screened", interview: "Interview",
  offer: "Offer", hired: "Hired", rejected: "Rejected",
};
const STAGE_COLORS: Record<string, string> = {
  applied: "bg-zinc-500", screened: "bg-blue-500", interview: "bg-violet-500",
  offer: "bg-amber-500", hired: "bg-emerald-500", rejected: "bg-red-500",
};

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 flex flex-col gap-2">
      <div className={`flex items-center gap-2 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-4xl font-bold">{value}</span>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then(setCandidates)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const total = candidates.length;
  const hiddenGems = candidates.filter((c) => c.hiddenGemScore && c.hiddenGemScore > 80).length;
  const withFlags = candidates.filter((c) => c.redFlags && c.redFlags.length > 0).length;
  const avgGem = total ? Math.round(candidates.reduce((s, c) => s + (c.hiddenGemScore ?? 0), 0) / total) : 0;
  const hired = candidates.filter((c) => c.pipelineStage === "hired").length;

  // Stage distribution
  const stageCounts = STAGES.map((s) => ({
    stage: s,
    count: candidates.filter((c) => (c.pipelineStage || "applied") === s).length,
  }));
  const maxCount = Math.max(...stageCounts.map((s) => s.count), 1);

  // Top skills
  const skillMap: Record<string, number> = {};
  for (const c of candidates) {
    for (const s of c.skills) {
      skillMap[s] = (skillMap[s] || 0) + 1;
    }
  }
  const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxSkill = topSkills[0]?.[1] || 1;

  // Hidden gem score distribution (buckets: 0–25, 26–50, 51–75, 76–100)
  const scoreBuckets = [
    { label: "0–25", count: candidates.filter((c) => (c.hiddenGemScore ?? 0) <= 25).length },
    { label: "26–50", count: candidates.filter((c) => { const s = c.hiddenGemScore ?? 0; return s > 25 && s <= 50; }).length },
    { label: "51–75", count: candidates.filter((c) => { const s = c.hiddenGemScore ?? 0; return s > 50 && s <= 75; }).length },
    { label: "76–100", count: candidates.filter((c) => (c.hiddenGemScore ?? 0) > 75).length },
  ];
  const maxBucket = Math.max(...scoreBuckets.map((b) => b.count), 1);

  // Avg radar data across all candidates (use sample avg)
  const avgTechnical = total ? Math.round(candidates.reduce((s, c) => s + (c.adjacencyScore ?? 50), 0) / total) : 50;
  const avgTrajectory = total ? Math.round(candidates.reduce((s, c) => s + (c.hiddenGemScore ?? 50), 0) / total) : 50;
  const avgCultural = Math.round((avgTechnical + avgTrajectory) / 2);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Pipeline and candidate pool insights</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Pool" value={total} icon={Users} color="text-muted-foreground" />
        <StatCard label="Hidden Gems" value={hiddenGems} icon={Sparkles} color="text-primary" />
        <StatCard label="Avg Gem Score" value={`${avgGem}%`} icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Red Flags" value={withFlags} icon={AlertTriangle} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline funnel */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Pipeline Funnel</h2>
          <div className="flex flex-col gap-3">
            {stageCounts.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-20 text-right shrink-0">{STAGE_LABELS[stage]}</span>
                <div className="flex-1 h-7 bg-secondary/40 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-lg ${STAGE_COLORS[stage]} opacity-70`}
                  />
                  <span className="absolute inset-0 flex items-center px-3 text-xs font-semibold">
                    {count} candidate{count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Top Skills in Pool</h2>
            <div className="flex flex-col gap-2">
              {topSkills.map(([skill, count]) => (
                <div key={skill} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 text-right shrink-0 truncate">{skill}</span>
                  <div className="flex-1 h-5 bg-secondary/40 rounded overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxSkill) * 100}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-primary/50 rounded"
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium">{count}</span>
                  </div>
                </div>
              ))}
              {topSkills.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No candidates yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Hidden Gem distribution */}
          <div className="glass-panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Gem Score Distribution</h2>
            <div className="flex flex-col gap-3">
              {scoreBuckets.map(({ label, count }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-14 text-right shrink-0">{label}</span>
                  <div className="flex-1 h-5 bg-secondary/40 rounded overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxBucket) * 100}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full bg-primary/60 rounded"
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avg pool radar */}
          <div className="glass-panel p-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 self-start">Pool Avg Profile</h2>
            {total > 0 ? (
              <RadarChart
                size={200}
                data={[
                  { label: "Adjacency", value: avgTechnical, color: "#60a5fa" },
                  { label: "Trajectory", value: avgTrajectory, color: "#34d399" },
                  { label: "Cultural", value: avgCultural, color: "#a78bfa" },
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground py-10">No data yet</p>
            )}
          </div>

          {/* Hired */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black text-emerald-400">{hired}</span>
            <span className="text-sm text-muted-foreground mt-2">Candidates Hired</span>
          </div>
        </div>
      </div>
    </main>
  );
}
