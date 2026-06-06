"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Loader2, Copy, CheckCircle2, CalendarPlus } from "lucide-react";
import { Candidate } from "@/lib/data";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { getRecruiterProfile } from "@/lib/recruiter-profile";

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

function buildCalendarLink(candidateName: string, date: string, time: string, duration: number) {
  // date: YYYY-MM-DD, time: HH:MM, duration: minutes
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Interview with ${candidateName}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Technical interview scheduled via Apex ATS`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function OutreachModal({ isOpen, onClose, candidate }: OutreachModalProps) {
  const [emailType, setEmailType] = useState("intro");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("10:00");
  const [slotDuration, setSlotDuration] = useState(60);
  const { toast } = useToast();

  const slotLink = slotDate && slotTime && candidate
    ? buildCalendarLink(candidate.name, slotDate, slotTime, slotDuration)
    : null;

  const slotLabel = slotDate
    ? `${new Date(`${slotDate}T${slotTime}`).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} (${slotDuration} min)`
    : null;

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
          recruiterName: (() => {
            const rp = getRecruiterProfile();
            return rp.name
              ? [rp.name, rp.title && rp.company ? `${rp.title} at ${rp.company}` : rp.company || rp.title].filter(Boolean).join(", ")
              : "The Hiring Team";
          })(),
          slotLink,
          slotLabel,
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
    setSlotDate("");
    setSlotTime("10:00");
    setSlotDuration(60);
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

              {/* Interview slot picker */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <CalendarPlus className="w-3.5 h-3.5" /> Interview Slot <span className="font-normal text-muted-foreground/60 normal-case tracking-normal">(optional)</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="date"
                    value={slotDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => { setSlotDate(e.target.value); setResult(null); }}
                    className="flex-1 min-w-[130px] bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="time"
                    value={slotTime}
                    onChange={(e) => { setSlotTime(e.target.value); setResult(null); }}
                    className="w-28 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <select
                    value={slotDuration}
                    onChange={(e) => { setSlotDuration(Number(e.target.value)); setResult(null); }}
                    className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
                {slotLink && (
                  <a
                    href={slotLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Preview slot in Google Calendar
                  </a>
                )}
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
