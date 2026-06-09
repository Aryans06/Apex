"use client";

import { Candidate } from "@/lib/data";
import { Sparkles, Activity, Users, Zap, Upload, Loader2, CheckCircle2, Briefcase, Search, FileText, AlertCircle, GitCompare, Mail, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { CandidateCard } from "@/components/CandidateCard";
import { ProofOfWorkModal } from "@/components/ProofOfWorkModal";
import { BulkUploadModal } from "@/components/BulkUploadModal";
import { CompareModal } from "@/components/CompareModal";
import { OutreachModal } from "@/components/OutreachModal";
import { SkeletonCard } from "@/components/SkeletonCard";
import { FilterBar, FilterState, defaultFilters } from "@/components/FilterBar";
import { useToast } from "@/components/Toast";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher, LocaleProvider, useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export interface MatchResult {
  candidateId: string;
  overallScore: number;
  technicalFit: number;
  trajectoryFit: number;
  culturalFit: number;
  reasoning: string;
  isShortlisted: boolean;
}

function DashboardContent() {
  const { locale } = useLocale();
  const { toast } = useToast();

  // Modal open states
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);

  // Upload single resume state
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  // JD matching state
  const [jdState, setJdState] = useState<"idle" | "matching" | "done" | "error">("idle");
  const [jdError, setJdError] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  // Data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [activeJD, setActiveJD] = useState("");

  // Proof of work
  const [selectedClaim, setSelectedClaim] = useState("");
  const [selectedCandidateName, setSelectedCandidateName] = useState("");

  // Comparison
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Outreach
  const [outreachCandidate, setOutreachCandidate] = useState<Candidate | null>(null);

  // Filters + search
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHiddenGemsOnly, setShowHiddenGemsOnly] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [topN, setTopN] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch candidates
  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((data) => setCandidates(data))
      .catch(() => toast("Failed to load candidates", "error"))
      .finally(() => setIsLoading(false));
  }, [toast]);

  // Pick up a pending JD from Saved Jobs page
  useEffect(() => {
    const pending = sessionStorage.getItem("pending_jd");
    if (pending) {
      sessionStorage.removeItem("pending_jd");
      try {
        const { content } = JSON.parse(pending);
        setJdText(content);
        setJdOpen(true);
      } catch { /* ignore */ }
    }
  }, []);

  // --- Handlers ---
  const handleOpenProofOfWork = (candidateId: string, claim: string) => {
    const c = candidates.find((c) => c.id === candidateId);
    setSelectedCandidateName(c?.name ?? "");
    setSelectedClaim(claim);
    setModalOpen(true);
  };

  const handleUpload = async () => {
    if (!resumeText.trim() && !resumeFile) return;
    setUploadState("uploading");
    const fd = new FormData();
    if (resumeText.trim()) fd.append("text", resumeText);
    if (resumeFile) fd.append("file", resumeFile);

    setTimeout(async () => {
      setUploadState("analyzing");
      try {
        const res = await fetch("/api/analyze", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Analysis failed");
        }
        const newCandidate = await res.json();
        setCandidates((prev) => [newCandidate, ...prev]);
        setUploadState("done");
        toast("Resume analyzed and added", "success");
        setTimeout(() => {
          setUploadOpen(false);
          setUploadState("idle");
          setUploadError("");
          setResumeText("");
          setResumeFile(null);
        }, 1800);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Analysis failed");
        setUploadState("error");
        toast("Analysis failed", "error");
      }
    }, 800);
  };

  const handlePostJD = async () => {
    if (!jdText.trim() && !jdFile) return;
    setJdState("matching");
    const fd = new FormData();
    if (jdText.trim()) fd.append("text", jdText);
    if (jdFile) fd.append("file", jdFile);
    fd.append("candidates", JSON.stringify(candidates));

    try {
      const res = await fetch("/api/match", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Match failed");
      }
      const data = await res.json();
      setMatchResults(data.rankings || []);
      setActiveJD(jdFile ? `File: ${jdFile.name}` : jdText.substring(0, 80) + "…");
      setJdState("done");
      toast("Candidates ranked by JD match", "success");
      setTimeout(() => { setJdOpen(false); setJdState("idle"); setJdText(""); setJdFile(null); }, 1200);
    } catch (err) {
      setJdError(err instanceof Error ? err.message : "Match failed");
      setJdState("error");
      toast("Matching failed", "error");
    }
  };

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const candidatesForCompare = candidates.filter((c) => selectedForCompare.includes(c.id));

  const openOutreach = (candidate: Candidate) => {
    setOutreachCandidate(candidate);
    setOutreachOpen(true);
  };

  // --- Filtering logic ---
  let filtered = candidates.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.skills.some((s) => s.name.toLowerCase().includes(q));
      if (!matches) return false;
    }
    if (filters.location.trim()) {
      if (!c.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    }
    if (filters.skills.length > 0) {
      const hasAll = filters.skills.every((fs) =>
        c.skills.some((s) => s.name.toLowerCase().includes(fs.toLowerCase()))
      );
      if (!hasAll) return false;
    }
    if (filters.minHiddenGem > 0) {
      if ((c.hiddenGemScore ?? 0) < filters.minHiddenGem) return false;
    }
    return true;
  });

  // Sort by match score
  if (matchResults.length > 0) {
    filtered = [...filtered].sort((a, b) => {
      const sa = matchResults.find((r) => r.candidateId === a.id)?.overallScore ?? 0;
      const sb = matchResults.find((r) => r.candidateId === b.id)?.overallScore ?? 0;
      // Also apply match score range filter
      return sb - sa;
    }).filter((c) => {
      const score = matchResults.find((r) => r.candidateId === c.id)?.overallScore ?? 0;
      return score >= filters.minScore && score <= filters.maxScore;
    });
  }

  const displayed = showHiddenGemsOnly
    ? filtered.filter((c) => c.hiddenGemScore && c.hiddenGemScore > 80)
    : filtered;

  const allSkills = [...new Set(candidates.flatMap((c) => c.skills.map(s => s.name)))].sort();

  const capped = topN !== null ? displayed.slice(0, topN) : displayed;

  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(capped.length / PAGE_SIZE);
  const paginated = capped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever the filtered set changes
  useEffect(() => { setPage(1); }, [searchQuery, filters, showHiddenGemsOnly, matchResults.length, topN]);

  const exportCSV = () => {
    const hasMatch = matchResults.length > 0;
    const headers = [
      "Name", "Role", "Location", "Hidden Gem Score", "Adjacency Score",
      ...(hasMatch ? ["Overall Match", "Technical Fit", "Trajectory Fit", "Cultural Fit", "Shortlisted", "Reasoning"] : []),
      "Skills", "Summary",
    ];
    const escape = (v: string | number | boolean | undefined | null) => {
      const s = String(v ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = capped.map((c) => {
      const m = matchResults.find((r) => r.candidateId === c.id);
      return [
        escape(c.name),
        escape(c.role),
        escape(c.location),
        escape(c.hiddenGemScore),
        escape(c.adjacencyScore),
        ...(hasMatch ? [
          escape(m?.overallScore),
          escape(m?.technicalFit),
          escape(m?.trajectoryFit),
          escape(m?.culturalFit),
          escape(m?.isShortlisted ? "Yes" : "No"),
          escape(m?.reasoning),
        ] : []),
        escape(c.skills.map(s => s.name).join(", ")),
        escape(c.summary),
      ].join(",");
    });
    const csv = [headers.map(escape).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex-candidates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-8 md:p-10 max-w-5xl mx-auto relative dot-grid">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 17, repeat: Infinity, ease: "linear", delay: 4 }} className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Modals */}
      <ProofOfWorkModal isOpen={modalOpen} onClose={() => setModalOpen(false)} claim={selectedClaim} candidateName={selectedCandidateName} />
      <BulkUploadModal isOpen={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)} onCandidatesAdded={(added) => setCandidates((prev) => [...added, ...prev])} />
      <CompareModal isOpen={compareOpen} candidates={candidatesForCompare} onClose={() => { setCompareOpen(false); setSelectedForCompare([]); }} />
      <OutreachModal isOpen={outreachOpen} onClose={() => setOutreachOpen(false)} candidate={outreachCandidate} />

      {/* Single upload modal */}
      <AnimatePresence>
        {uploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel w-full max-w-md overflow-hidden">
              <div className="p-8 text-center flex flex-col items-center">
                {uploadState === "idle" && (
                  <>
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t("upload.title", locale)}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{t("upload.subtitle", locale)}</p>
                    <div className="w-full flex flex-col gap-4 mb-4">
                      {resumeFile ? (
                        <div className="flex items-center justify-between bg-primary/10 border border-primary/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-sm truncate text-primary font-medium">{resumeFile.name}</span>
                          </div>
                          <button onClick={() => setResumeFile(null)} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
                        </div>
                      ) : (
                        <div onClick={() => resumeFileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
                          <FileText className="w-6 h-6 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                          <input type="file" accept=".pdf" ref={resumeFileInputRef} className="hidden" onChange={(e) => { if (e.target.files?.[0]) setResumeFile(e.target.files[0]); }} />
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase">
                        <div className="flex-1 h-px bg-border" /><span>OR PASTE TEXT</span><div className="flex-1 h-px bg-border" />
                      </div>
                      <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder={t("upload.placeholder", locale)} className="w-full h-32 bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" disabled={!!resumeFile} />
                    </div>
                    <div className="flex gap-3 w-full">
                      <button onClick={() => { setUploadOpen(false); setUploadState("idle"); setResumeFile(null); setResumeText(""); }} className="flex-1 px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">{t("upload.cancel", locale)}</button>
                      <button onClick={handleUpload} disabled={!resumeText.trim() && !resumeFile} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">{t("upload.analyze", locale)}</button>
                    </div>
                  </>
                )}
                {uploadState === "uploading" && (
                  <div className="py-12 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                    <h3 className="text-lg font-medium animate-pulse">{t("upload.uploading", locale)}</h3>
                  </div>
                )}
                {uploadState === "analyzing" && (
                  <div className="py-12 flex flex-col items-center relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <Sparkles className="w-12 h-12 text-primary animate-bounce mb-6 relative z-10" />
                    <h3 className="text-lg font-medium text-primary mb-2 relative z-10">{t("upload.analyzing", locale)}</h3>
                    <p className="text-xs text-muted-foreground relative z-10">{t("upload.analyzeHint", locale)}</p>
                  </div>
                )}
                {uploadState === "done" && (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-emerald-400">{t("upload.done", locale)}</h3>
                    <p className="text-xs text-muted-foreground mt-2">{t("upload.doneHint", locale)}</p>
                  </div>
                )}
                {uploadState === "error" && (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-red-400">Analysis Failed</h3>
                    {uploadError && <p className="text-xs text-muted-foreground text-center max-w-xs bg-secondary/50 border border-border rounded-lg px-3 py-2">{uploadError}</p>}
                    <button onClick={() => { setUploadState("idle"); setUploadError(""); }} className="px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">Try Again</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JD modal */}
      <AnimatePresence>
        {jdOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel w-full max-w-lg overflow-hidden border-purple-500/30">
              <div className="p-8 text-center flex flex-col items-center">
                {jdState === "idle" && (
                  <>
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                      <Briefcase className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t("jd.title", locale)}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{t("jd.subtitle", locale)}</p>
                    <div className="w-full flex flex-col gap-4 mb-4">
                      {jdFile ? (
                        <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                            <span className="text-sm truncate text-purple-400 font-medium">{jdFile.name}</span>
                          </div>
                          <button onClick={() => setJdFile(null)} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
                        </div>
                      ) : (
                        <div onClick={() => jdFileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-secondary/30 transition-colors">
                          <FileText className="w-6 h-6 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload JD PDF</span>
                          <input type="file" accept=".pdf" ref={jdFileInputRef} className="hidden" onChange={(e) => { if (e.target.files?.[0]) setJdFile(e.target.files[0]); }} />
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase">
                        <div className="flex-1 h-px bg-border" /><span>OR PASTE TEXT</span><div className="flex-1 h-px bg-border" />
                      </div>
                      <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder={t("jd.placeholder", locale)} className="w-full h-32 bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" disabled={!!jdFile} />
                    </div>
                    <div className="flex gap-3 w-full">
                      <button onClick={() => { setJdOpen(false); setJdState("idle"); setJdError(""); setJdFile(null); setJdText(""); }} className="flex-1 px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">{t("upload.cancel", locale)}</button>
                      <button onClick={handlePostJD} disabled={!jdText.trim() && !jdFile} className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-500/90 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50">{t("jd.analyze", locale)}</button>
                    </div>
                  </>
                )}
                {jdState === "matching" && (
                  <div className="py-12 flex flex-col items-center relative">
                    <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                    <Search className="w-12 h-12 text-purple-400 animate-bounce mb-6 relative z-10" />
                    <h3 className="text-lg font-medium text-purple-400 mb-2 relative z-10">{t("jd.matching", locale)}</h3>
                    <p className="text-xs text-muted-foreground relative z-10">{t("jd.matchHint", locale)}</p>
                  </div>
                )}
                {jdState === "done" && (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-emerald-400">Ranking Complete</h3>
                  </div>
                )}
                {jdState === "error" && (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-red-400">Matching Failed</h3>
                    {jdError && <p className="text-xs text-muted-foreground text-center max-w-xs bg-secondary/50 border border-border rounded-lg px-3 py-2">{jdError}</p>}
                    <button onClick={() => { setJdState("idle"); setJdError(""); }} className="px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">Try Again</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t("dash.title", locale)}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {t("dash.active", locale)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LanguageSwitcher />
          <button onClick={() => setJdOpen(true)} className="flex items-center gap-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-2 rounded-full text-sm font-medium hover:bg-purple-500/30 transition-colors">
            <Briefcase className="w-4 h-4" /> {t("dash.postJD", locale)}
          </button>
          <button onClick={() => setBulkUploadOpen(true)} className="flex items-center gap-2 bg-secondary border border-border text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
          <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Upload className="w-4 h-4" /> {t("dash.upload", locale)}
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5 flex flex-col gap-1 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{t("dash.totalPool", locale)}</span>
          </div>
          <span className="text-3xl font-bold">{candidates.length}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onClick={() => setShowHiddenGemsOnly(!showHiddenGemsOnly)} className="glass-panel p-5 flex flex-col gap-1 relative overflow-hidden group border-primary/30 bg-primary/5 hover:-translate-y-1 transition-transform cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{t("dash.hiddenGems", locale)}</span>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showHiddenGemsOnly ? "bg-primary" : "bg-secondary border border-border"}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showHiddenGemsOnly ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </div>
          <span className="text-3xl font-bold">{candidates.filter((c) => c.hiddenGemScore && c.hiddenGemScore > 80).length}</span>
          <p className="text-xs text-primary/70">{t("dash.toggleHint", locale)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-5 flex flex-col gap-1 group hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{t("dash.avgProcessing", locale)}</span>
          </div>
          <span className="text-3xl font-bold">1.2s</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-5 flex flex-col justify-center group hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Search className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Search</span>
          </div>
          <input
            type="text"
            placeholder="Name, role, skill..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </motion.div>
      </div>

      {/* Active JD banner */}
      {activeJD && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-sm font-medium text-purple-400">Active JD Match</span>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{activeJD}</p>
            </div>
          </div>
          <button onClick={() => { setMatchResults([]); setActiveJD(""); }} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 bg-secondary rounded-md shrink-0">Clear</button>
        </motion.div>
      )}

      {/* Compare bar */}
      {selectedForCompare.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium text-primary">{selectedForCompare.length} candidate{selectedForCompare.length > 1 ? "s" : ""} selected for comparison</span>
            <span className="text-xs text-muted-foreground">(max 4)</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedForCompare([])} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 bg-secondary rounded-md">Clear</button>
            <button
              onClick={() => setCompareOpen(true)}
              disabled={selectedForCompare.length < 2}
              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Compare
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter + count row */}
      <div className="flex justify-between items-center mb-5 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {searchQuery ? "Search Results" : t("dash.recommended", locale)}
            {!searchQuery && (
              <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/30">{t("dash.aiCurated", locale)}</span>
            )}
          </h2>
          <FilterBar filters={filters} onChange={setFilters} allSkills={allSkills} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-muted-foreground">
            {totalPages > 1
              ? <><span className="text-foreground font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, capped.length)}</span> of <span className="text-foreground font-medium">{capped.length}</span></>
              : <span className="text-foreground font-medium">{capped.length}</span>
            } candidates
          </span>
          <select
            value={topN ?? ""}
            onChange={(e) => setTopN(e.target.value === "" ? null : Number(e.target.value))}
            className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            title="Limit results"
          >
            <option value="">All</option>
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
          {capped.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-colors"
              title="Export displayed candidates as CSV"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Candidate list */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4 border border-dashed border-border rounded-xl text-muted-foreground">
          <Users className="w-10 h-10 opacity-30" />
          <div>
            <p className="font-medium">No candidates found</p>
            <p className="text-sm mt-1">
              {searchQuery || filters.skills.length > 0 || filters.location
                ? "Try adjusting your search or filters."
                : "Upload a resume to get started."}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors mt-2"
            >
              <Upload className="w-4 h-4" /> Upload First Resume
            </button>
          )}
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 gap-5">
          {paginated.map((candidate, idx) => {
            const globalIdx = (page - 1) * PAGE_SIZE + idx;
            return (
              <motion.div key={candidate.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * idx }}>
                <div className="relative group/card">
                  <CandidateCard
                    candidate={candidate}
                    onOpenProofOfWork={handleOpenProofOfWork}
                    matchResult={matchResults.find((r) => r.candidateId === candidate.id)}
                    rank={matchResults.length > 0 ? globalIdx + 1 : undefined}
                    isSelected={selectedForCompare.includes(candidate.id)}
                    onToggleSelect={toggleCompare}
                  />
                  {/* Outreach quick action */}
                  <button
                    onClick={() => openOutreach(candidate)}
                    className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/30"
                  >
                    <Mail className="w-3.5 h-3.5" /> Outreach
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 pb-4">
            <button
              onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
                Math.abs(p - page) <= 2 || p === 1 || p === totalPages ? (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {p}
                  </button>
                ) : Math.abs(p - page) === 3 ? (
                  <span key={p} className="w-9 text-center text-muted-foreground text-sm">…</span>
                ) : null
              )}
            </div>
            <button
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
      )}
    </main>
  );
}

export default function Dashboard() {
  return (
    <LocaleProvider>
      <DashboardContent />
    </LocaleProvider>
  );
}
