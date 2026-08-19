import { prisma } from "./db";
import Papa from "papaparse";

// ── Types ──────────────────────────────────────────────────────────────
interface ModelDraft {
  modelName: string;
  source: string;
  reasoningScore?: number | null;
  mathScore?: number | null;
  codingScore?: number | null;
  arenaScore?: number | null;
  popularityDownloads?: bigint | null;
  popularityLikes?: number | null;
}

interface SyncResult {
  success: boolean;
  modelsUpdated: number;
  errors: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────
function normalizeModelName(name: string): string {
  return name.toLowerCase().replace(/[_\-\/]/g, " ").replace(/\s+/g, " ").trim();
}

/** Fetch với timeout (mặc định 15s) */
async function fetchWithTimeout(url: string, timeoutMs = 15_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** Nhân 100 nếu giá trị nằm trong khoảng [0, 1] */
function toPercent(v: unknown): number | null {
  const n = Number(v);
  if (isNaN(n) || v === null || v === undefined || v === "") return null;
  return n <= 1 ? Math.round(n * 10000) / 100 : Math.round(n * 100) / 100;
}

/** Trung bình, bỏ qua null */
function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100;
}

// ── Nguồn 1: Open LLM Leaderboard (reasoning + math) ──────────────────
async function fetchOpenLLM(map: Map<string, ModelDraft>, errors: string[]) {
  const BASE = "https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard/contents&config=default&split=train&length=100";
  let offset = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = `${BASE}&offset=${offset}`;
      const res = await fetchWithTimeout(url, 10_000);
      if (!res.ok) throw new Error(`HTTP ${res.status} from Open LLM Leaderboard`);
      const data = await res.json();
      const rows: Array<{ row: Record<string, unknown> }> = data.rows ?? [];

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const { row } of rows) {
        const fullname = String(row["fullname"] ?? row["Model"] ?? "").trim();
        if (!fullname) continue;

        const gpqa = toPercent(row["GPQA Raw"]);
        const mmlu = toPercent(row["MMLU-PRO Raw"]);
        const bbh = toPercent(row["BBH Raw"]);
        const mathScore = toPercent(row["MATH Lvl 5 Raw"]);
        const reasoningScore = avg([gpqa, mmlu, bbh]);

        const key = normalizeModelName(fullname);
        const existing = map.get(key);
        map.set(key, {
          ...(existing ?? {}),
          modelName: existing?.modelName ?? fullname,
          source: "open-llm-leaderboard",
          reasoningScore: reasoningScore ?? existing?.reasoningScore ?? null,
          mathScore: mathScore ?? existing?.mathScore ?? null,
        });
      }

      offset += rows.length;
      // Giới hạn 200 model hàng đầu để tối ưu tốc độ
      if (offset >= 200) hasMore = false;
    }
    console.log(`[sync-leaderboard] Open LLM: loaded ${offset} rows`);
  } catch (err) {
    const msg = `Open LLM Leaderboard failed: ${(err as Error).message}`;
    console.error(`[sync-leaderboard] ${msg}`);
    errors.push(msg);
  }
}

// ── Nguồn 2: Arena Hard CSV (arena score) ──────────────────────────────
async function fetchArenaHard(map: Map<string, ModelDraft>, errors: string[]) {
  const URL =
    "https://huggingface.co/spaces/lmarena-ai/arena-leaderboard/raw/main/arena_hard_auto_leaderboard_v0.1.csv";

  try {
    const res = await fetchWithTimeout(URL, 10_000);
    if (!res.ok) throw new Error(`HTTP ${res.status} from Arena Hard CSV`);
    const csvText = await res.text();

    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    for (const row of parsed.data) {
      const modelName = (row["model"] ?? "").trim();
      const score = parseFloat(row["score"] ?? "");
      if (!modelName || isNaN(score)) continue;

      const key = normalizeModelName(modelName);
      const existing = map.get(key);
      map.set(key, {
        ...(existing ?? {}),
        modelName: existing?.modelName ?? modelName,
        source: existing?.source ?? "arena-hard",
        arenaScore: score,
      });
    }
    console.log(`[sync-leaderboard] Arena Hard: loaded ${parsed.data.length} models`);
  } catch (err) {
    const msg = `Arena Hard CSV failed: ${(err as Error).message}`;
    console.error(`[sync-leaderboard] ${msg}`);
    errors.push(msg);
  }
}

// ── Nguồn 3: BigCodeBench (coding score) ───────────────────────────────
async function fetchBigCodeBench(map: Map<string, ModelDraft>, errors: string[]) {
  const URL =
    "https://datasets-server.huggingface.co/rows?dataset=bigcode/bigcodebench-results&config=default&split=train&length=100";

  try {
    const res = await fetchWithTimeout(URL, 10_000);
    if (!res.ok) throw new Error(`HTTP ${res.status} from BigCodeBench`);
    const data = await res.json();
    const rows: Array<{ row: Record<string, unknown> }> = data.rows ?? [];

    for (const { row } of rows) {
      const modelName = String(row["model"] ?? "").trim();
      if (!modelName) continue;

      const complete = toPercent(row["complete"]);
      const instruct = toPercent(row["instruct"]);
      const codingScore = avg([complete, instruct]);

      const key = normalizeModelName(modelName);
      const existing = map.get(key);
      map.set(key, {
        ...(existing ?? {}),
        modelName: existing?.modelName ?? modelName,
        source: existing?.source ?? "bigcodebench",
        codingScore: codingScore ?? existing?.codingScore ?? null,
      });
    }
    console.log(`[sync-leaderboard] BigCodeBench: loaded ${rows.length} models`);
  } catch (err) {
    const msg = `BigCodeBench failed: ${(err as Error).message}`;
    console.error(`[sync-leaderboard] ${msg}`);
    errors.push(msg);
  }
}

// ── Nguồn 4: HF Hub Popularity (downloads + likes) ────────────────────
async function fetchPopularity(map: Map<string, ModelDraft>, errors: string[]) {
  // Chỉ fetch cho model có dạng "org/model" (HF Hub ID)
  const candidates = Array.from(map.entries()).filter(([, m]) => m.modelName.includes("/"));
  const batch = candidates.slice(0, 20); // 20 models nhanh

  const promises = batch.map(async ([key, model]) => {
    try {
      const res = await fetchWithTimeout(
        `https://huggingface.co/api/models/${encodeURIComponent(model.modelName)}`,
        5_000
      );
      if (!res.ok) return;
      const data = await res.json();

      map.set(key, {
        ...model,
        popularityDownloads: data.downloads != null ? BigInt(data.downloads) : null,
        popularityLikes: data.likes != null ? Number(data.likes) : null,
      });
    } catch {
      // Bỏ qua lỗi từng model
    }
  });

  await Promise.allSettled(promises);
  console.log(`[sync-leaderboard] Popularity: processed batch of ${batch.length}`);
}

// ── Main sync function ─────────────────────────────────────────────────
export async function syncLeaderboard(): Promise<SyncResult> {
  const errors: string[] = [];
  const map = new Map<string, ModelDraft>();

  // Fetch song song 3 nguồn chính
  await Promise.allSettled([
    fetchOpenLLM(map, errors),
    fetchArenaHard(map, errors),
    fetchBigCodeBench(map, errors),
  ]);

  // Fetch popularity
  await fetchPopularity(map, errors);

  // Upsert vào DB theo batch 20 để tối ưu network latency
  const allModels = Array.from(map.values()).filter((m) => m.modelName);
  let modelsUpdated = 0;
  const chunkSize = 20;

  for (let i = 0; i < allModels.length; i += chunkSize) {
    const chunk = allModels.slice(i, i + chunkSize);
    await Promise.allSettled(
      chunk.map(async (model) => {
        try {
          await prisma.model.upsert({
            where: { modelName: model.modelName },
            update: {
              source: model.source ?? undefined,
              reasoningScore: model.reasoningScore ?? undefined,
              mathScore: model.mathScore ?? undefined,
              codingScore: model.codingScore ?? undefined,
              arenaScore: model.arenaScore ?? undefined,
              popularityDownloads: model.popularityDownloads ?? undefined,
              popularityLikes: model.popularityLikes ?? undefined,
            },
            create: {
              modelName: model.modelName,
              source: model.source ?? null,
              reasoningScore: model.reasoningScore ?? null,
              mathScore: model.mathScore ?? null,
              codingScore: model.codingScore ?? null,
              arenaScore: model.arenaScore ?? null,
              popularityDownloads: model.popularityDownloads ?? null,
              popularityLikes: model.popularityLikes ?? null,
            },
          });
          modelsUpdated++;
        } catch (err) {
          errors.push(`Upsert failed for ${model.modelName}: ${(err as Error).message}`);
        }
      })
    );
  }

  console.log(`[sync-leaderboard] Done: ${modelsUpdated} models updated, ${errors.length} errors`);
  return { success: errors.length === 0, modelsUpdated, errors };
}
