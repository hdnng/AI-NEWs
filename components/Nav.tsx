"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/news", label: "Tin tức" },
  { href: "/leaderboard", label: "Xếp hạng" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-pulse" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            AI PULSE
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-surface2 text-pulse"
                    : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
