import Link from "next/link";
import { SparklesIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-20 border-t border-line bg-surface/30">
      <div className="mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accentDim text-accentLight border border-accent/20">
                <SparklesIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-display text-sm font-bold tracking-tight text-ink">
                AI PULSE
              </span>
            </div>
            <p className="max-w-md text-xs text-muted leading-relaxed">
              Tổng hợp tin tức AI toàn cầu và bảng so sánh trực quan các mô hình ngôn ngữ lớn (LLM) theo các tiêu chuẩn benchmark quốc tế.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
              Điều hướng
            </h4>
            <ul className="space-y-1.5 font-mono text-xs text-muted">
              <li>
                <Link href="/news" className="hover:text-ink transition-colors">
                  Tin tức AI
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-ink transition-colors">
                  Bảng xếp hạng mô hình
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Sources Info */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
              Nguồn dữ liệu
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              OpenAI, Google AI, TechCrunch, VentureBeat, arXiv, LMSYS Arena Hard, BigCodeBench & Hugging Face Hub.
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-line pt-5 sm:pt-6 font-mono text-[11px] text-mutedDark gap-2.5 text-center sm:text-left">
          <p>© {new Date().getFullYear()} AI Pulse. Nền tảng tổng hợp dữ liệu AI mở.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald" />
            Tự động đồng bộ liên tục
          </p>
        </div>
      </div>
    </footer>
  );
}
