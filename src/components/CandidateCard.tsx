"use client";

import { Candidate } from "@/lib/data";
import { ChevronRight, ExternalLink, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateCardProps {
  candidate: Candidate;
  onOpenProofOfWork: (candidateId: string, claim: string) => void;
}

export function CandidateCard({ candidate, onOpenProofOfWork }: CandidateCardProps) {
  const isHiddenGem = candidate.id === "c_001"; // Hardcoded for hackathon demo

  return (
    <div className={cn(
      "glass-panel p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all duration-300 hover:border-primary/50",
      isHiddenGem ? "border-primary/30 bg-primary/5" : ""
    )}>
      {isHiddenGem && (
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
      )}
      
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              {candidate.name}
              {isHiddenGem && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded-md border border-primary/30">
                  <Sparkles className="w-3 h-3" />
                  Hidden Gem
                </span>
              )}
            </h3>
            <p className="text-muted-foreground">{candidate.role}</p>
          </div>
          <div className="flex gap-2">
            {candidate.skills.slice(0, 3).map(skill => (
              <span key={skill} className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-xs bg-secondary/50 px-2 py-1 rounded text-muted-foreground">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed">{candidate.summary}</p>

        {isHiddenGem && (
          <div className="mt-2 bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-4 items-start">
            <div className="bg-primary/20 p-2 rounded shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-1">High Velocity Trajectory</h4>
              <p className="text-xs text-primary/80">Promoted from Junior to Lead in 18 months. Transitioned from monolithic Node.js to distributed systems in Rust. High skill adjacency for Senior Platform roles.</p>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Experience Highlights</h4>
          <div className="flex flex-col gap-3">
            {candidate.experience.map((exp, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{exp.role}</span>
                  <span className="text-muted-foreground">{exp.duration}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{exp.company}</span>
                </div>
                {/* Just showing the first bullet point as a highlight */}
                <div className="group flex items-start gap-2 mt-1 bg-secondary/20 p-2 rounded border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onOpenProofOfWork(candidate.id, exp.bullets[0])}>
                  <ChevronRight className="w-4 h-4 mt-0.5 text-primary/50 group-hover:text-primary shrink-0" />
                  <p className="text-sm text-foreground/90 flex-1">{exp.bullets[0]}</p>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-primary text-primary-foreground px-2 py-1 rounded whitespace-nowrap">
                    Validate Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
