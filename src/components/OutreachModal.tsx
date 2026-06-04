"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { Candidate } from "@/lib/data";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

const EMAIL_TYPES = [
  { id: "intro",     label: "Outreach",   color: "bg-primary/20 text-primary border-primary/30" },
  { id: "interview", label: "Interview",  color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  { id: "offer",     label: "Offer",      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "rejection", label: "Rejection",  color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export function OutreachModal({ isOpen, onClose, candidate }: OutreachModalProps) {
  const [emailType, setEmailType] = useState("intro");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    if (!candidate) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: candidate.name,
          candidateRole: candidate.role,
          candidateSummary: candidate.summary,
          emailType,
          recruiterName: "The Hiring Team",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
    } catch {
      toast("Failed to generate email", "error");
    } finally {
      setGenerating(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    toast("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setResult(null);
    setEmailType("intro");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Outreach Email</h3>
                  <p className="text-xs text-muted-foreground">For {candidate.name}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
              {/* Type selector */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Email Type</p>
                <div className="flex gap-2 flex-wrap">
                  {EMAIL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setEmailType(t.id); setResult(null); }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                        emailType === t.id ? t.color : "bg-secondary/40 text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              {!result && (
                <button
                  onClick={generate}
                  disabled={generating}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating with Gemini…</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Generate Email</>
                  )}
                </button>
              )}

              {/* Result */}
              {result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                  <div className="bg-secondary/30 border border-border rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                    <p className="text-sm font-medium">{result.subject}</p>
                  </div>
                  <div className="bg-secondary/30 border border-border rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Body</p>
                    <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed">
                      {result.body}
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setResult(null); }}
                      className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={copy}
                      className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Email"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
