"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Building2, Briefcase, Mail, CheckCircle2, Settings } from "lucide-react";
import { getRecruiterProfile, saveRecruiterProfile, RecruiterProfile } from "@/lib/recruiter-profile";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<RecruiterProfile>({ name: "", company: "", title: "", email: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getRecruiterProfile());
  }, []);

  const set = (field: keyof RecruiterProfile, value: string) => {
    setSaved(false);
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const handleSave = () => {
    saveRecruiterProfile(profile);
    setSaved(true);
    toast("Profile saved", "success");
    setTimeout(() => setSaved(false), 2500);
  };

  const senderPreview = [profile.name, profile.title && profile.company
    ? `${profile.title} @ ${profile.company}`
    : profile.company || profile.title
  ].filter(Boolean).join(" · ") || "The Hiring Team";

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-2.5 rounded-lg border border-primary/30">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recruiter Profile</h1>
            <p className="text-sm text-muted-foreground">Your identity in outreach emails and assessments</p>
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Your Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Priya Sharma"
              className="bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Company Name
            </label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Acme Technologies"
              className="bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Your Role / Title
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Senior Technical Recruiter"
              className="bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Reply-To Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="priya@acme.com"
              className="bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Live preview */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Email Sender Preview</p>
            <p className="text-sm text-foreground font-medium">{senderPreview}</p>
            {profile.email && (
              <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
