"use client";

import { RefreshCwIcon } from "@/components/Icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-rose/20 bg-surface/50 p-8 text-center backdrop-blur shadow-card">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose/10 border border-rose/30 text-rose">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h2 className="mt-5 font-display text-2xl font-bold text-ink">
        Không thể tải tin tức AI
      </h2>

      <p className="mt-2 max-w-md text-sm text-muted">
        {error.message || "Đã xảy ra lỗi khi kết nối hoặc tải dữ liệu. Vui lòng thử lại sau giây lát."}
      </p>

      <button
        onClick={reset}
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pulse to-cyan px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-base transition-all hover:opacity-90 hover:shadow-glow"
      >
        <RefreshCwIcon className="w-3.5 h-3.5" />
        <span>Thử lại</span>
      </button>
    </div>
  );
}
