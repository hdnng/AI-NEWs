import { NextResponse } from "next/server";
import { syncNews } from "@/lib/sync-news";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel: tối đa 30s cho job này

export async function GET(request: Request) {
  // Kiểm tra secret token — chặn gọi trái phép
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncNews();
    return NextResponse.json(result, { status: result.success ? 200 : 207 });
  } catch (err) {
    console.error("[cron/sync-news] Fatal:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
