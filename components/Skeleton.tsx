"use client";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 pt-6">
      {/* Tab skeleton */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-surface"
          />
        ))}
      </div>
      {/* Row skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-5 w-6 animate-pulse rounded bg-surface" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div
                  className="h-5 animate-pulse rounded bg-surface"
                  style={{ width: `${60 - i * 4}%` }}
                />
                <div className="h-5 w-12 animate-pulse rounded bg-surface" />
              </div>
              <div className="h-1.5 w-full animate-pulse rounded-full bg-surface2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-b border-line py-5 pl-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 animate-pulse rounded bg-surface" />
            <div className="h-3 w-2 animate-pulse rounded bg-surface" />
            <div className="h-3 w-16 animate-pulse rounded bg-surface" />
          </div>
          <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-surface" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-surface2" />
          <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-surface2" />
        </div>
      ))}
    </div>
  );
}
