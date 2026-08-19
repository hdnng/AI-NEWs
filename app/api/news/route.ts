import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = 20;

    const where = source ? { source } : {};

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json(
      { articles, totalCount, page, pageSize },
      {
        headers: {
          "Cache-Control": "s-maxage=120, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[api/news]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
