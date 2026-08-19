import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata = {
  title: "AI Pulse — Tin tức & Xếp hạng AI theo thời gian thực",
  description:
    "Tổng hợp tin tức AI mới nhất từ nhiều nguồn và bảng xếp hạng mô hình AI theo từng tiêu chí, cập nhật liên tục.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-base">
        <Nav />
        <main className="mx-auto max-w-5xl px-5 pb-24">{children}</main>
      </body>
    </html>
  );
}
