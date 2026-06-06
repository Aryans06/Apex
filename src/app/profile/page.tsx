"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Sparkles, Upload, Loader2, CheckCircle2, MapPin, Briefcase, GraduationCap, Link2, ChevronRight, TrendingUp } from "lucide-react";
import { Candidate } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { LocaleProvider, LanguageSwitcher, useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import Link from "next/link";
import { Zap } from "lucide-react";

function ProfileContent() {
  const { locale } = useLocale();
  const [resumeText, setResumeText] = useState("");
  const [uploadState, setUploadState] = useState<"idle" | "analyzing" | "done">("idle");
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [barsMounted, setBarsMounted] = useState(false);

  const handleUpload = async () => {
    if (!resumeText.trim()) return;
    setUploadState("analyzing");
    try {
      const formData = new FormData();
      formData.append("text", resumeText);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setProfile(data);
      setUploadState("done");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadState("idle");
    }
  };

  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => setBarsMounted(true), 150);
      return () => clearTimeout(timer);
    } else {
      setBarsMounted(false);
    }
  }, [profile]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
  };

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-primary/20 p-2 rounded-lg border border-primary/30">
            <Zap className="w-6 h-6 text-primary" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Candidate Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </header>

      {!profile && (
        <div className="max-w-2xl mx-auto mt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 md:p-12 text-center">
            {uploadState === "idle" && (
              <>
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Build your AI Profile</h3>
                <p className="text-muted-foreground mb-8">Paste your resume text below to see how Apex analyzes your trajectory and skills.</p>
                <textarea 
                  value={resumeText} 
                  onChange={(e) => setResumeText(e.target.value)} 
                  placeholder="Paste your full resume here..." 
                  className="w-full h-48 bg-secondary/50 border border-border rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-6" 
                />
                <button 
                  onClick={handleUpload} 
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Analyze My Resume
                </button>
              </>
            )}
            
            {uploadState === "analyzing" && (
              <div className="py-20 flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  <Sparkles className="w-16 h-16 text-primary animate-bounce relative z-10" />
                </div>
                <h3 className="text-xl font-medium text-primary mb-2">Apex is analyzing your career</h3>
                <p className="text-muted-foreground">Finding hidden gems in your trajectory...</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {profile && uploadState === "done" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Identity */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8 relative overflow-hidden border-primary/30">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="w-24 h-24 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-3xl font-bold mb-6">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
              
              <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
              <p className="text-muted-foreground text-lg mb-6">{profile.role}</p>
              
              <div className="flex flex-col gap-4 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </div>
                )}
                {profile.links.github && (
                  <a
                    href={profile.links.github.startsWith("http") ? profile.links.github : `https://${profile.links.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <Link2 className="w-4 h-4" /> {profile.links.github}
                  </a>
                )}
                {profile.education[0]?.degree && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <GraduationCap className="w-4 h-4" /> {profile.education[0]?.degree}, {profile.education[0]?.institution}
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill.name} className="bg-secondary/50 border border-border px-3 py-1 rounded-full text-xs font-medium">
                    {skill.name}
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
                    <span className="font-medium text-primary flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Trajectory Velocity
                    </span>
                    <span className="text-primary font-bold">{profile.hiddenGemScore || 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: barsMounted ? `${profile.hiddenGemScore || 0}%` : "0%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-purple-400 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> Skill Adjacency
                    </span>
                    <span className="text-purple-400 font-bold">{profile.adjacencyScore || 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <div className="h-full bg-purple-400 transition-all duration-1000" style={{ width: barsMounted ? `${profile.adjacencyScore || 0}%` : "0%" }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div custom={2} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8 border-primary/30 bg-primary/5 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-background border border-primary/30 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> AI Synthesis
              </div>
              <p className="text-lg leading-relaxed text-foreground/90 font-medium italic">
                "{profile.trajectoryNotes || profile.summary}"
              </p>
            </motion.div>

            <motion.div custom={3} variants={fadeInUp} initial="hidden" animate="visible" className="glass-panel p-8">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-muted-foreground" /> Detected Experience
              </h3>
              <div className="relative border-l border-border ml-3 space-y-12">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute w-6 h-6 bg-background border-2 border-primary rounded-full -left-[13px] top-1 flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-foreground">{exp.role}</h4>
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mt-2 md:mt-0 w-fit">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-medium mb-4">{exp.company}</p>
                    <div className="space-y-3">
                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="bg-secondary/10 border border-border/50 p-4 rounded-lg">
                          <p className="text-sm text-foreground/90 leading-relaxed">{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <LocaleProvider>
      <ProfileContent />
    </LocaleProvider>
  );
}
