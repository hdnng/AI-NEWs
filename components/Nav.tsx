"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SparklesIcon, TrophyIcon } from "./Icons";
import ThemeToggle from "./ThemeToggle";

const links = [
  {
    href: "/news",
    label: "Tin tức AI",
    icon: SparklesIcon,
  },
  {
    href: "/leaderboard",
    label: "Bảng xếp hạng",
    icon: TrophyIcon,
  },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accentDim border border-accent/30 text-accentLight shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-accent" />
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold tracking-tight text-ink group-hover:text-accentLight transition-colors">
                AI PULSE
              </span>
              <span className="rounded bg-accentDim px-1.5 py-0.5 font-mono text-[10px] font-bold text-accentText border border-accent/20">
                LIVE
              </span>
            </div>
          </div>
        </Link>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-2xl border border-line bg-surface2 p-1 shadow-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs tracking-wider transition-all ${
                  active
                    ? "bg-surface text-ink font-bold border border-lineLight shadow-sm"
                    : "text-muted hover:text-ink hover:bg-surfaceHover"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-accentLight" : "text-muted"}`} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & Live Status */}
        <div className="flex items-center gap-3">
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
