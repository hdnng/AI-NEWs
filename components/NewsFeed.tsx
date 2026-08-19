"use client";

import { useEffect, useState, useCallback, useMemo, useDeferredValue } from "react";
import NewsCard, { ArticleData } from "./NewsCard";
import {
  SearchIcon,
  GridIcon,
  ListIcon,
  RefreshCwIcon,
  SparklesIcon,
  ExternalLinkIcon,
  ClockIcon,
  ClearIcon,
  getSourceBadgeStyle,
} from "./Icons";
import { timeAgoVi } from "@/lib/time";

interface NewsFeedProps {
  initialArticles: ArticleData[];
  initialTotalCount: number;
  sources: string[];
}

const FRESH_MS = 10 * 60_000; // 10 minutes
const POLL_MS = 180_000; // 3 minutes smart poll

export default function NewsFeed({
  initialArticles,
  initialTotalCount,
  sources,
}: NewsFeedProps) {
  const [articles, setArticles] = useState<ArticleData[]>(initialArticles);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery); // React 18 Non-blocking Search
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Set initial client timestamp on mount to prevent SSR hydration mismatch
  useEffect(() => {
    setFetchedAt(new Date().toISOString());
  }, []);

  const fetchArticles = useCallback(
    async (src: string | null, pg: number, isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        if (src) params.set("source", src);
        params.set("page", String(pg));

        const res = await fetch(`/api/news?${params}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles);
          setTotalCount(data.totalCount);
          setFetchedAt(new Date().toISOString());
        }
      } catch {
        // Keep old data on network error
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Smart background polling (only when page is visible)
  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchArticles(selectedSource, page);
      }
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

  // Client-side search filtering using deferred value (60fps typing)
  const filteredArticles = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        a.source.toLowerCase().includes(q)
    );
  }, [articles, deferredSearch]);

  // Featured top story is top 1 article on page 1 when no search active
  const hasFeatured = page === 1 && !deferredSearch.trim() && !selectedSource && filteredArticles.length > 0;
  const featuredArticle = hasFeatured ? filteredArticles[0] : null;
  const feedArticles = hasFeatured ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="space-y-6">
      {/* ── Control & Search Bar ────────────────────────────────────────── */}
      <div className="surface-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết theo từ khoá, tiêu đề..."
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 font-body text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
                title="Xoá tìm kiếm"
              >
                <ClearIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher & Refresh */}
          <div className="flex items-center justify-between md:justify-end gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-line bg-surface2 p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                title="Dạng lưới thẻ"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs ${
                  viewMode === "grid"
                    ? "bg-surface text-ink font-bold shadow-sm border border-line"
                    : "text-muted hover:text-ink"
                }`}
              >
                <GridIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lưới</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Dạng danh sách gọn"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs ${
                  viewMode === "list"
                    ? "bg-surface text-ink font-bold shadow-sm border border-line"
                    : "text-muted hover:text-ink"
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gọn</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchArticles(selectedSource, page, true)}
              disabled={loading || refreshing}
              title="Làm mới dữ liệu ngay"
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 font-mono text-xs font-medium text-inkSecondary hover:text-ink hover:bg-surfaceHover shadow-sm disabled:opacity-50"
            >
              <RefreshCwIcon
                className={`w-3.5 h-3.5 ${refreshing || loading ? "animate-spin text-accentLight" : ""}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Source Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-line">
          <span className="text-xs font-mono text-inkSecondary font-medium uppercase tracking-wider mr-1">
            Nguồn:
          </span>
          <button
            onClick={() => handleSourceChange(null)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs shadow-sm ${
              selectedSource === null
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            Tất cả ({totalCount})
          </button>
          {sources.map((src) => {
            const badgeStyle = getSourceBadgeStyle(src);
            const active = selectedSource === src;
            return (
              <button
                key={src}
                onClick={() => handleSourceChange(src)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs border shadow-sm ${
                  active
                    ? "bg-accentDim text-accentText font-bold border-accent/40"
                    : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border-line"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${badgeStyle.dot}`} />
                <span>{src}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Status Banner ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between font-mono text-xs text-muted px-1">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald" />
          <span suppressHydrationWarning>
            {fetchedAt
              ? `Cập nhật lúc ${new Date(fetchedAt).toLocaleTimeString("vi-VN")}`
              : "Đang tải dữ liệu realtime..."}
          </span>
          {loading && <span className="text-accentLight font-semibold">• Đang tải...</span>}
        </div>

        {searchQuery && (
          <span className="text-accentLight font-semibold">
            Tìm thấy {filteredArticles.length} kết quả
          </span>
        )}
      </div>

      {/* ── Featured Story (Hero Spotlight) ──────────────────────────── */}
      {featuredArticle && (
        <section className="surface-card rounded-2xl p-6 sm:p-7 border-l-4 border-l-accent shadow-soft">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-accentDim px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-accentText border border-accent/30 shadow-sm">
                <SparklesIcon className="w-3 h-3 text-accentLight" />
                Mới nhất
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-semibold border shadow-sm ${
                  getSourceBadgeStyle(featuredArticle.source).bg
                } ${getSourceBadgeStyle(featuredArticle.source).text} ${
                  getSourceBadgeStyle(featuredArticle.source).border
                }`}
              >
                {featuredArticle.source}
              </span>

              <span className="flex items-center gap-1 font-mono text-xs text-muted" suppressHydrationWarning>
                <ClockIcon className="w-3 h-3" />
                <time dateTime={featuredArticle.publishedAt} suppressHydrationWarning>
                  {timeAgoVi(featuredArticle.publishedAt)}
                </time>
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-ink hover:text-accentLight">
              <a
                href={featuredArticle.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {featuredArticle.title}
              </a>
            </h2>

            {featuredArticle.summary && (
              <p className="max-w-3xl text-sm text-inkSecondary leading-relaxed font-body">
                {featuredArticle.summary}
              </p>
            )}

            <div className="pt-2">
              <a
                href={featuredArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface2 px-4 py-2 font-mono text-xs font-semibold text-ink hover:bg-accent hover:text-white dark:hover:border-accent dark:hover:text-accentLight shadow-sm"
              >
                <span>Đọc toàn bộ bài viết</span>
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── Articles Grid / List ─────────────────────────────────────── */}
      {feedArticles.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "space-y-3"
          }
        >
          {feedArticles.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              isFresh={
                Date.now() - new Date(item.publishedAt).getTime() < FRESH_MS
              }
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="surface-card rounded-2xl py-14 px-4 text-center">
          <SearchIcon className="mx-auto h-7 w-7 text-muted mb-2" />
          <h3 className="font-display text-base font-semibold text-ink">
            Không tìm thấy bài viết nào
          </h3>
          <p className="mt-1 max-w-sm mx-auto text-xs text-muted">
            {searchQuery
              ? `Không có kết quả khớp với "${searchQuery}". Hãy thử từ khoá khác.`
              : "Hiện chưa có bài viết nào trong danh mục này."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 rounded-lg border border-line bg-surface2 px-3 py-1 font-mono text-xs text-ink hover:bg-surfaceHover"
            >
              Xoá bộ lọc tìm kiếm
            </button>
          )}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex items-center justify-between border-t border-line pt-5">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-xl border border-line bg-surface px-4 py-2 font-mono text-xs font-semibold text-muted hover:text-ink hover:border-lineLight disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
          >
            ← Trang trước
          </button>

          <div className="font-mono text-xs text-muted font-medium">
            Trang <span className="font-bold text-ink">{page}</span> / {totalPages}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-xl border border-line bg-surface px-4 py-2 font-mono text-xs font-semibold text-muted hover:text-ink hover:border-lineLight disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  );
}
