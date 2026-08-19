"use client";

import { timeAgoVi } from "@/lib/time";

interface ArticleData {
  id: number;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string | null;
  category: string | null;
}

interface NewsCardProps {
  item: ArticleData;
  isFresh: boolean;
}

export default function NewsCard({ item, isFresh }: NewsCardProps) {
  return (
    <article className="group relative animate-rise border-b border-line py-5 pl-6 transition-colors hover:bg-surface/60">
      <span
        className={`absolute left-0 top-6 h-2 w-2 -translate-x-[3px] rounded-full ${
          isFresh ? "bg-pulse animate-pulseDot" : "bg-line"
        }`}
      />

      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        <span className="text-pulse">{item.source}</span>
        <span>·</span>
        <time dateTime={item.publishedAt}>
          {timeAgoVi(item.publishedAt)}
        </time>
        {isFresh && (
          <span className="rounded-full bg-pulseDim px-2 py-0.5 text-pulse">
            MỚI
          </span>
        )}
      </div>

      <h3 className="mt-1.5 font-display text-lg font-medium leading-snug text-ink group-hover:text-pulse">
        {item.title}
      </h3>

      {item.summary && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">
          {item.summary}
        </p>
      )}

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block font-mono text-xs text-pulse/70 transition-colors hover:text-pulse"
      >
        Đọc bài đầy đủ →
      </a>
    </article>
  );
}
