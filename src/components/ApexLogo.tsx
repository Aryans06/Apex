"use client";

function GemIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="apex-gem-top" x1="12" y1="2.5" x2="12" y2="13.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="apex-gem-left" x1="3.5" y1="9.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="apex-gem-right" x1="20.5" y1="9.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      {/* Top facet — brightest */}
      <path d="M12 2.5 L20.5 9.5 L12 13.5 L3.5 9.5 Z" fill="url(#apex-gem-top)" />
      {/* Bottom-left facet */}
      <path d="M3.5 9.5 L12 13.5 L12 21.5 Z" fill="url(#apex-gem-left)" />
      {/* Bottom-right facet */}
      <path d="M20.5 9.5 L12 21.5 L12 13.5 Z" fill="url(#apex-gem-right)" />
    </svg>
  );
}

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, { icon: number; pad: string; text: string; container: string }> = {
  sm:  { icon: 14, pad: "p-1",   text: "text-sm",   container: "rounded-lg" },
  md:  { icon: 20, pad: "p-2",   text: "text-base",  container: "rounded-xl" },
  lg:  { icon: 22, pad: "p-2",   text: "text-xl",    container: "rounded-xl" },
};

export function ApexLogo({
  showSubtitle = false,
  size = "md",
}: {
  showSubtitle?: boolean;
  size?: LogoSize;
}) {
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${s.pad} ${s.container} bg-gradient-to-br from-violet-500/20 via-indigo-500/15 to-blue-500/20 border border-violet-400/25 shadow-[0_0_18px_rgba(139,92,246,0.3)]`}
      >
        <GemIcon size={s.icon} />
      </div>
      <div>
        <span
          className={`font-bold tracking-tight ${s.text} bg-gradient-to-r from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent`}
        >
          Apex
        </span>
        {showSubtitle && (
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            ATS for Bharat
          </p>
        )}
      </div>
    </div>
  );
}
