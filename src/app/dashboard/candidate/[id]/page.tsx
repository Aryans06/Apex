"use client";

import { mockCandidates } from "@/lib/data";
import { ArrowLeft, Sparkles, TrendingUp, ShieldCheck, Link2, Briefcase, GraduationCap, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ProofOfWorkModal } from "@/components/ProofOfWorkModal";

export default function CandidateProfile() {
  const params = useParams();
  const candidateId = params?.id as string;
  const candidate = mockCandidates.find(c => c.id === candidateId) || mockCandidates[0]; // Fallback for demo
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState("");
  
  const isHiddenGem = candidate.id === "c_001";

  const handleOpenProofOfWork = (claim: string) => {
    setSelectedClaim(claim);
    setModalOpen(true);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
  };

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto">
      <ProofOfWorkModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        claim={selectedClaim} 
      />

      {/* Navigation */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Command Center
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Identity */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8 relative overflow-hidden">
            {isHiddenGem && (
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            )}
            
            <div className="w-24 h-24 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-3xl font-bold mb-6">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <h1 className="text-3xl font-bold mb-1">{candidate.name}</h1>
            <p className="text-muted-foreground text-lg mb-6">{candidate.role}</p>
            
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4" /> San Francisco, CA (Remote)
              </div>
              <div className="flex items-center gap-3 text-foreground hover:text-primary transition-colors cursor-pointer">
                <Link2 className="w-4 h-4" /> {candidate.links.github}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <GraduationCap className="w-4 h-4" /> {candidate.education.degree}, {candidate.education.school}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-2">
              {candidate.skills.map(skill => (
                <span key={skill} className="bg-secondary/50 border border-border px-3 py-1 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Scores Panel */}
          <motion.div custom={1} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-6 bg-secondary/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Apex Diagnostics</h3>
            
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Traditional Match</span>
                  <span className="text-muted-foreground">42%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground/50 w-[42%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-primary flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Trajectory Velocity
                  </span>
                  <span className="text-primary font-bold">96%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <div className="h-full bg-primary w-[96%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-purple-400 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Skill Adjacency
                  </span>
                  <span className="text-purple-400 font-bold">88%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <div className="h-full bg-purple-400 w-[88%]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: AI Analysis & Experience */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* AI Summary Card */}
          <motion.div custom={2} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8 border-primary/30 bg-primary/5 relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-background border border-primary/30 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-3 h-3" /> AI Synthesis
            </div>
            
            <p className="text-lg leading-relaxed text-foreground/90 font-medium italic">
              "Alex demonstrates exceptional growth velocity, transitioning from standard Node.js development to architecting high-throughput distributed systems in Rust in just 18 months. While lacking formal pedigree, their proven ability to handle complex concurrency and database optimization heavily compensates for missing keyword requirements. Highly recommended for Senior Platform roles."
            </p>
          </motion.div>

          {/* Timeline Experience */}
          <motion.div custom={3} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-muted-foreground" /> Proven Experience
            </h3>

            <div className="relative border-l border-border ml-3 space-y-12">
              {candidate.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute w-6 h-6 bg-background border-2 border-primary rounded-full -left-[13px] top-1 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-foreground">{exp.role}</h4>
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
