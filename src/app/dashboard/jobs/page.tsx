"use client";

import { useEffect, useState } from "react";
import { Briefcase, Plus, Trash2, Loader2, FileText, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

interface JobDescription {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) setJobs(await res.json());
    } catch {
      toast("Failed to load jobs", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error();
      const newJob = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      setTitle("");
      setContent("");
      setShowForm(false);
      toast("Job description saved", "success");
    } catch {
      toast("Failed to save job", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch("/api/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast("Job deleted", "info");
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const runMatch = (job: JobDescription) => {
    // Store in sessionStorage and redirect to dashboard to run match
    sessionStorage.setItem("pending_jd", JSON.stringify({ title: job.title, content: job.content }));
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
            <Briefcase className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Saved Job Descriptions</h1>
            <p className="text-sm text-muted-foreground">Reuse JDs across matching sessions</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New JD
        </button>
      </div>

      {/* New JD form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-6 mb-6 border-primary/30"
          >
            <h3 className="text-base font-semibold mb-4">New Job Description</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Job title (e.g. Senior Backend Engineer)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                placeholder="Paste job description here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowForm(false); setTitle(""); setContent(""); }}
                  className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim() || !content.trim()}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save JD"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job list */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="glass-panel p-5 flex gap-4 items-start group"
            >
              <div className="bg-purple-500/15 p-2.5 rounded-lg border border-purple-500/25 shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Saved {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-sm text-foreground/70 line-clamp-2">{job.content}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => runMatch(job)}
                  className="flex items-center gap-1.5 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" /> Match
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={deletingId === job.id}
                  className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/25 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === job.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {jobs.length === 0 && !showForm && (
          <div className="text-center py-20 flex flex-col items-center gap-4 border border-dashed border-border rounded-xl text-muted-foreground">
            <Briefcase className="w-10 h-10 opacity-30" />
            <div>
              <p className="font-medium">No saved job descriptions yet</p>
              <p className="text-sm mt-1">Save a JD to quickly re-run matching without re-pasting.</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Save your first JD
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
