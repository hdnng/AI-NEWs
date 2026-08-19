import { prisma } from "@/lib/db";
import NewsFeed from "@/components/NewsFeed";

export const revalidate = 120; // ISR: 2 minutes

export default async function NewsPage() {
  let serializedArticles: any[] = [];
  let totalCount = 0;
  let sources: string[] = [];

  try {
    const [articles, count, sourcesRaw] = await Promise.all([
      prisma.article.findMany({
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
      prisma.article.count(),
      prisma.article.findMany({
        select: { source: true },
        distinct: ["source"],
        orderBy: { source: "asc" },
      }),
    ]);

    totalCount = count;
    sources = sourcesRaw.map((s) => s.source);

    // Serialize dates for client component
    serializedArticles = articles.map((a) => ({
      ...a,
      publishedAt: a.publishedAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (err) {
    console.warn("[NewsPage] DB query skipped (e.g. at build time or DB not connected yet)");
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="border-b border-line pb-4 sm:pb-6 pt-1 sm:pt-2">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-accentDim px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-accentText border border-accent/20 shadow-sm">
              Live Feed
            </span>
            <span className="font-mono text-xs text-muted font-medium">
              {sources.length > 0 ? `${sources.length} Nguồn cập nhật tự động` : "5 Nguồn cấp uy tín"}
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-ink leading-tight">
            Tin tức Trí tuệ Nhân tạo Toàn cầu
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm text-muted leading-relaxed font-body">
            Tổng hợp thông tin mới nhất từ OpenAI, Google AI Blog, TechCrunch, VentureBeat và arXiv CS.AI.
          </p>
        </div>
      </section>

      {/* Main Feed Section */}
      <section>
        <NewsFeed
          initialArticles={serializedArticles}
          initialTotalCount={totalCount}
          sources={sources}
        />
      </section>
    </div>
  );
}
