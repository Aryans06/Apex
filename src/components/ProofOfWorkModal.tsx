"use client";

import { X, Loader2, Target, ShieldCheck, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProofOfWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: string;
}

export function ProofOfWorkModal({ isOpen, onClose, claim }: ProofOfWorkModalProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && claim) {
      setIsGenerating(true);
      
      const fetchQuestions = async () => {
        try {
          const res = await fetch("/api/generate-assessment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim })
          });
          
          if (!res.ok) throw new Error("Failed to fetch");
          
          const data = await res.json();
          
          // Map icons dynamically based on index for variety
          const icons = [
            <Database key="1" className="w-5 h-5 text-blue-400" />,
            <Target key="2" className="w-5 h-5 text-emerald-400" />,
            <ShieldCheck key="3" className="w-5 h-5 text-purple-400" />
          ];
          
          const formattedQuestions = data.questions.map((q: any, i: number) => ({
            ...q,
            icon: icons[i % icons.length]
          }));
          
          setQuestions(formattedQuestions);
        } catch (error) {
          console.error("Error generating assessment:", error);
          // Fallback if API fails
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
    }
  }, [isOpen, claim]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-border p-4 flex justify-between items-center bg-secondary/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-primary/20 text-primary p-1 rounded">
              <ShieldCheck className="w-5 h-5" />
            </span>
            Dynamic Proof of Work
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Validating Claim:</p>
            <div className="p-4 bg-secondary/50 rounded-lg border border-border/50 text-foreground italic">
              "{claim}"
            </div>
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">Gemini 1.5 Pro is generating specific technical validation questions...</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <p className="text-sm font-medium text-foreground">Generated Interview Interrogation:</p>
              {questions.map((q, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="mt-1">{q.icon}</div>
                  <div>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed mb-2">{q.q}</p>
                    <p className="text-xs text-muted-foreground bg-background/50 inline-flex px-2 py-1 rounded">
                      <span className="font-semibold mr-1">AI Intent:</span> {q.intent}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                <button className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors" onClick={onClose}>
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  Send Assessment to Candidate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
