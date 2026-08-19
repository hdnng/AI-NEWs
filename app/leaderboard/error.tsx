"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-rose/10 p-4">
        <svg
          className="h-8 w-8 text-rose"
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
      <h2 className="mt-4 font-display text-xl font-bold text-ink">
        Không thể tải bảng xếp hạng
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        {error.message || "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-surface2 px-6 py-2 font-mono text-xs uppercase tracking-wider text-pulse transition-colors hover:bg-pulse/20"
      >
        Thử lại
      </button>
    </div>
  );
}
