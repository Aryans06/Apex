"use client";

export function SkeletonCard() {
  return (
    <div className="glass-panel p-6 flex flex-col md:flex-row gap-6 animate-pulse">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-secondary shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-36 bg-secondary rounded" />
              <div className="h-3.5 w-24 bg-secondary/70 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-14 bg-secondary rounded" />
            <div className="h-6 w-14 bg-secondary rounded" />
            <div className="h-6 w-14 bg-secondary rounded" />
          </div>
        </div>
        <div className="h-4 w-full bg-secondary/70 rounded" />
        <div className="h-4 w-4/5 bg-secondary/70 rounded" />
        <div className="border-t border-border pt-4 flex flex-col gap-3">
          <div className="h-3.5 w-28 bg-secondary/60 rounded" />
          <div className="h-16 bg-secondary/40 rounded-lg" />
          <div className="h-16 bg-secondary/40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
