import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") ?? "reasoning";

    // Map sort param → Prisma orderBy field
    const sortMap: Record<string, string> = {
      reasoning: "reasoningScore",
      math: "mathScore",
      coding: "codingScore",
      arena: "arenaScore",
      downloads: "popularityDownloads",
      likes: "popularityLikes",
    };
    const orderField = sortMap[sort] ?? "reasoningScore";

    const models = await prisma.model.findMany({
      orderBy: { [orderField]: { sort: "desc", nulls: "last" } },
    });

    const agg = await prisma.model.aggregate({
      _max: { updatedAt: true },
    });

    // BigInt → string để JSON.stringify không lỗi
    const serialized = models.map((m) => ({
      ...m,
      popularityDownloads: m.popularityDownloads?.toString() ?? null,
    }));

    return NextResponse.json(
      { models: serialized, updatedAt: agg._max.updatedAt },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[api/leaderboard]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
