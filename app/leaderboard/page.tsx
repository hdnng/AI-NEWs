import { prisma } from "@/lib/db";
import LeaderboardTabs from "@/components/LeaderboardTabs";

export const revalidate = 300; // ISR: 5 phút

export default async function LeaderboardPage() {
  let serializedModels: any[] = [];
  let lastUpdated: string | null = null;

  try {
    const [models, agg] = await Promise.all([
      prisma.model.findMany({
        orderBy: { reasoningScore: { sort: "desc", nulls: "last" } },
      }),
      prisma.model.aggregate({
        _max: { updatedAt: true },
      }),
    ]);

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
    <div>
      <section className="border-b border-line py-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
          Bảng xếp hạng
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Ai đang dẫn đầu, theo từng tiêu chí
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Dữ liệu được tự động đồng bộ mỗi 6 giờ từ nhiều nguồn khác nhau (Open LLM Leaderboard,
          Arena Hard, BigCodeBench, Hugging Face Hub). Hover vào tab để xem
          nguồn cụ thể. Model đóng (GPT-4o, Claude…) không có trên HF Hub nên
          popularity hiển thị &quot;N/A&quot;.
        </p>
      </section>

      <section className="pt-6">
        <LeaderboardTabs
          models={serializedModels}
          lastUpdated={lastUpdated}
        />
      </section>
    </div>
  );
}
