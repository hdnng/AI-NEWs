"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/time";

// ── Types ──────────────────────────────────────────────────────────────
interface ModelData {
  id: number;
  modelName: string;
  source: string | null;
  reasoningScore: number | null;
  mathScore: number | null;
  codingScore: number | null;
  arenaScore: number | null;
  popularityDownloads: string | null; // BigInt serialized
  popularityLikes: number | null;
  updatedAt: string;
}

interface LeaderboardTabsProps {
  models: ModelData[];
  lastUpdated: string | null;
}

// ── Criteria config ────────────────────────────────────────────────────
const CRITERIA = [
  { id: "reasoning", label: "Suy luận", field: "reasoningScore" as const, source: "Open LLM Leaderboard (GPQA, MMLU-PRO, BBH)" },
  { id: "math", label: "Toán học", field: "mathScore" as const, source: "Open LLM Leaderboard (MATH Lvl 5)" },
  { id: "coding", label: "Lập trình", field: "codingScore" as const, source: "BigCodeBench (complete + instruct)" },
  { id: "arena", label: "Arena", field: "arenaScore" as const, source: "Arena Hard Auto v0.1 — snapshot 2024-07-31" },
  { id: "downloads", label: "Downloads", field: "popularityDownloads" as const, source: "Hugging Face Hub downloads" },
  { id: "likes", label: "Likes", field: "popularityLikes" as const, source: "Hugging Face Hub likes" },
] as const;

type CriterionId = (typeof CRITERIA)[number]["id"];

// ── Helpers ────────────────────────────────────────────────────────────
function getScore(model: ModelData, criterionId: CriterionId): number | null {
  switch (criterionId) {
    case "reasoning": return model.reasoningScore;
    case "math": return model.mathScore;
    case "coding": return model.codingScore;
    case "arena": return model.arenaScore;
    case "downloads":
      return model.popularityDownloads != null
        ? Number(model.popularityDownloads)
        : null;
    case "likes": return model.popularityLikes;
  }
}

function formatScore(criterionId: CriterionId, value: number | null): string {
  if (value == null) return "N/A";
  if (criterionId === "downloads" || criterionId === "likes") {
    return formatNumber(value);
  }
  if (criterionId === "arena") return value.toFixed(1);
  return value.toFixed(2);
}

// ── Component ──────────────────────────────────────────────────────────
export default function LeaderboardTabs({
  models,
  lastUpdated,
}: LeaderboardTabsProps) {
  const [active, setActive] = useState<CriterionId>("reasoning");
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const activeCriterion = CRITERIA.find((c) => c.id === active)!;

  const ranked = useMemo(() => {
    const withScore = models
      .map((m) => ({ ...m, _score: getScore(m, active) }))
      .filter((m) => m._score != null)
      .sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

    const max = withScore[0]?._score ?? 1;
    return withScore.map((m, i) => ({
      ...m,
      rank: i + 1,
      pct: max > 0 ? ((m._score ?? 0) / max) * 100 : 0,
    }));
  }, [models, active]);

  // Model không có dữ liệu cho tiêu chí này
  const noData = models.filter((m) => getScore(m, active) == null);

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-5">
        {CRITERIA.map((c) => (
          <div key={c.id} className="relative">
            <button
              onClick={() => setActive(c.id)}
              onMouseEnter={() => setShowTooltip(c.id)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                active === c.id
                  ? "bg-pulseDim text-pulse"
                  : "bg-surface text-muted hover:text-ink"
              }`}
            >
              {c.label}
            </button>
            {/* Tooltip hiển thị nguồn dữ liệu */}
            {showTooltip === c.id && (
              <div className="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-line bg-surface p-3 text-xs text-muted shadow-xl">
                <span className="font-mono text-pulse">Nguồn:</span>{" "}
                {c.source}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Source indicator */}
      <div className="mt-4 rounded-lg border border-line/50 bg-surface/50 px-4 py-2 font-mono text-[11px] text-muted">
        📊 Đang xem: <span className="text-pulse">{activeCriterion.label}</span>{" "}
        — Nguồn: {activeCriterion.source}
      </div>

      {/* Ranked list */}
      <ol className="mt-6 space-y-3">
        {ranked.map((m) => (
          <li key={m.id} className="flex items-center gap-4">
            <span
              className={`w-6 shrink-0 text-right font-mono text-sm ${
                m.rank <= 3 ? "text-amber" : "text-muted"
              }`}
            >
              {m.rank}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-display text-base font-medium text-ink">
                  {m.modelName}
                </span>
                <span className="shrink-0 font-mono text-sm text-pulse">
                  {formatScore(active, m._score)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pulseDim to-pulse transition-all duration-500"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Models without data for this criterion */}
      {noData.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="font-mono text-xs text-muted">
            {noData.length} model(s) không có dữ liệu cho tiêu chí &quot;{activeCriterion.label}&quot;:
          </p>
          <p className="mt-1 text-xs text-muted/60">
            {noData.map((m) => m.modelName).slice(0, 10).join(", ")}
            {noData.length > 10 && ` và ${noData.length - 10} model khác...`}
          </p>
        </div>
      )}

      {/* Last updated */}
      {lastUpdated && (
        <p className="mt-6 border-t border-line pt-4 font-mono text-xs text-muted">
          Cập nhật lần cuối:{" "}
          {new Date(lastUpdated).toLocaleString("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
    </div>
  );
}
