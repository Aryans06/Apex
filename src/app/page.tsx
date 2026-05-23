"use client";

import { mockCandidates } from "@/lib/data";
import { Sparkles, Activity, Users, Search } from "lucide-react";
import { CandidateCard } from "@/components/CandidateCard";
import { ProofOfWorkModal } from "@/components/ProofOfWorkModal";
import { useState } from "react";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState("");

  const handleOpenProofOfWork = (candidateId: string, claim: string) => {
    setSelectedClaim(claim);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto relative">
      <ProofOfWorkModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        claim={selectedClaim} 
      />

      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Apex</h1>
            <p className="text-sm text-muted-foreground">Intelligence layer active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by intent..." 
              className="bg-secondary/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all focus:w-80"
            />
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer">
            <span className="text-sm font-medium">HR</span>
          </div>
        </div>
      </header>

      {/* Stats/Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Total Pool</span>
          </div>
          <span className="text-4xl font-bold">1,248</span>
        </div>
        
        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group border-primary/30 bg-primary/5 hover:-translate-y-1 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.05)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Hidden Gems</span>
          </div>
          <span className="text-4xl font-bold text-foreground">12</span>
          <p className="text-xs text-primary/80 font-medium">High trajectory candidates</p>
        </div>
        
        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Avg Processing</span>
          </div>
          <span className="text-4xl font-bold">1.2s</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          Recommended Candidates
          <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]">AI Curated</span>
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          {mockCandidates.map((candidate) => (
            <CandidateCard 
              key={candidate.id} 
              candidate={candidate} 
              onOpenProofOfWork={handleOpenProofOfWork}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
