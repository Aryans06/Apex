"use client";

import { mockCandidates, Candidate } from "@/lib/data";
import { Sparkles, Activity, Users, Search, Zap, Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { CandidateCard } from "@/components/CandidateCard";
import { ProofOfWorkModal } from "@/components/ProofOfWorkModal";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "done">("idle");
  const [selectedClaim, setSelectedClaim] = useState("");
  const [showHiddenGemsOnly, setShowHiddenGemsOnly] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  const handleOpenProofOfWork = (candidateId: string, claim: string) => {
    setSelectedClaim(claim);
    setModalOpen(true);
  };

  const handleUpload = async () => {
    if (!resumeText.trim()) {
      alert("Please paste a resume text for the demo.");
      return;
    }

    setUploadState("uploading");
    
    // Quick visual transition
    setTimeout(async () => {
      setUploadState("analyzing");
      
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText })
        });
        
        if (!res.ok) throw new Error("Analysis failed");
        
        const newCandidate = await res.json();
        
        // Add to our local state
        setCandidates(prev => [newCandidate, ...prev]);
        setUploadState("done");
        
        setTimeout(() => {
          setUploadOpen(false);
          setUploadState("idle");
          setResumeText("");
        }, 2000);
        
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to analyze resume. Make sure GEMINI_API_KEY is set.");
        setUploadState("idle");
      }
    }, 800);
  };

  const displayedCandidates = showHiddenGemsOnly 
    ? candidates.filter(c => c.id === "c_001" || (c.hiddenGemScore && c.hiddenGemScore > 80)) 
    : candidates;

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto relative">
      <ProofOfWorkModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        claim={selectedClaim} 
      />

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md overflow-hidden relative"
            >
              <div className="p-8 text-center flex flex-col items-center">
                {uploadState === "idle" && (
                  <>
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Analyze Candidate</h3>
                    <p className="text-sm text-muted-foreground mb-6">Paste resume text below to let Apex analyze their trajectory.</p>
                    
                    <textarea 
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste resume text here..."
                      className="w-full h-32 bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
                    />
                    
                    <div className="flex gap-3 w-full">
                      <button onClick={() => setUploadOpen(false)} className="flex-1 px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">Cancel</button>
                      <button onClick={handleUpload} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Analyze</button>
                    </div>
                  </>
                )}
                
                {uploadState === "uploading" && (
                  <div className="py-12 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                    <h3 className="text-lg font-medium animate-pulse">Uploading file...</h3>
                  </div>
                )}
                
                {uploadState === "analyzing" && (
                  <div className="py-12 flex flex-col items-center relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <Sparkles className="w-12 h-12 text-primary animate-bounce mb-6 relative z-10" />
                    <h3 className="text-lg font-medium text-primary mb-2 relative z-10">Apex is analyzing</h3>
                    <p className="text-xs text-muted-foreground relative z-10">Computing trajectory and skill adjacency...</p>
                  </div>
                )}
                
                {uploadState === "done" && (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-emerald-400">Analysis Complete</h3>
                    <p className="text-xs text-muted-foreground mt-2">Candidate added to pool.</p>
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
            <h1 className="text-2xl font-bold tracking-tight">Apex Command Center</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Intelligence layer active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </button>
          <div className="h-10 w-10 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer">
            <span className="text-sm font-medium">HR</span>
          </div>
        </div>
      </header>

      {/* Stats/Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Total Pool</span>
          </div>
          <span className="text-4xl font-bold">1,248</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group border-primary/30 bg-primary/5 hover:-translate-y-1 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.05)] cursor-pointer"
          onClick={() => setShowHiddenGemsOnly(!showHiddenGemsOnly)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Hidden Gems</span>
            </div>
            {/* Fake toggle switch */}
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${showHiddenGemsOnly ? 'bg-primary' : 'bg-secondary border border-border'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showHiddenGemsOnly ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
          <span className="text-4xl font-bold text-foreground">12</span>
          <p className="text-xs text-primary/80 font-medium">Click to toggle high trajectory candidates</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Avg Processing</span>
          </div>
          <span className="text-4xl font-bold">1.2s</span>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Recommended Candidates
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]">AI Curated</span>
          </h2>
          <div className="text-sm text-muted-foreground">
            Role: <span className="text-foreground font-medium bg-secondary px-3 py-1.5 rounded-md border border-border">Senior Backend Engineer</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {displayedCandidates.map((candidate, idx) => (
            <motion.div 
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
            >
              <CandidateCard 
                candidate={candidate} 
                onOpenProofOfWork={handleOpenProofOfWork}
              />
            </motion.div>
          ))}
          {displayedCandidates.length === 0 && (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
              No candidates found matching this criteria.
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
