"use client";

import { X, Loader2, Target, ShieldCheck, Database, Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

interface ProofOfWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: string;
  candidateName?: string;
}

type SendState = "idle" | "enterEmail" | "sending" | "sent" | "error";

export function ProofOfWorkModal({ isOpen, onClose, claim, candidateName }: ProofOfWorkModalProps) {
  const { locale } = useLocale();
  const [isGenerating, setIsGenerating] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [candidateEmail, setCandidateEmail] = useState("");

  useEffect(() => {
    if (isOpen && claim) {
      setIsGenerating(true);
      setSendState("idle");
      setCandidateEmail("");

      const fetchQuestions = async () => {
        try {
          const res = await fetch("/api/generate-assessment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim })
          });

          if (!res.ok) throw new Error("Failed to fetch");

          const data = await res.json();

          const icons = [
            <Database key="1" className="w-5 h-5 text-blue-400" />,
            <Target key="2" className="w-5 h-5 text-emerald-400" />,
            <ShieldCheck key="3" className="w-5 h-5 text-purple-400" />
          ];

          setQuestions(data.questions.map((q: any, i: number) => ({
            ...q,
            icon: icons[i % icons.length]
          })));
        } catch (error) {
          console.error("Error generating assessment:", error);
          setQuestions([{
            icon: <Target className="w-5 h-5 text-red-400" />,
            q: "Failed to connect to the Gemini API. Please check your API key.",
            intent: "System Error"
          }]);
        } finally {
          setIsGenerating(false);
        }
      };

      fetchQuestions();
    } else {
      setQuestions([]);
      setSendState("idle");
      setCandidateEmail("");
    }
  }, [isOpen, claim]);

  const handleSendEmail = async () => {
    if (!candidateEmail || !questions.length) return;
    setSendState("sending");

    try {
      const res = await fetch("/api/send-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: candidateEmail,
          candidateName,
          claim,
          questions: questions.map((q: any) => ({ q: q.q, intent: q.intent }))
        })
      });

      if (!res.ok) throw new Error("Send failed");
      setSendState("sent");
    } catch (error) {
      console.error("Send error:", error);
      setSendState("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-border p-4 flex justify-between items-center bg-secondary/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-primary/20 text-primary p-1 rounded">
              <ShieldCheck className="w-5 h-5" />
            </span>
            {t("pow.title", locale)}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">{t("pow.validating", locale)}</p>
            <div className="p-4 bg-secondary/50 rounded-lg border border-border/50 text-foreground italic">
              &quot;{claim}&quot;
            </div>
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">{t("pow.generating", locale)}</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <p className="text-sm font-medium text-foreground">{t("pow.generated", locale)}</p>
              {questions.map((q, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="mt-1">{q.icon}</div>
                  <div>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed mb-2">{q.q}</p>
                    <p className="text-xs text-muted-foreground bg-background/50 inline-flex px-2 py-1 rounded">
                      <span className="font-semibold mr-1">{t("pow.intent", locale)}:</span> {q.intent}
                    </p>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-border">
                {sendState === "idle" && (
                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                      onClick={onClose}
                    >
                      {t("pow.cancel", locale)}
                    </button>
                    <button
                      className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                      onClick={() => setSendState("enterEmail")}
                    >
                      <Mail className="w-4 h-4" />
                      {t("pow.send", locale)}
                    </button>
                  </div>
                )}

                {sendState === "enterEmail" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      Enter {candidateName ? <span className="text-foreground font-medium">{candidateName}&apos;s</span> : "the candidate's"} email to send this assessment:
                    </p>
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={e => setCandidateEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && candidateEmail && handleSendEmail()}
                      placeholder="candidate@example.com"
                      autoFocus
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                        onClick={() => { setSendState("idle"); setCandidateEmail(""); }}
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        disabled={!candidateEmail}
                        onClick={handleSendEmail}
                        className={cn(
                          "px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2",
                          candidateEmail ? "hover:bg-primary/90" : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Mail className="w-4 h-4" /> Send Assessment
                      </button>
                    </div>
                  </div>
                )}

                {sendState === "sending" && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Sending assessment to {candidateEmail}...</span>
                  </div>
                )}

                {sendState === "sent" && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Assessment sent to {candidateEmail}!</span>
                    </div>
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                      Close
                    </button>
                  </div>
                )}

                {sendState === "error" && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Failed to send. Please try again.</span>
                    </div>
                    <button
                      onClick={() => setSendState("enterEmail")}
                      className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
