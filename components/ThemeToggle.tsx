"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-8 w-14 sm:w-16 items-center rounded-xl border border-line bg-surface p-0.5 opacity-50 shrink-0" />
    );
  }

  return (
    <div className="flex items-center rounded-xl border border-line bg-surface p-0.5 shadow-sm shrink-0">
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Chuyển sang Chế độ Tối (Dark Mode)"
        aria-label="Chuyển sang Chế độ Tối"
        className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1 min-h-[28px] font-mono text-[11px] transition-all duration-200 ${
          theme === "dark"
            ? "bg-surface2 text-accentLight shadow-sm font-semibold"
            : "text-muted hover:text-ink"
        }`}
      >
        <MoonIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Tối</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Chuyển sang Chế độ Sáng (Light Mode)"
        aria-label="Chuyển sang Chế độ Sáng"
        className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1 min-h-[28px] font-mono text-[11px] transition-all duration-200 ${
          theme === "light"
            ? "bg-surface2 text-accent font-semibold shadow-sm"
            : "text-muted hover:text-ink"
        }`}
      >
        <SunIcon className="w-3.5 h-3.5 text-amber shrink-0" />
        <span className="hidden sm:inline">Sáng</span>
      </button>
    </div>
  );
}
