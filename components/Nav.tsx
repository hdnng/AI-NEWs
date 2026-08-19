"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SparklesIcon, TrophyIcon } from "./Icons";
import ThemeToggle from "./ThemeToggle";

const links = [
  {
    href: "/news",
    label: "Tin tức AI",
    shortLabel: "Tin tức",
    icon: SparklesIcon,
  },
  {
    href: "/leaderboard",
    label: "Bảng xếp hạng",
    shortLabel: "Xếp hạng",
    icon: TrophyIcon,
  },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 gap-2">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-accentDim border border-accent/30 text-accentLight shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-accent" />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-sm sm:text-base font-bold tracking-tight text-ink group-hover:text-accentLight transition-colors">
              AI PULSE
            </span>
            <span className="hidden xs:inline-block rounded bg-accentDim px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-accentText border border-accent/20">
              LIVE
            </span>
          </div>
        </Link>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl sm:rounded-2xl border border-line bg-surface2 p-1 shadow-sm shrink-0">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 font-mono text-xs tracking-wider transition-all ${
                  active
                    ? "bg-surface text-ink font-bold border border-lineLight shadow-sm"
                    : "text-muted hover:text-ink hover:bg-surfaceHover"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-accentLight" : "text-muted"}`} />
                <span className="hidden sm:inline">{l.label}</span>
                <span className="sm:hidden text-[11px]">{l.shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & Live Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-muted font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald" />
            <span>5 Nguồn Feed</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
