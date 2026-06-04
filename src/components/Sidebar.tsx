"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, KanbanSquare, BarChart3, Briefcase, User } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Candidates", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: KanbanSquare, exact: false },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { href: "/dashboard/jobs", label: "Saved JDs", icon: Briefcase, exact: false },
  { href: "/profile", label: "Profile", icon: User, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col bg-background border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-border shrink-0">
        <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight">Apex</span>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">ATS for Bharat</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-border shrink-0 flex items-center gap-3">
        <UserButton />
        <span className="text-xs text-muted-foreground truncate">Account</span>
      </div>
    </aside>
  );
}
