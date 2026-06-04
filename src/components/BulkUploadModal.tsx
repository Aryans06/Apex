"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Candidate } from "@/lib/data";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  name: string;
  file: File;
  status: "pending" | "analyzing" | "done" | "error";
  error?: string;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidatesAdded: (candidates: Candidate[]) => void;
}

export function BulkUploadModal({ isOpen, onClose, onCandidatesAdded }: BulkUploadModalProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: QueueItem[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      file: f,
      status: "pending",
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => setQueue((prev) => prev.filter((i) => i.id !== id));

  const runAll = async () => {
    const pending = queue.filter((i) => i.status === "pending");
    if (pending.length === 0) return;
    setRunning(true);

    const added: Candidate[] = [];

    for (const item of pending) {
      setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "analyzing" } : i));

      try {
        const fd = new FormData();
        fd.append("file", item.file);
        const res = await fetch("/api/analyze", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Analysis failed");
        }
        const candidate = await res.json();
        added.push(candidate);
        setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "done" } : i));
      } catch (err) {
        setQueue((prev) => prev.map((i) => i.id === item.id ? {
          ...i,
          status: "error",
          error: err instanceof Error ? err.message : "Failed",
        } : i));
      }
    }

    if (added.length > 0) {
      onCandidatesAdded(added);
      toast(`${added.length} resume${added.length > 1 ? "s" : ""} analyzed`, "success");
    }
    setRunning(false);
  };

  const handleClose = () => {
    if (running) return;
    setQueue([]);
    onClose();
  };

  const doneCount = queue.filter((i) => i.status === "done").length;
  const errorCount = queue.filter((i) => i.status === "error").length;
  const pendingCount = queue.filter((i) => i.status === "pending").length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Bulk Resume Upload</h3>
                  <p className="text-xs text-muted-foreground">Upload multiple PDFs — analyzed one by one</p>
                </div>
              </div>
              <button onClick={handleClose} disabled={running} className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {/* Drop zone */}
              {!running && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-border rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click or drag PDFs here</span>
                  <span className="text-xs text-muted-foreground/60 mt-1">Multiple files supported</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>
              )}

              {/* Queue */}
              {queue.length > 0 && (
                <div className="flex flex-col gap-2">
                  {queue.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-secondary/30 border border-border rounded-lg px-4 py-3">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 truncate">{item.name}</span>
                      <div className="shrink-0">
                        {item.status === "pending" && !running && (
                          <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === "analyzing" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                        {item.status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {item.status === "error" && (
                          <span title={item.error}>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          </span>
                        )}
                        {item.status === "pending" && running && (
                          <span className="text-xs text-muted-foreground">Queued</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress summary */}
              {running && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-secondary/20 rounded-lg px-4 py-3">
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                  <span>Analyzing… {doneCount + errorCount}/{queue.length} done</span>
                  {doneCount > 0 && <span className="text-emerald-400">{doneCount} ✓</span>}
                  {errorCount > 0 && <span className="text-red-400">{errorCount} failed</span>}
                </div>
              )}

              {/* Empty */}
              {queue.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">Add PDF resumes above to get started.</p>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={handleClose} disabled={running} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-40">
                {doneCount > 0 && !running ? "Done" : "Cancel"}
              </button>
              <button
                onClick={runAll}
                disabled={running || pendingCount === 0}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {running
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</span>
                  : `Analyze ${pendingCount} Resume${pendingCount !== 1 ? "s" : ""}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
