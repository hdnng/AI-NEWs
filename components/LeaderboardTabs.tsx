"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { formatNumber } from "@/lib/time";
import {
  SearchIcon,
  BrainIcon,
  CalculatorIcon,
  CodeIcon,
  SwordsIcon,
  DownloadIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClearIcon,
  InfoIcon,
  GridIcon,
  TableIcon,
} from "./Icons";

// ── Types ──────────────────────────────────────────────────────────────
export interface ModelData {
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

type SortField =
  | "reasoningScore"
  | "mathScore"
  | "codingScore"
  | "arenaScore"
  | "popularityDownloads"
  | "popularityLikes"
  | "modelName";

type SortDirection = "asc" | "desc";

// Fast lookup cache for organization name
const orgCache = new Map<string, { org: string; isKnownOrg: boolean }>();

function extractOrgInfo(name: string): { org: string; isKnownOrg: boolean } {
  const cached = orgCache.get(name);
  if (cached) return cached;

  const lower = name.toLowerCase();
  let result: { org: string; isKnownOrg: boolean };

  if (lower.includes("openai") || lower.startsWith("gpt") || lower.startsWith("o1") || lower.startsWith("o3")) {
    result = { org: "OpenAI", isKnownOrg: true };
  } else if (lower.includes("anthropic") || lower.startsWith("claude")) {
    result = { org: "Anthropic", isKnownOrg: true };
  } else if (lower.includes("google") || lower.startsWith("gemini") || lower.startsWith("gemma")) {
    result = { org: "Google", isKnownOrg: true };
  } else if (lower.includes("deepseek")) {
    result = { org: "DeepSeek", isKnownOrg: true };
  } else if (lower.includes("meta") || lower.startsWith("llama")) {
    result = { org: "Meta", isKnownOrg: true };
  } else if (lower.includes("qwen") || lower.includes("alibaba")) {
    result = { org: "Alibaba", isKnownOrg: true };
  } else if (lower.includes("mistral") || lower.includes("mixtral") || lower.includes("codestral")) {
    result = { org: "Mistral", isKnownOrg: true };
  } else if (lower.includes("microsoft") || lower.startsWith("phi")) {
    result = { org: "Microsoft", isKnownOrg: true };
  } else if (name.includes("/")) {
    result = { org: name.split("/")[0], isKnownOrg: false };
  } else {
    result = { org: "Open", isKnownOrg: false };
  }

  orgCache.set(name, result);
  return result;
}

export default function LeaderboardTabs({
  models,
  lastUpdated,
}: LeaderboardTabsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery); // React 18 Non-blocking Search
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("reasoningScore");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");

  // Extract unique organizations for filter
  const organizations = useMemo(() => {
    const orgSet = new Set<string>();
    models.forEach((m) => {
      const { org } = extractOrgInfo(m.modelName);
      orgSet.add(org);
    });
    return Array.from(orgSet).sort();
  }, [models]);

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Max score for reasoning to render comparative bar
  const maxReasoning = useMemo(() => {
    let max = 100;
    for (const m of models) {
      if (m.reasoningScore != null && m.reasoningScore > max) {
        max = m.reasoningScore;
      }
    }
    return max;
  }, [models]);

  // Filtered & Sorted models (computed concurrently with deferred search)
  const processedModels = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();

    // 1. Search & Org filter
    let list = models.filter((m) => {
      const matchesSearch = !q || m.modelName.toLowerCase().includes(q);
      const { org } = extractOrgInfo(m.modelName);
      const matchesOrg = selectedOrg === "all" || org === selectedOrg;
      return matchesSearch && matchesOrg;
    });

    // 2. Sort
    list.sort((a, b) => {
      let valA: any = a[sortField as keyof ModelData];
      let valB: any = b[sortField as keyof ModelData];

      if (sortField === "popularityDownloads") {
        valA = a.popularityDownloads != null ? Number(a.popularityDownloads) : null;
        valB = b.popularityDownloads != null ? Number(b.popularityDownloads) : null;
      }

      // Handle nulls always last in descending
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "string") {
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [models, deferredSearch, selectedOrg, sortField, sortDir]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDownIcon className="w-3.5 h-3.5 text-muted opacity-40 group-hover:opacity-100 shrink-0" />;
    }
    return sortDir === "desc" ? (
      <ArrowDownIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
    ) : (
      <ArrowUpIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── Top Filters & Search ────────────────────────────────────────── */}
      <div className="surface-card rounded-2xl p-3.5 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Box with instant typing */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm model (GPT-4o, Claude 3.5, DeepSeek-R1, Llama 3...)"
              className="w-full rounded-xl border border-line bg-surface py-2 sm:py-2.5 pl-9 sm:pl-10 pr-9 sm:pr-10 font-body text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
                title="Xoá tìm kiếm"
              >
                <ClearIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Org Filter & View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Organization Filter Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
              <span className="hidden xs:inline font-mono text-xs text-muted font-medium whitespace-nowrap">
                Hãng:
              </span>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-line bg-surface2 px-2.5 sm:px-3 py-1.5 sm:py-2 font-mono text-xs font-semibold text-ink focus:border-accent focus:outline-none cursor-pointer shadow-sm"
              >
                <option value="all">Tất cả ({models.length})</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle (Mobile / Tablet / Desktop) */}
            <div className="flex items-center rounded-xl border border-line bg-surface2 p-0.5 sm:p-1 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                title="Dạng thẻ (Tối ưu cho điện thoại)"
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 font-mono text-xs ${
                  viewMode === "cards" || (viewMode === "auto" && false)
                    ? "bg-surface text-ink font-bold shadow-sm border border-line"
                    : "text-muted hover:text-ink"
                }`}
              >
                <GridIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Thẻ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Dạng bảng đầy đủ"
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 font-mono text-xs ${
                  viewMode === "table"
                    ? "bg-surface text-ink font-bold shadow-sm border border-line"
                    : "text-muted hover:text-ink"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Bảng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Benchmark Criteria Legend (Horizontal swipeable on mobile) */}
        <div className="mt-3 flex items-center gap-1.5 sm:gap-2 pt-3 border-t border-line overflow-x-auto no-scrollbar pb-0.5 font-mono text-xs text-muted">
          <span className="font-medium mr-0.5 text-inkSecondary shrink-0 text-[11px] sm:text-xs">
            Sắp xếp:
          </span>
          <button
            type="button"
            onClick={() => handleSort("reasoningScore")}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 shadow-sm transition-all ${
              sortField === "reasoningScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <BrainIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
            <span>Suy luận</span>
          </button>

          <button
            type="button"
            onClick={() => handleSort("mathScore")}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 shadow-sm transition-all ${
              sortField === "mathScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <CalculatorIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
            <span>Toán học</span>
          </button>

          <button
            type="button"
            onClick={() => handleSort("codingScore")}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 shadow-sm transition-all ${
              sortField === "codingScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <CodeIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
            <span>Lập trình</span>
          </button>

          <button
            type="button"
            onClick={() => handleSort("arenaScore")}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 shadow-sm transition-all ${
              sortField === "arenaScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <SwordsIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
            <span>Đấu trường Elo</span>
          </button>

          <button
            type="button"
            onClick={() => handleSort("popularityDownloads")}
            className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 shadow-sm transition-all ${
              sortField === "popularityDownloads"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <DownloadIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
            <span>Downloads HF</span>
          </button>
        </div>
      </div>

      {/* ── Status Count ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs text-muted px-1">
        <span>Hiển thị <strong className="text-ink">{processedModels.length}</strong> / {models.length} mô hình</span>
        <span className="hidden xs:inline text-accentText">
          Sắp xếp theo: {
            sortField === "reasoningScore" ? "Suy luận (GPQA)" :
            sortField === "mathScore" ? "Toán (MATH)" :
            sortField === "codingScore" ? "Lập trình (BCB)" :
            sortField === "arenaScore" ? "Arena Elo" :
            sortField === "popularityDownloads" ? "Downloads HF" : "Tên mô hình"
          } ({sortDir === "desc" ? "Cao → Thấp" : "Thấp → Cao"})
        </span>
      </div>

      {/* ── Mobile Responsive Card View (for mobile or when cards mode selected) ── */}
      <div
        className={
          viewMode === "cards"
            ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5"
            : viewMode === "auto"
            ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden"
            : "hidden"
        }
      >
        {processedModels.length > 0 ? (
          processedModels.map((m, idx) => {
            const { org } = extractOrgInfo(m.modelName);
            const isTop1 = idx === 0 && sortDir === "desc";
            const isTop2 = idx === 1 && sortDir === "desc";
            const isTop3 = idx === 2 && sortDir === "desc";
            const reasoningPct =
              m.reasoningScore != null
                ? Math.min(100, Math.max(10, (m.reasoningScore / maxReasoning) * 100))
                : 0;

            return (
              <div
                key={m.id}
                className="surface-card rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-soft hover:border-lineLight transition-colors"
              >
                {/* Card Top: Rank & Model Name & Org */}
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 pt-0.5">
                    {isTop1 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amberDim font-mono text-xs font-bold text-amber border border-amber/40 shadow-sm">
                        1
                      </span>
                    ) : isTop2 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface3 font-mono text-xs font-bold text-ink border border-lineLight shadow-sm">
                        2
                      </span>
                    ) : isTop3 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amberDim font-mono text-xs font-bold text-amber border border-amber/30 shadow-sm">
                        3
                      </span>
                    ) : (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface2 font-mono text-xs font-medium text-muted border border-line">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-display text-sm font-bold text-ink break-words">
                        {m.modelName}
                      </h3>
                      <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted bg-surface3 border border-line shrink-0">
                        {org}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/60 font-mono text-xs">
                  {/* Reasoning GPQA */}
                  <div className="rounded-xl bg-surface2/70 p-2 border border-line/50 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                      <BrainIcon className="w-3 h-3 text-accentLight" />
                      <span>Suy luận GPQA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">
                        {m.reasoningScore != null ? m.reasoningScore.toFixed(2) : "—"}
                      </span>
                      {m.reasoningScore != null && (
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface3">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${reasoningPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Math */}
                  <div className="rounded-xl bg-surface2/70 p-2 border border-line/50 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                      <CalculatorIcon className="w-3 h-3 text-accentLight" />
                      <span>Toán MATH</span>
                    </div>
                    <span className="font-bold text-inkSecondary">
                      {m.mathScore != null ? `${m.mathScore.toFixed(2)}%` : "—"}
                    </span>
                  </div>

                  {/* Coding */}
                  <div className="rounded-xl bg-surface2/70 p-2 border border-line/50 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                      <CodeIcon className="w-3 h-3 text-accentLight" />
                      <span>Code BCB</span>
                    </div>
                    <span className="font-bold text-inkSecondary">
                      {m.codingScore != null ? m.codingScore.toFixed(2) : "—"}
                    </span>
                  </div>

                  {/* Arena Elo */}
                  <div className="rounded-xl bg-surface2/70 p-2 border border-line/50 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                      <SwordsIcon className="w-3 h-3 text-accentLight" />
                      <span>Arena Elo</span>
                    </div>
                    <span className="font-bold text-ink">
                      {m.arenaScore != null ? m.arenaScore.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>

                {/* Card Footer: HF Downloads */}
                {m.popularityDownloads != null && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted border-t border-line/40 pt-1.5">
                    <span className="flex items-center gap-1">
                      <DownloadIcon className="w-3 h-3 text-accentLight" />
                      <span>Downloads HF</span>
                    </span>
                    <span className="font-semibold text-ink">
                      {formatNumber(Number(m.popularityDownloads))}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full surface-card rounded-2xl py-10 px-4 text-center">
            <SearchIcon className="mx-auto h-7 w-7 text-muted mb-2" />
            <p className="font-medium text-ink">Không tìm thấy model nào khớp</p>
            <p className="text-xs text-muted mt-1">
              Hãy thử tìm kiếm với từ khóa khác hoặc bỏ chọn lọc hãng.
            </p>
          </div>
        )}
      </div>

      {/* ── Main Leaderboard Data Table (Desktop or when table mode selected) ── */}
      <div
        className={
          viewMode === "table"
            ? "surface-card rounded-2xl overflow-hidden shadow-soft"
            : viewMode === "auto"
            ? "hidden md:block surface-card rounded-2xl overflow-hidden shadow-soft"
            : "hidden"
        }
      >
        {/* Mobile Horizontal Scroll Hint */}
        <div className="md:hidden flex items-center justify-center gap-1.5 bg-accentDim py-1.5 px-3 border-b border-accent/20 font-mono text-[11px] text-accentText font-medium">
          <span>↔ Vuốt ngang bảng để xem tất cả các cột chỉ số</span>
        </div>

        <div className="custom-table-container">
          <table className="w-full text-left border-collapse min-w-[650px] md:min-w-full">
            <thead>
              <tr className="border-b border-line bg-surface2 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-muted font-bold select-none">
                <th className="py-3 pl-3 sm:pl-4 pr-1.5 w-12 sm:w-14 text-center sticky left-0 bg-surface2 z-20">#</th>
                <th
                  onClick={() => handleSort("modelName")}
                  className="py-3 px-3 sm:px-4 cursor-pointer hover:text-accentLight min-w-[180px] sm:min-w-[220px] sticky left-12 sm:left-14 bg-surface2 z-20 sticky-col-shadow"
                >
                  <div className="flex items-center gap-1.5 group">
                    <span>Mô hình AI</span>
                    {renderSortIcon("modelName")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("reasoningScore")}
                  className="py-3 px-3 cursor-pointer hover:text-accentLight min-w-[130px] sm:min-w-[150px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <BrainIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
                    <span>Suy luận (GPQA)</span>
                    {renderSortIcon("reasoningScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("mathScore")}
                  className="py-3 px-3 cursor-pointer hover:text-accentLight min-w-[110px] sm:min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <CalculatorIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
                    <span>Toán (MATH)</span>
                    {renderSortIcon("mathScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("codingScore")}
                  className="py-3 px-3 cursor-pointer hover:text-accentLight min-w-[110px] sm:min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <CodeIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
                    <span>Code (BCB)</span>
                    {renderSortIcon("codingScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("arenaScore")}
                  className="py-3 px-3 cursor-pointer hover:text-accentLight min-w-[110px] sm:min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <SwordsIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
                    <span>Arena Elo</span>
                    {renderSortIcon("arenaScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("popularityDownloads")}
                  className="py-3 pl-3 pr-3 sm:pr-4 cursor-pointer hover:text-accentLight min-w-[110px] sm:min-w-[120px] text-right"
                >
                  <div className="flex items-center justify-end gap-1.5 group">
                    <DownloadIcon className="w-3.5 h-3.5 text-accentLight shrink-0" />
                    <span>Downloads HF</span>
                    {renderSortIcon("popularityDownloads")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-body text-xs sm:text-sm">
              {processedModels.length > 0 ? (
                processedModels.map((m, idx) => {
                  const { org } = extractOrgInfo(m.modelName);
                  const isTop1 = idx === 0 && sortDir === "desc";
                  const isTop2 = idx === 1 && sortDir === "desc";
                  const isTop3 = idx === 2 && sortDir === "desc";

                  const reasoningPct =
                    m.reasoningScore != null
                      ? Math.min(100, Math.max(10, (m.reasoningScore / maxReasoning) * 100))
                      : 0;

                  return (
                    <tr
                      key={m.id}
                      className="group bg-surface hover:bg-surfaceHover odd:bg-surface even:bg-rowAlt"
                    >
                      {/* Rank Number (Sticky left) */}
                      <td className="py-3 pl-3 sm:pl-4 pr-1.5 text-center font-mono text-xs sticky left-0 bg-surface group-hover:bg-surfaceHover odd:bg-surface even:bg-rowAlt z-10">
                        {isTop1 ? (
                          <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-amberDim font-bold text-amber border border-amber/40 shadow-sm text-[11px] sm:text-xs">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-surface3 font-bold text-ink border border-lineLight shadow-sm text-[11px] sm:text-xs">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-amberDim font-bold text-amber border border-amber/30 shadow-sm text-[11px] sm:text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-muted font-medium">{idx + 1}</span>
                        )}
                      </td>

                      {/* Model Name & Org (Sticky left next to rank) */}
                      <td className="py-3 px-3 sm:px-4 sticky left-12 sm:left-14 bg-surface group-hover:bg-surfaceHover odd:bg-surface even:bg-rowAlt z-10 sticky-col-shadow">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-display font-semibold text-ink group-hover:text-accentLight break-words">
                            {m.modelName}
                          </span>
                          <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-medium text-muted bg-surface3 border border-line shrink-0">
                            {org}
                          </span>
                        </div>
                      </td>

                      {/* Reasoning Score with mini comparison bar */}
                      <td className="py-3 px-3 font-mono text-xs">
                        {m.reasoningScore != null ? (
                          <div className="space-y-1">
                            <span className="font-bold text-ink">
                              {m.reasoningScore.toFixed(2)}
                            </span>
                            <div className="h-1.5 w-16 sm:w-24 overflow-hidden rounded-full bg-surface3">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${reasoningPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* Math Score */}
                      <td className="py-3 px-3 font-mono text-xs">
                        {m.mathScore != null ? (
                          <span className="font-semibold text-inkSecondary">
                            {m.mathScore.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* Coding Score */}
                      <td className="py-3 px-3 font-mono text-xs">
                        {m.codingScore != null ? (
                          <span className="font-semibold text-inkSecondary">
                            {m.codingScore.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* Arena Elo */}
                      <td className="py-3 px-3 font-mono text-xs">
                        {m.arenaScore != null ? (
                          <span className="inline-block rounded bg-surface3 px-2 py-0.5 font-bold text-ink border border-line">
                            {m.arenaScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* HF Downloads */}
                      <td className="py-3 pl-3 pr-3 sm:pr-4 font-mono text-xs text-right font-medium text-muted">
                        {m.popularityDownloads != null ? (
                          formatNumber(Number(m.popularityDownloads))
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    <SearchIcon className="mx-auto h-7 w-7 text-muted mb-2" />
                    <p className="font-medium text-ink">Không tìm thấy model nào khớp</p>
                    <p className="text-xs text-muted mt-1">
                      Hãy thử tìm kiếm với từ khóa khác hoặc bỏ chọn lọc hãng.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Methodology & Last updated footnote ────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px] sm:text-xs text-muted px-1">
        <div className="flex items-center gap-1.5">
          <InfoIcon className="w-3.5 h-3.5 shrink-0 text-accentLight" />
          <span>Thước đo: Open LLM Leaderboard, BigCodeBench, LMSYS Arena Hard v0.1 & HF Hub</span>
        </div>

        {lastUpdated && (
          <span suppressHydrationWarning>
            Đồng bộ lần cuối:{" "}
            {new Date(lastUpdated).toLocaleString("vi-VN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
