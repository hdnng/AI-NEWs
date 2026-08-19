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
    <div className="flex min-h-[40vh] sm:min-h-[50vh] flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-rose/20 bg-surface/50 p-5 sm:p-8 text-center backdrop-blur shadow-card">
      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-rose/10 border border-rose/30 text-rose">
        <svg
          className="h-6 w-6 sm:h-8 sm:w-8"
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

      <h2 className="mt-4 sm:mt-5 font-display text-xl sm:text-2xl font-bold text-ink">
        Không thể tải tin tức AI
      </h2>

      <p className="mt-2 max-w-md text-xs sm:text-sm text-muted">
        {error.message || "Đã xảy ra lỗi khi kết nối hoặc tải dữ liệu. Vui lòng thử lại sau giây lát."}
      </p>

      <button
        onClick={reset}
        className="mt-5 sm:mt-6 flex items-center gap-2 rounded-xl bg-accent px-5 sm:px-6 py-2 sm:py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 shadow-sm"
      >
        <RefreshCwIcon className="w-3.5 h-3.5" />
        <span>Thử lại</span>
      </button>
    </div>
  );
}
