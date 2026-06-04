"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  minScore: number;
  maxScore: number;
  minHiddenGem: number;
  skills: string[];
  location: string;
}

export const defaultFilters: FilterState = {
  minScore: 0,
  maxScore: 100,
  minHiddenGem: 0,
  skills: [],
  location: "",
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  allSkills: string[];
}

export function FilterBar({ filters, onChange, allSkills }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const activeCount = [
    filters.minScore > 0 || filters.maxScore < 100,
    filters.minHiddenGem > 0,
    filters.skills.length > 0,
    filters.location.trim() !== "",
  ].filter(Boolean).length;

  const addSkill = (skill: string) => {
    if (!skill.trim() || filters.skills.includes(skill)) return;
    onChange({ ...filters, skills: [...filters.skills, skill] });
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    onChange({ ...filters, skills: filters.skills.filter((s) => s !== skill) });
  };

  const reset = () => onChange(defaultFilters);

  const suggestions = allSkills.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !filters.skills.includes(s)
  ).slice(0, 6);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
          activeCount > 0
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
        )}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{activeCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 w-80 glass-panel p-5 flex flex-col gap-5 shadow-2xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Filters</span>
            {activeCount > 0 && (
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Reset all
              </button>
            )}
          </div>

          {/* Match score range */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-3">
              Match Score Range: <span className="text-foreground">{filters.minScore}–{filters.maxScore}</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="range" min={0} max={100} step={5}
                value={filters.minScore}
                onChange={(e) => onChange({ ...filters, minScore: +e.target.value })}
                className="flex-1 accent-primary"
              />
              <input
                type="range" min={0} max={100} step={5}
                value={filters.maxScore}
                onChange={(e) => onChange({ ...filters, maxScore: +e.target.value })}
                className="flex-1 accent-primary"
              />
            </div>
          </div>

          {/* Min hidden gem score */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-3">
              Min Hidden Gem Score: <span className="text-primary">{filters.minHiddenGem}</span>
            </label>
            <input
              type="range" min={0} max={100} step={5}
              value={filters.minHiddenGem}
              onChange={(e) => onChange({ ...filters, minHiddenGem: +e.target.value })}
              className="w-full accent-primary"
            />
          </div>

          {/* Location filter */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g. Bengaluru, Pune..."
              value={filters.location}
              onChange={(e) => onChange({ ...filters, location: e.target.value })}
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Skill filter */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {filters.skills.map((s) => (
                <span key={s} className="flex items-center gap-1 text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded-md">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Add skill filter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addSkill(skillInput); }}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {suggestions.length > 0 && skillInput && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-900 border border-border rounded-lg overflow-hidden shadow-xl z-10">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
