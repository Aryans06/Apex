"use client";

import { Sparkles, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const typewriterWords = [
  "Skill Adjacency",
  "Career Velocity", 
  "Proof of Work",
  "Hidden Gems",
  "True Potential",
];

function TypewriterText() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = typewriterWords[currentWordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setCurrentText(word.substring(0, currentText.length + 1));
          if (currentText.length === word.length) {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          setCurrentText(word.substring(0, currentText.length - 1));
          if (currentText.length === 0) {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % typewriterWords.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

  return (
    <span className="text-primary">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Hidden Gem Detection",
    description:
      "Surfaces self-taught developers and career-switchers that traditional ATS systems filter out.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Trajectory Analysis",
    description:
      "Measures career velocity — how fast someone grew, not just where they started.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Proof of Work Validation",
    description:
      "Generates hyper-specific technical questions to verify every resume claim.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex justify-between items-center px-8 md:px-16 py-6"
      >
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Apex</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground hidden md:block">
            Built for the future of hiring
          </span>
          <Link
            href="/dashboard"
            className="text-sm bg-secondary/50 border border-border px-4 py-2 rounded-full hover:bg-secondary transition-colors"
          >
            Sign In
          </Link>
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
            Intelligence layer active
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mb-6"
        >
          Stop filtering.
          <br />
          Start{" "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            understanding.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4 leading-relaxed"
        >
          Apex reads career trajectories, validates claims with AI, and surfaces
          the brilliant candidates that every other ATS filters out.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-2xl md:text-3xl font-semibold h-12 mb-10"
        >
          <TypewriterText />
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
          >
            Enter Command Center
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="flex items-center gap-2 bg-secondary/50 border border-border px-8 py-3.5 rounded-full font-semibold text-base hover:bg-secondary transition-colors">
            Watch Demo
          </button>
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
            { value: "12,000+", label: "Hidden Gems Found" },
            { value: "40%", label: "Faster Hiring" },
            { value: "3.2s", label: "Avg Analysis Time" },
          ].map((stat) => (
            <div key={stat.label}>
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
          Beyond keyword matching
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground mb-12 max-w-xl mx-auto"
        >
          Three AI-powered capabilities that understand humans, not just
          documents.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-8 md:px-16">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Apex</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Built with AI. For humans.
          </span>
        </div>
      </footer>
    </div>
  );
}
