"use client";

import { Candidate } from "@/lib/data";
import { Sparkles, Activity, Users, Zap, Upload, Loader2, CheckCircle2, Briefcase, Search, FileText } from "lucide-react";
import { CandidateCard } from "@/components/CandidateCard";
import { ProofOfWorkModal } from "@/components/ProofOfWorkModal";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { LocaleProvider, useLocale, LanguageSwitcher } from "@/lib/locale-context";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "done">("idle");
  const [jdState, setJdState] = useState<"idle" | "matching" | "done">("idle");
  const [selectedClaim, setSelectedClaim] = useState("");
  const [showHiddenGemsOnly, setShowHiddenGemsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // File vs Text states
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [activeJD, setActiveJD] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch("/api/candidates");
        if (res.ok) {
          const data = await res.json();
          setCandidates(data);
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleOpenProofOfWork = (_candidateId: string, claim: string) => {
    setSelectedClaim(claim);
    setModalOpen(true);
  };

  const handleUpload = async () => {
    if (!resumeText.trim() && !resumeFile) return;
    setUploadState("uploading");
    
    const formData = new FormData();
    if (resumeText.trim()) formData.append("text", resumeText);
    if (resumeFile) formData.append("file", resumeFile);

    setTimeout(async () => {
      setUploadState("analyzing");
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("Analysis failed");
        const newCandidate = await res.json();
        setCandidates(prev => [newCandidate, ...prev]);
        setUploadState("done");
        setTimeout(() => { 
          setUploadOpen(false); 
          setUploadState("idle"); 
          setResumeText(""); 
          setResumeFile(null); 
        }, 2000);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadState("idle");
      }
    }, 800);
  };

  const handlePostJD = async () => {
    if (!jdText.trim() && !jdFile) return;
    setJdState("matching");
    
    const formData = new FormData();
    if (jdText.trim()) formData.append("text", jdText);
    if (jdFile) formData.append("file", jdFile);
    formData.append("candidates", JSON.stringify(candidates));

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Match failed");
      const data = await res.json();
      setMatchResults(data.rankings || []);
      
      const activeText = jdFile ? `File: ${jdFile.name}` : jdText.substring(0, 80) + "...";
      setActiveJD(activeText);
      
      setJdState("done");
      setTimeout(() => { 
        setJdOpen(false); 
        setJdState("idle"); 
        setJdText(""); 
        setJdFile(null); 
      }, 1500);
    } catch (error) {
      console.error("JD match error:", error);
      setJdState("idle");
    }
  };

  // 1. Filter by search query
  let filteredCandidates = candidates.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query) ||
      c.skills.some(s => s.toLowerCase().includes(query))
    );
  });

  // 2. Sort by match score if we have results
  const sortedCandidates = matchResults.length > 0
    ? [...filteredCandidates].sort((a, b) => {
        const scoreA = matchResults.find(r => r.candidateId === a.id)?.overallScore ?? 0;
        const scoreB = matchResults.find(r => r.candidateId === b.id)?.overallScore ?? 0;
        return scoreB - scoreA;
      })
    : filteredCandidates;

  // 3. Filter by hidden gems if toggled
  const displayedCandidates = showHiddenGemsOnly 
    ? sortedCandidates.filter(c => c.id === "c_001" || (c.hiddenGemScore && c.hiddenGemScore > 80)) 
    : sortedCandidates;

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto relative dot-grid">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "linear", delay: 4 }}
          className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 25, -25, 0], y: [0, -25, 25, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute top-3/4 left-1/3 w-72 h-72 bg-emerald-500/4 rounded-full blur-3xl"
        />
      </div>

      <ProofOfWorkModal
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        claim={selectedClaim} 
      />

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel w-full max-w-md overflow-hidden relative">
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
                        <div 
                          onClick={() => resumeFileInputRef.current?.click()}
                          className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                        >
                          <FileText className="w-6 h-6 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                          <input 
                            type="file" 
                            accept=".pdf" 
                            ref={resumeFileInputRef} 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setResumeFile(e.target.files[0]);
                              }
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase">
                        <div className="flex-1 h-px bg-border"></div>
                        <span>OR PASTE TEXT</span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                      
                      <textarea 
                        value={resumeText} 
                        onChange={(e) => setResumeText(e.target.value)} 
                        placeholder={t("upload.placeholder", locale)} 
                        className="w-full h-32 bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" 
                        disabled={!!resumeFile}
                      />
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={() => { setUploadOpen(false); setResumeFile(null); setResumeText(""); }} className="flex-1 px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">{t("upload.cancel", locale)}</button>
                      <button onClick={handleUpload} disabled={!resumeText.trim() && !resumeFile} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">{t("upload.analyze", locale)}</button>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JD Modal */}
      <AnimatePresence>
        {jdOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel w-full max-w-lg overflow-hidden relative border-purple-500/30">
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
                        <div 
                          onClick={() => jdFileInputRef.current?.click()}
                          className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-secondary/30 transition-colors"
                        >
                          <FileText className="w-6 h-6 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload JD PDF</span>
                          <input 
                            type="file" 
                            accept=".pdf" 
                            ref={jdFileInputRef} 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setJdFile(e.target.files[0]);
                              }
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase">
                        <div className="flex-1 h-px bg-border"></div>
                        <span>OR PASTE TEXT</span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>

                      <textarea 
                        value={jdText} 
                        onChange={(e) => setJdText(e.target.value)} 
                        placeholder={t("jd.placeholder", locale)} 
                        className="w-full h-32 bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" 
                        disabled={!!jdFile}
                      />
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={() => { setJdOpen(false); setJdFile(null); setJdText(""); }} className="flex-1 px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">{t("upload.cancel", locale)}</button>
                      <button onClick={handlePostJD} disabled={!jdText.trim() && !jdFile} className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-500/90 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed">{t("jd.analyze", locale)}</button>
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
                    <p className="text-xs text-muted-foreground mt-2">Candidates sorted by match score.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-primary/20 p-2 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-primary/30 transition-colors">
            <Zap className="w-6 h-6 text-primary" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("dash.title", locale)}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {t("dash.active", locale)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <LanguageSwitcher />
          <button onClick={() => setJdOpen(true)} className="flex items-center gap-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-500/30 transition-colors">
            <Briefcase className="w-4 h-4" />
            {t("dash.postJD", locale)}
          </button>
          <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Upload className="w-4 h-4" />
            {t("dash.upload", locale)}
          </button>
          <UserButton />
        </div>
      </header>

      {/* Stats/Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">{t("dash.totalPool", locale)}</span>
          </div>
          <span className="text-4xl font-bold">{candidates.length.toLocaleString()}</span>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group border-primary/30 bg-primary/5 hover:-translate-y-1 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.05)] cursor-pointer" onClick={() => setShowHiddenGemsOnly(!showHiddenGemsOnly)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">{t("dash.hiddenGems", locale)}</span>
            </div>
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${showHiddenGemsOnly ? 'bg-primary' : 'bg-secondary border border-border'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showHiddenGemsOnly ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
          <span className="text-4xl font-bold text-foreground">{candidates.filter(c => c.hiddenGemScore && c.hiddenGemScore > 80).length}</span>
          <p className="text-xs text-primary/80 font-medium">{t("dash.toggleHint", locale)}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">{t("dash.avgProcessing", locale)}</span>
          </div>
          <span className="text-4xl font-bold">1.2s</span>
        </motion.div>

        {/* Search Bar Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Search Candidates</span>
          </div>
          <input 
            type="text" 
            placeholder="Role, skill, or name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 relative z-10"
          />
        </motion.div>
      </div>

      {/* Active JD Banner */}
      {activeJD && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-sm font-medium text-purple-400">Active Job Description Match</span>
              <p className="text-xs text-muted-foreground mt-0.5">{activeJD}</p>
            </div>
          </div>
          <button onClick={() => { setMatchResults([]); setActiveJD(""); }} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 bg-secondary rounded-md">Clear</button>
        </motion.div>
      )}

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {searchQuery ? "Search Results" : t("dash.recommended", locale)}
            {!searchQuery && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]">{t("dash.aiCurated", locale)}</span>}
          </h2>
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{displayedCandidates.length}</span> candidates
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Loading candidates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {displayedCandidates.map((candidate, idx) => (
              <motion.div key={candidate.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (idx * 0.1) }}>
                <CandidateCard 
                  candidate={candidate} 
                  onOpenProofOfWork={handleOpenProofOfWork}
                  matchResult={matchResults.find(r => r.candidateId === candidate.id)}
                  rank={matchResults.length > 0 ? idx + 1 : undefined}
                />
              </motion.div>
            ))}
            {displayedCandidates.length === 0 && (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
                {searchQuery ? "No candidates found matching your search." : t("dash.noResults", locale)}
              </div>
            )}
          </div>
        )}
      </motion.div>
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
