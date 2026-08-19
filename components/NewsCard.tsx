"use client";

import React, { useState, memo } from "react";
import { timeAgoVi } from "@/lib/time";
import {
  ExternalLinkIcon,
  ClockIcon,
  CopyIcon,
  CheckIcon,
  getSourceBadgeStyle,
} from "./Icons";

export interface ArticleData {
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
  viewMode?: "grid" | "list";
}

// Estimate read time based on summary length
function estimateReadingTime(summary: string | null): string {
  if (!summary) return "1 phút đọc";
  const words = summary.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 40));
  return `${mins} phút đọc`;
}

function NewsCard({ item, isFresh, viewMode = "grid" }: NewsCardProps) {
  const [copied, setCopied] = useState(false);
  const badgeStyle = getSourceBadgeStyle(item.source);
  const readTime = estimateReadingTime(item.summary);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (viewMode === "list") {
    return (
      <article className="surface-card rounded-2xl p-3.5 sm:p-5 hover:border-lineLight hover:bg-surfaceHover shadow-soft transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 font-mono text-[10px] sm:text-[11px]">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-semibold border shadow-sm ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                {item.source}
              </span>

              <span className="flex items-center gap-1 text-muted" suppressHydrationWarning>
                <ClockIcon className="w-3 h-3 shrink-0" />
                <time dateTime={item.publishedAt} suppressHydrationWarning>
                  {timeAgoVi(item.publishedAt)}
                </time>
              </span>

              {isFresh && (
                <span className="inline-flex items-center rounded-md bg-accentDim px-1.5 py-0.5 font-bold text-[9px] sm:text-[10px] text-accentText border border-accent/20">
                  MỚI
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-display text-sm sm:text-base font-bold leading-snug text-ink hover:text-accentLight break-words">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline focus:outline-none"
              >
                {item.title}
              </a>
            </h3>

            {/* Summary */}
            {item.summary && (
              <p className="mt-1 line-clamp-2 sm:line-clamp-1 text-xs text-muted leading-relaxed font-body break-words">
                {item.summary}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-line/40 sm:border-0">
            <span className="sm:hidden font-mono text-[11px] text-muted">{readTime}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                title="Sao chép liên kết"
                aria-label="Sao chép liên kết"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover shadow-sm"
              >
                {copied ? (
                  <CheckIcon className="w-3.5 h-3.5 text-emerald" />
                ) : (
                  <CopyIcon className="w-3.5 h-3.5" />
                )}
              </button>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface2 px-3 py-1.5 font-mono text-xs font-semibold text-inkSecondary hover:bg-accent hover:text-white dark:hover:text-ink dark:hover:border-lineLight shadow-sm"
              >
                <span>Xem bài</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid Card Layout (Default)
  return (
    <article className="surface-card rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-between hover:border-lineLight hover:bg-surfaceHover shadow-soft transition-colors">
      <div>
        {/* Top bar: Source badge + Time */}
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold border shadow-sm ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
              {item.source}
            </span>

            {isFresh && (
              <span className="inline-flex items-center rounded-md bg-accentDim px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-accentText border border-accent/20">
                MỚI
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            title={copied ? "Đã sao chép!" : "Sao chép link"}
            aria-label="Sao chép liên kết"
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-line bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover shadow-sm"
          >
            {copied ? (
              <CheckIcon className="w-3.5 h-3.5 text-emerald" />
            ) : (
              <CopyIcon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-ink hover:text-accentLight break-words">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-none"
          >
            {item.title}
          </a>
        </h3>

        {/* Summary */}
        {item.summary && (
          <p className="mt-2 sm:mt-2.5 line-clamp-3 text-xs sm:text-sm text-muted leading-relaxed font-body break-words">
            {item.summary}
          </p>
        )}
      </div>

      {/* Card Footer: Timestamp, Read time, Link button */}
      <div className="mt-4 sm:mt-5 flex items-center justify-between border-t border-line pt-3 sm:pt-3.5">
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs text-muted" suppressHydrationWarning>
          <span className="flex items-center gap-1 text-muted" suppressHydrationWarning>
            <ClockIcon className="w-3 h-3 shrink-0" />
            <time dateTime={item.publishedAt} suppressHydrationWarning>
              {timeAgoVi(item.publishedAt)}
            </time>
          </span>
          <span className="text-lineLight">•</span>
          <span className="text-muted">{readTime}</span>
        </div>

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 sm:gap-1.5 font-mono text-xs font-semibold text-accentLight hover:underline"
        >
          <span>Đọc bài</span>
          <ExternalLinkIcon className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
}

export default memo(NewsCard);
