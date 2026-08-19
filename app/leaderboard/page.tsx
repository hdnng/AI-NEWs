import { prisma } from "@/lib/db";
import LeaderboardTabs from "@/components/LeaderboardTabs";

export const revalidate = 300; // ISR: 5 minutes

export default async function LeaderboardPage() {
  let serializedModels: any[] = [];
  let lastUpdated: string | null = null;
  let totalModels = 0;

  try {
    const [models, agg, count] = await Promise.all([
      prisma.model.findMany({
        orderBy: { reasoningScore: { sort: "desc", nulls: "last" } },
      }),
      prisma.model.aggregate({
        _max: { updatedAt: true },
      }),
      prisma.model.count(),
    ]);

    totalModels = count;
    serializedModels = models.map((m) => ({
      ...m,
      popularityDownloads: m.popularityDownloads?.toString() ?? null,
      updatedAt: m.updatedAt.toISOString(),
    }));

    lastUpdated = agg._max.updatedAt?.toISOString() ?? null;
  } catch (err) {
    console.warn("[LeaderboardPage] DB query skipped (e.g. at build time or DB not connected yet)");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="border-b border-line pb-6 pt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-accentDim px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accentText border border-accent/20 shadow-sm">
              Benchmark
            </span>
            <span className="font-mono text-xs text-muted font-medium">
              {totalModels > 0 ? `${totalModels} Mô hình đã đo lường` : "Bảng so sánh tổng hợp"}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Bảng xếp hạng & So sánh Mô hình AI
          </h1>

          <p className="max-w-2xl text-sm text-muted leading-relaxed font-body">
            Dữ liệu tổng hợp trực tiếp từ Open LLM Leaderboard (Suy luận GPQA, Toán MATH), 
            BigCodeBench (Lập trình), LMSYS Arena Hard và Hugging Face Hub. Nhấn vào tiêu đề cột để sắp xếp trực tiếp.
          </p>
        </div>
      </section>

      {/* Leaderboard Table Section */}
      <section>
        <LeaderboardTabs
          models={serializedModels}
          lastUpdated={lastUpdated}
        />
      </section>
    </div>
  );
}
