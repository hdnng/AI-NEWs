"use client";

import { useMemo, useState } from "react";
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

// Extract clean model organization / family tag if any
function extractOrgInfo(name: string): { org: string; isKnownOrg: boolean } {
  const lower = name.toLowerCase();
  if (lower.includes("openai") || lower.startsWith("gpt") || lower.startsWith("o1") || lower.startsWith("o3")) {
    return { org: "OpenAI", isKnownOrg: true };
  }
  if (lower.includes("anthropic") || lower.startsWith("claude")) {
    return { org: "Anthropic", isKnownOrg: true };
  }
  if (lower.includes("google") || lower.startsWith("gemini") || lower.startsWith("gemma")) {
    return { org: "Google", isKnownOrg: true };
  }
  if (lower.includes("deepseek")) {
    return { org: "DeepSeek", isKnownOrg: true };
  }
  if (lower.includes("meta") || lower.startsWith("llama")) {
    return { org: "Meta", isKnownOrg: true };
  }
  if (lower.includes("qwen") || lower.includes("alibaba")) {
    return { org: "Alibaba", isKnownOrg: true };
  }
  if (lower.includes("mistral") || lower.includes("mixtral") || lower.includes("codestral")) {
    return { org: "Mistral", isKnownOrg: true };
  }
  if (lower.includes("microsoft") || lower.startsWith("phi")) {
    return { org: "Microsoft", isKnownOrg: true };
  }
  if (name.includes("/")) {
    return { org: name.split("/")[0], isKnownOrg: false };
  }
  return { org: "Open", isKnownOrg: false };
}

export default function LeaderboardTabs({
  models,
  lastUpdated,
}: LeaderboardTabsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("reasoningScore");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

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

  // Filtered & Sorted models
  const processedModels = useMemo(() => {
    // 1. Search & Org filter
    let list = models.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.modelName.toLowerCase().includes(searchQuery.toLowerCase().trim());

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
  }, [models, searchQuery, selectedOrg, sortField, sortDir]);

  // Max score for reasoning to render comparative bar
  const maxReasoning = useMemo(() => {
    const valid = models
      .map((m) => m.reasoningScore)
      .filter((s): s is number => s != null);
    return Math.max(...valid, 100);
  }, [models]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDownIcon className="w-3.5 h-3.5 text-muted opacity-40 group-hover:opacity-100" />;
    }
    return sortDir === "desc" ? (
      <ArrowDownIcon className="w-3.5 h-3.5 text-accentLight" />
    ) : (
      <ArrowUpIcon className="w-3.5 h-3.5 text-accentLight" />
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Top Filters & Search ────────────────────────────────────────── */}
      <div className="surface-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm model (vd: GPT-4o, Claude 3.5, DeepSeek-R1, Llama 3...)"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 font-body text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none transition-colors shadow-sm"
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

          {/* Organization Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted font-medium whitespace-nowrap">
              Hãng phát triển:
            </span>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="rounded-xl border border-line bg-surface2 px-3 py-2.5 font-mono text-xs font-semibold text-ink focus:border-accent focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="all">Tất cả ({models.length})</option>
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Benchmark Criteria Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-line font-mono text-xs text-muted">
          <span className="font-medium mr-1 text-inkSecondary">Sắp xếp theo:</span>
          <button
            onClick={() => handleSort("reasoningScore")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all shadow-sm ${
              sortField === "reasoningScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <BrainIcon className="w-3.5 h-3.5 text-accentLight" />
            <span>Suy luận</span>
          </button>

          <button
            onClick={() => handleSort("mathScore")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all shadow-sm ${
              sortField === "mathScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <CalculatorIcon className="w-3.5 h-3.5 text-accentLight" />
            <span>Toán học</span>
          </button>

          <button
            onClick={() => handleSort("codingScore")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all shadow-sm ${
              sortField === "codingScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <CodeIcon className="w-3.5 h-3.5 text-accentLight" />
            <span>Lập trình</span>
          </button>

          <button
            onClick={() => handleSort("arenaScore")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all shadow-sm ${
              sortField === "arenaScore"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <SwordsIcon className="w-3.5 h-3.5 text-accentLight" />
            <span>Đấu trường Elo</span>
          </button>

          <button
            onClick={() => handleSort("popularityDownloads")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all shadow-sm ${
              sortField === "popularityDownloads"
                ? "bg-accentDim text-accentText font-bold border border-accent/40"
                : "bg-surface2 text-muted hover:text-ink hover:bg-surfaceHover border border-line"
            }`}
          >
            <DownloadIcon className="w-3.5 h-3.5 text-accentLight" />
            <span>Downloads HF</span>
          </button>
        </div>
      </div>

      {/* ── Main Leaderboard Data Table ─────────────────────────────────── */}
      <div className="surface-card rounded-2xl overflow-hidden shadow-soft">
        <div className="custom-table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface2 font-mono text-xs uppercase tracking-wider text-muted font-bold select-none">
                <th className="py-3.5 pl-4 pr-2 w-14 text-center">#</th>
                <th
                  onClick={() => handleSort("modelName")}
                  className="py-3.5 px-4 cursor-pointer hover:text-accentLight transition-colors min-w-[220px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <span>Mô hình AI</span>
                    {renderSortIcon("modelName")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("reasoningScore")}
                  className="py-3.5 px-3 cursor-pointer hover:text-accentLight transition-colors min-w-[150px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <BrainIcon className="w-3.5 h-3.5 text-accentLight" />
                    <span>Suy luận (GPQA)</span>
                    {renderSortIcon("reasoningScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("mathScore")}
                  className="py-3.5 px-3 cursor-pointer hover:text-accentLight transition-colors min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <CalculatorIcon className="w-3.5 h-3.5 text-accentLight" />
                    <span>Toán (MATH)</span>
                    {renderSortIcon("mathScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("codingScore")}
                  className="py-3.5 px-3 cursor-pointer hover:text-accentLight transition-colors min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <CodeIcon className="w-3.5 h-3.5 text-accentLight" />
                    <span>Code (BCB)</span>
                    {renderSortIcon("codingScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("arenaScore")}
                  className="py-3.5 px-3 cursor-pointer hover:text-accentLight transition-colors min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5 group">
                    <SwordsIcon className="w-3.5 h-3.5 text-accentLight" />
                    <span>Arena Elo</span>
                    {renderSortIcon("arenaScore")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("popularityDownloads")}
                  className="py-3.5 pl-3 pr-4 cursor-pointer hover:text-accentLight transition-colors min-w-[120px] text-right"
                >
                  <div className="flex items-center justify-end gap-1.5 group">
                    <DownloadIcon className="w-3.5 h-3.5 text-accentLight" />
                    <span>Downloads HF</span>
                    {renderSortIcon("popularityDownloads")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-body text-sm">
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
                      className="group transition-colors bg-surface hover:bg-surfaceHover odd:bg-surface even:bg-rowAlt"
                    >
                      {/* Rank Number */}
                      <td className="py-3.5 pl-4 pr-2 text-center font-mono text-xs">
                        {isTop1 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amberDim font-bold text-amber border border-amber/40 shadow-sm">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface3 font-bold text-ink border border-lineLight shadow-sm">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amberDim font-bold text-amber border border-amber/30 shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="text-muted font-medium">{idx + 1}</span>
                        )}
                      </td>

                      {/* Model Name & Org */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-ink group-hover:text-accentLight transition-colors">
                            {m.modelName}
                          </span>
                          <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted bg-surface3 border border-line">
                            {org}
                          </span>
                        </div>
                      </td>

                      {/* Reasoning Score with mini comparison bar */}
                      <td className="py-3.5 px-3 font-mono text-xs">
                        {m.reasoningScore != null ? (
                          <div className="space-y-1">
                            <span className="font-bold text-ink">
                              {m.reasoningScore.toFixed(2)}
                            </span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface3">
                              <div
                                className="h-full rounded-full bg-accent transition-all duration-300"
                                style={{ width: `${reasoningPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* Math Score */}
                      <td className="py-3.5 px-3 font-mono text-xs">
                        {m.mathScore != null ? (
                          <span className="font-semibold text-inkSecondary">
                            {m.mathScore.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* Coding Score */}
                      <td className="py-3.5 px-3 font-mono text-xs">
                        {m.codingScore != null ? (
                          <span className="font-semibold text-inkSecondary">
                            {m.codingScore.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* Arena Elo */}
                      <td className="py-3.5 px-3 font-mono text-xs">
                        {m.arenaScore != null ? (
                          <span className="inline-block rounded bg-surface3 px-2 py-0.5 font-bold text-ink border border-line">
                            {m.arenaScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-mutedDark">—</span>
                        )}
                      </td>

                      {/* HF Downloads */}
                      <td className="py-3.5 pl-3 pr-4 font-mono text-xs text-right font-medium text-muted">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs text-muted px-1">
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
