"use client";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      {/* Search and control skeleton */}
      <div className="h-20 animate-pulse rounded-2xl bg-surface border border-line" />

      {/* Table skeleton */}
      <div className="surface-card rounded-2xl p-4 space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-surface2/60" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-line/40">
            <div className="h-6 w-6 animate-pulse rounded bg-surface2" />
            <div className="h-5 w-48 animate-pulse rounded bg-surface2" />
            <div className="h-5 w-24 animate-pulse rounded bg-surface2 ml-auto" />
            <div className="h-5 w-20 animate-pulse rounded bg-surface2" />
            <div className="h-5 w-20 animate-pulse rounded bg-surface2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      {/* Search and control skeleton */}
      <div className="h-24 animate-pulse rounded-2xl bg-surface border border-line" />

      {/* Featured hero skeleton */}
      <div className="h-44 animate-pulse rounded-2xl bg-surface border border-line" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between h-44 animate-pulse rounded-2xl bg-surface border border-line p-5"
          >
            <div className="space-y-2.5">
              <div className="h-4 w-20 rounded bg-surface2" />
              <div className="h-5 w-4/5 rounded bg-surface2" />
              <div className="h-3.5 w-full rounded bg-surface2/60" />
            </div>
            <div className="h-4 w-28 rounded bg-surface2/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
