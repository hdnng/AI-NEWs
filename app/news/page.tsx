import { prisma } from "@/lib/db";
import NewsFeed from "@/components/NewsFeed";

export const revalidate = 120; // ISR: 2 phút

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

    // Serialize dates cho client component
    serializedArticles = articles.map((a) => ({
      ...a,
      publishedAt: a.publishedAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (err) {
    console.warn("[NewsPage] DB query skipped (e.g. at build time or DB not connected yet)");
  }

  return (
    <div>
      <section className="border-b border-line py-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-pulse">
          Tổng hợp tin tức AI
        </p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Bắt tín hiệu AI ngay khi vừa phát ra
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Gom tin từ {sources.length} nguồn uy tín, tự động đồng bộ mỗi 10 phút
          — dữ liệu luôn sẵn trong database, không fetch ngoài khi bạn load trang.
        </p>
      </section>

      <section className="pt-2">
        <NewsFeed
          initialArticles={serializedArticles}
          initialTotalCount={totalCount}
          sources={sources}
        />
      </section>
    </div>
  );
}
