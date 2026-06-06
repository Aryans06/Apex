"use client";

import { Sparkles, ArrowRight, Shield, TrendingUp, Briefcase, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { ApexLogo } from "@/components/ApexLogo";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { LocaleProvider, useLocale, LanguageSwitcher } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SignInButton, useUser } from "@clerk/nextjs";

function LiveCandidateCard() {
  const [gemScore, setGemScore] = useState(0);
  const [adjScore, setAdjScore] = useState(0);

  useEffect(() => {
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        setGemScore((prev) => {
          if (prev >= 91) { clearInterval(interval); return 91; }
          return prev + 2;
        });
        setAdjScore((prev) => Math.min(prev + 2, 84));
      }, 18);
      return () => clearInterval(interval);
    }, 700);
    return () => clearTimeout(delay);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="glass-panel w-full max-w-lg text-left border-primary/20 overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/40">
        <span className="text-xs text-muted-foreground font-mono">apex://candidate-match</span>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <div className="p-4 flex gap-4 items-start">
        {/* Avatar + meta */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 flex items-center justify-center text-sm font-bold text-primary border border-primary/30">
            RK
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div>
              <span className="text-sm font-semibold">Ravi Kumar</span>
              <span className="text-xs text-muted-foreground ml-2">Full-Stack Dev · 4 yrs</span>
            </div>
            <span className="shrink-0 text-xs bg-primary/10 border border-primary/25 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Hidden Gem
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">Indore, MP</span>
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Self-taught</span>
            {["React", "Node.js", "Postgres"].map((s) => (
              <span key={s} className="text-xs bg-secondary/60 px-2 py-0.5 rounded-full text-muted-foreground">{s}</span>
            ))}
          </div>

          {/* Score bars */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Hidden Gem Score</span>
                <span className="font-bold tabular-nums text-primary">{gemScore}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400"
                  animate={{ width: `${gemScore}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Skill Adjacency</span>
                <span className="font-bold tabular-nums text-emerald-400">{adjScore}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  animate={{ width: `${adjScore}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 text-xs text-muted-foreground italic border-t border-border pt-2.5 bg-secondary/20">
        Rejected by 3 keyword-based ATS systems — surfaced by Apex as top 4%
      </div>
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};


function LandingContent() {
  const { locale } = useLocale();
  const { isSignedIn, isLoaded } = useUser();

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "done">("idle");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  const handleStudentUpload = async () => {
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
        
        setUploadState("done");
        setTimeout(() => { 
          setStudentModalOpen(false); 
          setUploadState("idle"); 
          setResumeText(""); 
          setResumeFile(null); 
        }, 3000);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadState("idle");
      }
    }, 800);
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t("landing.feature1Title", locale),
      description: t("landing.feature1Desc", locale),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t("landing.feature2Title", locale),
      description: t("landing.feature2Desc", locale),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("landing.feature3Title", locale),
      description: t("landing.feature3Desc", locale),
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  const steps = [
    { step: "01", title: t("landing.step1Title", locale), desc: t("landing.step1Desc", locale) },
    { step: "02", title: t("landing.step2Title", locale), desc: t("landing.step2Desc", locale) },
    { step: "03", title: t("landing.step3Title", locale), desc: t("landing.step3Desc", locale) },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden dot-grid">
      {/* Dot-grid fade edges */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_60%,var(--color-background)_100%)]" />

      {/* Student Upload Modal */}
      <AnimatePresence>
        {studentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel w-full max-w-md overflow-hidden relative">
              <div className="p-8 text-center flex flex-col items-center">
                {uploadState === "idle" && (
                  <>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                      <GraduationCapIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Submit Your Profile</h3>
                    <p className="text-sm text-muted-foreground mb-6">Upload your resume to join the Apex talent pool and get matched with top opportunities.</p>
                    
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
                          <span className="text-sm text-muted-foreground">Click to upload PDF resume</span>
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
                        placeholder="Paste your resume text here..." 
                        className="w-full h-32 bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" 
                        disabled={!!resumeFile}
                      />
                    </div>

                    <div className="flex gap-3 w-full">
                      <button onClick={() => { setStudentModalOpen(false); setResumeFile(null); setResumeText(""); }} className="flex-1 px-4 py-2 bg-secondary rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">Cancel</button>
                      <button onClick={handleStudentUpload} disabled={!resumeText.trim() && !resumeFile} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">Submit Profile</button>
                    </div>
                  </>
                )}
                {uploadState === "uploading" && (
                  <div className="py-12 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                    <h3 className="text-lg font-medium animate-pulse">Uploading securely...</h3>
                  </div>
                )}
                {uploadState === "analyzing" && (
                  <div className="py-12 flex flex-col items-center relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <Sparkles className="w-12 h-12 text-primary animate-bounce mb-6 relative z-10" />
                    <h3 className="text-lg font-medium text-primary mb-2 relative z-10">AI Parsing Profile...</h3>
                    <p className="text-xs text-muted-foreground relative z-10">Extracting skills and potential</p>
                  </div>
                )}
                {uploadState === "done" && (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-emerald-400">Profile Submitted!</h3>
                    <p className="text-xs text-muted-foreground mt-2">You are now visible to top recruiters.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex justify-between items-center px-8 md:px-16 py-6"
      >
        <ApexLogo size="lg" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:block">
            {t("landing.builtFor", locale)}
          </span>
          <LanguageSwitcher />
          {isLoaded && (
            isSignedIn ? (
              <Link
                href="/dashboard"
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="text-sm bg-secondary/50 border border-border px-4 py-2 rounded-full hover:bg-secondary transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )
          )}
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-8 pt-20 md:pt-32 pb-20">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-1.5 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">
            {t("landing.badge", locale)}
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mb-6"
        >
          {t("landing.headline1", locale)}
          <br />
          Start{" "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            {t("landing.headline2", locale)}
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4 leading-relaxed"
        >
          {t("landing.subheadline", locale)}
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-lg mb-6"
        >
          <LiveCandidateCard />
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl mt-4"
        >
          {/* Dual Entry Points */}
          <Link
            href="/dashboard"
            className="flex-1 group glass-panel p-6 border-purple-500/20 hover:border-purple-500/50 bg-secondary/50 hover:bg-secondary/80 transition-all flex flex-col items-center cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.05)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          >
            <Briefcase className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-bold text-lg mb-1">I&apos;m a Recruiter</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">Post JDs, discover hidden gems, and manage candidates.</p>
            <span className="text-purple-400 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Enter ATS <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          
          <div
            onClick={() => setStudentModalOpen(true)}
            className="flex-1 group glass-panel p-6 border-primary/20 hover:border-primary/50 bg-secondary/50 hover:bg-secondary/80 transition-all flex flex-col items-center cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.05)] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          >
            <GraduationCapIcon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-lg mb-1">I&apos;m a Job Seeker</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">Submit your profile and let our AI match you to top roles.</p>
            <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Submit Profile <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex gap-12 mt-20 text-center"
        >
          {[
            { value: "12,000+", label: t("landing.statsGems", locale) },
            { value: "40%", label: t("landing.statsFaster", locale) },
            { value: "3.2s", label: t("landing.statsTime", locale) },
          ].map((stat) => (
            <div key={stat.value}>
              <div className="text-2xl md:text-3xl font-bold">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 md:px-16 pb-32 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold mb-4"
        >
          {t("landing.featuresTitle", locale)}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground mb-12 max-w-xl mx-auto"
        >
          {t("landing.featuresSubtitle", locale)}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`glass-panel p-6 hover:-translate-y-1 transition-transform cursor-default group ${feature.border}`}
            >
              <div
                className={`${feature.bg} ${feature.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 px-8 md:px-16 pb-32 max-w-5xl mx-auto scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 md:p-12 border-primary/20"
        >
          <h2 className="text-3xl font-bold mb-10 text-center">{t("landing.howTitle", locale)}</h2>
          
          <div className="space-y-12">
            {steps.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 items-start group">
                <div className="text-5xl font-black text-primary/20 mt-1 group-hover:text-primary/40 transition-colors">{item.step}</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-8 md:px-16">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <ApexLogo size="sm" />
          <span className="text-xs text-muted-foreground">
            {t("landing.footer", locale)}
          </span>
        </div>
      </footer>
    </div>
  );
}

// Simple icon for the button
function GraduationCapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.33a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.832l8.57 2.75a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <LocaleProvider>
      <LandingContent />
    </LocaleProvider>
  );
}
