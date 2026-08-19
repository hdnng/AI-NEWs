import { LeaderboardSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <section className="border-b border-line py-10">
        <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-surface" />
        <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-surface2" />
      </section>
      <section>
        <LeaderboardSkeleton />
      </section>
    </div>
  );
}
