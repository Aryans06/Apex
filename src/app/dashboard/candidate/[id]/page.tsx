"use client";

import { Candidate } from "@/lib/data";
import { ArrowLeft, Sparkles, TrendingUp, ShieldCheck, Link2, Briefcase, GraduationCap, MapPin, Zap, Loader2, AlertTriangle, Mail, StickyNote, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ProofOfWorkModal } from "@/components/ProofOfWorkModal";
import { CandidateAvatar } from "@/components/CandidateAvatar";
import { RadarChart } from "@/components/RadarChart";
import { OutreachModal } from "@/components/OutreachModal";
import { useToast } from "@/components/Toast";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

function CandidateProfileContent() {
  const params = useParams();
  const candidateId = params?.id as string;
  const { toast } = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState("");
  const [barsMounted, setBarsMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`/api/candidates/${candidateId}`);
        if (res.ok) {
          const data = await res.json();
          setCandidate(data);
          setNotes(data.notes || []);
        }
      } catch {
        toast("Failed to load candidate", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidate();
  }, [candidateId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && candidate) {
      const timer = setTimeout(() => setBarsMounted(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading, candidate]);

  const addNote = async () => {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteInput.trim() }),
      });
      if (!res.ok) throw new Error();
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setNoteInput("");
      toast("Note saved", "success");
    } catch {
      toast("Failed to save note", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast("Note deleted", "info");
    } catch {
      toast("Failed to delete note", "error");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const isHiddenGem = candidate?.hiddenGemScore && candidate.hiddenGemScore > 80;
  const hasRedFlags = candidate?.redFlags && candidate.redFlags.length > 0;

  const handleOpenProofOfWork = (claim: string) => {
    setSelectedClaim(claim);
    setModalOpen(true);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Loading candidate profile...</p>
      </main>
    );
  }

  if (!candidate) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="glass-panel p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-6">The candidate you are looking for does not exist.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const trajectoryScore = candidate.hiddenGemScore ?? 50;
  const adjacencyScore = candidate.adjacencyScore ?? 50;
  const traditionalMatch = Math.max(100 - trajectoryScore, 20);

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto dot-grid">
      <ProofOfWorkModal isOpen={modalOpen} onClose={() => setModalOpen(false)} claim={selectedClaim} candidateName={candidate.name} />
      <OutreachModal isOpen={outreachOpen} onClose={() => setOutreachOpen(false)} candidate={candidate} />

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <button
          onClick={() => setOutreachOpen(true)}
          className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-500/30 transition-colors"
        >
          <Mail className="w-4 h-4" /> Draft Outreach Email
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8 relative overflow-hidden">
            {isHiddenGem && (
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            )}

            <CandidateAvatar name={candidate.name} size="lg" className="mb-6" />

            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 flex-wrap">
              {candidate.name}
              {isHiddenGem && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-primary/20 text-primary px-2.5 py-1 rounded-md border border-primary/30">
                  <Sparkles className="w-3 h-3" /> Hidden Gem
                </span>
              )}
              {hasRedFlags && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" /> Red Flags
                </span>
              )}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">{candidate.role}</p>

            <div className="flex flex-col gap-4 text-sm">
              {candidate.location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {candidate.location}
                </div>
              )}
              {candidate.links?.github && (
                <div className="flex items-center gap-3 text-foreground hover:text-primary transition-colors cursor-pointer">
                  <Link2 className="w-4 h-4" /> {candidate.links.github}
                </div>
              )}
              {candidate.links?.portfolio && (
                <div className="flex items-center gap-3 text-foreground hover:text-primary transition-colors cursor-pointer">
                  <Link2 className="w-4 h-4" /> {candidate.links.portfolio}
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <GraduationCap className="w-4 h-4" /> {candidate.education[0]?.degree}, {candidate.education[0]?.institution}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-2">
              {candidate.skills.map(skill => (
                <span key={skill.name} className="bg-secondary/50 border border-border px-3 py-1 rounded-full text-xs font-medium">
                  {skill.name}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Red flags */}
          {hasRedFlags && (
            <motion.div custom={0.5} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-5 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Red Flags</h3>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {candidate.redFlags!.map((flag, i) => (
                  <li key={i} className="text-sm text-amber-300/80">{flag}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Scores + Radar */}
          <motion.div custom={1} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-6 bg-secondary/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Apex Diagnostics</h3>

            <div className="flex justify-center mb-6">
              <RadarChart
                size={200}
                data={[
                  { label: "Gem Score", value: trajectoryScore, color: "#60a5fa" },
                  { label: "Adjacency", value: adjacencyScore, color: "#a78bfa" },
                  { label: "Traditional", value: traditionalMatch, color: "#6b7280" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Traditional Match</span>
                  <span className="text-muted-foreground">{traditionalMatch}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground/50 transition-all duration-1000" style={{ width: barsMounted ? `${traditionalMatch}%` : "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-primary flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Trajectory Velocity
                  </span>
                  <span className="text-primary font-bold">{trajectoryScore}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: barsMounted ? `${trajectoryScore}%` : "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-purple-400 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Skill Adjacency
                  </span>
                  <span className="text-purple-400 font-bold">{adjacencyScore}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <div className="h-full bg-purple-400 transition-all duration-1000" style={{ width: barsMounted ? `${adjacencyScore}%` : "0%" }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recruiter Notes */}
          <motion.div custom={1.5} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recruiter Notes</h3>
            </div>

            <div className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto">
              {notes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No notes yet. Add one below.</p>
              )}
              {notes.map((note) => (
                <div key={note.id} className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 flex gap-2 items-start group">
                  <p className="text-sm flex-1 text-foreground/80">{note.content}</p>
                  <button
                    onClick={() => deleteNote(note.id)}
                    disabled={deletingNoteId === note.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0"
                  >
                    {deletingNoteId === note.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                placeholder="Add a note... (Enter to save)"
                rows={2}
                className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <button
                onClick={addNote}
                disabled={savingNote || !noteInput.trim()}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 shrink-0"
              >
                {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {candidate.trajectoryNotes && (
            <motion.div custom={2} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8 border-primary/30 bg-primary/5 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-background border border-primary/30 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Sparkles className="w-3 h-3" /> AI Synthesis
              </div>
              <p className="text-lg leading-relaxed text-foreground/90 font-medium italic">
                &quot;{candidate.trajectoryNotes}&quot;
              </p>
            </motion.div>
          )}

          <motion.div custom={2.5} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-6">
            <p className="text-foreground/80 leading-relaxed">{candidate.summary}</p>
          </motion.div>

          <motion.div custom={3} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-muted-foreground" /> Proven Experience
            </h3>

            <div className="relative border-l border-border ml-3 space-y-12">
              {candidate.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute w-6 h-6 bg-background border-2 border-primary rounded-full -left-[13px] top-1 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h4 className="text-lg font-bold">{exp.role}</h4>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mt-2 md:mt-0 w-fit">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-medium mb-4">{exp.company}</p>

                  {exp.description && (
                    <p className="text-sm text-foreground/80 mb-6 bg-secondary/30 p-4 rounded-lg border border-border/50">
                      {exp.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="group relative bg-secondary/10 border border-border/50 p-4 rounded-lg hover:border-primary/40 hover:bg-secondary/30 transition-all">
                        <p className="text-sm text-foreground/90 leading-relaxed pr-24">{bullet}</p>
                        <button
                          onClick={() => handleOpenProofOfWork(bullet)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1 shadow-lg shadow-primary/20 hover:scale-105"
                        >
                          <ShieldCheck className="w-3 h-3" /> Validate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

export default function CandidateProfile() {
  return <CandidateProfileContent />;
}
