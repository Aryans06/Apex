export interface RecruiterProfile {
  name: string;
  company: string;
  title: string;
  email: string;
}

const KEY = "apex_recruiter_profile";

export function getRecruiterProfile(): RecruiterProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultProfile();
}

export function saveRecruiterProfile(p: RecruiterProfile): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}

function defaultProfile(): RecruiterProfile {
  return { name: "", company: "", title: "", email: "" };
}
