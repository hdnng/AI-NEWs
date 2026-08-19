"use client";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 pt-1 sm:pt-2">
      {/* Search and control skeleton */}
      <div className="h-24 sm:h-20 animate-pulse rounded-2xl bg-surface border border-line" />

      {/* Table / Card skeleton */}
      <div className="surface-card rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="h-9 sm:h-10 animate-pulse rounded-lg bg-surface2/60" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 sm:gap-4 py-2 border-b border-line/40">
            <div className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse rounded bg-surface2 shrink-0" />
            <div className="h-4 sm:h-5 w-32 sm:w-48 animate-pulse rounded bg-surface2" />
            <div className="hidden sm:block h-5 w-24 animate-pulse rounded bg-surface2 ml-auto" />
            <div className="h-4 sm:h-5 w-16 sm:w-20 animate-pulse rounded bg-surface2 ml-auto sm:ml-0" />
            <div className="hidden md:block h-5 w-20 animate-pulse rounded bg-surface2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 pt-1 sm:pt-2">
      {/* Search and control skeleton */}
      <div className="h-28 sm:h-24 animate-pulse rounded-2xl bg-surface border border-line" />

      {/* Featured hero skeleton */}
      <div className="h-40 sm:h-48 animate-pulse rounded-2xl bg-surface border border-line" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between h-40 sm:h-44 animate-pulse rounded-2xl bg-surface border border-line p-4 sm:p-5"
          >
            <div className="space-y-2 sm:space-y-2.5">
              <div className="h-3.5 sm:h-4 w-20 rounded bg-surface2" />
              <div className="h-4 sm:h-5 w-4/5 rounded bg-surface2" />
              <div className="h-3 sm:h-3.5 w-full rounded bg-surface2/60" />
            </div>
            <div className="h-3.5 sm:h-4 w-28 rounded bg-surface2/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
