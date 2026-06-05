"use client";

import { Candidate } from "@/lib/data";
import { ChevronRight, ExternalLink, Sparkles, TrendingUp, CheckCircle2, ShieldCheck, MapPin, AlertTriangle, SquareCheckBig, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MatchResult } from "@/app/dashboard/page";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { CandidateAvatar } from "@/components/CandidateAvatar";

interface CandidateCardProps {
  candidate: Candidate;
  onOpenProofOfWork: (candidateId: string, claim: string) => void;
  matchResult?: MatchResult;
  rank?: number;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function CandidateCard({ candidate, onOpenProofOfWork, matchResult, rank, isSelected, onToggleSelect }: CandidateCardProps) {
  const { locale } = useLocale();
  const isHiddenGem = candidate.hiddenGemScore && candidate.hiddenGemScore > 80;
  const hasRedFlags = candidate.redFlags && candidate.redFlags.length > 0;

  return (
    <div className={cn(
      "glass-panel p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all duration-300 hover:border-primary/50",
      isHiddenGem ? "border-primary/30 bg-primary/5" : "",
      matchResult?.isShortlisted ? "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]" : "",
      isSelected ? "ring-2 ring-primary/60" : ""
    )}>
      {isHiddenGem && (
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
      )}
      {matchResult?.isShortlisted && (
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Comparison checkbox */}
            {onToggleSelect && (
              <button
                onClick={() => onToggleSelect(candidate.id)}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                title={isSelected ? "Remove from compare" : "Add to compare"}
              >
                {isSelected
                  ? <SquareCheckBig className="w-4 h-4 text-primary" />
                  : <Square className="w-4 h-4" />
                }
              </button>
            )}

            {/* Avatar */}
            <CandidateAvatar name={candidate.name} size="md" />

            <div className="min-w-0">
              <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                {rank !== undefined && (
                  <span className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs shrink-0",
                    rank <= 3 ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400" : "bg-secondary text-muted-foreground border border-border"
                  )}>
                    #{rank}
                  </span>
                )}
                <span className="truncate">{candidate.name}</span>
                {matchResult?.isShortlisted && (
                  <span className="flex items-center gap-1 text-xs font-semibold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/30 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("card.shortlisted", locale)}
                  </span>
                )}
                {isHiddenGem && (
                  <span className="flex items-center gap-1 text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-md border border-primary/30 shrink-0">
                    <Sparkles className="w-3 h-3" />
                    {t("card.hiddenGem", locale)}
                  </span>
                )}
                {hasRedFlags && (
                  <span className="flex items-center gap-1 text-xs font-semibold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    Red Flags
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                {candidate.role}
                {candidate.location && (
                  <span className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3" /> {candidate.location}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            {candidate.skills.slice(0, 3).map(skill => (
              <span key={skill.name} className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground border border-border">
                {skill.name}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-xs bg-secondary/50 px-2 py-1 rounded text-muted-foreground border border-border">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Red Flags */}
        {hasRedFlags && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-3 flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Potential Red Flags</span>
              <ul className="list-disc list-inside space-y-0.5">
                {candidate.redFlags!.map((flag, i) => (
                  <li key={i} className="text-xs text-amber-300/80">{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* JD Match Result Section */}
        {matchResult && (
          <div className="bg-secondary/40 border border-border rounded-lg p-4 mt-2">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-foreground">
                  {matchResult.overallScore}<span className="text-sm text-muted-foreground font-normal">/100</span>
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{t("card.matchScore", locale)}</div>
              </div>
              <div className="flex gap-5 text-xs font-medium">
                <div className="flex flex-col gap-1.5 min-w-[64px]">
                  <span className="text-muted-foreground">Technical</span>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-16">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${matchResult.technicalFit}%` }} />
                  </div>
                  <span className="text-blue-400">{matchResult.technicalFit}%</span>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[64px]">
                  <span className="text-muted-foreground">Trajectory</span>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-16">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${matchResult.trajectoryFit}%` }} />
                  </div>
                  <span className="text-emerald-400">{matchResult.trajectoryFit}%</span>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[64px]">
                  <span className="text-muted-foreground">Cultural</span>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden w-16">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${matchResult.culturalFit}%` }} />
                  </div>
                  <span className="text-purple-400">{matchResult.culturalFit}%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-foreground/80 italic border-l-2 border-purple-500/50 pl-3">
              &quot;{matchResult.reasoning}&quot;
            </p>
          </div>
        )}

        <p className="text-sm text-foreground/80 leading-relaxed">{candidate.summary}</p>

        {isHiddenGem && candidate.trajectoryNotes && !matchResult && (
          <div className="mt-2 bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-4 items-start">
            <div className="bg-primary/20 p-2 rounded shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-1">{t("card.trajectory", locale)}</h4>
              <p className="text-xs text-primary/80">{candidate.trajectoryNotes}</p>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("card.experience", locale)}</h4>
            <Link href={`/dashboard/candidate/${candidate.id}`} className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium">
              {t("card.viewProfile", locale)} <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {candidate.experience.slice(0, 2).map((exp, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{exp.role}</span>
                  <span className="text-muted-foreground">{exp.duration}</span>
                </div>
                <div className="text-xs text-muted-foreground">{exp.company}</div>
                {exp.bullets.length > 0 && (
                  <div className="group flex items-start gap-2 mt-1 bg-secondary/20 p-2 rounded border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onOpenProofOfWork(candidate.id, exp.bullets[0])}>
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary/50 group-hover:text-primary shrink-0" />
                    <p className="text-sm text-foreground/90 flex-1">{exp.bullets[0]}</p>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-primary text-primary-foreground px-2 py-1 rounded whitespace-nowrap flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {t("card.validate", locale)}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
