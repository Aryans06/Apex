"use client";

import { cn } from "@/lib/utils";

// Deterministic color from name string
function hashColor(name: string): string {
  const palette = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface CandidateAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CandidateAvatar({ name, size = "md", className }: CandidateAvatarProps) {
  const color = hashColor(name);
  const initials = getInitials(name);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-20 h-20 text-2xl",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        color,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
