import { prisma } from "./db";
import { RSS_SOURCES } from "./rss-sources";
import Parser from "rss-parser";

// ── Types ──────────────────────────────────────────────────────────────
interface SyncResult {
  success: boolean;
  articlesAdded: number;
  errors: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────
function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// ── Main sync function ─────────────────────────────────────────────────
export async function syncNews(): Promise<SyncResult> {
  const errors: string[] = [];
  let articlesAdded = 0;

  const parser = new Parser({
    timeout: 15_000,
    headers: {
      "User-Agent": "AI-Pulse-Bot/2.0 (+https://github.com/ai-pulse)",
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    },
    customFields: {
      item: [["summary", "summary"]],
    },
  });

  // Fetch tất cả RSS feeds song song
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        const items = feed.items ?? [];

        for (const item of items) {
          const title = stripHtml(item.title);
          const link = item.link ?? item.guid;
          if (!title || !link) continue;

          const pubDate = item.pubDate ?? item.isoDate;
          const publishedAt = pubDate ? new Date(pubDate) : new Date();
          if (isNaN(publishedAt.getTime())) continue;

          const itemRecord = item as unknown as Record<string, unknown>;
          const encodedContent = typeof itemRecord["content:encoded"] === "string" ? itemRecord["content:encoded"] : undefined;
          const rawSummary =
            item.contentSnippet ??
            item.summary ??
            stripHtml(item.content ?? encodedContent);
          const summary = (rawSummary ?? "").slice(0, 300);

          try {
            await prisma.article.upsert({
              where: { link },
              update: {
                title,
                source: source.name,
                publishedAt,
                summary: summary || null,
              },
              create: {
                title,
                link,
                source: source.name,
                publishedAt,
                summary: summary || null,
                category: null,
              },
            });
            articlesAdded++;
          } catch (err) {
            // Bỏ qua lỗi upsert đơn lẻ (ví dụ link quá dài)
            if (
              !(err as Error).message?.includes("Unique constraint")
            ) {
              errors.push(
                `Upsert article failed [${source.id}]: ${(err as Error).message}`
              );
            }
          }
        }

        console.log(
          `[sync-news] ${source.id}: ${items.length} items processed`
        );
      } catch (err) {
        const msg = `Feed ${source.id} (${source.url}) failed: ${(err as Error).message}`;
        console.error(`[sync-news] ${msg}`);
        errors.push(msg);
      }
    })
  );

  // Log các promise bị reject (phòng trường hợp lỗi chưa catch)
  for (const r of results) {
    if (r.status === "rejected") {
      errors.push(`Unhandled feed error: ${r.reason}`);
    }
  }

  console.log(
    `[sync-news] Done: ${articlesAdded} articles upserted, ${errors.length} errors`
  );
  return { success: errors.length === 0, articlesAdded, errors };
}
