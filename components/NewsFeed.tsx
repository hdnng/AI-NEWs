"use client";

import { useEffect, useState, useCallback } from "react";
import NewsCard from "./NewsCard";

interface ArticleData {
  id: number;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string | null;
  category: string | null;
}

interface NewsFeedProps {
  initialArticles: ArticleData[];
  initialTotalCount: number;
  sources: string[];
}

const FRESH_MS = 10 * 60_000; // 10 phút (khớp với chu kỳ sync)
const POLL_MS = 60_000; // tự làm mới mỗi 60s

export default function NewsFeed({
  initialArticles,
  initialTotalCount,
  sources,
}: NewsFeedProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(new Date().toISOString());
  const [, forceTick] = useState(0);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Tick mỗi 30s để cập nhật nhãn "x phút trước"
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const fetchArticles = useCallback(
    async (src: string | null, pg: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (src) params.set("source", src);
        params.set("page", String(pg));

        const res = await fetch(`/api/news?${params}`, { cache: "no-store" });
        const data = await res.json();
        setArticles(data.articles);
        setTotalCount(data.totalCount);
        setFetchedAt(new Date().toISOString());
      } catch {
        // Lỗi mạng — giữ dữ liệu cũ
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto poll
  useEffect(() => {
    const id = setInterval(() => {
      fetchArticles(selectedSource, page);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [selectedSource, page, fetchArticles]);

  const handleSourceChange = (src: string | null) => {
    setSelectedSource(src);
    setPage(1);
    fetchArticles(src, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchArticles(selectedSource, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Source filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4 pt-2">
        <button
          onClick={() => handleSourceChange(null)}
          className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
            selectedSource === null
              ? "bg-pulseDim text-pulse"
              : "bg-surface text-muted hover:text-ink"
          }`}
        >
          Tất cả
        </button>
        {sources.map((src) => (
          <button
            key={src}
            onClick={() => handleSourceChange(src)}
            className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
              selectedSource === src
                ? "bg-pulseDim text-pulse"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 py-3 font-mono text-xs text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-pulse" />
        </span>
        Cập nhật lúc {new Date(fetchedAt).toLocaleTimeString("vi-VN")} · tự
        động làm mới mỗi phút
        {loading && (
          <span className="ml-2 text-pulse">đang tải...</span>
        )}
      </div>

      {/* Articles list */}
      <div>
        {articles.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            isFresh={
              Date.now() - new Date(item.publishedAt).getTime() < FRESH_MS
            }
          />
        ))}
      </div>

      {articles.length === 0 && !loading && (
        <p className="py-10 text-center text-muted">
          Chưa có tin nào — hãy chạy sync job hoặc chờ cron tự động cập nhật.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-line pt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-full bg-surface px-4 py-1.5 font-mono text-xs text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Trang trước
          </button>
          <span className="font-mono text-xs text-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-full bg-surface px-4 py-1.5 font-mono text-xs text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  );
}
